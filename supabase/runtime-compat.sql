begin;

create table if not exists public.runtime_documents (
  document_key text primary key,
  document_value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by_profile_id text references public.profiles(id) on delete set null
);

alter table public.runtime_documents enable row level security;
drop policy if exists anon_read on public.runtime_documents;
create policy anon_read on public.runtime_documents for select to anon using (true);
grant select on public.runtime_documents to anon, authenticated;
revoke insert, update, delete, truncate on public.runtime_documents from anon, authenticated;

create or replace function public.get_runtime_documents()
returns jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'revision', coalesce((select revision from public.app_meta where id = true), 0),
    'documents', coalesce((select jsonb_object_agg(document_key, document_value) from public.runtime_documents), '{}'::jsonb),
    'adminSecurity', coalesce((select jsonb_strip_nulls(jsonb_build_object(
      'passwordHash', password_hash,
      'updatedAt', case when updated_at is null then null else extract(epoch from updated_at) * 1000 end,
      'updatedByProfileId', updated_by_profile_id
    )) from public.admin_security where id = true), '{}'::jsonb)
  );
$$;

create or replace function public.commit_runtime_documents(
  p_documents jsonb default '{}'::jsonb,
  p_delete_keys text[] default '{}'::text[],
  p_expected_revision bigint default null,
  p_actor_profile_id text default null,
  p_event_type text default 'runtime_change',
  p_tournament_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_revision bigint;
  v_item record;
begin
  select revision into v_revision
  from public.app_meta
  where id = true
  for update;

  if p_expected_revision is not null and v_revision <> p_expected_revision then
    return jsonb_build_object('committed', false, 'revision', v_revision);
  end if;

  if p_documents is not null then
    for v_item in select * from jsonb_each(p_documents)
    loop
      insert into public.runtime_documents(document_key, document_value, updated_at, updated_by_profile_id)
      values (v_item.key, v_item.value, now(), p_actor_profile_id)
      on conflict (document_key) do update
      set document_value = excluded.document_value,
          updated_at = excluded.updated_at,
          updated_by_profile_id = excluded.updated_by_profile_id;
    end loop;
  end if;

  if p_delete_keys is not null and cardinality(p_delete_keys) > 0 then
    delete from public.runtime_documents
    where document_key = any(p_delete_keys);
  end if;

  v_revision := v_revision + 1;
  update public.app_meta
  set revision = v_revision,
      updated_at = now()
  where id = true;

  insert into public.sync_events(revision, event_type, tournament_id, actor_profile_id, payload)
  values (v_revision, p_event_type, p_tournament_id, p_actor_profile_id,
    jsonb_build_object('keys', coalesce((select jsonb_agg(k.document_key) from jsonb_object_keys(coalesce(p_documents, '{}'::jsonb)) as k(document_key)), '[]'::jsonb),
                       'deletedKeys', to_jsonb(coalesce(p_delete_keys, '{}'::text[]))));

  return jsonb_build_object('committed', true, 'revision', v_revision);
end;
$$;

grant execute on function public.get_runtime_documents() to anon, authenticated;
grant execute on function public.commit_runtime_documents(jsonb,text[],bigint,text,text,text) to anon, authenticated;

commit;
