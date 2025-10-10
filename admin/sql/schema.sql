create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  status text not null default 'active',
  stripe_product_id text unique,
  default_price_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists prices (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  nickname text,
  unit_amount integer,
  currency text not null default 'usd',
  interval text not null default 'one_time',
  stripe_price_id text unique,
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_default_price_fk'
  ) then
    alter table products
      add constraint products_default_price_fk
      foreign key (default_price_id)
      references prices(id);
  end if;
end $$;

create view products_with_prices as
select
  p.id,
  p.name,
  p.description,
  p.status,
  p.default_price_id,
  p.created_at,
  jsonb_build_object(
    'id', pr.id,
    'product_id', pr.product_id,
    'nickname', pr.nickname,
    'unit_amount', pr.unit_amount,
    'currency', pr.currency,
    'interval', pr.interval,
    'created_at', pr.created_at
  ) as price
from products p
left join prices pr on pr.id = p.default_price_id;
