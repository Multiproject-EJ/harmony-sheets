-- Schema for Harmony Sheets product catalog in Supabase (PostgreSQL)

create table if not exists public.products (
    id text primary key,
    name text not null,
    tagline text,
    description text,
    price_amount numeric(10, 2) not null,
    price_currency text not null default 'USD',
    price_display text not null,
    hero_image text,
    color_image text,
    color_caption text,
    demo_video text,
    demo_poster text,
    virtual_demo text,
    pricing_title text,
    pricing_sub text,
    stripe_url text,
    etsy_url text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.product_social_proof (
    product_id text primary key references public.products(id) on delete cascade,
    stars text,
    quote text
);

create table if not exists public.product_life_areas (
    id bigserial primary key,
    product_id text not null references public.products(id) on delete cascade,
    life_area text not null,
    position integer not null default 0
);

create table if not exists public.product_badges (
    id bigserial primary key,
    product_id text not null references public.products(id) on delete cascade,
    badge text not null,
    position integer not null default 0
);

create table if not exists public.product_features (
    id bigserial primary key,
    product_id text not null references public.products(id) on delete cascade,
    feature text not null,
    position integer not null default 0
);

create table if not exists public.product_gallery (
    id bigserial primary key,
    product_id text not null references public.products(id) on delete cascade,
    image_src text not null,
    image_alt text,
    position integer not null default 0
);

create table if not exists public.product_included_items (
    id bigserial primary key,
    product_id text not null references public.products(id) on delete cascade,
    included_item text not null,
    position integer not null default 0
);

create table if not exists public.product_faqs (
    id bigserial primary key,
    product_id text not null references public.products(id) on delete cascade,
    question text not null,
    answer text not null,
    position integer not null default 0
);

create table if not exists public.product_benefits (
    id bigserial primary key,
    product_id text not null references public.products(id) on delete cascade,
    title text not null,
    description text not null,
    position integer not null default 0
);

create or replace function public.set_current_timestamp_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

do $$
begin
    if not exists (
        select 1
        from pg_trigger
        where tgname = 'set_products_updated_at'
    ) then
        create trigger set_products_updated_at
        before update on public.products
        for each row
        execute function public.set_current_timestamp_updated_at();
    end if;
end $$;
