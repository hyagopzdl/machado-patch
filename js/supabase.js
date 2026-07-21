(() => {
  window.ManchaApp = window.ManchaApp || {};

  const config = window.__SUPABASE_CONFIG__ || {};
  const client = window.supabase && config.url && config.anonKey
    ? window.supabase.createClient(config.url, config.anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
        realtime: { params: { eventsPerSecond: 2 } }
      })
    : null;

  let state = { pes: {} };
  let revision = 0;
  let bootstrapPromise = null;
  let bootstrapLoaded = false;
  const tournamentPromises = new Map();
  const pathPromises = new Map();
  const listeners = new Map();

  const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
  const parts = (path) => String(path || "").replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
  const normalizePath = (path) => path === ".info/connected" ? path : (String(path || "").startsWith("pes") ? String(path) : `pes/${path}`);
  const asObject = (value) => value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const asArray = (value) => Array.isArray(value) ? value : [];
  const ms = (value) => value == null ? null : new Date(value).getTime();

  function timed(label, fn) {
    const started = performance.now();
    return Promise.resolve().then(fn).finally(() => {
      console.info(`[Supabase] ${label}: ${Math.round(performance.now() - started)}ms`);
    });
  }

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

  function emit(path) {
    const callbacks = listeners.get(path);
    if (!callbacks) return;
    const value = clone(getAt(state, path));
    callbacks.forEach((callback) => callback({ val: () => value }));
  }

  function emitMany(pathsToEmit) {
    [...new Set(pathsToEmit)].forEach(emit);
  }

  async function select(table, columns, configure) {
    let query = client.from(table).select(columns);
    if (configure) query = configure(query);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async function runtimeDocuments(keys) {
    if (!keys.length) return {};
    const { data, error } = await client.rpc("get_runtime_documents_by_keys", { p_keys: keys });
    if (!error) {
      revision = Number(data && data.revision || revision);
      return asObject(data && data.documents);
    }
    // Compatibilidade enquanto o SQL novo ainda não foi aplicado.
    const rows = await select("runtime_documents", "document_key,document_value", (q) => q.in("document_key", keys));
    return Object.fromEntries(rows.map((row) => [row.document_key, row.document_value]));
  }

  function profileFromRow(row) {
    return {
      id: row.id, name: row.name, color: row.color, avatar: row.avatar, role: row.role,
      active: row.active, pinHash: row.pin_hash, pinUpdatedAt: ms(row.pin_updated_at),
      recoveredFromTournament: row.recovered_from_tournament, recoveredAt: ms(row.recovered_at),
      createdAt: ms(row.created_at)
    };
  }

  function tournamentFromRow(row) {
    return {
      id: row.id, name: row.name, format: row.format, type: row.type, status: row.status,
      champion: row.champion, cupStage: row.cup_stage, groups: row.groups_data,
      cupSnapshot: row.cup_snapshot, finalStandings: row.final_standings,
      economySettings: row.economy_settings, finalPrizeSettings: row.final_prize_settings,
      marketBalanceSettings: row.market_balance_settings, marketSettings: row.market_settings,
      createdAt: ms(row.created_at), finishedAt: ms(row.finished_at), resetAt: ms(row.reset_at),
      resetByProfileId: row.reset_by_profile_id
    };
  }

  async function bootstrap() {
    if (!client) return state;
    if (bootstrapLoaded) return state;
    if (bootstrapPromise) return bootstrapPromise;
    bootstrapPromise = timed("bootstrap", async () => {
      const [profileRows, tournamentRows, metaRows] = await Promise.all([
        select("profiles", "id,name,color,avatar,role,active,pin_hash,pin_updated_at,recovered_from_tournament,recovered_at,created_at,source_order", (q) => q.order("source_order", { ascending: true })),
        select("tournaments", "id,name,format,type,status,champion,cup_stage,groups_data,cup_snapshot,final_standings,economy_settings,final_prize_settings,market_balance_settings,market_settings,created_at,finished_at,reset_at,reset_by_profile_id,source_order", (q) => q.order("source_order", { ascending: true })),
        select("app_meta", "current_tournament_id,identity_schema_version,identity_migrated_at,season_counter,revision", (q) => q.limit(1))
      ]);
      const profileKeys = profileRows.map((row) => `profile:${row.id}`);
      const docs = await runtimeDocuments([...profileKeys, "meta", "adminSecurity"]);
      const profiles = profileRows.map((row) => docs[`profile:${row.id}`] || profileFromRow(row));
      const metaRow = metaRows[0] || {};
      revision = Math.max(revision, Number(metaRow.revision || 0));
      state = { pes: {
        profiles,
        tournaments: tournamentRows.map(tournamentFromRow),
        meta: docs.meta || {
          currentTournamentId: metaRow.current_tournament_id || null,
          identitySchemaVersion: Number(metaRow.identity_schema_version || 0),
          identityMigratedAt: ms(metaRow.identity_migrated_at),
          seasonCounter: Number(metaRow.season_counter || 0)
        },
        adminSecurity: docs.adminSecurity || {},
        teams: [], ownership: {}, playerStats: {}, transfers: [], presence: {},
        playerCatalogOverrides: {}, playerReviews: {}, profileChampionshipPreferences: {}
      }};
      bootstrapLoaded = true;
      emitMany(["pes/profiles", "pes/tournaments", "pes/meta", "pes/adminSecurity", "pes/teams", "pes/ownership", "pes/playerStats", "pes/transfers"]);
      return state;
    }).finally(() => { bootstrapPromise = null; });
    return bootstrapPromise;
  }

  async function buildNormalizedTournament(tournamentId) {
    const [participantRows, teamRows, matchRows, ownershipRows, statsRows, offerRows, historyRows, transferRows, financialRows, importRows] = await Promise.all([
      select("tournament_participants", "profile_id,position", (q) => q.eq("tournament_id", tournamentId).order("position")),
      select("teams", "id,profile_id,name,color,budget,active,historical,lineup,source_order", (q) => q.eq("tournament_id", tournamentId).order("source_order")),
      select("matches", "id,home_team_id,away_team_id,home_profile_id,away_profile_id,stage,round,leg,status,played,home_score,away_score,played_at,created_at,source_order", (q) => q.eq("tournament_id", tournamentId).order("source_order")),
      select("player_ownership", "player_id,team_id,initial_team_id,squad_role,acquisition_source,acquired_at,for_sale", (q) => q.eq("tournament_id", tournamentId)),
      select("player_stats", "player_id,team_id,player_name_snapshot,goals,red_cards,updated_at", (q) => q.eq("tournament_id", tournamentId)),
      select("trade_offers", "id,player_id,player_name,buyer_team_id,seller_team_id,buyer_profile_id,seller_profile_id,current_amount,market_value_at_creation,last_actor_team_id,status,expires_at,created_at,updated_at", (q) => q.eq("tournament_id", tournamentId)),
      select("trade_offer_history", "id,offer_id,actor_team_id,action_type,amount,created_at", (q) => q.eq("tournament_id", tournamentId).order("created_at")),
      select("transfers", "id,player_id,player_name,transfer_type,from_team_id,to_team_id,offer_id,price,market_value,depreciation_pct,transfer_date,created_at", (q) => q.eq("tournament_id", tournamentId).order("created_at")),
      select("financial_transactions", "id,team_id,transaction_type,amount,balance_before,balance_after,label,reference_id,created_at", (q) => q.eq("tournament_id", tournamentId).order("created_at", { ascending: false }).limit(500)),
      select("admin_imports", "id,imported_by_profile_id,import_type,mode,player_count,team_count,imported_at", (q) => q.eq("tournament_id", tournamentId).order("imported_at", { ascending: false }).limit(100))
    ]);
    const base = state.pes.tournaments.find((item) => String(item.id) === String(tournamentId)) || { id: tournamentId };
    const histories = new Map();
    historyRows.forEach((row) => {
      if (!histories.has(row.offer_id)) histories.set(row.offer_id, []);
      histories.get(row.offer_id).push({ id: row.id, actorTeamId: row.actor_team_id, type: row.action_type, amount: row.amount == null ? null : Number(row.amount), createdAt: ms(row.created_at) });
    });
    const ownership = {};
    ownershipRows.forEach((row) => { ownership[row.player_id] = { teamId: row.team_id, initialTeamId: row.initial_team_id, squadRole: row.squad_role, acquisitionSource: row.acquisition_source, acquiredAt: ms(row.acquired_at), forSale: row.for_sale }; });
    const playerStats = {};
    statsRows.forEach((row) => { playerStats[row.player_id] = { teamId: row.team_id, playerNameSnapshot: row.player_name_snapshot, goals: row.goals, redCards: row.red_cards, updatedAt: ms(row.updated_at) }; });
    const tradeOffers = {};
    offerRows.forEach((row) => { tradeOffers[row.id] = { id: row.id, playerId: row.player_id, playerName: row.player_name, buyerTeamId: row.buyer_team_id, sellerTeamId: row.seller_team_id, buyerProfileId: row.buyer_profile_id, sellerProfileId: row.seller_profile_id, currentAmount: Number(row.current_amount || 0), marketValueAtCreation: row.market_value_at_creation == null ? null : Number(row.market_value_at_creation), lastActorTeamId: row.last_actor_team_id, status: row.status, expiresAt: ms(row.expires_at), createdAt: ms(row.created_at), updatedAt: ms(row.updated_at), history: histories.get(row.id) || [] }; });
    const teams = teamRows.map((row) => ({ id: row.id, profileId: row.profile_id, name: row.name, color: row.color, budget: Number(row.budget || 0), active: row.active, historical: row.historical, lineup: row.lineup }));
    const matches = matchRows.map((row) => ({ id: row.id, homeTeamId: row.home_team_id, awayTeamId: row.away_team_id, homeProfileId: row.home_profile_id, awayProfileId: row.away_profile_id, stage: row.stage, round: row.round, leg: row.leg, status: row.status, played: row.played, homeScore: row.home_score, awayScore: row.away_score, playedAt: ms(row.played_at), createdAt: ms(row.created_at) }));
    return {
      ...base,
      participants: participantRows.map((row) => row.profile_id),
      teamIds: teams.map((team) => team.id),
      matches,
      context: {
        teams, matches, ownership, playerStats, tradeOffers,
        transfers: transferRows.map((row) => ({ id: row.id, playerId: row.player_id, playerName: row.player_name, type: row.transfer_type, fromTeamId: row.from_team_id, toTeamId: row.to_team_id, offerId: row.offer_id, price: Number(row.price || 0), marketValue: row.market_value == null ? null : Number(row.market_value), depreciationPct: row.depreciation_pct == null ? null : Number(row.depreciation_pct), date: row.transfer_date, createdAt: ms(row.created_at) })),
        financialTransactions: financialRows.map((row) => ({ id: row.id, teamId: row.team_id, type: row.transaction_type, amount: Number(row.amount || 0), balanceBefore: Number(row.balance_before || 0), balanceAfter: Number(row.balance_after || 0), label: row.label, referenceId: row.reference_id, createdAt: ms(row.created_at) })),
        adminImports: importRows.map((row) => ({ id: row.id, importedByProfileId: row.imported_by_profile_id, type: row.import_type, mode: row.mode, playerCount: row.player_count, teamCount: row.team_count, importedAt: ms(row.imported_at) }))
      }
    };
  }

  async function loadTournamentData(tournamentId, force = false) {
    if (!client || !tournamentId) return null;
    const id = String(tournamentId);
    const current = state.pes.tournaments.find((item) => String(item.id) === id);
    if (!force && current && current.context) return current;
    if (tournamentPromises.has(id)) return tournamentPromises.get(id);
    const promise = timed(`tournament:${id}`, async () => {
      await bootstrap();
      const docs = await runtimeDocuments([`tournament:${id}`]);
      const loaded = docs[`tournament:${id}`] || await buildNormalizedTournament(id);
      const index = state.pes.tournaments.findIndex((item) => String(item.id) === id);
      if (index >= 0) state.pes.tournaments[index] = loaded;
      else state.pes.tournaments.push(loaded);
      emit("pes/tournaments");
      return loaded;
    }).finally(() => tournamentPromises.delete(id));
    tournamentPromises.set(id, promise);
    return promise;
  }

  async function ensurePath(path) {
    await bootstrap();
    const relative = path.replace(/^pes\/?/, "");
    const root = relative.split("/")[0];
    if (["profiles", "tournaments", "meta", "adminSecurity", "teams", "ownership", "playerStats", "transfers"].includes(root)) return;
    if (pathPromises.has(root)) return pathPromises.get(root);
    const promise = timed(`document:${root}`, async () => {
      const docs = await runtimeDocuments([root]);
      if (Object.prototype.hasOwnProperty.call(docs, root)) state.pes[root] = docs[root];
      else if (root === "presence") {
        const rows = await select("presence", "profile_id,online,updated_at");
        state.pes.presence = Object.fromEntries(rows.map((row) => [row.profile_id, { online: row.online, updatedAt: ms(row.updated_at) }]));
      } else state.pes[root] = state.pes[root] || (root === "playerReviews" || root === "playerCatalogOverrides" || root === "profileChampionshipPreferences" ? {} : null);
      emit(path);
    }).finally(() => pathPromises.delete(root));
    pathPromises.set(root, promise);
    return promise;
  }

  function actorProfileId() {
    try { const p = JSON.parse(localStorage.getItem("pes-my-profile") || "null"); return p && p.id || null; }
    catch (_) { return null; }
  }

  function indexById(list) {
    const map = new Map();
    asArray(list).forEach((item) => { if (item && item.id != null) map.set(String(item.id), item); });
    return map;
  }

  function collectEntityDiff(prefix, beforeList, afterList, documents, deleteKeys) {
    const before = indexById(beforeList), after = indexById(afterList);
    after.forEach((value, id) => { if (JSON.stringify(before.get(id)) !== JSON.stringify(value)) documents[`${prefix}:${id}`] = value; });
    before.forEach((_, id) => { if (!after.has(id)) deleteKeys.push(`${prefix}:${id}`); });
  }

  function buildRuntimePatch(previousState, nextState) {
    const before = asObject(previousState && previousState.pes), after = asObject(nextState && nextState.pes);
    const documents = {}, deleteKeys = [];
    collectEntityDiff("profile", before.profiles, after.profiles, documents, deleteKeys);
    collectEntityDiff("tournament", before.tournaments, after.tournaments, documents, deleteKeys);
    ["meta", "adminSecurity", "ownership", "presence", "profileChampionshipPreferences", "playerCatalogOverrides", "playerReviews"].forEach((key) => {
      if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) documents[key] = after[key] == null ? null : after[key];
    });
    return { documents, deleteKeys };
  }

  async function commit(nextState, eventType = "state_change") {
    const patch = buildRuntimePatch(state, nextState);
    if (!Object.keys(patch.documents).length && !patch.deleteKeys.length) { state = nextState; return { committed: true, revision }; }
    const tournamentId = nextState && nextState.pes && nextState.pes.meta && nextState.pes.meta.currentTournamentId || null;
    const { data, error } = await client.rpc("commit_runtime_documents", { p_documents: patch.documents, p_delete_keys: patch.deleteKeys, p_expected_revision: revision, p_actor_profile_id: actorProfileId(), p_event_type: eventType, p_tournament_id: tournamentId });
    if (error) throw error;
    if (!data || !data.committed) { revision = Number(data && data.revision || revision); return { committed: false, revision }; }
    state = nextState; revision = Number(data.revision); emitMany([...listeners.keys()]);
    return { committed: true, revision };
  }

  async function runTransaction(path, updater, completion) {
    await ensurePath(path);
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const base = clone(state), current = clone(getAt(base, path)), updated = updater(current);
      if (updated === undefined) { const snapshot = { val: () => current }; if (completion) completion(null, false, snapshot); return { committed: false, snapshot }; }
      const next = setAt(base, path, clone(updated));
      try {
        const result = await commit(next, `transaction:${path}`);
        if (result.committed) { const snapshot = { val: () => clone(getAt(state, path)) }; if (completion) completion(null, true, snapshot); return { committed: true, snapshot }; }
        await bootstrap();
      } catch (error) { if (completion) completion(error, false, { val: () => clone(getAt(state, path)) }); throw error; }
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
        else ensurePath(path).then(() => callback({ val: () => clone(getAt(state, path)) })).catch(console.error);
        return callback;
      },
      off(event, callback) { if (event !== "value") return; const set = listeners.get(path); if (!set) return; if (callback) set.delete(callback); else set.clear(); if (!set.size) listeners.delete(path); },
      once() { return ensurePath(path).then(() => ({ val: () => clone(getAt(state, path)) })); },
      set(value) { return runTransaction(path, () => value).then(() => undefined); },
      update(patch) { return runTransaction(path, (current) => ({ ...(current && typeof current === "object" ? current : {}), ...patch })).then(() => undefined); },
      remove() { return runTransaction(path, () => null).then(() => undefined); },
      transaction(updater, completion) { return runTransaction(path, updater, completion); },
      onDisconnect() { return { remove: () => Promise.resolve(), set: () => Promise.resolve() }; }
    };
  }

  async function fetchPage(rpcName, params = {}) {
    const { data, error } = await client.rpc(rpcName, params);
    if (error) throw error;
    return { items: (data || []).map((row) => row.data), total: Number(data && data[0] && data[0].total_count || 0) };
  }

  function Ee() { return client ? { ref, fetchPage, loadTournamentData } : null; }
  function U(path, value) { const db = Ee(); return db ? db.ref(`pes/${path}`).set(value === undefined ? null : value) : Promise.resolve(); }
  function Q(path, callback) { const db = Ee(); if (!db) { callback(null); return () => {}; } const reference = db.ref(`pes/${path}`); const handler = (snapshot) => callback(snapshot.val()); reference.on("value", handler); return () => reference.off("value", handler); }

  const IDENTITY_SCHEMA_VERSION = 4;
  const normalizeIdentityText = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase().replace(/\s+/g, " ");
  function stableIdentityId(prefix, seed) { const input = `${prefix}:${normalizeIdentityText(seed) || "legacy"}`; let hash = 2166136261; for (let index = 0; index < input.length; index += 1) { hash ^= input.charCodeAt(index); hash = Math.imul(hash, 16777619); } return `${prefix}_${(hash >>> 0).toString(36)}`; }
  function migrateStableIdentitySchema() { return Promise.resolve(true); }

  Object.assign(window.ManchaApp, { Ee, U, Q, normalizeIdentityText, stableIdentityId, migrateStableIdentitySchema, IDENTITY_SCHEMA_VERSION, supabaseClient: client, fetchSupabasePage: fetchPage, loadTournamentData });
})();
