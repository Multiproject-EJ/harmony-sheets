begin;

create temporary table temp_seed_products (
    slug text primary key,
    id uuid
) on commit drop;

with product_data (slug, name, tagline, price_amount, price_display, status_text) as (
    values
        ('budget-dashboard', 'Budget Dashboard — Personal Finance Tracker', 'Take control of your money with clarity and confidence.', 9.00, '$9', 'Active status for Budget Dashboard — Personal Finance Tracker'),
        ('pomodoro', 'Pomodoro — Productivity & Study Timer', 'Focus faster with structured 25–5 cycles. Calm visuals, zero clutter.', 2.50, '$2.50', 'Active status for Pomodoro — Productivity & Study Timer'),
        ('pomodoro-pro', 'Pomodoro Pro — Advanced Productivity System', 'The upgraded Pomodoro with analytics, goals, and smart focus tools.', 18.00, '$18', 'Active status for Pomodoro Pro — Advanced Productivity System'),
        ('smart-savings-tracker', 'Smart Savings Tracker', 'Turn your savings goals into clear milestones you''ll actually reach.', 2.50, '$2.50', 'Active status for Smart Savings Tracker'),
        ('ultimate-study-planner', 'Ultimate Study Planner', 'Plan deep work, assignments, and exams with a calm weekly rhythm.', 18.00, '$18', 'Active status for Ultimate Study Planner'),
        ('ultimate-subscription-tracker', 'Ultimate Subscription Tracker', 'See every recurring charge at a glance and cancel what you don''t need.', 2.50, '$2.50', 'Active status for Ultimate Subscription Tracker')
), upserted as (
    insert into public.products (
        slug,
        name,
        tagline,
        price_amount,
        price_currency,
        price_display,
        draft,
        pricing_title
    )
    select
        slug,
        name,
        tagline,
        price_amount,
        'USD' as price_currency,
        price_display,
        false as draft,
        status_text as pricing_title
    from product_data
    on conflict (slug) do update set
        name = excluded.name,
        tagline = excluded.tagline,
        price_amount = excluded.price_amount,
        price_currency = excluded.price_currency,
        price_display = excluded.price_display,
        draft = excluded.draft,
        pricing_title = excluded.pricing_title,
        updated_at = now()
    returning slug, id
)
insert into temp_seed_products (slug, id)
select slug, id
from upserted
on conflict (slug) do update set id = excluded.id;

-- Replace life areas for seeded products
with life_area_data (slug, life_area, position) as (
    values
        ('budget-dashboard', 'finances', 1),
        ('budget-dashboard', 'family', 2),
        ('budget-dashboard', 'environment', 3),
        ('budget-dashboard', 'love', 4),
        ('pomodoro', 'career', 1),
        ('pomodoro', 'health', 2),
        ('pomodoro', 'fun', 3),
        ('pomodoro', 'spirituality', 4),
        ('pomodoro-pro', 'career', 1),
        ('pomodoro-pro', 'health', 2),
        ('pomodoro-pro', 'fun', 3),
        ('pomodoro-pro', 'family', 4),
        ('pomodoro-pro', 'spirituality', 5),
        ('smart-savings-tracker', 'finances', 1),
        ('smart-savings-tracker', 'family', 2),
        ('smart-savings-tracker', 'love', 3),
        ('ultimate-study-planner', 'career', 1),
        ('ultimate-study-planner', 'health', 2),
        ('ultimate-study-planner', 'fun', 3),
        ('ultimate-study-planner', 'spirituality', 4),
        ('ultimate-subscription-tracker', 'finances', 1),
        ('ultimate-subscription-tracker', 'career', 2),
        ('ultimate-subscription-tracker', 'environment', 3)
)
delete from public.product_life_areas pla
using temp_seed_products tsp
where pla.product_id = tsp.id;

insert into public.product_life_areas (product_id, life_area, position)
select tsp.id, lad.life_area, lad.position
from life_area_data lad
join temp_seed_products tsp on tsp.slug = lad.slug
order by tsp.slug, lad.position;

-- Replace badges for seeded products
with badge_data (slug, position, badge) as (
    values
        ('budget-dashboard', 1, 'One-time purchase'),
        ('budget-dashboard', 2, 'Instant Google Sheets setup'),
        ('budget-dashboard', 3, 'Track income & expenses'),
        ('budget-dashboard', 4, 'Visual dashboards'),
        ('pomodoro', 1, 'One-time purchase'),
        ('pomodoro', 2, 'No login'),
        ('pomodoro', 3, 'Instant download'),
        ('pomodoro', 4, 'Google Sheets compatible'),
        ('pomodoro-pro', 1, 'Advanced features'),
        ('pomodoro-pro', 2, 'Goal tracking'),
        ('pomodoro-pro', 3, 'Focus analytics'),
        ('pomodoro-pro', 4, 'Google Sheets + Web'),
        ('smart-savings-tracker', 1, 'One-time purchase'),
        ('smart-savings-tracker', 2, 'Goal tracking'),
        ('smart-savings-tracker', 3, 'Progress visuals'),
        ('smart-savings-tracker', 4, 'Google Sheets compatible'),
        ('ultimate-study-planner', 1, 'One-time purchase'),
        ('ultimate-study-planner', 2, 'Focus blocks'),
        ('ultimate-study-planner', 3, 'Study analytics'),
        ('ultimate-study-planner', 4, 'Google Sheets compatible'),
        ('ultimate-subscription-tracker', 1, 'One-time purchase'),
        ('ultimate-subscription-tracker', 2, 'Track renewals'),
        ('ultimate-subscription-tracker', 3, 'Cancel reminders'),
        ('ultimate-subscription-tracker', 4, 'Google Sheets compatible')
)
delete from public.product_badges pb
using temp_seed_products tsp
where pb.product_id = tsp.id;

insert into public.product_badges (product_id, badge, position)
select tsp.id, bd.badge, bd.position
from badge_data bd
join temp_seed_products tsp on tsp.slug = bd.slug
order by tsp.slug, bd.position;

commit;
