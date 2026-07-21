(() => {
  const params = new URLSearchParams(window.location.search);
  const enabled = params.get("audit") === "1" || localStorage.getItem("mancha-supabase-audit") === "1";
  if (!enabled) {
    window.ManchaSupabaseAudit = {
      enabled: false,
      enable() {
        localStorage.setItem("mancha-supabase-audit", "1");
        window.location.reload();
      }
    };
    return;
  }

  const originalFetch = window.fetch.bind(window);
  const startedAt = Date.now();
  const records = [];
  const MAX_RECORDS = 5000;

  const byteLength = (value) => {
    try {
      if (value == null) return 0;
      if (typeof value === "string") return new Blob([value]).size;
      if (value instanceof Blob) return value.size;
      if (value instanceof ArrayBuffer) return value.byteLength;
      if (ArrayBuffer.isView(value)) return value.byteLength;
      if (value instanceof URLSearchParams) return new Blob([value.toString()]).size;
      if (typeof FormData !== "undefined" && value instanceof FormData) {
        let total = 0;
        value.forEach((entry, key) => {
          total += new Blob([key]).size;
          total += entry instanceof Blob ? entry.size : new Blob([String(entry)]).size;
        });
        return total;
      }
      return new Blob([JSON.stringify(value)]).size;
    } catch (_) {
      return 0;
    }
  };

  const classify = (url, method) => {
    const path = url.pathname;
    if (path.includes("/rest/v1/rpc/")) {
      return { area: "rpc", resource: decodeURIComponent(path.split("/rest/v1/rpc/")[1] || "unknown"), operation: "rpc" };
    }
    if (path.includes("/rest/v1/")) {
      const resource = decodeURIComponent((path.split("/rest/v1/")[1] || "unknown").split("/")[0]);
      const opByMethod = { GET: "select", POST: "insert", PATCH: "update", PUT: "upsert", DELETE: "delete" };
      return { area: "database", resource, operation: opByMethod[method] || method.toLowerCase() };
    }
    if (path.includes("/auth/v1/")) return { area: "auth", resource: path.split("/auth/v1/")[1] || "auth", operation: method.toLowerCase() };
    if (path.includes("/storage/v1/")) return { area: "storage", resource: path.split("/storage/v1/")[1] || "storage", operation: method.toLowerCase() };
    if (path.includes("/functions/v1/")) return { area: "edge-function", resource: path.split("/functions/v1/")[1] || "function", operation: method.toLowerCase() };
    if (path.includes("/realtime/v1")) return { area: "realtime", resource: "realtime", operation: method.toLowerCase() };
    return { area: "supabase-other", resource: path, operation: method.toLowerCase() };
  };

  const normalizeSignature = (method, url, details) => {
    const query = new URLSearchParams(url.search);
    query.delete("apikey");
    const sorted = [...query.entries()].sort(([a], [b]) => a.localeCompare(b));
    return `${method} ${details.area}:${details.resource}:${details.operation}?${new URLSearchParams(sorted).toString()}`;
  };

  const redactValue = (key, value) => {
    const sensitive = /apikey|authorization|token|secret|password|email|phone|cpf|document/i;
    if (sensitive.test(key)) return "[redacted]";
    const text = String(value == null ? "" : value);
    return text.length > 300 ? `${text.slice(0, 300)}…` : text;
  };

  const extractQueryDetails = (url) => {
    const params = new URLSearchParams(url.search);
    const query = {};
    for (const [key, value] of params.entries()) {
      if (key === "apikey") continue;
      query[key] = redactValue(key, value);
    }
    return {
      select: params.get("select") || "",
      order: params.get("order") || "",
      limit: params.get("limit") || "",
      offset: params.get("offset") || "",
      filters: Object.fromEntries([...params.entries()].filter(([key]) => !["apikey", "select", "order", "limit", "offset"].includes(key)).map(([key, value]) => [key, redactValue(key, value)])),
      query
    };
  };

  const parseResponseMeta = async (response) => {
    const meta = { rowCount: null, bodyType: "unknown", topLevelKeys: [], sampleShape: "" };
    try {
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        meta.bodyType = contentType || "non-json";
        return meta;
      }
      const text = await response.clone().text();
      if (!text) {
        meta.bodyType = "empty";
        meta.rowCount = 0;
        return meta;
      }
      const json = JSON.parse(text);
      if (Array.isArray(json)) {
        meta.bodyType = "array";
        meta.rowCount = json.length;
        const first = json[0];
        if (first && typeof first === "object" && !Array.isArray(first)) {
          meta.topLevelKeys = Object.keys(first).slice(0, 30);
          meta.sampleShape = meta.topLevelKeys.join(",");
        } else if (first != null) {
          meta.sampleShape = typeof first;
        }
      } else if (json && typeof json === "object") {
        meta.bodyType = "object";
        meta.rowCount = 1;
        meta.topLevelKeys = Object.keys(json).slice(0, 30);
        meta.sampleShape = meta.topLevelKeys.join(",");
      } else {
        meta.bodyType = typeof json;
        meta.rowCount = 1;
      }
    } catch (error) {
      meta.bodyType = "unparsed";
      meta.parseError = String(error && error.message || error);
    }
    return meta;
  };

  const captureStack = () => {
    try {
      return new Error().stack
        .split("\n")
        .slice(2, 10)
        .filter((line) => !line.includes("supabase-audit.js"))
        .join("\n")
        .trim();
    } catch (_) {
      return "";
    }
  };

  const addRecord = (record) => {
    records.push(record);
    if (records.length > MAX_RECORDS) records.shift();
    window.dispatchEvent(new CustomEvent("mancha:audit-record", { detail: record }));
  };

  window.fetch = async function auditedFetch(input, init = {}) {
    const request = input instanceof Request ? input : null;
    const rawUrl = request ? request.url : String(input);
    let url;
    try { url = new URL(rawUrl, window.location.href); } catch (_) { return originalFetch(input, init); }

    const supabaseHost = /\.supabase\.(co|in)$/.test(url.hostname) || url.hostname.includes("supabase.co");
    if (!supabaseHost) return originalFetch(input, init);

    const method = String(init.method || (request && request.method) || "GET").toUpperCase();
    const details = classify(url, method);
    const queryDetails = extractQueryDetails(url);
    const callerStack = captureStack();
    const sentBytes = byteLength(init.body || (request && request.body));
    const started = performance.now();

    try {
      const response = await originalFetch(input, init);
      let receivedBytes = Number(response.headers.get("content-length")) || 0;
      let measuredFromBody = false;
      try {
        const copy = response.clone();
        const buffer = await copy.arrayBuffer();
        receivedBytes = buffer.byteLength;
        measuredFromBody = true;
      } catch (_) {}
      const responseMeta = await parseResponseMeta(response);

      addRecord({
        at: new Date().toISOString(),
        method,
        status: response.status,
        ok: response.ok,
        durationMs: Math.round((performance.now() - started) * 10) / 10,
        sentBytes,
        receivedBytes,
        measuredFromBody,
        area: details.area,
        resource: details.resource,
        operation: details.operation,
        signature: normalizeSignature(method, url, details),
        path: `${url.pathname}${url.search}`,
        select: queryDetails.select,
        order: queryDetails.order,
        limit: queryDetails.limit,
        offset: queryDetails.offset,
        filters: queryDetails.filters,
        query: queryDetails.query,
        rowCount: responseMeta.rowCount,
        bodyType: responseMeta.bodyType,
        topLevelKeys: responseMeta.topLevelKeys,
        sampleShape: responseMeta.sampleShape,
        parseError: responseMeta.parseError || "",
        callerStack
      });
      return response;
    } catch (error) {
      addRecord({
        at: new Date().toISOString(), method, status: 0, ok: false,
        durationMs: Math.round((performance.now() - started) * 10) / 10,
        sentBytes, receivedBytes: 0, measuredFromBody: false,
        area: details.area, resource: details.resource, operation: details.operation,
        signature: normalizeSignature(method, url, details), path: `${url.pathname}${url.search}`,
        select: queryDetails.select, order: queryDetails.order, limit: queryDetails.limit, offset: queryDetails.offset,
        filters: queryDetails.filters, query: queryDetails.query, rowCount: null, bodyType: "error",
        topLevelKeys: [], sampleShape: "", callerStack,
        error: String(error && error.message || error)
      });
      throw error;
    }
  };

  const summarize = () => {
    const groups = new Map();
    const signatures = new Map();
    let sentBytes = 0;
    let receivedBytes = 0;
    let errors = 0;

    records.forEach((record) => {
      sentBytes += record.sentBytes || 0;
      receivedBytes += record.receivedBytes || 0;
      if (!record.ok) errors += 1;
      const key = `${record.area}:${record.resource}:${record.operation}`;
      const group = groups.get(key) || { area: record.area, resource: record.resource, operation: record.operation, calls: 0, errors: 0, sentBytes: 0, receivedBytes: 0, totalDurationMs: 0, maxDurationMs: 0 };
      group.calls += 1;
      group.errors += record.ok ? 0 : 1;
      group.sentBytes += record.sentBytes || 0;
      group.receivedBytes += record.receivedBytes || 0;
      group.totalDurationMs += record.durationMs || 0;
      group.maxDurationMs = Math.max(group.maxDurationMs, record.durationMs || 0);
      groups.set(key, group);
      signatures.set(record.signature, (signatures.get(record.signature) || 0) + 1);
    });

    const operations = [...groups.values()].map((group) => ({
      ...group,
      avgDurationMs: group.calls ? Math.round((group.totalDurationMs / group.calls) * 10) / 10 : 0
    })).sort((a, b) => b.receivedBytes - a.receivedBytes);

    const duplicates = [...signatures.entries()]
      .filter(([, count]) => count > 1)
      .map(([signature, count]) => ({ signature, count }))
      .sort((a, b) => b.count - a.count);

    return {
      enabled: true,
      startedAt: new Date(startedAt).toISOString(),
      generatedAt: new Date().toISOString(),
      durationSeconds: Math.round((Date.now() - startedAt) / 1000),
      summary: { requests: records.length, errors, sentBytes, receivedBytes, totalBytes: sentBytes + receivedBytes },
      operations,
      duplicates,
      records: [...records]
    };
  };

  const download = (filename, content, type) => {
    const blob = new Blob([content], { type });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  };

  const exportJson = () => {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    download(`supabase-audit-${stamp}.json`, JSON.stringify(summarize(), null, 2), "application/json");
  };

  const csvEscape = (value) => `"${String(value == null ? "" : value).replace(/"/g, '""')}"`;
  const exportCsv = () => {
    const report = summarize();
    const headers = [
      "at", "area", "resource", "operation", "method", "status", "ok", "durationMs",
      "sentBytes", "receivedBytes", "rowCount", "bodyType", "select", "order", "limit", "offset",
      "filters", "sampleShape", "signature", "path", "callerStack", "error"
    ];
    const lines = [headers.join(",")];
    report.records.forEach((row) => {
      const normalized = {
        ...row,
        filters: JSON.stringify(row.filters || {}),
        callerStack: String(row.callerStack || "").replace(/\n/g, " | ")
      };
      lines.push(headers.map((key) => csvEscape(normalized[key])).join(","));
    });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    download(`supabase-audit-v2-${stamp}.csv`, lines.join("\n"), "text/csv;charset=utf-8");
  };

  const formatBytes = (bytes) => {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
  };

  const mountPanel = () => {
    if (document.getElementById("mancha-audit-panel")) return;
    const panel = document.createElement("section");
    panel.id = "mancha-audit-panel";
    panel.innerHTML = `
      <button type="button" data-audit-toggle aria-label="Abrir auditoria">AUDIT</button>
      <div data-audit-body hidden>
        <header><strong>Auditoria Supabase</strong><button type="button" data-audit-close>×</button></header>
        <div class="audit-summary" data-audit-summary></div>
        <div class="audit-actions">
          <button type="button" data-audit-json>Exportar JSON</button>
          <button type="button" data-audit-csv>Exportar CSV</button>
          <button type="button" data-audit-clear>Limpar</button>
          <button type="button" data-audit-disable>Desativar</button>
        </div>
        <div class="audit-table-wrap"><table><thead><tr><th>Recurso</th><th>Chamadas</th><th>Recebido</th></tr></thead><tbody data-audit-rows></tbody></table></div>
        <small>Estimativa medida no navegador. O faturamento do Supabase pode variar por compressão, cache e Realtime.</small>
      </div>`;
    document.body.appendChild(panel);

    const body = panel.querySelector("[data-audit-body]");
    const render = () => {
      const report = summarize();
      panel.querySelector("[data-audit-summary]").innerHTML = `<b>${report.summary.requests}</b> requisições · <b>${formatBytes(report.summary.receivedBytes)}</b> recebidos · <b>${report.summary.errors}</b> erros`;
      panel.querySelector("[data-audit-rows]").innerHTML = report.operations.slice(0, 12).map((row) => `<tr><td>${row.resource}<small>${row.operation}</small></td><td>${row.calls}</td><td>${formatBytes(row.receivedBytes)}</td></tr>`).join("") || '<tr><td colspan="3">Nenhuma chamada registrada.</td></tr>';
    };
    panel.querySelector("[data-audit-toggle]").onclick = () => { body.hidden = false; render(); };
    panel.querySelector("[data-audit-close]").onclick = () => { body.hidden = true; };
    panel.querySelector("[data-audit-json]").onclick = exportJson;
    panel.querySelector("[data-audit-csv]").onclick = exportCsv;
    panel.querySelector("[data-audit-clear]").onclick = () => { records.length = 0; render(); };
    panel.querySelector("[data-audit-disable]").onclick = () => { localStorage.removeItem("mancha-supabase-audit"); const next = new URL(window.location.href); next.searchParams.delete("audit"); window.location.href = next.toString(); };
    window.addEventListener("mancha:audit-record", render);
    render();
  };

  window.ManchaSupabaseAudit = {
    enabled: true,
    getRecords: () => [...records],
    getReport: summarize,
    exportJson,
    exportCsv,
    clear: () => { records.length = 0; },
    disable() { localStorage.removeItem("mancha-supabase-audit"); },
    formatBytes
  };
  window.exportSupabaseAudit = exportJson;
  localStorage.setItem("mancha-supabase-audit", "1");
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountPanel);
  else mountPanel();
  console.info("[Auditoria Supabase v2] ativa. Use window.ManchaSupabaseAudit.getReport() ou window.exportSupabaseAudit().");
})();
