(() => {
  window.ManchaApp = window.ManchaApp || {};

  const config = window.__SUPABASE_CONFIG__ || {};
  const client = window.supabase && config.url && config.anonKey
    ? window.supabase.createClient(config.url, config.anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
        realtime: { params: { eventsPerSecond: 1 } }
      })
    : null;

  let state = { pes: {} };
  let loadPromise = null;
  let loaded = false;
  let writeQueue = Promise.resolve();
  const listeners = new Map();

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

  async function select(table, columns, configure) {
    let query = client.from(table).select(columns);
    if (configure) query = configure(query);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async function loadGroup(tasks) {
    const result = [];
    for (const task of tasks) result.push(await task());
    return result;
  }

  async function loadNormalizedState() {
    const started = performance.now();
    // Grupos pequenos e sequenciais: nenhuma tempestade de conexoes e nenhum retry automatico.
    const [profiles, tournaments, meta, security] = await loadGroup([
      () => select("profiles", "id,name,color,avatar,role,active,pin_hash,pin_updated_at,recovered_from_tournament,recovered_at,created_at,source_order", q => q.order("source_order")),
      () => select("tournaments", "id,name,format,type,status,champion,cup_stage,groups_data,cup_snapshot,final_standings,economy_settings,final_prize_settings,market_balance_settings,market_settings,created_at,finished_at,reset_at,reset_by_profile_id,source_order", q => q.order("source_order")),
      () => select("app_meta", "current_tournament_id,identity_schema_version,identity_migrated_at,season_counter", q => q.limit(1)),
      async () => { const {data,error}=await client.rpc("get_app_security"); if(error) throw error; return data || {}; }
    ]);
    const [participants, teams, matches, ownership] = await loadGroup([
      () => select("tournament_participants", "tournament_id,profile_id,position", q => q.order("position")),
      () => select("teams", "id,tournament_id,profile_id,name,color,budget,active,historical,lineup,source_order", q => q.order("source_order")),
      () => select("matches", "id,tournament_id,home_team_id,away_team_id,home_profile_id,away_profile_id,stage,round,leg,status,played,home_score,away_score,played_at,created_at,source_order", q => q.order("source_order")),
      () => select("player_ownership", "tournament_id,player_id,team_id,initial_team_id,squad_role,acquisition_source,acquired_at,for_sale")
    ]);
    const [stats, offers, histories, transfers] = await loadGroup([
      () => select("player_stats", "tournament_id,player_id,team_id,player_name_snapshot,goals,red_cards,updated_at"),
      () => select("trade_offers", "id,tournament_id,player_id,player_name,buyer_team_id,seller_team_id,buyer_profile_id,seller_profile_id,current_amount,market_value_at_creation,last_actor_team_id,status,expires_at,created_at,updated_at"),
      () => select("trade_offer_history", "id,offer_id,actor_team_id,action_type,amount,created_at", q => q.order("created_at")),
      () => select("transfers", "id,tournament_id,player_id,player_name,transfer_type,from_team_id,to_team_id,offer_id,price,market_value,depreciation_pct,transfer_date,created_at", q => q.order("created_at"))
    ]);
    const [financial, reviews, votes, overrides] = await loadGroup([
      () => select("financial_transactions", "id,tournament_id,team_id,transaction_type,amount,balance_before,balance_after,label,reference_id,created_at", q => q.order("created_at", { ascending: false }).limit(2000)),
      () => select("player_reviews", "id,player_id,player_name_snapshot,created_by_profile_id,created_by_name_snapshot,original,proposed,status,applying_by_profile_id,applying_at,resolved_by_profile_id,resolved_at,resolution_reason,created_at,updated_at"),
      () => select("player_review_votes", "review_id,profile_id,vote,avatar_snapshot,name_snapshot,created_at"),
      () => select("player_catalog_overrides", "player_id,overall,market_value,updated_by_profile_id,updated_at")
    ]);
    const [favorites, presence, globalOwnership, imports] = await loadGroup([
      () => select("profile_favorites", "tournament_id,profile_id,player_id,created_at"),
      () => select("presence", "profile_id,online,updated_at"),
      () => select("global_player_ownership", "player_id,team_id,for_sale"),
      () => select("admin_imports", "id,tournament_id,imported_by_profile_id,import_type,mode,player_count,team_count,imported_at", q => q.order("imported_at", { ascending: false }).limit(500))
    ]);

    const historyByOffer = new Map();
    histories.forEach(row => {
      if (!historyByOffer.has(row.offer_id)) historyByOffer.set(row.offer_id, []);
      historyByOffer.get(row.offer_id).push({ id: row.id, actorTeamId: row.actor_team_id, type: row.action_type, amount: row.amount == null ? null : Number(row.amount), createdAt: ms(row.created_at) });
    });

    const tournamentList = tournaments.map(row => {
      const id = row.id;
      const tournamentTeams = teams.filter(x => x.tournament_id === id).map(x => ({ id:x.id, profileId:x.profile_id, name:x.name, color:x.color, budget:Number(x.budget||0), active:x.active, historical:x.historical, lineup:x.lineup }));
      const tournamentMatches = matches.filter(x => x.tournament_id === id).map(x => ({ id:x.id, homeId:x.home_team_id, awayId:x.away_team_id, homeTeamId:x.home_team_id, awayTeamId:x.away_team_id, homeProfileId:x.home_profile_id, awayProfileId:x.away_profile_id, stage:x.stage, round:x.round, leg:x.leg, status:x.status, played:x.played, homeScore:x.home_score, awayScore:x.away_score, playedAt:ms(x.played_at), createdAt:ms(x.created_at) }));
      const tournamentOwnership = {};
      ownership.filter(x => x.tournament_id === id).forEach(x => { tournamentOwnership[x.player_id] = { teamId:x.team_id, initialTeamId:x.initial_team_id, squadRole:x.squad_role, acquisitionSource:x.acquisition_source, acquiredAt:ms(x.acquired_at), forSale:x.for_sale }; });
      const tournamentStats = {};
      stats.filter(x => x.tournament_id === id).forEach(x => { tournamentStats[x.player_id] = { teamId:x.team_id, playerNameSnapshot:x.player_name_snapshot, goals:x.goals, redCards:x.red_cards, updatedAt:ms(x.updated_at) }; });
      const tournamentOffers = {};
      offers.filter(x => x.tournament_id === id).forEach(x => { tournamentOffers[x.id] = { id:x.id, playerId:x.player_id, playerName:x.player_name, buyerTeamId:x.buyer_team_id, sellerTeamId:x.seller_team_id, buyerProfileId:x.buyer_profile_id, sellerProfileId:x.seller_profile_id, currentAmount:Number(x.current_amount||0), marketValueAtCreation:x.market_value_at_creation==null?null:Number(x.market_value_at_creation), lastActorTeamId:x.last_actor_team_id, status:x.status, expiresAt:ms(x.expires_at), createdAt:ms(x.created_at), updatedAt:ms(x.updated_at), history:historyByOffer.get(x.id)||[] }; });
      return {
        id:row.id, name:row.name, format:row.format, type:row.type, status:row.status, champion:row.champion,
        cupStage:row.cup_stage, groups:row.groups_data, cupSnapshot:row.cup_snapshot, finalStandings:row.final_standings,
        economySettings:row.economy_settings, finalPrizeSettings:row.final_prize_settings, marketBalanceSettings:row.market_balance_settings,
        marketSettings:row.market_settings, createdAt:ms(row.created_at), finishedAt:ms(row.finished_at), resetAt:ms(row.reset_at), resetByProfileId:row.reset_by_profile_id,
        participants: participants.filter(x => x.tournament_id === id).sort((a,b)=>(a.position||0)-(b.position||0)).map(x=>x.profile_id),
        teamIds:tournamentTeams.map(x=>x.id), matches:tournamentMatches,
        context:{
          teams:tournamentTeams, matches:tournamentMatches, ownership:tournamentOwnership, playerStats:tournamentStats, tradeOffers:tournamentOffers,
          transfers:transfers.filter(x=>x.tournament_id===id).map(x=>({ id:x.id, playerId:x.player_id, playerName:x.player_name, type:x.transfer_type, fromTeamId:x.from_team_id, toTeamId:x.to_team_id, offerId:x.offer_id, price:Number(x.price||0), marketValue:x.market_value==null?null:Number(x.market_value), depreciationPct:x.depreciation_pct==null?null:Number(x.depreciation_pct), date:x.transfer_date, createdAt:ms(x.created_at) })),
          financialTransactions:financial.filter(x=>x.tournament_id===id).map(x=>({ id:x.id, teamId:x.team_id, type:x.transaction_type, amount:Number(x.amount||0), balanceBefore:Number(x.balance_before||0), balanceAfter:Number(x.balance_after||0), label:x.label, referenceId:x.reference_id, createdAt:ms(x.created_at) })),
          adminImports:imports.filter(x=>x.tournament_id===id).map(x=>({ id:x.id, importedByProfileId:x.imported_by_profile_id, type:x.import_type, mode:x.mode, playerCount:x.player_count, teamCount:x.team_count, importedAt:ms(x.imported_at) }))
        }
      };
    });

    const reviewMap = {};
    reviews.forEach(row => {
      const reviewVotes = {};
      votes.filter(v=>v.review_id===row.id).forEach(v=>{ reviewVotes[v.profile_id]={ decision:v.vote, avatarSnapshot:v.avatar_snapshot, nameSnapshot:v.name_snapshot, createdAt:ms(v.created_at) }; });
      reviewMap[row.id]={ id:row.id, playerId:row.player_id, playerNameSnapshot:row.player_name_snapshot, createdByProfileId:row.created_by_profile_id, createdByNameSnapshot:row.created_by_name_snapshot, original:row.original, proposed:row.proposed, status:row.status, applyingByProfileId:row.applying_by_profile_id, applyingAt:ms(row.applying_at), resolvedByProfileId:row.resolved_by_profile_id, resolvedAt:ms(row.resolved_at), resolutionReason:row.resolution_reason, createdAt:ms(row.created_at), updatedAt:ms(row.updated_at), votes:reviewVotes };
    });
    const preferenceMap = {};
    favorites.forEach(row=>{ preferenceMap[row.tournament_id] ||= {}; preferenceMap[row.tournament_id][row.profile_id] ||= {favorites:{}}; preferenceMap[row.tournament_id][row.profile_id].favorites[row.player_id]=true; });
    const overrideMap = {};
    overrides.forEach(row=>{ overrideMap[row.player_id]={ overall:row.overall, value:row.market_value==null?null:Number(row.market_value), updatedByProfileId:row.updated_by_profile_id, updatedAt:ms(row.updated_at) }; });
    const presenceMap = {};
    presence.forEach(row=>{ presenceMap[row.profile_id]={ online:row.online, updatedAt:ms(row.updated_at) }; });
    const globalMap = {};
    globalOwnership.forEach(row=>{ globalMap[row.player_id]={ teamId:row.team_id, forSale:row.for_sale }; });
    const metaRow = meta[0] || {};

    console.info(`[Supabase] carga normalizada: ${Math.round(performance.now()-started)}ms, 21 consultas, 0 snapshots, 0 retries`);
    return { pes:{
      profiles:profiles.map(row=>({ id:row.id,name:row.name,color:row.color,avatar:row.avatar,role:row.role,active:row.active,pinHash:row.pin_hash,pinUpdatedAt:ms(row.pin_updated_at),recoveredFromTournament:row.recovered_from_tournament,recoveredAt:ms(row.recovered_at),createdAt:ms(row.created_at) })),
      tournaments:tournamentList,
      meta:{ currentTournamentId:metaRow.current_tournament_id||null, identitySchemaVersion:Number(metaRow.identity_schema_version||0), identityMigratedAt:ms(metaRow.identity_migrated_at), seasonCounter:Number(metaRow.season_counter||0) },
      adminSecurity:security || {}, ownership:globalMap, playerReviews:reviewMap, presence:presenceMap,
      profileChampionshipPreferences:preferenceMap, playerCatalogOverrides:overrideMap
    }};
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
  function buildPatch(beforeState,nextState) {
    const before=asObject(beforeState&&beforeState.pes), after=asObject(nextState&&nextState.pes), documents={}, deleteKeys=[];
    const collect=(prefix,b,a)=>{ const bm=indexById(b), am=indexById(a); am.forEach((v,id)=>{if(JSON.stringify(bm.get(id))!==JSON.stringify(v))documents[`${prefix}:${id}`]=v;}); bm.forEach((_,id)=>{if(!am.has(id))deleteKeys.push(`${prefix}:${id}`);}); };
    collect("profile",before.profiles,after.profiles); collect("tournament",before.tournaments,after.tournaments);
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
      state=nextState; emitAll();
    };
    writeQueue=writeQueue.then(operation,operation);
    return writeQueue;
  }

  async function runTransaction(path,updater,completion){
    await load();
    const base=clone(state), current=clone(getAt(base,path)), updated=updater(current);
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

  async function fetchPage(rpcName,params={}){if(!client)throw new Error("Supabase não configurado");const{data,error}=await client.rpc(rpcName,params);if(error)throw error;return{items:(data||[]).map(row=>row.data),total:Number(data&&data[0]&&data[0].total_count||0)};}
  function Ee(){return client?{ref,fetchPage}:null;}
  function U(path,value){const db=Ee();return db?db.ref(`pes/${path}`).set(value===undefined?null:value):Promise.resolve();}
  function Q(path,callback){const db=Ee();if(!db){callback(null);return()=>{};}const reference=db.ref(`pes/${path}`),handler=snapshot=>callback(snapshot.val());reference.on("value",handler);return()=>reference.off("value",handler);}

  const IDENTITY_SCHEMA_VERSION=4;
  const normalizeIdentityText=value=>String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim().toLowerCase().replace(/\s+/g," ");
  function stableIdentityId(prefix,seed){const input=`${prefix}:${normalizeIdentityText(seed)||"legacy"}`;let hash=2166136261;for(let i=0;i<input.length;i++){hash^=input.charCodeAt(i);hash=Math.imul(hash,16777619);}return`${prefix}_${(hash>>>0).toString(36)}`;}
  function migrateStableIdentitySchema(){return Promise.resolve(true);}
  Object.assign(window.ManchaApp,{Ee,U,Q,normalizeIdentityText,stableIdentityId,migrateStableIdentitySchema,IDENTITY_SCHEMA_VERSION,supabaseClient:client,fetchSupabasePage:fetchPage});
})();
