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
  const asObject = (value) => value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const asArray = (value) => Array.isArray(value) ? value : [];
  const ms = (value) => value == null ? null : new Date(value).getTime();

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

  async function selectAll(table, orderColumn) {
    let query = client.from(table).select("*");
    if (orderColumn) query = query.order(orderColumn, { ascending: true });
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  function overlayRaw(row, extra = {}) {
    return { ...asObject(row.raw_data), ...extra };
  }

  async function loadNormalizedBase() {
    // Carregamento propositalmente sequencial. No plano free, muitas consultas
    // simultaneas podem competir por conexoes e atingir o statement_timeout.
    const profileRows = await selectAll("profiles", "source_order");
    const tournamentRows = await selectAll("tournaments", "source_order");
    const participantRows = await selectAll("tournament_participants", "position");
    const teamRows = await selectAll("teams", "source_order");
    const matchRows = await selectAll("matches", "source_order");
    const ownershipRows = await selectAll("player_ownership");
    const globalOwnershipRows = await selectAll("global_player_ownership");
    const statsRows = await selectAll("player_stats");
    const offerRows = await selectAll("trade_offers");
    const historyRows = await selectAll("trade_offer_history");
    const transferRows = await selectAll("transfers", "created_at");
    const financialRows = await selectAll("financial_transactions", "created_at");
    const reviewRows = await selectAll("player_reviews", "created_at");
    const voteRows = await selectAll("player_review_votes", "created_at");
    const overrideRows = await selectAll("player_catalog_overrides", "updated_at");
    const favoriteRows = await selectAll("profile_favorites", "created_at");
    const presenceRows = await selectAll("presence", "updated_at");
    const importRows = await selectAll("admin_imports", "imported_at");
    const metaRows = await selectAll("app_meta");
    const runtimeResult = await client.rpc("get_runtime_documents");

    if (runtimeResult.error) throw runtimeResult.error;
    const runtime = runtimeResult.data || {};
    const documents = asObject(runtime.documents);

    const profiles = profileRows.map((row) => overlayRaw(row, {
      id: row.id,
      name: row.name,
      color: row.color,
      avatar: row.avatar,
      role: row.role,
      active: row.active,
      pinHash: row.pin_hash,
      pinUpdatedAt: ms(row.pin_updated_at),
      recoveredFromTournament: row.recovered_from_tournament,
      recoveredAt: ms(row.recovered_at)
    }));

    const historiesByOffer = new Map();
    historyRows.forEach((row) => {
      if (!historiesByOffer.has(row.offer_id)) historiesByOffer.set(row.offer_id, []);
      historiesByOffer.get(row.offer_id).push(overlayRaw(row, {
        id: row.id,
        actorTeamId: row.actor_team_id,
        type: row.action_type,
        amount: row.amount == null ? null : Number(row.amount),
        createdAt: ms(row.created_at)
      }));
    });

    const tournaments = tournamentRows.map((row) => {
      const raw = overlayRaw(row, {
        id: row.id,
        name: row.name,
        format: row.format,
        type: row.type,
        status: row.status,
        champion: row.champion,
        cupStage: row.cup_stage,
        groups: row.groups_data,
        cupSnapshot: row.cup_snapshot,
        finalStandings: row.final_standings,
        economySettings: row.economy_settings,
        finalPrizeSettings: row.final_prize_settings,
        marketBalanceSettings: row.market_balance_settings,
        marketSettings: row.market_settings,
        createdAt: ms(row.created_at),
        finishedAt: ms(row.finished_at),
        resetAt: ms(row.reset_at),
        resetByProfileId: row.reset_by_profile_id
      });
      const tournamentId = row.id;
      const participants = participantRows.filter((item) => item.tournament_id === tournamentId).sort((a, b) => (a.position || 0) - (b.position || 0)).map((item) => item.profile_id);
      const teams = teamRows.filter((item) => item.tournament_id === tournamentId).map((item) => overlayRaw(item, {
        id: item.id, profileId: item.profile_id, name: item.name, color: item.color,
        budget: Number(item.budget || 0), active: item.active, historical: item.historical,
        lineup: item.lineup
      }));
      const matches = matchRows.filter((item) => item.tournament_id === tournamentId).map((item) => overlayRaw(item, {
        id: item.id, homeTeamId: item.home_team_id, awayTeamId: item.away_team_id,
        homeProfileId: item.home_profile_id, awayProfileId: item.away_profile_id,
        stage: item.stage, round: item.round, leg: item.leg, status: item.status,
        played: item.played, homeScore: item.home_score, awayScore: item.away_score,
        playedAt: ms(item.played_at), createdAt: ms(item.created_at)
      }));
      const ownership = {};
      ownershipRows.filter((item) => item.tournament_id === tournamentId).forEach((item) => {
        ownership[item.player_id] = overlayRaw(item, {
          teamId: item.team_id, initialTeamId: item.initial_team_id,
          squadRole: item.squad_role, acquisitionSource: item.acquisition_source,
          acquiredAt: ms(item.acquired_at), forSale: item.for_sale
        });
      });
      const playerStats = {};
      statsRows.filter((item) => item.tournament_id === tournamentId).forEach((item) => {
        playerStats[item.player_id] = overlayRaw(item, {
          teamId: item.team_id, playerNameSnapshot: item.player_name_snapshot,
          goals: item.goals, redCards: item.red_cards, updatedAt: ms(item.updated_at)
        });
      });
      const tradeOffers = {};
      offerRows.filter((item) => item.tournament_id === tournamentId).forEach((item) => {
        tradeOffers[item.id] = overlayRaw(item, {
          id: item.id, playerId: item.player_id, playerName: item.player_name,
          buyerTeamId: item.buyer_team_id, sellerTeamId: item.seller_team_id,
          buyerProfileId: item.buyer_profile_id, sellerProfileId: item.seller_profile_id,
          currentAmount: Number(item.current_amount || 0), marketValueAtCreation: item.market_value_at_creation == null ? null : Number(item.market_value_at_creation),
          lastActorTeamId: item.last_actor_team_id, status: item.status,
          expiresAt: ms(item.expires_at), createdAt: ms(item.created_at), updatedAt: ms(item.updated_at),
          history: historiesByOffer.get(item.id) || []
        });
      });
      const transfers = transferRows.filter((item) => item.tournament_id === tournamentId).map((item) => overlayRaw(item, {
        id: item.id, playerId: item.player_id, playerName: item.player_name,
        type: item.transfer_type, fromTeamId: item.from_team_id, toTeamId: item.to_team_id,
        offerId: item.offer_id, price: Number(item.price || 0), marketValue: item.market_value == null ? null : Number(item.market_value),
        depreciationPct: item.depreciation_pct == null ? null : Number(item.depreciation_pct), date: item.transfer_date, createdAt: ms(item.created_at)
      }));
      const financialTransactions = financialRows.filter((item) => item.tournament_id === tournamentId).map((item) => overlayRaw(item, {
        id: item.id, teamId: item.team_id, type: item.transaction_type,
        amount: Number(item.amount || 0), balanceBefore: Number(item.balance_before || 0), balanceAfter: Number(item.balance_after || 0),
        label: item.label, referenceId: item.reference_id, createdAt: ms(item.created_at)
      }));
      const adminImports = importRows.filter((item) => item.tournament_id === tournamentId).map((item) => overlayRaw(item, {
        id: item.id, importedByProfileId: item.imported_by_profile_id, type: item.import_type,
        mode: item.mode, playerCount: item.player_count, teamCount: item.team_count, importedAt: ms(item.imported_at)
      }));
      return {
        ...raw,
        participants,
        teamIds: teams.map((team) => team.id),
        matches,
        context: { ...asObject(raw.context), teams, matches, ownership, playerStats, tradeOffers, transfers, financialTransactions, adminImports }
      };
    });

    const playerReviews = {};
    reviewRows.forEach((row) => {
      const votes = {};
      voteRows.filter((vote) => vote.review_id === row.id).forEach((vote) => {
        votes[vote.profile_id] = overlayRaw(vote, {
          decision: vote.vote, avatarSnapshot: vote.avatar_snapshot,
          nameSnapshot: vote.name_snapshot, createdAt: ms(vote.created_at)
        });
      });
      playerReviews[row.id] = overlayRaw(row, {
        id: row.id, playerId: row.player_id, playerNameSnapshot: row.player_name_snapshot,
        createdByProfileId: row.created_by_profile_id, createdByNameSnapshot: row.created_by_name_snapshot,
        original: row.original, proposed: row.proposed, status: row.status,
        applyingByProfileId: row.applying_by_profile_id, applyingAt: ms(row.applying_at),
        resolvedByProfileId: row.resolved_by_profile_id, resolvedAt: ms(row.resolved_at),
        resolutionReason: row.resolution_reason, createdAt: ms(row.created_at), updatedAt: ms(row.updated_at), votes
      });
    });

    const playerCatalogOverrides = {};
    overrideRows.forEach((row) => {
      playerCatalogOverrides[row.player_id] = overlayRaw(row, {
        overall: row.overall, value: row.market_value == null ? null : Number(row.market_value),
        updatedByProfileId: row.updated_by_profile_id, updatedAt: ms(row.updated_at)
      });
    });
    const profileChampionshipPreferences = {};
    favoriteRows.forEach((row) => {
      profileChampionshipPreferences[row.tournament_id] ||= {};
      profileChampionshipPreferences[row.tournament_id][row.profile_id] ||= { favorites: {} };
      profileChampionshipPreferences[row.tournament_id][row.profile_id].favorites[row.player_id] = true;
    });
    const presence = {};
    presenceRows.forEach((row) => { presence[row.profile_id] = { online: row.online, updatedAt: ms(row.updated_at) }; });
    const globalOwnership = {};
    globalOwnershipRows.forEach((row) => { globalOwnership[row.player_id] = overlayRaw(row, { teamId: row.team_id, forSale: row.for_sale }); });
    const metaRow = metaRows[0] || {};

    const pes = {
      profiles,
      tournaments,
      meta: {
        currentTournamentId: metaRow.current_tournament_id || null,
        identitySchemaVersion: Number(metaRow.identity_schema_version || 0),
        identityMigratedAt: ms(metaRow.identity_migrated_at),
        seasonCounter: Number(metaRow.season_counter || 0)
      },
      adminSecurity: runtime.adminSecurity || {},
      ownership: globalOwnership,
      playerReviews,
      presence,
      profileChampionshipPreferences,
      playerCatalogOverrides
    };

    applyRuntimeDocuments(pes, documents);
    return { snapshot: { pes }, revision: Number(runtime.revision || metaRow.revision || 0) };
  }

  function applyRuntimeDocuments(pes, documents) {
    Object.entries(documents).forEach(([key, value]) => {
      if (key.startsWith("profile:")) {
        const id = key.slice(8);
        const index = pes.profiles.findIndex((item) => item && String(item.id) === id);
        if (value === null) { if (index >= 0) pes.profiles.splice(index, 1); }
        else if (index >= 0) pes.profiles[index] = value;
        else pes.profiles.push(value);
      } else if (key.startsWith("tournament:")) {
        const id = key.slice(11);
        const index = pes.tournaments.findIndex((item) => item && String(item.id) === id);
        if (value === null) { if (index >= 0) pes.tournaments.splice(index, 1); }
        else if (index >= 0) pes.tournaments[index] = value;
        else pes.tournaments.push(value);
      } else if (key.startsWith("review:")) {
        const id = key.slice(7);
        if (value === null) delete pes.playerReviews[id]; else pes.playerReviews[id] = value;
      } else {
        pes[key] = value;
      }
    });
  }

  async function load(force = false) {
    if (!client) return state;
    if (loadPromise && !force) return loadPromise;
    loadPromise = (async () => {
      const loaded = await loadNormalizedBase();
      state = loaded.snapshot;
      revision = loaded.revision;
      emitAll();
      return state;
    })().finally(() => { loadPromise = null; });
    return loadPromise;
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
    const before = indexById(beforeList);
    const after = indexById(afterList);
    after.forEach((value, id) => {
      if (JSON.stringify(before.get(id)) !== JSON.stringify(value)) documents[`${prefix}:${id}`] = value;
    });
    before.forEach((_, id) => { if (!after.has(id)) deleteKeys.push(`${prefix}:${id}`); });
  }

  function buildRuntimePatch(previousState, nextState) {
    const before = asObject(previousState && previousState.pes);
    const after = asObject(nextState && nextState.pes);
    const documents = {};
    const deleteKeys = [];
    collectEntityDiff("profile", before.profiles, after.profiles, documents, deleteKeys);
    collectEntityDiff("tournament", before.tournaments, after.tournaments, documents, deleteKeys);

    const beforeReviews = asObject(before.playerReviews);
    const afterReviews = asObject(after.playerReviews);
    Object.entries(afterReviews).forEach(([id, value]) => {
      if (JSON.stringify(beforeReviews[id]) !== JSON.stringify(value)) documents[`review:${id}`] = value;
    });
    Object.keys(beforeReviews).forEach((id) => { if (!(id in afterReviews)) deleteKeys.push(`review:${id}`); });

    const smallKeys = ["meta", "adminSecurity", "ownership", "presence", "profileChampionshipPreferences", "playerCatalogOverrides"];
    smallKeys.forEach((key) => {
      if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) documents[key] = after[key] == null ? null : after[key];
    });
    return { documents, deleteKeys };
  }

  async function commit(nextState, eventType = "state_change") {
    if (!client) throw new Error("Supabase não configurado");
    const patch = buildRuntimePatch(state, nextState);
    if (!Object.keys(patch.documents).length && !patch.deleteKeys.length) {
      state = nextState;
      emitAll();
      return { committed: true, revision };
    }
    const tournamentId = nextState && nextState.pes && nextState.pes.meta && nextState.pes.meta.currentTournamentId || null;
    const { data, error } = await client.rpc("commit_runtime_documents", {
      p_documents: patch.documents,
      p_delete_keys: patch.deleteKeys,
      p_expected_revision: revision,
      p_actor_profile_id: actorProfileId(),
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
      update(patch) { return runTransaction(path, (current) => ({ ...(current && typeof current === "object" ? current : {}), ...patch })).then(() => undefined); },
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
