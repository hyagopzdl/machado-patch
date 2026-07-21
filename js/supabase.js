(() => {
  window.ManchaApp = window.ManchaApp || {};

  const config = window.__SUPABASE_CONFIG__ || {};
  const client = window.supabase && config.url && config.anonKey
    ? window.supabase.createClient(config.url, config.anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
        realtime: { params: { eventsPerSecond: 4 } }
      })
    : null;

  let state = { pes: {} };
  let revision = 0;
  let loadPromise = null;
  const listeners = new Map();
  let realtimeChannel = null;

  const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
  const parts = (path) => String(path || "").replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
  const normalizePath = (path) => path === ".info/connected" ? path : (String(path || "").startsWith("pes") ? String(path) : `pes/${path}`);

  function getAt(root, path) {
    if (path === ".info/connected") return true;
    return parts(path).reduce((value, key) => value == null ? null : value[key], root);
  }

  function setAt(root, path, value) {
    const keys = parts(path);
    if (!keys.length) return value;
    let cursor = root;
    keys.slice(0, -1).forEach((key) => {
      if (!cursor[key] || typeof cursor[key] !== "object") cursor[key] = {};
      cursor = cursor[key];
    });
    const last = keys[keys.length - 1];
    if (value === null || value === undefined) delete cursor[last];
    else cursor[last] = value;
    return root;
  }

  function emitAll() {
    listeners.forEach((callbacks, path) => {
      const value = clone(getAt(state, path));
      callbacks.forEach((callback) => callback({ val: () => value }));
    });
  }

  async function load(force = false) {
    if (!client) return state;
    if (loadPromise && !force) return loadPromise;
    loadPromise = (async () => {
      const { data, error } = await client.rpc("get_legacy_snapshot");
      if (error) throw error;
      state = data && data.snapshot ? data.snapshot : { pes: {} };
      revision = Number(data && data.revision || 0);
      emitAll();
      return state;
    })().finally(() => { loadPromise = null; });
    return loadPromise;
  }

  async function commit(nextState, eventType = "state_change") {
    if (!client) throw new Error("Supabase não configurado");
    const actor = (() => {
      try { const p = JSON.parse(localStorage.getItem("pes-my-profile") || "null"); return p && p.id || null; }
      catch (_) { return null; }
    })();
    const tournamentId = nextState && nextState.pes && nextState.pes.meta && nextState.pes.meta.currentTournamentId || null;
    const { data, error } = await client.rpc("commit_legacy_snapshot", {
      p_snapshot: nextState,
      p_expected_revision: revision,
      p_actor_profile_id: actor,
      p_event_type: eventType,
      p_tournament_id: tournamentId
    });
    if (error) throw error;
    if (!data || !data.committed) return { committed: false, revision: Number(data && data.revision || revision) };
    state = nextState;
    revision = Number(data.revision);
    emitAll();
    return { committed: true, revision };
  }

  async function runTransaction(path, updater, completion) {
    await load();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const base = clone(state);
      const current = clone(getAt(base, path));
      const updated = updater(current);
      if (updated === undefined) {
        const snapshot = { val: () => current };
        if (completion) completion(null, false, snapshot);
        return { committed: false, snapshot };
      }
      const next = setAt(base, path, clone(updated));
      try {
        const result = await commit(next, `transaction:${path}`);
        if (result.committed) {
          const snapshot = { val: () => clone(getAt(state, path)) };
          if (completion) completion(null, true, snapshot);
          return { committed: true, snapshot };
        }
        await load(true);
      } catch (error) {
        if (completion) completion(error, false, { val: () => clone(getAt(state, path)) });
        throw error;
      }
    }
    const error = new Error("Conflito de atualização no Supabase");
    if (completion) completion(error, false, { val: () => clone(getAt(state, path)) });
    throw error;
  }

  function ref(rawPath) {
    const path = normalizePath(rawPath);
    return {
      on(event, callback) {
        if (event !== "value") return callback;
        if (!listeners.has(path)) listeners.set(path, new Set());
        listeners.get(path).add(callback);
        if (path === ".info/connected") callback({ val: () => true });
        else load().then(() => callback({ val: () => clone(getAt(state, path)) })).catch(console.error);
        return callback;
      },
      off(event, callback) {
        if (event !== "value") return;
        const set = listeners.get(path);
        if (!set) return;
        if (callback) set.delete(callback); else set.clear();
        if (!set.size) listeners.delete(path);
      },
      once() { return load().then(() => ({ val: () => clone(getAt(state, path)) })); },
      set(value) { return runTransaction(path, () => value).then(() => undefined); },
      update(patch) {
        return runTransaction(path, (current) => ({ ...(current && typeof current === "object" ? current : {}), ...patch })).then(() => undefined);
      },
      remove() { return runTransaction(path, () => null).then(() => undefined); },
      transaction(updater, completion) { return runTransaction(path, updater, completion); },
      onDisconnect() { return { remove: () => Promise.resolve(), set: () => Promise.resolve() }; }
    };
  }

  function startRealtime() {
    if (!client || realtimeChannel) return;
    realtimeChannel = client.channel("app-sync-events")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "sync_events" }, (payload) => {
        const incoming = Number(payload.new && payload.new.revision || 0);
        if (incoming > revision) load(true).catch(console.error);
      })
      .subscribe();
  }

  async function fetchPage(rpcName, params = {}) {
    if (!client) throw new Error("Supabase não configurado");
    const { data, error } = await client.rpc(rpcName, params);
    if (error) throw error;
    return { items: (data || []).map((row) => row.data), total: Number(data && data[0] && data[0].total_count || 0) };
  }

  function Ee() { startRealtime(); return client ? { ref, fetchPage } : null; }
  function U(path, value) { const db = Ee(); return db ? db.ref(`pes/${path}`).set(value === undefined ? null : value) : Promise.resolve(); }
  function Q(path, callback) {
    const db = Ee();
    if (!db) { callback(null); return () => {}; }
    const reference = db.ref(`pes/${path}`);
    const handler = (snapshot) => callback(snapshot.val());
    reference.on("value", handler);
    return () => reference.off("value", handler);
  }

  const IDENTITY_SCHEMA_VERSION = 4;
  const normalizeIdentityText = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase().replace(/\s+/g, " ");
  function stableIdentityId(prefix, seed) {
    const input = `${prefix}:${normalizeIdentityText(seed) || "legacy"}`;
    let hash = 2166136261;
    for (let index = 0; index < input.length; index += 1) { hash ^= input.charCodeAt(index); hash = Math.imul(hash, 16777619); }
    return `${prefix}_${(hash >>> 0).toString(36)}`;
  }
  function migrateStableIdentitySchema() { return Promise.resolve(true); }

  Object.assign(window.ManchaApp, { Ee, U, Q, normalizeIdentityText, stableIdentityId, migrateStableIdentitySchema, IDENTITY_SCHEMA_VERSION, supabaseClient: client, fetchSupabasePage: fetchPage });
})();
