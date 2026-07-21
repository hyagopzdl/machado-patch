#!/usr/bin/env node
import { analyze, env, parseArgs, readBackup } from './migration-lib.mjs';

const args = parseArgs(process.argv);
const snapshot = readBackup(args.input || './firebase-backup.json');
const totals = analyze(snapshot);
console.log('Entidades encontradas:'); console.table(totals);
if (args.dryRun) { console.log('Dry-run concluído.'); process.exit(0); }

const url = env('SUPABASE_URL');
const key = env('SUPABASE_SERVICE_ROLE_KEY');
const baseHeaders = { apikey:key, authorization:`Bearer ${key}`, 'content-type':'application/json' };
const pes = snapshot.pes || {};
const arr = v => Array.isArray(v) ? v.filter(Boolean) : [];
const obj = v => v && typeof v === 'object' && !Array.isArray(v) ? v : {};
const nil = v => v === '' || v === undefined ? null : v;
const num = v => v === '' || v === undefined || v === null ? null : Number(v);
const bool = (v,d=false) => v === undefined || v === null ? d : Boolean(v);
const ts = v => { if (v === undefined || v === null || v === '') return null; const n=Number(v); return Number.isFinite(n) ? new Date(n).toISOString() : v; };

async function request(path, options={}) {
  const r = await fetch(`${url}/rest/v1/${path}`, { ...options, headers:{...baseHeaders,...options.headers} });
  const text = await r.text();
  if (!r.ok) throw new Error(`${options.method||'GET'} ${path} (${r.status}): ${text}`);
  return text ? JSON.parse(text) : null;
}
async function clear(table, filter) {
  await request(`${table}?${filter}`, {method:'DELETE', headers:{Prefer:'return=minimal'}});
}
async function upsert(table, rows, conflict, size=50) {
  if (!rows.length) { console.log(`- ${table}: 0`); return; }
  for (let i=0;i<rows.length;i+=size) {
    const chunk=rows.slice(i,i+size);
    const q=conflict?`?on_conflict=${encodeURIComponent(conflict)}`:'';
    await request(`${table}${q}`, {method:'POST', headers:{Prefer:'resolution=merge-duplicates,return=minimal'}, body:JSON.stringify(chunk)});
    console.log(`- ${table}: ${Math.min(i+size,rows.length)}/${rows.length}`);
  }
}

