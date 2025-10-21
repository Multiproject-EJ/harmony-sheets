-- Debugger script for Harmony Sheets product data access
-- -------------------------------------------------------
-- This diagnostic script is designed for the Supabase SQL editor (or psql).
-- Run it to verify that all tables powering the public product and products
-- pages exist, expose the required columns with the correct data types, have
-- accessible data, and are readable by the `anon` role through Row Level
-- Security (RLS) policies.
--
-- The script is read-only: it performs no writes and can safely be executed in
-- production. Each section focuses on a different aspect of the storefront
-- data pipeline:
--   1. Required table presence and row counts
--   2. Column type & nullability validation
--   3. High-level data quality checks
--   4. Orphaned relation detection
--   5. Privilege and RLS policy visibility for the `anon` role
--
-- If any row in the output highlights a problem ("missing", "type mismatch",
-- "should be not null", orphan counts, or lack of anon privileges), adjust the
-- schema or policies accordingly and re-run the script until everything reports
-- as expected.

-- 1. Verify required tables exist and report estimated row counts
with required_tables as (
    values
        ('public', 'products'),
        ('public', 'product_social_proof'),
        ('public', 'product_life_areas'),
        ('public', 'product_badges'),
        ('public', 'product_features'),
        ('public', 'product_gallery'),
        ('public', 'product_included_items'),
        ('public', 'product_faqs'),
        ('public', 'product_benefits')
)
select
    rt.column1 as schema_name,
    rt.column2 as table_name,
    (t.table_name is not null) as table_exists,
    coalesce(s.n_live_tup, 0) as approx_row_count
from required_tables rt
left join information_schema.tables t
    on t.table_schema = rt.column1 and t.table_name = rt.column2
left join pg_class c
    on c.relname = rt.column2
left join pg_namespace n
    on n.oid = c.relnamespace and n.nspname = rt.column1
left join pg_stat_user_tables s
    on s.relid = c.oid
order by rt.column1, rt.column2;

-- 2. Confirm critical columns exist with expected data types & nullability
with required_columns as (
    select * from (values
        -- products
        ('products', 'id', 'uuid', true),
        ('products', 'slug', 'text', true),
        ('products', 'name', 'text', true),
        ('products', 'tagline', 'text', false),
        ('products', 'description', 'text', false),
        ('products', 'price_amount', 'numeric(10,2)', true),
        ('products', 'price_currency', 'text', true),
        ('products', 'price_display', 'text', true),
        ('products', 'draft', 'boolean', true),
        ('products', 'hero_image', 'text', false),
        ('products', 'color_image', 'text', false),
        ('products', 'color_caption', 'text', false),
        ('products', 'demo_video', 'text', false),
        ('products', 'demo_poster', 'text', false),
        ('products', 'virtual_demo', 'text', false),
        ('products', 'pricing_title', 'text', false),
        ('products', 'pricing_sub', 'text', false),
        ('products', 'stripe_url', 'text', false),
        ('products', 'etsy_url', 'text', false),
        ('products', 'created_at', 'timestamp with time zone', true),
        ('products', 'updated_at', 'timestamp with time zone', true),
        -- product_social_proof
        ('product_social_proof', 'product_id', 'uuid', true),
        ('product_social_proof', 'stars', 'text', false),
        ('product_social_proof', 'quote', 'text', false),
        -- product_life_areas
        ('product_life_areas', 'id', 'bigint', true),
        ('product_life_areas', 'product_id', 'uuid', true),
        ('product_life_areas', 'life_area', 'text', true),
        ('product_life_areas', 'position', 'integer', true),
        -- product_badges
        ('product_badges', 'id', 'bigint', true),
        ('product_badges', 'product_id', 'uuid', true),
        ('product_badges', 'badge', 'text', true),
        ('product_badges', 'position', 'integer', true),
        -- product_features
        ('product_features', 'id', 'bigint', true),
        ('product_features', 'product_id', 'uuid', true),
        ('product_features', 'feature', 'text', true),
        ('product_features', 'position', 'integer', true),
        -- product_gallery
        ('product_gallery', 'id', 'bigint', true),
        ('product_gallery', 'product_id', 'uuid', true),
        ('product_gallery', 'image_src', 'text', true),
        ('product_gallery', 'image_alt', 'text', false),
        ('product_gallery', 'position', 'integer', true),
        -- product_included_items
        ('product_included_items', 'id', 'bigint', true),
        ('product_included_items', 'product_id', 'uuid', true),
        ('product_included_items', 'included_item', 'text', true),
        ('product_included_items', 'position', 'integer', true),
        -- product_faqs
        ('product_faqs', 'id', 'bigint', true),
        ('product_faqs', 'product_id', 'uuid', true),
        ('product_faqs', 'question', 'text', true),
        ('product_faqs', 'answer', 'text', true),
        ('product_faqs', 'position', 'integer', true),
        -- product_benefits
        ('product_benefits', 'id', 'bigint', true),
        ('product_benefits', 'product_id', 'uuid', true),
        ('product_benefits', 'title', 'text', true),
        ('product_benefits', 'description', 'text', true),
        ('product_benefits', 'position', 'integer', true)
    ) as rc(table_name, column_name, expected_type, required_not_null)
)
select
    rc.table_name,
    rc.column_name,
    rc.expected_type,
    format_type(a.atttypid, a.atttypmod) as actual_type,
    not a.attnotnull as is_nullable,
    case
        when a.attnum is null then 'missing'
        when format_type(a.atttypid, a.atttypmod) <> rc.expected_type then 'type mismatch'
        when rc.required_not_null and not a.attnotnull then 'should be not null'
        else 'ok'
    end as status
