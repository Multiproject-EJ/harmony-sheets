insert into storage.buckets (id, name, public)
values ('goals-media', 'goals-media', false)
on conflict (id) do nothing;

grant usage on schema storage to authenticated;

grant select, insert, update, delete on all tables in schema storage to authenticated;

create policy "Users can access own media" on storage.objects
  for select using (bucket_id = 'goals-media' and (auth.uid())::text = substring(name from '[^/]+'));
