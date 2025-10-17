create extension if not exists "pgcrypto";

create table if not exists public.products (
    id uuid primary key default gen_random_uuid(),
    slug text not null unique,
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
    product_id uuid primary key references public.products(id) on delete cascade,
    stars text,
    quote text
);

create table if not exists public.product_life_areas (
    id bigserial primary key,
    product_id uuid not null references public.products(id) on delete cascade,
    life_area text not null,
    position integer not null default 0
);

create table if not exists public.product_badges (
    id bigserial primary key,
    product_id uuid not null references public.products(id) on delete cascade,
    badge text not null,
    position integer not null default 0
);

create table if not exists public.product_features (
    id bigserial primary key,
    product_id uuid not null references public.products(id) on delete cascade,
    feature text not null,
    position integer not null default 0
);

create table if not exists public.product_gallery (
    id bigserial primary key,
    product_id uuid not null references public.products(id) on delete cascade,
    image_src text not null,
    image_alt text,
    position integer not null default 0
);

create table if not exists public.product_included_items (
    id bigserial primary key,
    product_id uuid not null references public.products(id) on delete cascade,
    included_item text not null,
    position integer not null default 0
);

create table if not exists public.product_faqs (
    id bigserial primary key,
    product_id uuid not null references public.products(id) on delete cascade,
    question text not null,
    answer text not null,
    position integer not null default 0
);

create table if not exists public.product_benefits (
    id bigserial primary key,
    product_id uuid not null references public.products(id) on delete cascade,
    title text not null,
    description text not null,
    position integer not null default 0
);

do $$
declare
    products_id_is_text boolean;
