begin;

create or replace function public.ms_to_timestamptz(v jsonb)
returns timestamptz language sql immutable as $$
  select case when v is null or v = 'null'::jsonb or trim(both '"' from v::text) = '' then null
    else to_timestamp((trim(both '"' from v::text))::double precision / 1000.0) end
$$;

create or replace function public.import_legacy_snapshot(p_snapshot jsonb, p_revision bigint default 0)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  root jsonb := coalesce(p_snapshot->'pes', p_snapshot, '{}'::jsonb);
  item jsonb; child jsonb; nested jsonb; key text;
  ord bigint; tournament_id text; review_id text; offer_id text;
begin
  set constraints all deferred;

  delete from public.trade_offer_history;
  delete from public.player_review_votes;
  delete from public.profile_favorites;
  delete from public.admin_imports;
  delete from public.financial_transactions;
  delete from public.transfers;
  delete from public.trade_offers;
  delete from public.player_stats;
  delete from public.player_ownership;
  delete from public.matches;
  delete from public.tournament_participants;
  delete from public.teams;
  delete from public.tournaments;
  delete from public.player_reviews;
  delete from public.player_catalog_overrides;
  delete from public.presence;
  delete from public.global_player_ownership;
  delete from public.profiles;

  for item, ord in select value, ordinality from jsonb_array_elements(coalesce(root->'profiles','[]'::jsonb)) with ordinality loop
    insert into public.profiles(id,name,color,avatar,role,active,pin_hash,pin_updated_at,recovered_from_tournament,recovered_at,raw_data,source_order,updated_at)
    values (item->>'id', coalesce(nullif(item->>'name',''),'Perfil'), item->>'color', item->>'avatar', coalesce(item->>'role','player'), coalesce((item->>'active')::boolean,true), item->>'pinHash', public.ms_to_timestamptz(item->'pinUpdatedAt'), coalesce((item->>'recoveredFromTournament')::boolean,false), public.ms_to_timestamptz(item->'recoveredAt'), item, ord-1, now());
  end loop;

  for item, ord in select value, ordinality from jsonb_array_elements(coalesce(root->'tournaments','[]'::jsonb)) with ordinality loop
    insert into public.tournaments(id,name,format,type,status,champion,cup_stage,groups_data,cup_snapshot,final_standings,economy_settings,final_prize_settings,market_balance_settings,market_settings,raw_data,created_at,finished_at,reset_at,reset_by_profile_id,source_order,updated_at)
    values (item->>'id',coalesce(item->>'name','Competição'),item->>'format',item->>'type',coalesce(item->>'status','draft'),item->>'champion',item->>'cupStage',item->'groups',item->'cupSnapshot',item->'finalStandings',item->'economySettings',item->'finalPrizeSettings',item->'marketBalanceSettings',item->'marketSettings',item,public.ms_to_timestamptz(item->'createdAt'),public.ms_to_timestamptz(item->'finishedAt'),public.ms_to_timestamptz(item->'resetAt'),nullif(item->>'resetByProfileId',''),ord-1,now());
  end loop;

  for item, ord in select value, ordinality from jsonb_array_elements(coalesce(root->'tournaments','[]'::jsonb)) with ordinality loop
    tournament_id := item->>'id';
    for child, ord in select value, ordinality from jsonb_array_elements(coalesce(item->'participants','[]'::jsonb)) with ordinality loop
      insert into public.tournament_participants(tournament_id,profile_id,position) values(tournament_id,trim(both '"' from child::text),ord-1) on conflict do nothing;
    end loop;
    for child, ord in select value, ordinality from jsonb_array_elements(coalesce(item#>'{context,teams}','[]'::jsonb)) with ordinality loop
      insert into public.teams(id,tournament_id,profile_id,name,color,budget,active,historical,lineup,raw_data,source_order,updated_at)
      values(child->>'id',tournament_id,nullif(child->>'profileId',''),coalesce(child->>'name','Time'),child->>'color',coalesce((child->>'budget')::numeric,0),coalesce((child->>'active')::boolean,true),coalesce((child->>'historical')::boolean,false),child->'lineup',child,ord-1,now());
    end loop;
  end loop;

  for item in select value from jsonb_array_elements(coalesce(root->'tournaments','[]'::jsonb)) loop
    tournament_id := item->>'id';
    for child, ord in select value, ordinality from jsonb_array_elements(coalesce(item#>'{context,matches}', item->'matches','[]'::jsonb)) with ordinality loop
      insert into public.matches(id,tournament_id,home_team_id,away_team_id,home_profile_id,away_profile_id,stage,round,leg,status,played,home_score,away_score,played_at,created_at,raw_data,source_order)
      values(child->>'id',tournament_id,nullif(coalesce(child->>'homeTeamId',child->>'homeId'),''),nullif(coalesce(child->>'awayTeamId',child->>'awayId'),''),nullif(child->>'homeProfileId',''),nullif(child->>'awayProfileId',''),child->>'stage',nullif(child->>'round','')::integer,nullif(child->>'leg','')::integer,child->>'status',coalesce((child->>'played')::boolean,false),nullif(child->>'homeScore','')::integer,nullif(child->>'awayScore','')::integer,public.ms_to_timestamptz(child->'playedAt'),public.ms_to_timestamptz(child->'createdAt'),child,ord-1);
    end loop;
    for key, child in select key,value from jsonb_each(coalesce(item#>'{context,ownership}','{}'::jsonb)) loop
      insert into public.player_ownership(tournament_id,player_id,team_id,initial_team_id,squad_role,acquisition_source,acquired_at,for_sale,raw_data)
      values(tournament_id,key,nullif(child->>'teamId',''),nullif(child->>'initialTeamId',''),child->>'squadRole',child->>'acquisitionSource',public.ms_to_timestamptz(child->'acquiredAt'),coalesce((child->>'forSale')::boolean,false),child);
    end loop;
    for key, child in select key,value from jsonb_each(coalesce(item#>'{context,playerStats}','{}'::jsonb)) loop
      insert into public.player_stats(tournament_id,player_id,team_id,player_name_snapshot,goals,red_cards,updated_at,raw_data)
      values(tournament_id,key,nullif(child->>'teamId',''),child->>'playerNameSnapshot',coalesce((child->>'goals')::integer,0),coalesce((child->>'redCards')::integer,0),public.ms_to_timestamptz(child->'updatedAt'),child);
    end loop;
    for key, child in select key,value from jsonb_each(coalesce(item#>'{context,tradeOffers}','{}'::jsonb)) loop
      offer_id := key;
      insert into public.trade_offers(id,tournament_id,player_id,player_name,buyer_team_id,seller_team_id,buyer_profile_id,seller_profile_id,current_amount,market_value_at_creation,last_actor_team_id,status,expires_at,created_at,updated_at,raw_data)
      values(offer_id,tournament_id,child->>'playerId',child->>'playerName',child->>'buyerTeamId',child->>'sellerTeamId',nullif(child->>'buyerProfileId',''),nullif(child->>'sellerProfileId',''),coalesce((child->>'currentAmount')::numeric,0),nullif(child->>'marketValueAtCreation','')::numeric,nullif(child->>'lastActorTeamId',''),coalesce(child->>'status','pending'),public.ms_to_timestamptz(child->'expiresAt'),public.ms_to_timestamptz(child->'createdAt'),public.ms_to_timestamptz(child->'updatedAt'),child);
      for nested in select value from jsonb_array_elements(coalesce(child->'history','[]'::jsonb)) loop
        insert into public.trade_offer_history(id,offer_id,actor_team_id,action_type,amount,created_at,raw_data)
        values(nested->>'id',offer_id,nullif(nested->>'actorTeamId',''),coalesce(nested->>'type','event'),nullif(nested->>'amount','')::numeric,public.ms_to_timestamptz(nested->'createdAt'),nested);
      end loop;
    end loop;
    for child in select value from jsonb_array_elements(coalesce(item#>'{context,transfers}','[]'::jsonb)) loop
      insert into public.transfers(id,tournament_id,player_id,player_name,transfer_type,from_team_id,to_team_id,offer_id,price,market_value,depreciation_pct,transfer_date,created_at,raw_data)
      values(child->>'id',tournament_id,child->>'playerId',child->>'playerName',coalesce(child->>'type','transfer'),nullif(child->>'fromTeamId',''),nullif(child->>'toTeamId',''),nullif(child->>'offerId',''),coalesce((child->>'price')::numeric,0),nullif(child->>'marketValue','')::numeric,nullif(child->>'depreciationPct','')::numeric,child->>'date',public.ms_to_timestamptz(child->'createdAt'),child);
    end loop;
    for child in select value from jsonb_array_elements(coalesce(item#>'{context,financialTransactions}','[]'::jsonb)) loop
      insert into public.financial_transactions(id,tournament_id,team_id,transaction_type,amount,balance_before,balance_after,label,reference_id,created_at,raw_data)
      values(child->>'id',tournament_id,child->>'teamId',coalesce(child->>'type','adjustment'),coalesce((child->>'amount')::numeric,0),coalesce((child->>'balanceBefore')::numeric,0),coalesce((child->>'balanceAfter')::numeric,0),child->>'label',child->>'referenceId',public.ms_to_timestamptz(child->'createdAt'),child);
    end loop;
    for child in select value from jsonb_array_elements(coalesce(item#>'{context,adminImports}','[]'::jsonb)) loop
      insert into public.admin_imports(id,tournament_id,imported_by_profile_id,import_type,mode,player_count,team_count,imported_at,raw_data)
      values(child->>'id',tournament_id,nullif(child->>'importedByProfileId',''),child->>'type',child->>'mode',nullif(child->>'playerCount','')::integer,nullif(child->>'teamCount','')::integer,public.ms_to_timestamptz(child->'importedAt'),child);
    end loop;
  end loop;

  for key, item in select key,value from jsonb_each(coalesce(root->'playerReviews','{}'::jsonb)) loop
    review_id := key;
    insert into public.player_reviews(id,player_id,player_name_snapshot,created_by_profile_id,created_by_name_snapshot,original,proposed,status,applying_by_profile_id,applying_at,resolved_by_profile_id,resolved_at,resolution_reason,created_at,updated_at,raw_data)
    values(review_id,item->>'playerId',item->>'playerNameSnapshot',nullif(item->>'createdByProfileId',''),item->>'createdByNameSnapshot',coalesce(item->'original','{}'::jsonb),coalesce(item->'proposed','{}'::jsonb),coalesce(item->>'status','pending'),nullif(item->>'applyingByProfileId',''),public.ms_to_timestamptz(item->'applyingAt'),nullif(item->>'resolvedByProfileId',''),public.ms_to_timestamptz(item->'resolvedAt'),item->>'resolutionReason',public.ms_to_timestamptz(item->'createdAt'),public.ms_to_timestamptz(item->'updatedAt'),item);
    for key, child in select key,value from jsonb_each(coalesce(item->'votes','{}'::jsonb)) loop
      insert into public.player_review_votes(review_id,profile_id,vote,avatar_snapshot,name_snapshot,created_at,raw_data)
      values(review_id,key,coalesce(child->>'decision',child->>'vote',child->>'type','approve'),child->>'avatarSnapshot',child->>'nameSnapshot',public.ms_to_timestamptz(child->'createdAt'),child);
    end loop;
  end loop;

  for key, item in select key,value from jsonb_each(coalesce(root->'playerCatalogOverrides','{}'::jsonb)) loop
    insert into public.player_catalog_overrides(player_id,overall,market_value,updated_by_profile_id,updated_at,raw_data)
    values(key,nullif(item->>'overall','')::integer,nullif(coalesce(item->>'value',item->>'marketValue'),'')::numeric,nullif(item->>'updatedByProfileId',''),coalesce(public.ms_to_timestamptz(item->'updatedAt'),now()),item);
  end loop;

  for tournament_id, item in select key,value from jsonb_each(coalesce(root->'profileChampionshipPreferences','{}'::jsonb)) loop
    for key, child in select key,value from jsonb_each(item) loop
      for review_id, nested in select key,value from jsonb_each(coalesce(child->'favorites','{}'::jsonb)) loop
        if nested = 'true'::jsonb then insert into public.profile_favorites(tournament_id,profile_id,player_id) values(tournament_id,key,review_id) on conflict do nothing; end if;
      end loop;
    end loop;
  end loop;

  for key, item in select key,value from jsonb_each(coalesce(root->'presence','{}'::jsonb)) loop
    insert into public.presence(profile_id,online,updated_at) values(key,coalesce((item->>'online')::boolean,false),coalesce(public.ms_to_timestamptz(item->'updatedAt'),now()));
  end loop;

  for key, item in select key,value from jsonb_each(coalesce(root->'ownership','{}'::jsonb)) loop
    insert into public.global_player_ownership(player_id,team_id,for_sale,raw_data) values(key,item->>'teamId',coalesce((item->>'forSale')::boolean,false),item);
  end loop;

  update public.admin_security set password_hash=root#>>'{adminSecurity,passwordHash}',updated_at=public.ms_to_timestamptz(root#>'{adminSecurity,updatedAt}'),updated_by_profile_id=nullif(root#>>'{adminSecurity,updatedByProfileId}','') where id=true;
  update public.app_meta set current_tournament_id=nullif(root#>>'{meta,currentTournamentId}',''),identity_schema_version=coalesce((root#>>'{meta,identitySchemaVersion}')::integer,0),identity_migrated_at=public.ms_to_timestamptz(root#>'{meta,identityMigratedAt}'),season_counter=coalesce((root#>>'{meta,seasonCounter}')::integer,0),revision=p_revision,updated_at=now() where id=true;
end;
$$;

create or replace function public.get_legacy_snapshot()
returns jsonb language sql security definer set search_path=public as $$
  select jsonb_build_object('snapshot', snapshot, 'revision', revision) from public.legacy_state where id=true
$$;

create or replace function public.commit_legacy_snapshot(p_snapshot jsonb,p_expected_revision bigint,p_actor_profile_id text default null,p_event_type text default 'state_change',p_tournament_id text default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare current_revision bigint; next_revision bigint;
begin
  select revision into current_revision from public.legacy_state where id=true for update;
  if current_revision <> p_expected_revision then return jsonb_build_object('committed',false,'revision',current_revision,'reason','revision_conflict'); end if;
  next_revision := current_revision + 1;
  perform public.import_legacy_snapshot(p_snapshot,next_revision);
  update public.legacy_state set snapshot=p_snapshot,revision=next_revision,updated_at=now() where id=true;
  insert into public.sync_events(revision,event_type,tournament_id,actor_profile_id,payload) values(next_revision,p_event_type,p_tournament_id,p_actor_profile_id,jsonb_build_object('revision',next_revision));
  return jsonb_build_object('committed',true,'revision',next_revision);
end;
$$;

create or replace function public.market_purchase(p_tournament_id text,p_team_id text,p_player_id text,p_player_name text,p_price numeric,p_actor_profile_id text,p_transfer_id text,p_transaction_id text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare op uuid:=gen_random_uuid(); old_budget numeric; before_state jsonb;
begin
  select budget into old_budget from public.teams where id=p_team_id and tournament_id=p_tournament_id for update;
  if old_budget is null then raise exception 'team_not_found'; end if;
  if old_budget < p_price then raise exception 'insufficient_budget'; end if;
  if exists(select 1 from public.player_ownership where tournament_id=p_tournament_id and player_id=p_player_id and team_id is not null) then raise exception 'player_unavailable'; end if;
  before_state:=jsonb_build_object('budget',old_budget,'ownership',(select to_jsonb(x) from public.player_ownership x where tournament_id=p_tournament_id and player_id=p_player_id));
  update public.teams set budget=budget-p_price,updated_at=now() where id=p_team_id;
  insert into public.player_ownership(tournament_id,player_id,team_id,for_sale,acquisition_source,acquired_at,raw_data) values(p_tournament_id,p_player_id,p_team_id,false,'market_purchase',now(),'{}') on conflict(tournament_id,player_id) do update set team_id=excluded.team_id,for_sale=false,acquisition_source='market_purchase',acquired_at=now();
  insert into public.transfers(id,tournament_id,player_id,player_name,transfer_type,to_team_id,price,created_at,raw_data) values(p_transfer_id,p_tournament_id,p_player_id,p_player_name,'market_purchase',p_team_id,p_price,now(),'{}');
  insert into public.financial_transactions(id,tournament_id,team_id,transaction_type,amount,balance_before,balance_after,label,reference_id,operation_id,created_at,raw_data) values(p_transaction_id,p_tournament_id,p_team_id,'market_purchase',-p_price,old_budget,old_budget-p_price,'Compra de '||p_player_name,p_player_id,op,now(),'{}');
  insert into public.operation_journal(id,tournament_id,operation_type,actor_profile_id,before_state,after_state) values(op,p_tournament_id,'market_purchase',p_actor_profile_id,before_state,jsonb_build_object('budget',old_budget-p_price,'playerId',p_player_id));
  return jsonb_build_object('ok',true,'operationId',op,'balance',old_budget-p_price);
end;
$$;

create or replace function public.market_sale(p_tournament_id text,p_team_id text,p_player_id text,p_player_name text,p_price numeric,p_actor_profile_id text,p_transfer_id text,p_transaction_id text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare op uuid:=gen_random_uuid(); old_budget numeric; owner text;
begin
  select budget into old_budget from public.teams where id=p_team_id and tournament_id=p_tournament_id for update;
  select team_id into owner from public.player_ownership where tournament_id=p_tournament_id and player_id=p_player_id for update;
  if owner is distinct from p_team_id then raise exception 'not_player_owner'; end if;
  update public.teams set budget=budget+p_price,updated_at=now() where id=p_team_id;
  update public.player_ownership set team_id=null,for_sale=false where tournament_id=p_tournament_id and player_id=p_player_id;
  insert into public.transfers(id,tournament_id,player_id,player_name,transfer_type,from_team_id,price,created_at,raw_data) values(p_transfer_id,p_tournament_id,p_player_id,p_player_name,'market_sale',p_team_id,p_price,now(),'{}');
  insert into public.financial_transactions(id,tournament_id,team_id,transaction_type,amount,balance_before,balance_after,label,reference_id,operation_id,created_at,raw_data) values(p_transaction_id,p_tournament_id,p_team_id,'market_sale',p_price,old_budget,old_budget+p_price,'Venda de '||p_player_name,p_player_id,op,now(),'{}');
  insert into public.operation_journal(id,tournament_id,operation_type,actor_profile_id,before_state,after_state) values(op,p_tournament_id,'market_sale',p_actor_profile_id,jsonb_build_object('budget',old_budget,'teamId',p_team_id,'playerId',p_player_id),jsonb_build_object('budget',old_budget+p_price,'teamId',null,'playerId',p_player_id));
  return jsonb_build_object('ok',true,'operationId',op,'balance',old_budget+p_price);
end;
$$;

create or replace function public.create_trade_offer(p_offer jsonb,p_actor_profile_id text)
returns jsonb language plpgsql security definer set search_path=public as $$
begin
  insert into public.trade_offers(id,tournament_id,player_id,player_name,buyer_team_id,seller_team_id,buyer_profile_id,seller_profile_id,current_amount,market_value_at_creation,last_actor_team_id,status,expires_at,created_at,updated_at,raw_data)
  values(p_offer->>'id',p_offer->>'championshipId',p_offer->>'playerId',p_offer->>'playerName',p_offer->>'buyerTeamId',p_offer->>'sellerTeamId',nullif(p_offer->>'buyerProfileId',''),nullif(p_offer->>'sellerProfileId',''),(p_offer->>'currentAmount')::numeric,nullif(p_offer->>'marketValueAtCreation','')::numeric,p_offer->>'lastActorTeamId',coalesce(p_offer->>'status','pending'),public.ms_to_timestamptz(p_offer->'expiresAt'),coalesce(public.ms_to_timestamptz(p_offer->'createdAt'),now()),coalesce(public.ms_to_timestamptz(p_offer->'updatedAt'),now()),p_offer);
  return jsonb_build_object('ok',true,'offerId',p_offer->>'id');
end;
$$;

create or replace function public.counter_trade_offer(p_offer_id text,p_actor_team_id text,p_amount numeric,p_history_id text)
returns jsonb language plpgsql security definer set search_path=public as $$
begin
  update public.trade_offers set current_amount=p_amount,last_actor_team_id=p_actor_team_id,status='countered',updated_at=now() where id=p_offer_id and status in ('pending','countered');
  if not found then raise exception 'offer_not_available'; end if;
  insert into public.trade_offer_history(id,offer_id,actor_team_id,action_type,amount,created_at,raw_data) values(p_history_id,p_offer_id,p_actor_team_id,'counter',p_amount,now(),'{}');
  return jsonb_build_object('ok',true);
end;
$$;

create or replace function public.accept_trade_offer(p_offer_id text,p_actor_profile_id text,p_transfer_id text,p_buyer_transaction_id text,p_seller_transaction_id text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare o public.trade_offers%rowtype; buyer_budget numeric; seller_budget numeric; op uuid:=gen_random_uuid();
begin
  select * into o from public.trade_offers where id=p_offer_id for update;
  if o.id is null or o.status not in ('pending','countered') or o.expires_at < now() then raise exception 'offer_not_available'; end if;
  select budget into buyer_budget from public.teams where id=o.buyer_team_id for update;
  select budget into seller_budget from public.teams where id=o.seller_team_id for update;
  if buyer_budget < o.current_amount then raise exception 'insufficient_budget'; end if;
  if not exists(select 1 from public.player_ownership where tournament_id=o.tournament_id and player_id=o.player_id and team_id=o.seller_team_id) then raise exception 'seller_no_longer_owns_player'; end if;
  update public.teams set budget=case when id=o.buyer_team_id then budget-o.current_amount else budget+o.current_amount end,updated_at=now() where id in(o.buyer_team_id,o.seller_team_id);
  update public.player_ownership set team_id=o.buyer_team_id,for_sale=false,acquisition_source='trade_offer',acquired_at=now() where tournament_id=o.tournament_id and player_id=o.player_id;
  update public.trade_offers set status='accepted',updated_at=now() where id=o.id;
  insert into public.transfers(id,tournament_id,player_id,player_name,transfer_type,from_team_id,to_team_id,offer_id,price,created_at,raw_data) values(p_transfer_id,o.tournament_id,o.player_id,o.player_name,'trade_offer',o.seller_team_id,o.buyer_team_id,o.id,o.current_amount,now(),'{}');
  insert into public.financial_transactions(id,tournament_id,team_id,transaction_type,amount,balance_before,balance_after,label,reference_id,operation_id,created_at,raw_data) values
   (p_buyer_transaction_id,o.tournament_id,o.buyer_team_id,'trade_purchase',-o.current_amount,buyer_budget,buyer_budget-o.current_amount,'Compra de '||o.player_name,o.player_id,op,now(),'{}'),
   (p_seller_transaction_id,o.tournament_id,o.seller_team_id,'trade_sale',o.current_amount,seller_budget,seller_budget+o.current_amount,'Venda de '||o.player_name,o.player_id,op,now(),'{}');
  insert into public.operation_journal(id,tournament_id,operation_type,actor_profile_id,before_state,after_state) values(op,o.tournament_id,'accept_trade_offer',p_actor_profile_id,jsonb_build_object('buyerBudget',buyer_budget,'sellerBudget',seller_budget,'ownerTeamId',o.seller_team_id,'offerStatus',o.status),jsonb_build_object('buyerBudget',buyer_budget-o.current_amount,'sellerBudget',seller_budget+o.current_amount,'ownerTeamId',o.buyer_team_id,'offerStatus','accepted'));
  return jsonb_build_object('ok',true,'operationId',op);
end;
$$;

create or replace function public.apply_match_rewards(p_tournament_id text,p_match_id text,p_rewards jsonb,p_actor_profile_id text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare entry jsonb; old_budget numeric; op uuid:=gen_random_uuid(); before_state jsonb:='[]'::jsonb; after_state jsonb:='[]'::jsonb;
begin
  for entry in select value from jsonb_array_elements(p_rewards) loop
    select budget into old_budget from public.teams where id=entry->>'teamId' and tournament_id=p_tournament_id for update;
    before_state:=before_state||jsonb_build_array(jsonb_build_object('teamId',entry->>'teamId','budget',old_budget));
    update public.teams set budget=budget+(entry->>'amount')::numeric,updated_at=now() where id=entry->>'teamId';
    insert into public.financial_transactions(id,tournament_id,team_id,transaction_type,amount,balance_before,balance_after,label,reference_id,operation_id,created_at,raw_data)
    values(entry->>'id',p_tournament_id,entry->>'teamId',coalesce(entry->>'type','match_reward'),(entry->>'amount')::numeric,old_budget,old_budget+(entry->>'amount')::numeric,entry->>'label',p_match_id,op,now(),entry);
    after_state:=after_state||jsonb_build_array(jsonb_build_object('teamId',entry->>'teamId','budget',old_budget+(entry->>'amount')::numeric));
  end loop;
  insert into public.operation_journal(id,tournament_id,operation_type,actor_profile_id,before_state,after_state) values(op,p_tournament_id,'match_rewards',p_actor_profile_id,before_state,after_state);
  return jsonb_build_object('ok',true,'operationId',op);
end;
$$;

create or replace function public.rollback_operation(p_operation_id uuid,p_actor_profile_id text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare j public.operation_journal%rowtype; entry jsonb;
begin
  select * into j from public.operation_journal where id=p_operation_id for update;
  if j.id is null then raise exception 'operation_not_found'; end if;
  if j.rolled_back_at is not null then raise exception 'operation_already_rolled_back'; end if;
  if j.operation_type='market_purchase' then
    update public.teams set budget=(j.before_state->>'budget')::numeric where id=(j.after_state->>'teamId');
    update public.player_ownership set team_id=null,for_sale=false where tournament_id=j.tournament_id and player_id=j.after_state->>'playerId';
  elsif j.operation_type='market_sale' then
    update public.teams set budget=(j.before_state->>'budget')::numeric where id=j.before_state->>'teamId';
    update public.player_ownership set team_id=j.before_state->>'teamId' where tournament_id=j.tournament_id and player_id=j.before_state->>'playerId';
  elsif j.operation_type='match_rewards' then
    for entry in select value from jsonb_array_elements(j.before_state) loop update public.teams set budget=(entry->>'budget')::numeric where id=entry->>'teamId'; end loop;
  else
    raise exception 'rollback_not_supported_for_%',j.operation_type;
  end if;
  delete from public.financial_transactions where operation_id=j.id;
  update public.operation_journal set rolled_back_at=now(),rolled_back_by_profile_id=p_actor_profile_id where id=j.id;
  return jsonb_build_object('ok',true);
end;
$$;

create or replace function public.get_matches_page(p_tournament_id text,p_limit integer default 25,p_offset integer default 0)
returns table(data jsonb,total_count bigint) language sql stable security definer set search_path=public as $$
  select m.raw_data, count(*) over() from public.matches m where m.tournament_id=p_tournament_id order by coalesce(m.played_at,m.created_at) desc nulls last limit greatest(1,least(p_limit,100)) offset greatest(p_offset,0)
$$;
create or replace function public.get_transfers_page(p_tournament_id text,p_limit integer default 25,p_offset integer default 0)
returns table(data jsonb,total_count bigint) language sql stable security definer set search_path=public as $$
  select t.raw_data, count(*) over() from public.transfers t where t.tournament_id=p_tournament_id order by t.created_at desc nulls last limit greatest(1,least(p_limit,100)) offset greatest(p_offset,0)
$$;
create or replace function public.get_financial_transactions_page(p_tournament_id text,p_team_id text default null,p_limit integer default 25,p_offset integer default 0)
returns table(data jsonb,total_count bigint) language sql stable security definer set search_path=public as $$
  select f.raw_data, count(*) over() from public.financial_transactions f where f.tournament_id=p_tournament_id and (p_team_id is null or f.team_id=p_team_id) order by f.created_at desc nulls last limit greatest(1,least(p_limit,100)) offset greatest(p_offset,0)
$$;
grant execute on function public.get_matches_page(text,integer,integer) to anon,authenticated;
grant execute on function public.get_transfers_page(text,integer,integer) to anon,authenticated;
grant execute on function public.get_financial_transactions_page(text,text,integer,integer) to anon,authenticated;

grant execute on function public.get_legacy_snapshot() to anon, authenticated;
grant execute on function public.commit_legacy_snapshot(jsonb,bigint,text,text,text) to anon, authenticated;
grant execute on function public.market_purchase(text,text,text,text,numeric,text,text,text) to anon, authenticated;
grant execute on function public.market_sale(text,text,text,text,numeric,text,text,text) to anon, authenticated;
grant execute on function public.create_trade_offer(jsonb,text) to anon, authenticated;
grant execute on function public.counter_trade_offer(text,text,numeric,text) to anon, authenticated;
grant execute on function public.accept_trade_offer(text,text,text,text,text) to anon, authenticated;
grant execute on function public.apply_match_rewards(text,text,jsonb,text) to anon, authenticated;
grant execute on function public.rollback_operation(uuid,text) to anon, authenticated;

commit;
