begin;

with bundle_source as (
    select *
    from (values
        (
            'back-to-school',
            'Back to School Bundle',
            'Student Focus',
            'Reset your semester routines with synchronized study, class, and budget trackers.',
            'Class schedules, assignments, and study flow in one dashboard.',
            'View bundle details',
            49.00,
            'USD',
            '$49',
            '$18',
            'planning',
            '#2563eb',
            '#2563eb',
            'View bundle details',
            'bundle-back-to-school.html',
            'https://buy.stripe.com/test_backtoschool',
            false,
            true
        ),
        (
            'premium',
            'Premium Bundle',
            'Pro Essentials',
            'Every flagship Harmony Sheet gathered into a premium toolkit.',
            'Unlock the complete toolkit of flagship templates.',
            'View bundle details',
            119.00,
            'USD',
            '$119',
            '$42',
            'productivity',
            '#7c3aed',
            '#7c3aed',
            'View bundle details',
            'bundle-premium.html',
            'https://buy.stripe.com/test_premium',
            false,
            true
        ),
        (
            'full-life-hack',
            'Full Life Hack Bundle',
            'Life Harmony',
            'Transform every area of your Life Harmony Wheel with coordinated systems.',
            'Transform every area with aligned rituals and dashboards.',
            'View bundle details',
            159.00,
            'USD',
            '$159',
            '$58',
            'lifestyle',
            '#0ea5e9',
            '#0ea5e9',
            'View bundle details',
            'bundle-full-life-hack.html',
            'https://buy.stripe.com/test_fulllifehack',
            false,
            true
        ),
        (
            'personal-finance',
            'Personal Finance Bundle',
            'Money Clarity',
            'Master budgets, goals, and spending with calm, visual dashboards.',
            'Budgets, debt payoff, and savings snapshots at a glance.',
            'View bundle details',
            69.00,
            'USD',
            '$69',
            '$24',
            'finance',
            '#22c55e',
            '#22c55e',
            'View bundle details',
            'bundle-personal-finance.html',
            'https://buy.stripe.com/test_personalfinance',
            false,
            true
        )
    ) as t(
        slug,
        name,
        badge,
        tagline,
        nav_tagline,
        nav_cta,
        price_amount,
        price_currency,
        price_display,
        savings_display,
        category,
        color_hex,
        nav_color_hex,
        cta_label,
        page_url,
        stripe_url,
        draft,
        nav_featured
    )
),
upserted as (
    insert into public.bundles (
        slug,
        name,
        badge,
        tagline,
        nav_tagline,
        nav_cta,
        price_amount,
        price_currency,
        price_display,
        savings_display,
        category,
        color_hex,
        nav_color_hex,
        cta_label,
        page_url,
        stripe_url,
        draft,
        nav_featured
    )
    select
        slug,
        name,
        badge,
        tagline,
        nav_tagline,
        nav_cta,
        price_amount,
        price_currency,
        price_display,
        savings_display,
        category,
        color_hex,
        nav_color_hex,
        cta_label,
        page_url,
        stripe_url,
        draft,
        nav_featured
    from bundle_source
    on conflict (slug) do update set
        name = excluded.name,
        badge = excluded.badge,
        tagline = excluded.tagline,
        nav_tagline = excluded.nav_tagline,
        nav_cta = excluded.nav_cta,
        price_amount = excluded.price_amount,
        price_currency = excluded.price_currency,
        price_display = excluded.price_display,
        savings_display = excluded.savings_display,
        category = excluded.category,
        color_hex = excluded.color_hex,
        nav_color_hex = excluded.nav_color_hex,
        cta_label = excluded.cta_label,
        page_url = excluded.page_url,
        stripe_url = excluded.stripe_url,
        draft = excluded.draft,
        nav_featured = excluded.nav_featured,
        updated_at = timezone('utc', now())
    returning id, slug
),
all_targets as (
    select id, slug from upserted
    union
    select b.id, b.slug
    from public.bundles b
    join bundle_source s on s.slug = b.slug
),
include_source as (
    select *
    from (values
        ('back-to-school', 1, 'Semester Course Planner'),
        ('back-to-school', 2, 'Assignment Tracker Dashboard'),
        ('back-to-school', 3, 'Weekly Study Schedule'),
        ('back-to-school', 4, 'Student Budget Snapshot'),
        ('premium', 1, 'Ultimate Habit Operating System'),
        ('premium', 2, 'Project Command Center'),
        ('premium', 3, 'Executive Finance Console'),
        ('premium', 4, 'Deep Work Time Blocking Studio'),
        ('full-life-hack', 1, 'Relationship Ritual Tracker'),
        ('full-life-hack', 2, 'Career OKR Planner'),
        ('full-life-hack', 3, 'Holistic Health Notebook'),
        ('full-life-hack', 4, 'Joy & Recreation Logbook'),
        ('full-life-hack', 5, 'Spiritual Reflection Journal'),
        ('personal-finance', 1, 'Annual Budget HQ'),
        ('personal-finance', 2, 'Monthly Cash Flow Radar'),
        ('personal-finance', 3, 'Savings Goal Tracker'),
        ('personal-finance', 4, 'Debt Payoff Momentum Map')
    ) as t(slug, position, item)
)
-- clear existing includes for target bundles
delete from public.bundle_includes bi
using all_targets t
where bi.bundle_id = t.id;

insert into public.bundle_includes (bundle_id, item, position)
select t.id, src.item, src.position
from include_source src
join all_targets t on t.slug = src.slug
order by t.slug, src.position;

-- clear existing product links for target bundles
delete from public.bundle_products bp
using all_targets t
where bp.bundle_id = t.id;

commit;
