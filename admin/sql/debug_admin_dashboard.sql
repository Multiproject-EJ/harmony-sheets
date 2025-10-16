-- Debug helper queries for the Harmony Sheets admin dashboard
-- -----------------------------------------------------------
-- Run these statements in the Supabase SQL editor (or any Postgres client)
-- to verify that the commerce schema powering the admin dashboard is ready.
-- Each section focuses on a different aspect so you can copy/paste the
-- portion you need when troubleshooting.

-- 1. Confirm the core tables and view exist
select table_schema,
       table_name,
       table_type
from information_schema.tables
where table_schema = 'public'
  and table_name in ('products', 'prices', 'products_with_prices')
order by table_name;

-- 2. Inspect the column definitions for the products and prices tables
select table_name,
       column_name,
       data_type,
       is_nullable,
       column_default
from information_schema.columns
where table_schema = 'public'
  and table_name in ('products', 'prices')
order by table_name, ordinal_position;

-- 3. Count the rows in each table so you can confirm Supabase contains data
select 'products' as entity, count(*) as row_count from public.products
union all
select 'prices' as entity, count(*) as row_count from public.prices;

-- 4. Identify any products whose default_price_id no longer points to a price
select p.id,
       p.name,
       p.status,
       p.default_price_id
from public.products p
left join public.prices pr on pr.id = p.default_price_id
where p.default_price_id is not null
  and pr.id is null;

-- 5. Review a snapshot of the products_with_prices view
select pwp.*
from public.products_with_prices pwp
order by pwp.created_at desc
limit 20;

-- 6. List row-level security policies in case access looks incorrect
select schemaname,
       tablename,
       policyname,
       qual,
       with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('products', 'prices')
order by tablename, policyname;

-- 7. Confirm row-level security is actually enabled on the tables
select relname,
       relrowsecurity as rls_enabled,
       relforcerowsecurity as force_rls
from pg_class
where relname in ('products', 'prices')
order by relname;

-- 8. Ensure the pgcrypto extension exists so gen_random_uuid() works
select extname,
       nspname as schema
from pg_extension
where extname = 'pgcrypto';