begin
    select exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'products'
          and column_name = 'id'
          and data_type = 'text'
    )
    into products_id_is_text;

    if products_id_is_text then
        if not exists (
            select 1
            from information_schema.columns
            where table_schema = 'public'
              and table_name = 'products'
              and column_name = 'slug'
        ) then
            alter table public.products add column slug text;
        end if;

        update public.products
        set slug = id
        where slug is null;

        alter table public.products alter column slug set not null;

        begin
            alter table public.products add constraint products_slug_key unique (slug);
        exception
            when duplicate_object then null;
        end;

        if not exists (
            select 1
            from information_schema.columns
            where table_schema = 'public'
              and table_name = 'products'
              and column_name = 'id_uuid'
        ) then
            alter table public.products add column id_uuid uuid default gen_random_uuid();
        end if;

        update public.products
        set id_uuid = coalesce(id_uuid, gen_random_uuid());

        begin
            alter table public.products add constraint products_id_uuid_key unique (id_uuid);
        exception
            when duplicate_object then null;
        end;

        if exists (
            select 1
            from information_schema.columns
            where table_schema = 'public'
              and table_name = 'product_social_proof'
              and column_name = 'product_id'
              and data_type = 'text'
        ) then
            alter table public.product_social_proof add column if not exists product_id_uuid uuid;

            update public.product_social_proof psp
            set product_id_uuid = p.id_uuid
            from public.products p
            where psp.product_id = p.id;

            alter table public.product_social_proof drop constraint if exists product_social_proof_product_id_fkey;
            alter table public.product_social_proof drop constraint if exists product_social_proof_pkey;
            alter table public.product_social_proof drop column product_id;
            alter table public.product_social_proof rename column product_id_uuid to product_id;
            alter table public.product_social_proof alter column product_id set not null;
            alter table public.product_social_proof add primary key (product_id);
            alter table public.product_social_proof add constraint product_social_proof_product_id_fkey foreign key (product_id) references public.products(id_uuid) on delete cascade;
        end if;

        if exists (
            select 1
            from information_schema.columns
            where table_schema = 'public'
              and table_name = 'product_life_areas'
              and column_name = 'product_id'
              and data_type = 'text'
        ) then
            alter table public.product_life_areas add column if not exists product_id_uuid uuid;

            update public.product_life_areas pla
            set product_id_uuid = p.id_uuid
            from public.products p
            where pla.product_id = p.id;

            alter table public.product_life_areas drop constraint if exists product_life_areas_product_id_fkey;
            alter table public.product_life_areas drop column product_id;
            alter table public.product_life_areas rename column product_id_uuid to product_id;
            alter table public.product_life_areas alter column product_id set not null;
            alter table public.product_life_areas add constraint product_life_areas_product_id_fkey foreign key (product_id) references public.products(id_uuid) on delete cascade;
        end if;

        if exists (
            select 1
            from information_schema.columns
            where table_schema = 'public'
              and table_name = 'product_badges'
              and column_name = 'product_id'
              and data_type = 'text'
        ) then
            alter table public.product_badges add column if not exists product_id_uuid uuid;

            update public.product_badges pb
            set product_id_uuid = p.id_uuid
            from public.products p
            where pb.product_id = p.id;

            alter table public.product_badges drop constraint if exists product_badges_product_id_fkey;
            alter table public.product_badges drop column product_id;
            alter table public.product_badges rename column product_id_uuid to product_id;
            alter table public.product_badges alter column product_id set not null;
            alter table public.product_badges add constraint product_badges_product_id_fkey foreign key (product_id) references public.products(id_uuid) on delete cascade;
        end if;

        if exists (
            select 1
            from information_schema.columns
            where table_schema = 'public'
              and table_name = 'product_features'
              and column_name = 'product_id'
              and data_type = 'text'
        ) then
            alter table public.product_features add column if not exists product_id_uuid uuid;

            update public.product_features pf
            set product_id_uuid = p.id_uuid
            from public.products p
            where pf.product_id = p.id;

            alter table public.product_features drop constraint if exists product_features_product_id_fkey;
            alter table public.product_features drop column product_id;
            alter table public.product_features rename column product_id_uuid to product_id;
            alter table public.product_features alter column product_id set not null;
            alter table public.product_features add constraint product_features_product_id_fkey foreign key (product_id) references public.products(id_uuid) on delete cascade;
        end if;

        if exists (
            select 1
            from information_schema.columns
            where table_schema = 'public'
              and table_name = 'product_gallery'
              and column_name = 'product_id'
              and data_type = 'text'
        ) then
            alter table public.product_gallery add column if not exists product_id_uuid uuid;

            update public.product_gallery pg
            set product_id_uuid = p.id_uuid
            from public.products p
            where pg.product_id = p.id;

            alter table public.product_gallery drop constraint if exists product_gallery_product_id_fkey;
            alter table public.product_gallery drop column product_id;
            alter table public.product_gallery rename column product_id_uuid to product_id;
            alter table public.product_gallery alter column product_id set not null;
            alter table public.product_gallery add constraint product_gallery_product_id_fkey foreign key (product_id) references public.products(id_uuid) on delete cascade;
        end if;

        if exists (
            select 1
            from information_schema.columns
            where table_schema = 'public'
              and table_name = 'product_included_items'
              and column_name = 'product_id'
              and data_type = 'text'
        ) then
            alter table public.product_included_items add column if not exists product_id_uuid uuid;

            update public.product_included_items pii
            set product_id_uuid = p.id_uuid
            from public.products p
            where pii.product_id = p.id;

            alter table public.product_included_items drop constraint if exists product_included_items_product_id_fkey;
            alter table public.product_included_items drop column product_id;
            alter table public.product_included_items rename column product_id_uuid to product_id;
            alter table public.product_included_items alter column product_id set not null;
            alter table public.product_included_items add constraint product_included_items_product_id_fkey foreign key (product_id) references public.products(id_uuid) on delete cascade;
        end if;

        if exists (
            select 1
            from information_schema.columns
            where table_schema = 'public'
              and table_name = 'product_faqs'
              and column_name = 'product_id'
              and data_type = 'text'
        ) then
            alter table public.product_faqs add column if not exists product_id_uuid uuid;

            update public.product_faqs pf
            set product_id_uuid = p.id_uuid
            from public.products p
            where pf.product_id = p.id;

            alter table public.product_faqs drop constraint if exists product_faqs_product_id_fkey;
            alter table public.product_faqs drop column product_id;
            alter table public.product_faqs rename column product_id_uuid to product_id;
            alter table public.product_faqs alter column product_id set not null;
            alter table public.product_faqs add constraint product_faqs_product_id_fkey foreign key (product_id) references public.products(id_uuid) on delete cascade;
        end if;

        if exists (
            select 1
            from information_schema.columns
            where table_schema = 'public'
              and table_name = 'product_benefits'
              and column_name = 'product_id'
              and data_type = 'text'
        ) then
            alter table public.product_benefits add column if not exists product_id_uuid uuid;

            update public.product_benefits pb
            set product_id_uuid = p.id_uuid
            from public.products p
            where pb.product_id = p.id;

            alter table public.product_benefits drop constraint if exists product_benefits_product_id_fkey;
            alter table public.product_benefits drop column product_id;
            alter table public.product_benefits rename column product_id_uuid to product_id;
            alter table public.product_benefits alter column product_id set not null;
            alter table public.product_benefits add constraint product_benefits_product_id_fkey foreign key (product_id) references public.products(id_uuid) on delete cascade;
        end if;

        alter table public.products drop constraint if exists products_pkey;
        alter table public.products drop column id;
        alter table public.products rename column id_uuid to id;
        alter table public.products alter column id set default gen_random_uuid();
        alter table public.products alter column id set not null;
        alter table public.products add primary key (id);
    end if;
end
$$;