const profiles=arr(pes.profiles).map((x,i)=>({id:x.id,name:x.name||'Perfil',color:nil(x.color),avatar:nil(x.avatar),role:x.role||'player',active:bool(x.active,true),pin_hash:nil(x.pinHash),pin_updated_at:ts(x.pinUpdatedAt),recovered_from_tournament:bool(x.recoveredFromTournament),recovered_at:ts(x.recoveredAt),raw_data:x,source_order:i}));
const tournaments=arr(pes.tournaments).map((x,i)=>({id:x.id,name:x.name||'Competição',format:nil(x.format),type:nil(x.type),status:x.status||'draft',champion:nil(x.champion),cup_stage:nil(x.cupStage),groups_data:x.groups??null,cup_snapshot:x.cupSnapshot??null,final_standings:x.finalStandings??null,economy_settings:x.economySettings??null,final_prize_settings:x.finalPrizeSettings??null,market_balance_settings:x.marketBalanceSettings??null,market_settings:x.marketSettings??null,raw_data:x,created_at:ts(x.createdAt),finished_at:ts(x.finishedAt),reset_at:ts(x.resetAt),reset_by_profile_id:nil(x.resetByProfileId),source_order:i}));
const participants=[],teams=[],matches=[],ownership=[],stats=[],offers=[],offerHistory=[],transfers=[],financial=[],adminImports=[];
for (const t of arr(pes.tournaments)) {
  arr(t.participants).forEach((profile_id,position)=>participants.push({tournament_id:t.id,profile_id,position}));
  arr(t.context?.teams).forEach((x,i)=>teams.push({id:x.id,tournament_id:t.id,profile_id:nil(x.profileId),name:x.name||'Time',color:nil(x.color),budget:Number(x.budget||0),active:bool(x.active,true),historical:bool(x.historical),lineup:x.lineup??null,raw_data:x,source_order:i}));
  arr(t.context?.matches || t.matches).forEach((x,i)=>matches.push({id:x.id,tournament_id:t.id,home_team_id:nil(x.homeTeamId??x.homeId),away_team_id:nil(x.awayTeamId??x.awayId),home_profile_id:nil(x.homeProfileId),away_profile_id:nil(x.awayProfileId),stage:nil(x.stage),round:num(x.round),leg:num(x.leg),status:nil(x.status),played:bool(x.played),home_score:num(x.homeScore),away_score:num(x.awayScore),played_at:ts(x.playedAt),created_at:ts(x.createdAt),raw_data:x,source_order:i}));
  for (const [player_id,x] of Object.entries(obj(t.context?.ownership))) ownership.push({tournament_id:t.id,player_id,team_id:nil(x.teamId),initial_team_id:nil(x.initialTeamId),squad_role:nil(x.squadRole),acquisition_source:nil(x.acquisitionSource),acquired_at:ts(x.acquiredAt),for_sale:bool(x.forSale),raw_data:x});
  for (const [player_id,x] of Object.entries(obj(t.context?.playerStats))) stats.push({tournament_id:t.id,player_id,team_id:nil(x.teamId),player_name_snapshot:nil(x.playerNameSnapshot),goals:Number(x.goals||0),red_cards:Number(x.redCards||0),updated_at:ts(x.updatedAt),raw_data:x});
  for (const [id,x] of Object.entries(obj(t.context?.tradeOffers))) { offers.push({id,tournament_id:t.id,player_id:x.playerId,player_name:nil(x.playerName),buyer_team_id:x.buyerTeamId,seller_team_id:x.sellerTeamId,buyer_profile_id:nil(x.buyerProfileId),seller_profile_id:nil(x.sellerProfileId),current_amount:Number(x.currentAmount||0),market_value_at_creation:num(x.marketValueAtCreation),last_actor_team_id:nil(x.lastActorTeamId),status:x.status||'pending',expires_at:ts(x.expiresAt),created_at:ts(x.createdAt),updated_at:ts(x.updatedAt),raw_data:x}); arr(x.history).forEach((h,idx)=>offerHistory.push({id:h.id||`${id}-${idx}`,offer_id:id,actor_team_id:nil(h.actorTeamId),action_type:h.type||'event',amount:num(h.amount),created_at:ts(h.createdAt),raw_data:h})); }
  arr(t.context?.transfers).forEach(x=>transfers.push({id:x.id,tournament_id:t.id,player_id:x.playerId,player_name:nil(x.playerName),transfer_type:x.type||'transfer',from_team_id:nil(x.fromTeamId),to_team_id:nil(x.toTeamId),offer_id:nil(x.offerId),price:Number(x.price||0),market_value:num(x.marketValue),depreciation_pct:num(x.depreciationPct),transfer_date:nil(x.date),created_at:ts(x.createdAt),raw_data:x}));
  arr(t.context?.financialTransactions).forEach(x=>financial.push({id:x.id,tournament_id:t.id,team_id:x.teamId,transaction_type:x.type||'adjustment',amount:Number(x.amount||0),balance_before:Number(x.balanceBefore||0),balance_after:Number(x.balanceAfter||0),label:nil(x.label),reference_id:nil(x.referenceId),created_at:ts(x.createdAt),raw_data:x}));
  arr(t.context?.adminImports).forEach(x=>adminImports.push({id:x.id,tournament_id:t.id,imported_by_profile_id:nil(x.importedByProfileId),import_type:nil(x.type),mode:nil(x.mode),player_count:num(x.playerCount),team_count:num(x.teamCount),imported_at:ts(x.importedAt),raw_data:x}));
}
const reviews=[],reviewVotes=[]; for (const [id,x] of Object.entries(obj(pes.playerReviews))) { reviews.push({id,player_id:x.playerId,player_name_snapshot:nil(x.playerNameSnapshot),created_by_profile_id:nil(x.createdByProfileId),created_by_name_snapshot:nil(x.createdByNameSnapshot),original:x.original||{},proposed:x.proposed||{},status:x.status||'pending',applying_by_profile_id:nil(x.applyingByProfileId),applying_at:ts(x.applyingAt),resolved_by_profile_id:nil(x.resolvedByProfileId),resolved_at:ts(x.resolvedAt),resolution_reason:nil(x.resolutionReason),created_at:ts(x.createdAt),updated_at:ts(x.updatedAt),raw_data:x}); for(const [profile_id,v] of Object.entries(obj(x.votes))) reviewVotes.push({review_id:id,profile_id,vote:v.decision||v.vote||v.type||'approve',avatar_snapshot:nil(v.avatarSnapshot),name_snapshot:nil(v.nameSnapshot),created_at:ts(v.createdAt),raw_data:v}); }
const overrides=Object.entries(obj(pes.playerCatalogOverrides)).map(([player_id,x])=>({player_id,overall:num(x.overall),market_value:num(x.value??x.marketValue),updated_by_profile_id:nil(x.updatedByProfileId),updated_at:ts(x.updatedAt)||new Date().toISOString(),raw_data:x}));
const favorites=[]; for(const [tournament_id,tp] of Object.entries(obj(pes.profileChampionshipPreferences))) for(const [profile_id,p] of Object.entries(obj(tp))) for(const [player_id,v] of Object.entries(obj(p.favorites))) if(v===true) favorites.push({tournament_id,profile_id,player_id});
const presence=Object.entries(obj(pes.presence)).map(([profile_id,x])=>({profile_id,online:bool(x.online),updated_at:ts(x.updatedAt)||new Date().toISOString()}));
const globalOwnership=Object.entries(obj(pes.ownership)).map(([player_id,x])=>({player_id,team_id:nil(x.teamId),for_sale:bool(x.forSale),raw_data:x}));

