(() => {
  window.ManchaApp = window.ManchaApp || {};

  const rawConfig = window.__SUPABASE_CONFIG__ || {};
  const DEFAULT_SUPABASE_URL = "https://snamfpafcvoyzilkktvd.supabase.co";
  const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_WdoTS1XAmXCuee76_arQ7w_A5ZkDEKn";

  function normalizeSupabaseUrl(value) {
    const candidate = String(value || "").trim();
    try {
      const parsed = new URL(candidate);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") return parsed.origin;
    } catch (error) {}
    return DEFAULT_SUPABASE_URL;
  }

  const config = {
    url: normalizeSupabaseUrl(rawConfig.url),
    anonKey: String(rawConfig.anonKey || DEFAULT_SUPABASE_ANON_KEY).trim() || DEFAULT_SUPABASE_ANON_KEY
  };

  let client = null;
  if (window.supabase && typeof window.supabase.createClient === "function") {
    try {
      client = window.supabase.createClient(config.url, config.anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
        realtime: { params: { eventsPerSecond: 1 } }
      });
    } catch (error) {
      console.error("Falha ao iniciar o Supabase", error, { url: config.url });
    }
  }

  let state = { pes: {} };
  let loadPromise = null;
  let loaded = false;
  let writeQueue = Promise.resolve();
  const listeners = new Map();
  const queryCache = new Map();
  const pendingQueries = new Map();
  const deferredLoaded = { financial: new Set(), reviews: false, imports: new Set() };
  const CACHE_TTL_MS = 60 * 1000;

  const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
  const asObject = (value) => value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const asArray = (value) => Array.isArray(value) ? value : [];
  const parts = (path) => String(path || "").replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
  const normalizePath = (path) => path === ".info/connected" ? path : (String(path || "").startsWith("pes") ? String(path) : `pes/${path}`);
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
      // `.info/connected` is a synthetic connection signal. Re-emitting it after
      // every database commit restarts the presence write and creates an
      // infinite apply_direct_patch loop. It is emitted only when subscribed.
      if (path === ".info/connected") return;
      const value = clone(getAt(state, path));
      callbacks.forEach((callback) => callback({ val: () => value }));
    });
  }

  async function select(table, columns, configure, cacheKey = null, ttl = CACHE_TTL_MS) {
    const key = cacheKey || null;
    const now = Date.now();
    const cached = key ? queryCache.get(key) : null;
    if (cached && now - cached.at < ttl) return clone(cached.data);
    if (key && pendingQueries.has(key)) return clone(await pendingQueries.get(key));
    const request = (async () => {
      let query = client.from(table).select(columns);
      if (configure) query = configure(query);
      const { data, error } = await query;
      if (error) throw error;
      const rows = data || [];
      if (key) queryCache.set(key, { at: Date.now(), data: rows });
      return rows;
    })();
    if (key) pendingQueries.set(key, request);
    try { return clone(await request); }
    finally { if (key) pendingQueries.delete(key); }
  }

  function invalidateCache(prefix = "") {
    for (const key of queryCache.keys()) if (!prefix || key.startsWith(prefix)) queryCache.delete(key);
  }

  async function loadNormalizedState() {
    const started = performance.now();
    const [profiles, tournaments, meta, security, participants, teams, matches, ownership, stats, offers, histories, transfers, favorites, presence, globalOwnership, overrides] = await Promise.all([
      select("profiles", "id,name,color,avatar,role,active,pin_hash,pin_updated_at,recovered_from_tournament,recovered_at,created_at,source_order", q => q.order("source_order"), "boot:profiles"),
      select("tournaments", "id,name,format,type,status,champion,cup_stage,groups_data,cup_snapshot,final_standings,economy_settings,final_prize_settings,market_balance_settings,market_settings,created_at,finished_at,reset_at,reset_by_profile_id,source_order", q => q.order("source_order"), "boot:tournaments"),
      select("app_meta", "current_tournament_id,identity_schema_version,identity_migrated_at,season_counter", q => q.limit(1), "boot:meta"),
      (async () => { const {data,error}=await client.rpc("get_app_security"); if(error) throw error; return data || {}; })(),
      select("tournament_participants", "tournament_id,profile_id,position", q => q.order("position"), "boot:participants"),
      select("teams", "id,tournament_id,profile_id,name,color,budget,active,historical,lineup,source_order", q => q.order("source_order"), "boot:teams"),
      select("matches", "id,tournament_id,home_team_id,away_team_id,home_profile_id,away_profile_id,stage,round,leg,status,played,home_score,away_score,played_at,created_at,source_order,raw_data", q => q.order("source_order"), "boot:matches"),
      select("player_ownership", "tournament_id,player_id,team_id,initial_team_id,squad_role,acquisition_source,acquired_at,for_sale", null, "boot:ownership"),
      select("player_stats", "tournament_id,player_id,team_id,player_name_snapshot,goals,red_cards,updated_at", null, "boot:stats"),
      select("trade_offers", "id,tournament_id,player_id,player_name,buyer_team_id,seller_team_id,buyer_profile_id,seller_profile_id,current_amount,market_value_at_creation,last_actor_team_id,status,expires_at,created_at,updated_at", null, "boot:offers"),
      select("trade_offer_history", "id,offer_id,actor_team_id,action_type,amount,created_at", q => q.order("created_at"), "boot:offer-history"),
      select("transfers", "id,tournament_id,player_id,player_name,transfer_type,from_team_id,to_team_id,offer_id,price,market_value,depreciation_pct,transfer_date,created_at", q => q.order("created_at"), "boot:transfers"),
      select("profile_favorites", "tournament_id,profile_id,player_id,created_at", null, "boot:favorites"),
      select("presence", "profile_id,online,updated_at", null, "boot:presence", 15000),
      select("global_player_ownership", "player_id,team_id,for_sale", null, "boot:global-ownership"),
      select("player_catalog_overrides", "player_id,overall,market_value,updated_by_profile_id,updated_at", null, "boot:overrides")
    ]);

    const historyByOffer = new Map();
    histories.forEach(row => {
      if (!historyByOffer.has(row.offer_id)) historyByOffer.set(row.offer_id, []);
      historyByOffer.get(row.offer_id).push({ id: row.id, actorTeamId: row.actor_team_id, type: row.action_type, amount: row.amount == null ? null : Number(row.amount), createdAt: ms(row.created_at) });
    });
    const teamsByTournament = new Map(), matchesByTournament = new Map(), ownershipByTournament = new Map(), statsByTournament = new Map(), offersByTournament = new Map(), transfersByTournament = new Map(), participantsByTournament = new Map();
    const push=(map,key,value)=>{ if(!map.has(key)) map.set(key,[]); map.get(key).push(value); };
    teams.forEach(x=>push(teamsByTournament,x.tournament_id,x)); matches.forEach(x=>push(matchesByTournament,x.tournament_id,x)); ownership.forEach(x=>push(ownershipByTournament,x.tournament_id,x)); stats.forEach(x=>push(statsByTournament,x.tournament_id,x)); offers.forEach(x=>push(offersByTournament,x.tournament_id,x)); transfers.forEach(x=>push(transfersByTournament,x.tournament_id,x)); participants.forEach(x=>push(participantsByTournament,x.tournament_id,x));

    const tournamentList = tournaments.map(row => {
      const id = row.id;
      const tournamentTeams = (teamsByTournament.get(id)||[]).map(x => ({ id:x.id, profileId:x.profile_id, name:x.name, color:x.color, budget:Number(x.budget||0), active:x.active, historical:x.historical, lineup:x.lineup }));
      const tournamentMatches = (matchesByTournament.get(id)||[]).map(x => { const raw=asObject(x.raw_data); return { ...raw, id:x.id, homeId:x.home_team_id, awayId:x.away_team_id, homeTeamId:x.home_team_id, awayTeamId:x.away_team_id, homeProfileId:x.home_profile_id, awayProfileId:x.away_profile_id, stage:x.stage, round:x.round, leg:x.leg, status:x.status, played:x.played, homeScore:x.home_score, awayScore:x.away_score, playedAt:ms(x.played_at), createdAt:ms(x.created_at) }; });
      const tournamentOwnership = {}; (ownershipByTournament.get(id)||[]).forEach(x => { tournamentOwnership[x.player_id] = { teamId:x.team_id, initialTeamId:x.initial_team_id, squadRole:x.squad_role, acquisitionSource:x.acquisition_source, acquiredAt:ms(x.acquired_at), forSale:x.for_sale }; });
      const tournamentStats = {}; (statsByTournament.get(id)||[]).forEach(x => { tournamentStats[x.player_id] = { teamId:x.team_id, playerNameSnapshot:x.player_name_snapshot, goals:x.goals, redCards:x.red_cards, updatedAt:ms(x.updated_at) }; });
      const tournamentOffers = {}; (offersByTournament.get(id)||[]).forEach(x => { tournamentOffers[x.id] = { id:x.id, playerId:x.player_id, playerName:x.player_name, buyerTeamId:x.buyer_team_id, sellerTeamId:x.seller_team_id, buyerProfileId:x.buyer_profile_id, sellerProfileId:x.seller_profile_id, currentAmount:Number(x.current_amount||0), marketValueAtCreation:x.market_value_at_creation==null?null:Number(x.market_value_at_creation), lastActorTeamId:x.last_actor_team_id, status:x.status, expiresAt:ms(x.expires_at), createdAt:ms(x.created_at), updatedAt:ms(x.updated_at), history:historyByOffer.get(x.id)||[] }; });
      return { id:row.id, name:row.name, format:row.format, type:row.type, status:row.status, champion:row.champion, cupStage:row.cup_stage, groups:row.groups_data, cupSnapshot:row.cup_snapshot, finalStandings:row.final_standings, economySettings:row.economy_settings, finalPrizeSettings:row.final_prize_settings, marketBalanceSettings:row.market_balance_settings, marketSettings:row.market_settings, createdAt:ms(row.created_at), finishedAt:ms(row.finished_at), resetAt:ms(row.reset_at), resetByProfileId:row.reset_by_profile_id, participants:(participantsByTournament.get(id)||[]).sort((a,b)=>(a.position||0)-(b.position||0)).map(x=>x.profile_id), teamIds:tournamentTeams.map(x=>x.id), matches:tournamentMatches, context:{ teams:tournamentTeams, matches:tournamentMatches, ownership:tournamentOwnership, playerStats:tournamentStats, tradeOffers:tournamentOffers, transfers:(transfersByTournament.get(id)||[]).map(x=>({ id:x.id, playerId:x.player_id, playerName:x.player_name, type:x.transfer_type, fromTeamId:x.from_team_id, toTeamId:x.to_team_id, offerId:x.offer_id, price:Number(x.price||0), marketValue:x.market_value==null?null:Number(x.market_value), depreciationPct:x.depreciation_pct==null?null:Number(x.depreciation_pct), date:x.transfer_date, createdAt:ms(x.created_at) })), financialTransactions:[], adminImports:[], __financialLoaded:false, __importsLoaded:false } };
    });
    const preferenceMap = {}; favorites.forEach(row=>{ preferenceMap[row.tournament_id] ||= {}; preferenceMap[row.tournament_id][row.profile_id] ||= {favorites:{}}; preferenceMap[row.tournament_id][row.profile_id].favorites[row.player_id]=true; });
    const overrideMap = {}; overrides.forEach(row=>{ overrideMap[row.player_id]={ overall:row.overall, value:row.market_value==null?null:Number(row.market_value), updatedByProfileId:row.updated_by_profile_id, updatedAt:ms(row.updated_at) }; });
    const presenceMap = {}; presence.forEach(row=>{ presenceMap[row.profile_id]={ online:row.online, updatedAt:ms(row.updated_at) }; });
    const globalMap = {}; globalOwnership.forEach(row=>{ globalMap[row.player_id]={ teamId:row.team_id, forSale:row.for_sale }; });
    const metaRow = meta[0] || {};
    console.info(`[Supabase] boot otimizado: ${Math.round(performance.now()-started)}ms, 16 consultas paralelas; históricos pesados sob demanda`);
    return { pes:{ profiles:profiles.map(row=>({ id:row.id,name:row.name,color:row.color,avatar:row.avatar,role:row.role,active:row.active,pinHash:row.pin_hash,pinUpdatedAt:ms(row.pin_updated_at),recoveredFromTournament:row.recovered_from_tournament,recoveredAt:ms(row.recovered_at),createdAt:ms(row.created_at) })), tournaments:tournamentList, meta:{ currentTournamentId:metaRow.current_tournament_id||null, identitySchemaVersion:Number(metaRow.identity_schema_version||0), identityMigratedAt:ms(metaRow.identity_migrated_at), seasonCounter:Number(metaRow.season_counter||0) }, adminSecurity:security || {}, ownership:globalMap, playerReviews:{}, presence:presenceMap, profileChampionshipPreferences:preferenceMap, playerCatalogOverrides:overrideMap } };
  }

  const mapFinancialRow = x => ({ id:x.id, teamId:x.team_id, type:x.transaction_type, amount:Number(x.amount||0), balanceBefore:Number(x.balance_before||0), balanceAfter:Number(x.balance_after||0), label:x.label, referenceId:x.reference_id, createdAt:ms(x.created_at) });
  async function loadFinancialTransactions({ tournamentId, teamId = null, limit = 50, before = null, force = false } = {}) {
    await load();
    if (!tournamentId) return { items:[], hasMore:false, nextCursor:null };
    const key=`financial:${tournamentId}:${teamId||'*'}:${before||'first'}:${limit}`;
    let rows = await select("financial_transactions", "id,tournament_id,team_id,transaction_type,amount,balance_before,balance_after,label,reference_id,created_at", q => { q=q.eq("tournament_id",String(tournamentId)); if(teamId) q=q.eq("team_id",String(teamId)); if(before) q=q.lt("created_at",new Date(before).toISOString()); return q.order("created_at",{ascending:false}).limit(Math.min(100,Math.max(1,Number(limit)||50))+1); }, force?null:key, force?0:CACHE_TTL_MS);
    const pageSize=Math.min(100,Math.max(1,Number(limit)||50)), hasMore=rows.length>pageSize, items=rows.slice(0,pageSize).map(mapFinancialRow);
    return { items, hasMore, nextCursor:hasMore&&items.length?items[items.length-1].createdAt:null };
  }
  async function hydrateTournamentFinancial(tournamentId) {
    await load();
    const id=String(tournamentId||""); if(!id||deferredLoaded.financial.has(id)) return;
    const rows=await select("financial_transactions", "id,tournament_id,team_id,transaction_type,amount,balance_before,balance_after,label,reference_id,created_at", q=>q.eq("tournament_id",id).order("created_at",{ascending:false}), `financial:all:${id}`);
    const tournaments=asArray(getAt(state,"pes/tournaments")).map(t=>String(t&&t.id)===id?{...t,context:{...asObject(t.context),financialTransactions:rows.map(mapFinancialRow),__financialLoaded:true}}:t);
    setAt(state,"pes/tournaments",tournaments); deferredLoaded.financial.add(id); emitAll();
  }
  async function loadPlayerReviews({ force=false }={}) {
    await load(); if(deferredLoaded.reviews&&!force) return clone(getAt(state,"pes/playerReviews")||{});
    const [reviews,votes]=await Promise.all([
      select("player_reviews", "id,player_id,player_name_snapshot,created_by_profile_id,created_by_name_snapshot,original,proposed,status,applying_by_profile_id,applying_at,resolved_by_profile_id,resolved_at,resolution_reason,created_at,updated_at", null, force?null:"reviews:all"),
      select("player_review_votes", "review_id,profile_id,vote,name_snapshot,created_at", null, force?null:"reviews:votes")
    ]);
    const votesByReview=new Map(); votes.forEach(v=>{if(!votesByReview.has(v.review_id))votesByReview.set(v.review_id,[]);votesByReview.get(v.review_id).push(v);});
    const map={}; reviews.forEach(row=>{const reviewVotes={};(votesByReview.get(row.id)||[]).forEach(v=>{reviewVotes[v.profile_id]={decision:v.vote,profileId:v.profile_id,profileNameSnapshot:v.name_snapshot,createdAt:ms(v.created_at)}});map[row.id]={id:row.id,playerId:row.player_id,playerNameSnapshot:row.player_name_snapshot,createdByProfileId:row.created_by_profile_id,createdByNameSnapshot:row.created_by_name_snapshot,original:row.original,proposed:row.proposed,status:row.status,applyingByProfileId:row.applying_by_profile_id,applyingAt:ms(row.applying_at),resolvedByProfileId:row.resolved_by_profile_id,resolvedAt:ms(row.resolved_at),resolutionReason:row.resolution_reason,createdAt:ms(row.created_at),updatedAt:ms(row.updated_at),votes:reviewVotes};});
    setAt(state,"pes/playerReviews",map); deferredLoaded.reviews=true; emitAll(); return clone(map);
  }

  async function load() {
    if (!client) return state;
    if (loaded) return state;
    if (loadPromise) return loadPromise;
    loadPromise = loadNormalizedState().then(next => { state=next; loaded=true; emitAll(); return state; }).finally(()=>{ loadPromise=null; });
    return loadPromise;
  }

  function actorProfileId() {
    try { const p=JSON.parse(localStorage.getItem("pes-my-profile")||"null"); return p&&p.id||null; } catch (_) { return null; }
  }

  function indexById(list) { const map=new Map(); asArray(list).forEach(item=>{ if(item&&item.id!=null) map.set(String(item.id),item); }); return map; }
  function tournamentPatchDocument(value) {
    const tournament=clone(value);
    const context=asObject(tournament&&tournament.context);
    // Lazy-loaded financial data is not an empty collection. Omitting it from
    // ordinary tournament updates prevents apply_direct_patch from treating
    // "not loaded" as "delete every financial transaction".
    if(context.__financialLoaded!==true){
      delete context.financialTransactions;
    }
    delete context.__financialLoaded;
    delete context.__importsLoaded;
    tournament.context=context;
    return tournament;
  }
  function buildPatch(beforeState,nextState) {
    const before=asObject(beforeState&&beforeState.pes), after=asObject(nextState&&nextState.pes), documents={}, deleteKeys=[];
    const collect=(prefix,b,a,serialize=(value)=>value)=>{ const bm=indexById(b), am=indexById(a); am.forEach((v,id)=>{const beforeValue=bm.get(id), serializedBefore=beforeValue==null?beforeValue:serialize(beforeValue), serializedNext=serialize(v);if(JSON.stringify(serializedBefore)!==JSON.stringify(serializedNext))documents[`${prefix}:${id}`]=serializedNext;}); bm.forEach((_,id)=>{if(!am.has(id))deleteKeys.push(`${prefix}:${id}`);}); };
    collect("profile",before.profiles,after.profiles); collect("tournament",before.tournaments,after.tournaments,tournamentPatchDocument);
    const br=asObject(before.playerReviews), ar=asObject(after.playerReviews);
    Object.entries(ar).forEach(([id,v])=>{if(JSON.stringify(br[id])!==JSON.stringify(v))documents[`review:${id}`]=v;}); Object.keys(br).forEach(id=>{if(!(id in ar))deleteKeys.push(`review:${id}`);});
    ["meta","adminSecurity","ownership","presence","playerCatalogOverrides"].forEach(key=>{if(JSON.stringify(before[key])!==JSON.stringify(after[key]))documents[key]=after[key]??null;});
    return {documents,deleteKeys};
  }

  async function commit(nextState,eventType) {
    const patch=buildPatch(state,nextState);
    if(!Object.keys(patch.documents).length&&!patch.deleteKeys.length){state=nextState;emitAll();return;}
    const operation=async()=>{
      const {error}=await client.rpc("apply_direct_patch",{p_documents:patch.documents,p_delete_keys:patch.deleteKeys,p_actor_profile_id:actorProfileId(),p_event_type:eventType||"state_change"});
      if(error) throw error;
      state=nextState; invalidateCache(); emitAll();
    };
    writeQueue=writeQueue.then(operation,operation);
    return writeQueue;
  }

  function financialMutationTournamentIds(path,current,updated) {
    if (!(path === "pes/tournaments" || path.startsWith("pes/tournaments/"))) return [];
    const explicit=path.match(/^pes\/tournaments\/([^/]+)/);
    if (explicit && path.includes("financialTransactions")) return [explicit[1]];
    if (path !== "pes/tournaments") return [];
    const beforeById=indexById(current), ids=[];
    asArray(updated).forEach((nextTournament)=>{
      if(!nextTournament||nextTournament.id==null)return;
      const previous=beforeById.get(String(nextTournament.id));
      const previousTransactions=asArray(previous&&previous.context&&previous.context.financialTransactions);
      const nextTransactions=asArray(nextTournament&&nextTournament.context&&nextTournament.context.financialTransactions);
      if(JSON.stringify(previousTransactions)!==JSON.stringify(nextTransactions)) ids.push(String(nextTournament.id));
    });
    return ids;
  }

  async function runTransaction(path,updater,completion){
    await load();
    if (path === "pes/playerReviews" || path.startsWith("pes/playerReviews/")) await loadPlayerReviews();
    let base=clone(state), current=clone(getAt(base,path)), updated=updater(current);
    const financialIds=financialMutationTournamentIds(path,current,updated).filter((id)=>!deferredLoaded.financial.has(String(id)));
    if(financialIds.length){
      await Promise.all(financialIds.map(hydrateTournamentFinancial));
      base=clone(state); current=clone(getAt(base,path)); updated=updater(current);
    }
    if(updated===undefined){const snapshot={val:()=>current}; if(completion)completion(null,false,snapshot); return{committed:false,snapshot};}
    const next=setAt(base,path,clone(updated));

    const favoriteMatch = path.match(/^pes\/profileChampionshipPreferences\/([^/]+)\/([^/]+)\/favorites\/([^/]+)$/);
    if (favoriteMatch) {
      const [, tournamentId, profileId, playerId] = favoriteMatch;
      const isFavorite = updated === true;
      const operation = async () => {
        const { error } = await client.rpc("set_profile_favorite", {
          p_tournament_id: tournamentId,
          p_profile_id: profileId,
          p_player_id: playerId,
          p_favorite: isFavorite
        });
        if (error) throw error;
        state = next;
        emitAll();
      };
      try {
        writeQueue = writeQueue.then(operation, operation);
        await writeQueue;
        const snapshot={val:()=>clone(getAt(state,path))};
        if(completion)completion(null,true,snapshot);
        return{committed:true,snapshot};
      } catch(error) {
        if(completion)completion(error,false,{val:()=>clone(getAt(state,path))});
        throw error;
      }
    }

    // Firebase presence depended on a real socket and onDisconnect(). This
    // compatibility runtime has no realtime connection, so persisting presence
    // through the generic patch RPC creates self-triggered write loops. Keep
    // presence local-only until it is replaced by a dedicated heartbeat RPC.
    if(path === "pes/presence" || path.startsWith("pes/presence/")){
      state=next;
      emitAll();
      const snapshot={val:()=>clone(getAt(state,path))};
      if(completion)completion(null,true,snapshot);
      return{committed:true,snapshot};
    }

    try{await commit(next,`transaction:${path}`);const snapshot={val:()=>clone(getAt(state,path))};if(completion)completion(null,true,snapshot);return{committed:true,snapshot};}
    catch(error){if(completion)completion(error,false,{val:()=>clone(getAt(state,path))});throw error;}
  }

  function ref(rawPath){const path=normalizePath(rawPath);return{
    on(event,callback){if(event!=="value")return callback;if(!listeners.has(path))listeners.set(path,new Set());listeners.get(path).add(callback);if(path===".info/connected")callback({val:()=>true});else load().then(()=>callback({val:()=>clone(getAt(state,path))})).catch(console.error);return callback;},
    off(event,callback){if(event!=="value")return;const set=listeners.get(path);if(!set)return;if(callback)set.delete(callback);else set.clear();if(!set.size)listeners.delete(path);},
    once(){return load().then(()=>({val:()=>clone(getAt(state,path))}));},
    set(value){return runTransaction(path,()=>value).then(()=>undefined);},
    update(patch){return runTransaction(path,current=>({...asObject(current),...patch})).then(()=>undefined);},
    remove(){return runTransaction(path,()=>null).then(()=>undefined);},
    transaction(updater,completion){return runTransaction(path,updater,completion);},
    onDisconnect(){return{remove:()=>Promise.resolve(),set:()=>Promise.resolve()};}
  };}


  async function setTeamBudget(tournamentId, teamId, amount) {
    await load();
    if (!client) throw new Error("Supabase não configurado");
    const normalizedAmount = Math.max(0, Number(amount) || 0);
    const transactionId = `admin_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,10)}`;
    const { data, error } = await client.rpc("set_team_budget", {
      p_tournament_id: String(tournamentId),
      p_team_id: String(teamId),
      p_amount: normalizedAmount,
      p_transaction_id: transactionId,
      p_actor_profile_id: actorProfileId()
    });
    if (error) throw error;
    const result = data || {};
    const tournamentPath = `pes/tournaments`;
    const tournaments = asArray(getAt(state, tournamentPath)).map((tournament) => {
      if (!tournament || String(tournament.id) !== String(tournamentId)) return tournament;
      const context = asObject(tournament.context);
      const teams = asArray(context.teams).map((team) => String(team.id) === String(teamId) ? { ...team, budget: normalizedAmount } : team);
      const transactions = asArray(context.financialTransactions).filter((item) => item && item.id !== transactionId);
      if (result.transaction) transactions.unshift(result.transaction);
      return { ...tournament, context: { ...context, teams, financialTransactions: transactions } };
    });
    setAt(state, tournamentPath, tournaments);
    emitAll();
    return result;
  }
  async function fetchPage(rpcName,params={}){if(!client)throw new Error("Supabase não configurado");const{data,error}=await client.rpc(rpcName,params);if(error)throw error;return{items:(data||[]).map(row=>row.data),total:Number(data&&data[0]&&data[0].total_count||0)};}
  function Ee(){return client?{ref,fetchPage,loadFinancialTransactions,loadPlayerReviews,hydrateTournamentFinancial}:null;}
  function U(path,value){const db=Ee();return db?db.ref(`pes/${path}`).set(value===undefined?null:value):Promise.resolve();}
  function Q(path,callback){const db=Ee();if(!db){callback(null);return()=>{};}const reference=db.ref(`pes/${path}`),handler=snapshot=>callback(snapshot.val());reference.on("value",handler);return()=>reference.off("value",handler);}

  const IDENTITY_SCHEMA_VERSION=4;
  const normalizeIdentityText=value=>String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim().toLowerCase().replace(/\s+/g," ");
  function stableIdentityId(prefix,seed){const input=`${prefix}:${normalizeIdentityText(seed)||"legacy"}`;let hash=2166136261;for(let i=0;i<input.length;i++){hash^=input.charCodeAt(i);hash=Math.imul(hash,16777619);}return`${prefix}_${(hash>>>0).toString(36)}`;}
  function migrateStableIdentitySchema(){return Promise.resolve(true);}
  Object.assign(window.ManchaApp,{Ee,U,Q,setTeamBudget,loadFinancialTransactions,loadPlayerReviews,hydrateTournamentFinancial,normalizeIdentityText,stableIdentityId,migrateStableIdentitySchema,IDENTITY_SCHEMA_VERSION,supabaseClient:client,fetchSupabasePage:fetchPage});
})();