from required_columns rc
left join pg_class c
    on c.relname = rc.table_name and c.relkind in ('r', 'p')
left join pg_namespace n
    on n.oid = c.relnamespace and n.nspname = 'public'
left join pg_attribute a
    on a.attrelid = c.oid
   and a.attname = rc.column_name
   and a.attnum > 0
   and not a.attisdropped
order by rc.table_name, rc.column_name;

-- 3. Data quality checks for storefront-critical fields
select
    'products' as table_name,
    count(*) as total_rows,
    count(*) filter (where not draft) as published_rows,
    count(*) filter (where slug is null or slug = '') as missing_slug,
    count(*) filter (where name is null or name = '') as missing_name,
    count(*) filter (where price_display is null or price_display = '') as missing_price_display,
    count(*) filter (where stripe_url is null or stripe_url = '') as missing_stripe_url,
    count(*) filter (where etsy_url is null or etsy_url = '') as missing_etsy_url,
    count(*) filter (where hero_image is null or hero_image = '') as missing_hero_image
from public.products
union all
select
    'product_features' as table_name,
    count(*) as total_rows,
    null,
    count(*) filter (where feature is null or feature = '') as missing_primary_text,
    null,
    null,
    null,
    null
from public.product_features
union all
select
    'product_benefits' as table_name,
    count(*) as total_rows,
    null,
    count(*) filter (where title is null or title = '') as missing_primary_text,
    count(*) filter (where description is null or description = '') as missing_secondary_text,
    null,
    null,
    null
from public.product_benefits
union all
select
    'product_faqs' as table_name,
    count(*) as total_rows,
    null,
    count(*) filter (where question is null or question = '') as missing_primary_text,
    count(*) filter (where answer is null or answer = '') as missing_secondary_text,
    null,
    null,
    null
from public.product_faqs
union all
select
    'product_gallery' as table_name,
    count(*) as total_rows,
    null,
    count(*) filter (where image_src is null or image_src = '') as missing_primary_text,
    null,
    null,
    null,
    null
from public.product_gallery
order by table_name;

-- 4. Detect orphaned rows that reference missing products
with product_refs as (
    select 'product_social_proof'::text as table_name, product_id from public.product_social_proof
    union all select 'product_life_areas', product_id from public.product_life_areas
    union all select 'product_badges', product_id from public.product_badges
    union all select 'product_features', product_id from public.product_features
    union all select 'product_gallery', product_id from public.product_gallery
    union all select 'product_included_items', product_id from public.product_included_items
    union all select 'product_faqs', product_id from public.product_faqs
    union all select 'product_benefits', product_id from public.product_benefits
)
select
    pr.table_name,
    count(*) as total_rows,
    count(*) filter (where p.id is null) as orphan_rows
from product_refs pr
left join public.products p
    on p.id = pr.product_id
group by pr.table_name
order by pr.table_name;

-- 5. Surface anon role privileges and active RLS policies
select
    grants.table_schema,
    grants.table_name,
    grants.grantee,
    string_agg(grants.privilege_type, ', ' order by grants.privilege_type) as privileges
from information_schema.role_table_grants grants
where grants.table_schema = 'public'
  and grants.table_name in (
        'products',
        'product_social_proof',
        'product_life_areas',
        'product_badges',
        'product_features',
        'product_gallery',
        'product_included_items',
        'product_faqs',
        'product_benefits'
    )
  and grants.grantee in ('anon', 'authenticated')
group by grants.table_schema, grants.table_name, grants.grantee
order by grants.table_name, grants.grantee;

select
    pol.schemaname,
    pol.tablename,
    pol.policyname,
    pol.roles,
    pol.cmd,
    pol.qual,
    pol.with_check
from pg_policies pol
where pol.schemaname = 'public'
  and pol.tablename in (
        'products',
        'product_social_proof',
        'product_life_areas',
        'product_badges',
        'product_features',
        'product_gallery',
        'product_included_items',
        'product_faqs',
        'product_benefits'
    )
order by pol.tablename, pol.policyname;
