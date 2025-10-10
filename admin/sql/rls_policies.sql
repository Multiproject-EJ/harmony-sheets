alter table products enable row level security;
alter table prices enable row level security;

create policy "Allow service role" on products for all to service_role using (true) with check (true);
create policy "Allow service role" on prices for all to service_role using (true) with check (true);