console.log('Limpando tabelas com filtros seguros...');
for (const [t,f] of [['trade_offer_history','id=not.is.null'],['player_review_votes','review_id=not.is.null'],['profile_favorites','tournament_id=not.is.null'],['admin_imports','id=not.is.null'],['financial_transactions','id=not.is.null'],['transfers','id=not.is.null'],['trade_offers','id=not.is.null'],['player_stats','tournament_id=not.is.null'],['player_ownership','tournament_id=not.is.null'],['matches','id=not.is.null'],['tournament_participants','tournament_id=not.is.null'],['teams','id=not.is.null'],['player_reviews','id=not.is.null'],['player_catalog_overrides','player_id=not.is.null'],['presence','profile_id=not.is.null'],['global_player_ownership','player_id=not.is.null'],['tournaments','id=not.is.null'],['profiles','id=not.is.null']]) await clear(t,f);

for (const [t,r,c] of [['profiles',profiles,'id'],['tournaments',tournaments,'id'],['tournament_participants',participants,'tournament_id,profile_id'],['teams',teams,'id'],['matches',matches,'id'],['player_ownership',ownership,'tournament_id,player_id'],['player_stats',stats,'tournament_id,player_id'],['trade_offers',offers,'id'],['trade_offer_history',offerHistory,'id'],['transfers',transfers,'id'],['financial_transactions',financial,'id'],['admin_imports',adminImports,'id'],['player_reviews',reviews,'id'],['player_review_votes',reviewVotes,'review_id,profile_id'],['player_catalog_overrides',overrides,'player_id'],['profile_favorites',favorites,'tournament_id,profile_id,player_id'],['presence',presence,'profile_id'],['global_player_ownership',globalOwnership,'player_id']]) await upsert(t,r,c);

const validCurrent = tournaments.some(t=>t.id===pes.meta?.currentTournamentId) ? pes.meta.currentTournamentId : (tournaments.find(t=>t.status==='ongoing')?.id || tournaments[0]?.id || null);
await request('app_meta?id=eq.true',{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({current_tournament_id:validCurrent,identity_schema_version:Number(pes.meta?.identitySchemaVersion||0),identity_migrated_at:ts(pes.meta?.identityMigratedAt),season_counter:Number(pes.meta?.seasonCounter||0),revision:1,updated_at:new Date().toISOString()})});
await request('admin_security?id=eq.true',{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({password_hash:nil(pes.adminSecurity?.passwordHash),updated_at:ts(pes.adminSecurity?.updatedAt),updated_by_profile_id:nil(pes.adminSecurity?.updatedByProfileId)})});
console.log('Importação em lotes concluída com sucesso.');
