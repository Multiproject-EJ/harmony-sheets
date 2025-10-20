create extension if not exists "pgcrypto";

create table if not exists public.bundles (
    id uuid primary key default gen_random_uuid(),
    slug text not null unique,
    name text not null,
    badge text,
    tagline text,
    nav_tagline text,
    nav_cta text,
    price_amount numeric(10, 2),
    price_currency text not null default 'USD',
    price_display text,
    savings_display text,
    category text,
    color_hex text,
    nav_color_hex text,
    cta_label text,
    page_url text,
    stripe_url text,
    draft boolean not null default false,
    nav_featured boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.bundle_includes (
    id bigserial primary key,
    bundle_id uuid not null references public.bundles(id) on delete cascade,
    item text not null,
    position integer not null default 0
);

create table if not exists public.bundle_products (
    id bigserial primary key,
    bundle_id uuid not null references public.bundles(id) on delete cascade,
    product_slug text references public.products(slug) on delete set null,
    position integer not null default 0
);

create index if not exists bundle_includes_bundle_id_position_idx
    on public.bundle_includes (bundle_id, position);

create index if not exists bundle_products_bundle_id_position_idx
    on public.bundle_products (bundle_id, position);

create index if not exists bundle_products_product_slug_idx
    on public.bundle_products (product_slug);
