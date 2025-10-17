create extension if not exists "pgcrypto";

do $$
begin
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
    set slug = coalesce(slug, id::text)
    where slug is null;

    if not exists (
        select 1
        from pg_constraint con
        join pg_class rel on rel.oid = con.conrelid
        join pg_namespace nsp on nsp.oid = rel.relnamespace
        where con.conname = 'products_slug_key'
          and nsp.nspname = 'public'
    ) then
        alter table public.products add constraint products_slug_key unique (slug);
    end if;

    begin
        alter table public.products alter column slug set not null;
    exception
        when others then null;
    end;
end
$$;

alter table public.products
    add column if not exists name text,
    add column if not exists tagline text,
    add column if not exists description text,
    add column if not exists price_amount numeric(10, 2),
    add column if not exists price_currency text,
    add column if not exists price_display text,
    add column if not exists hero_image text,
    add column if not exists color_image text,
    add column if not exists color_caption text,
    add column if not exists demo_video text,
    add column if not exists demo_poster text,
    add column if not exists virtual_demo text,
    add column if not exists pricing_title text,
    add column if not exists pricing_sub text,
    add column if not exists stripe_url text,
    add column if not exists etsy_url text,
    add column if not exists updated_at timestamptz default now(),
    add column if not exists created_at timestamptz default now();

begin;

create temporary table temp_product_map (
    slug text primary key,
    id uuid
) on commit drop;

with upserted as (
    insert into public.products (
        slug,
        name,
        tagline,
        description,
        price_amount,
        price_currency,
        price_display,
        hero_image,
        color_image,
        color_caption,
        demo_video,
        demo_poster,
        virtual_demo,
        pricing_title,
        pricing_sub,
        stripe_url,
        etsy_url
    )
    values
        (
            'pomodoro',
            'Pomodoro — Productivity & Study Timer',
            'Focus faster with structured 25–5 cycles. Calm visuals, zero clutter.',
            $$<p>This Pomodoro timer helps you <strong>start fast and stay consistent</strong>. Auto-start cycles keep you in flow, optional sound alerts give gentle nudges, and counters track your daily focus without effort.</p>$$,
            9.00,
            'USD',
            '$9',
            'assets/pomodoro-colors.webp',
            'assets/pomodoro-colors.webp',
            'Pick a theme that feels calm and keeps you focused.',
            'assets/pomodoro-demo.mp4',
            'assets/pomodoro-demo-poster.jpg',
            'demos/pomodoro.html',
            'Get the Pomodoro Timer',
            'One-time purchase. Instant access.',
            'https://buy.stripe.com/test_pomodoro_example',
            'https://etsy.com/listing/pomodoro-example'
        ),
        (
            'budget-dashboard',
            'Budget Dashboard — Personal Finance Tracker',
            'Take control of your money with clarity and confidence.',
            $$<p>The <strong>Budget Dashboard</strong> helps you clearly see where your money goes. Track spending, savings, and debt repayments in one place with automatic charts and reports.</p>$$,
            19.00,
            'USD',
            '$19',
            null,
            'assets/budget-colors.webp',
            'Choose a theme that fits your financial journey.',
            'assets/budget-demo.mp4',
            'assets/budget-demo-poster.jpg',
            null,
            'Get the Budget Dashboard',
            'One-time purchase. Lifetime updates.',
            'https://buy.stripe.com/test_budget_example',
            'https://etsy.com/listing/budget-example'
        ),
        (
            'pomodoro-pro',
            'Pomodoro Pro — Advanced Productivity System',
            'The upgraded Pomodoro with analytics, goals, and smart focus tools.',
            $$<p><strong>Pomodoro Pro</strong> is built for power users. Track your focus over weeks and months, set custom goals, and review analytics that show your most productive times of day.</p>$$,
            29.00,
            'USD',
            '$29',
            null,
            'assets/pomodoro-pro-colors.webp',
            'Premium themes and advanced layouts included.',
            'assets/pomodoro-pro-demo.mp4',
            'assets/pomodoro-pro-demo-poster.jpg',
            null,
            'Get Pomodoro Pro',
            'One-time purchase. Includes future Pro updates.',
            'https://buy.stripe.com/test_pomodoro_pro_example',
            'https://etsy.com/listing/pomodoro-pro-example'
        ),
        (
            'ultimate-subscription-tracker',
            'Ultimate Subscription Tracker',
            'See every recurring charge at a glance and cancel what you don''t need.',
            $$<p><strong>Ultimate Subscription Tracker</strong> brings every recurring charge into one calm workspace. Spot duplicate services, set review cadences, and feel confident about what stays on your card.</p>$$,
            17.00,
            'USD',
            '$17',
            null,
            'assets/imgSubscriptions1.webp',
            'Minimal dashboard view with renewal alerts and spending totals.',
            null,
            null,
            null,
            'Get the Ultimate Subscription Tracker',
            'One-time purchase. Keep lifetime access.',
            'https://buy.stripe.com/test_subscription_tracker',
            'https://etsy.com/listing/ultimate-subscription-tracker'
        ),
        (
            'ultimate-study-planner',
            'Ultimate Study Planner',
            'Plan deep work, assignments, and exams with a calm weekly rhythm.',
            $$<p>The <strong>Ultimate Study Planner</strong> keeps your semester organized without overwhelm. Map focus blocks, log progress, and reflect on how you feel so you stay motivated the whole term.</p>$$,
            15.00,
            'USD',
            '$15',
            null,
            'assets/imgStudyPlanner1.webp',
            'Weekly view with color-coded focus blocks and energy check-ins.',
            null,
            null,
            null,
            'Get the Ultimate Study Planner',
            'One-time purchase. Includes free updates.',
            'https://buy.stripe.com/test_study_planner',
            'https://etsy.com/listing/ultimate-study-planner'
        ),
        (
            'smart-savings-tracker',
            'Smart Savings Tracker',
            'Turn your savings goals into clear milestones you''ll actually reach.',
            $$<p><strong>Smart Savings Tracker</strong> turns every savings target into an encouraging roadmap. See how each contribution moves you forward and stay inspired with a dashboard that celebrates momentum.</p>$$,
            14.00,
            'USD',
            '$14',
            null,
            'assets/imgSavings1.webp',
            'Savings goal dashboard with automatic progress tracking.',
            null,
            null,
            null,
            'Get the Smart Savings Tracker',
            'One-time purchase. Lifetime access.',
            'https://buy.stripe.com/test_savings_tracker',
            'https://etsy.com/listing/smart-savings-tracker'
        )
    on conflict (slug) do update set
        name = excluded.name,
        tagline = excluded.tagline,
        description = excluded.description,
        price_amount = excluded.price_amount,
        price_currency = excluded.price_currency,
        price_display = excluded.price_display,
        hero_image = excluded.hero_image,
        color_image = excluded.color_image,
        color_caption = excluded.color_caption,
        demo_video = excluded.demo_video,
        demo_poster = excluded.demo_poster,
        virtual_demo = excluded.virtual_demo,
        pricing_title = excluded.pricing_title,
        pricing_sub = excluded.pricing_sub,
        stripe_url = excluded.stripe_url,
        etsy_url = excluded.etsy_url,
        updated_at = now()
    returning id, slug
)
insert into temp_product_map (slug, id)
select slug, id
from upserted
on conflict (slug) do update set id = excluded.id;

-- Social proof
insert into public.product_social_proof (product_id, stars, quote)
select map.id, data.stars, data.quote
from temp_product_map map
join (values
    ('pomodoro', '★★★★★', $$Loved by busy students, makers, and teams. 'It gets me started in 10 seconds.'$$),
    ('budget-dashboard', '★★★★★', $$Used by 1,000+ people to master their personal finances.$$),
    ('pomodoro-pro', '★★★★★', $$“Pomodoro Pro changed how I study and work — the analytics are gold.”$$),
    ('ultimate-subscription-tracker', '★★★★★', $$Customers trimmed an average of $42/month in unwanted subscriptions.$$),
    ('ultimate-study-planner', '★★★★★', $$“I finally feel in control of my course load and downtime.”$$),
    ('smart-savings-tracker', '★★★★★', $$Users report hitting savings milestones 27% faster with weekly check-ins.$$)
) as data(slug, stars, quote)
    on data.slug = map.slug
on conflict (product_id) do update set
    stars = excluded.stars,
    quote = excluded.quote;

-- Life areas
with data(slug, life_area, position) as (
    values
        ('pomodoro', 'career', 1),
        ('pomodoro', 'health', 2),
        ('pomodoro', 'fun', 3),
        ('pomodoro', 'spirituality', 4),
        ('budget-dashboard', 'finances', 1),
        ('budget-dashboard', 'family', 2),
        ('budget-dashboard', 'environment', 3),
        ('budget-dashboard', 'love', 4),
        ('pomodoro-pro', 'career', 1),
        ('pomodoro-pro', 'health', 2),
        ('pomodoro-pro', 'fun', 3),
        ('pomodoro-pro', 'family', 4),
        ('pomodoro-pro', 'spirituality', 5),
        ('ultimate-subscription-tracker', 'finances', 1),
        ('ultimate-subscription-tracker', 'career', 2),
        ('ultimate-subscription-tracker', 'environment', 3),
        ('ultimate-study-planner', 'career', 1),
        ('ultimate-study-planner', 'health', 2),
        ('ultimate-study-planner', 'fun', 3),
        ('ultimate-study-planner', 'spirituality', 4),
        ('smart-savings-tracker', 'finances', 1),
        ('smart-savings-tracker', 'family', 2),
        ('smart-savings-tracker', 'love', 3)
), mapped as (
    select map.id, data.life_area, data.position
    from data
    join temp_product_map map on map.slug = data.slug
)
delete from public.product_life_areas pla
using mapped
where pla.product_id = mapped.id;

with data(slug, life_area, position) as (
    values
        ('pomodoro', 'career', 1),
        ('pomodoro', 'health', 2),
        ('pomodoro', 'fun', 3),
        ('pomodoro', 'spirituality', 4),
        ('budget-dashboard', 'finances', 1),
        ('budget-dashboard', 'family', 2),
        ('budget-dashboard', 'environment', 3),
        ('budget-dashboard', 'love', 4),
        ('pomodoro-pro', 'career', 1),
        ('pomodoro-pro', 'health', 2),
        ('pomodoro-pro', 'fun', 3),
        ('pomodoro-pro', 'family', 4),
        ('pomodoro-pro', 'spirituality', 5),
        ('ultimate-subscription-tracker', 'finances', 1),
        ('ultimate-subscription-tracker', 'career', 2),
        ('ultimate-subscription-tracker', 'environment', 3),
        ('ultimate-study-planner', 'career', 1),
        ('ultimate-study-planner', 'health', 2),
        ('ultimate-study-planner', 'fun', 3),
        ('ultimate-study-planner', 'spirituality', 4),
        ('smart-savings-tracker', 'finances', 1),
        ('smart-savings-tracker', 'family', 2),
        ('smart-savings-tracker', 'love', 3)
), mapped as (
    select map.id, data.life_area, data.position
    from data
    join temp_product_map map on map.slug = data.slug
)
insert into public.product_life_areas (product_id, life_area, position)
select mapped.id, mapped.life_area, mapped.position
from mapped
order by mapped.id, mapped.position;

-- Badges
with data(slug, badge, position) as (
    values
        ('pomodoro', 'One-time purchase', 1),
        ('pomodoro', 'No login', 2),
        ('pomodoro', 'Instant download', 3),
        ('budget-dashboard', 'One-time purchase', 1),
        ('budget-dashboard', 'No login', 2),
        ('budget-dashboard', 'Instant download', 3),
        ('pomodoro-pro', 'One-time purchase', 1),
        ('pomodoro-pro', 'Advanced analytics', 2),
        ('pomodoro-pro', 'Goal tracking', 3),
        ('ultimate-subscription-tracker', 'Track renewals', 1),
        ('ultimate-subscription-tracker', 'Email reminders', 2),
        ('ultimate-study-planner', 'Weekly planning', 1),
        ('ultimate-study-planner', 'Progress logging', 2),
        ('smart-savings-tracker', 'Goal milestones', 1),
        ('smart-savings-tracker', 'Celebrate wins', 2)
), mapped as (
    select map.id, data.badge, data.position
    from data
    join temp_product_map map on map.slug = data.slug
)
delete from public.product_badges pb
using mapped
where pb.product_id = mapped.id;

with data(slug, badge, position) as (
    values
        ('pomodoro', 'One-time purchase', 1),
        ('pomodoro', 'No login', 2),
        ('pomodoro', 'Instant download', 3),
        ('budget-dashboard', 'One-time purchase', 1),
        ('budget-dashboard', 'No login', 2),
        ('budget-dashboard', 'Instant download', 3),
        ('pomodoro-pro', 'One-time purchase', 1),
        ('pomodoro-pro', 'Advanced analytics', 2),
        ('pomodoro-pro', 'Goal tracking', 3),
        ('ultimate-subscription-tracker', 'Track renewals', 1),
        ('ultimate-subscription-tracker', 'Email reminders', 2),
        ('ultimate-study-planner', 'Weekly planning', 1),
        ('ultimate-study-planner', 'Progress logging', 2),
        ('smart-savings-tracker', 'Goal milestones', 1),
        ('smart-savings-tracker', 'Celebrate wins', 2)
), mapped as (
    select map.id, data.badge, data.position
    from data
    join temp_product_map map on map.slug = data.slug
)
insert into public.product_badges (product_id, badge, position)
select mapped.id, mapped.badge, mapped.position
from mapped
order by mapped.id, mapped.position;

-- Features
with data(slug, feature, position) as (
    values
        ('pomodoro', 'Automatic work/break cycling', 1),
        ('pomodoro', 'Optional sound alerts', 2),
        ('pomodoro', 'Daily focus counter', 3),
        ('budget-dashboard', 'Monthly budget overview', 1),
        ('budget-dashboard', 'Expense categorization', 2),
        ('budget-dashboard', 'Savings goals tracking', 3),
        ('pomodoro-pro', 'Productivity analytics', 1),
        ('pomodoro-pro', 'Custom goal tracking', 2),
        ('pomodoro-pro', 'Focus trends dashboard', 3),
        ('ultimate-subscription-tracker', 'Recurring payment tracking', 1),
        ('ultimate-subscription-tracker', 'Cancellation reminders', 2),
        ('ultimate-study-planner', 'Assignment planning', 1),
        ('ultimate-study-planner', 'Deep work scheduler', 2),
        ('smart-savings-tracker', 'Goal milestone tracking', 1),
        ('smart-savings-tracker', 'Progress visualization', 2)
), mapped as (
    select map.id, data.feature, data.position
    from data
    join temp_product_map map on map.slug = data.slug
)
delete from public.product_features pf
using mapped
where pf.product_id = mapped.id;

with data(slug, feature, position) as (
    values
        ('pomodoro', 'Automatic work/break cycling', 1),
        ('pomodoro', 'Optional sound alerts', 2),
        ('pomodoro', 'Daily focus counter', 3),
        ('budget-dashboard', 'Monthly budget overview', 1),
        ('budget-dashboard', 'Expense categorization', 2),
        ('budget-dashboard', 'Savings goals tracking', 3),
        ('pomodoro-pro', 'Productivity analytics', 1),
        ('pomodoro-pro', 'Custom goal tracking', 2),
        ('pomodoro-pro', 'Focus trends dashboard', 3),
        ('ultimate-subscription-tracker', 'Recurring payment tracking', 1),
        ('ultimate-subscription-tracker', 'Cancellation reminders', 2),
        ('ultimate-study-planner', 'Assignment planning', 1),
        ('ultimate-study-planner', 'Deep work scheduler', 2),
        ('smart-savings-tracker', 'Goal milestone tracking', 1),
        ('smart-savings-tracker', 'Progress visualization', 2)
), mapped as (
    select map.id, data.feature, data.position
    from data
    join temp_product_map map on map.slug = data.slug
)
insert into public.product_features (product_id, feature, position)
select mapped.id, mapped.feature, mapped.position
from mapped
order by mapped.id, mapped.position;

-- Gallery
with data(slug, image_src, image_alt, position) as (
    values
        ('pomodoro', 'assets/pomodoro-gallery-1.webp', 'Minimal timer view with focus session stats.', 1),
        ('pomodoro', 'assets/pomodoro-gallery-2.webp', 'Break timer with calm gradient background.', 2),
        ('pomodoro', 'assets/pomodoro-gallery-3.webp', 'Session history with total focus hours.', 3),
        ('budget-dashboard', 'assets/budget-gallery-1.webp', 'Budget overview dashboard with charts.', 1),
        ('budget-dashboard', 'assets/budget-gallery-2.webp', 'Expense tracking table with categories.', 2),
        ('budget-dashboard', 'assets/budget-gallery-3.webp', 'Savings goals progress view.', 3),
        ('pomodoro-pro', 'assets/pomodoro-pro-gallery-1.webp', 'Advanced analytics dashboard.', 1),
        ('pomodoro-pro', 'assets/pomodoro-pro-gallery-2.webp', 'Goal tracking interface.', 2),
        ('pomodoro-pro', 'assets/pomodoro-pro-gallery-3.webp', 'Focus heatmap calendar.', 3),
        ('ultimate-subscription-tracker', 'assets/subscriptions-gallery-1.webp', 'Subscription dashboard overview.', 1),
        ('ultimate-subscription-tracker', 'assets/subscriptions-gallery-2.webp', 'Renewal calendar view.', 2),
        ('ultimate-study-planner', 'assets/study-planner-gallery-1.webp', 'Weekly planner layout.', 1),
        ('ultimate-study-planner', 'assets/study-planner-gallery-2.webp', 'Task tracking board.', 2),
        ('smart-savings-tracker', 'assets/savings-gallery-1.webp', 'Savings goal dashboard overview.', 1),
        ('smart-savings-tracker', 'assets/savings-gallery-2.webp', 'Milestone tracker screen.', 2)
), mapped as (
    select map.id, data.image_src, data.image_alt, data.position
    from data
    join temp_product_map map on map.slug = data.slug
)
delete from public.product_gallery pg
using mapped
where pg.product_id = mapped.id;

with data(slug, image_src, image_alt, position) as (
    values
        ('pomodoro', 'assets/pomodoro-gallery-1.webp', 'Minimal timer view with focus session stats.', 1),
        ('pomodoro', 'assets/pomodoro-gallery-2.webp', 'Break timer with calm gradient background.', 2),
        ('pomodoro', 'assets/pomodoro-gallery-3.webp', 'Session history with total focus hours.', 3),
        ('budget-dashboard', 'assets/budget-gallery-1.webp', 'Budget overview dashboard with charts.', 1),
        ('budget-dashboard', 'assets/budget-gallery-2.webp', 'Expense tracking table with categories.', 2),
        ('budget-dashboard', 'assets/budget-gallery-3.webp', 'Savings goals progress view.', 3),
        ('pomodoro-pro', 'assets/pomodoro-pro-gallery-1.webp', 'Advanced analytics dashboard.', 1),
        ('pomodoro-pro', 'assets/pomodoro-pro-gallery-2.webp', 'Goal tracking interface.', 2),
        ('pomodoro-pro', 'assets/pomodoro-pro-gallery-3.webp', 'Focus heatmap calendar.', 3),
        ('ultimate-subscription-tracker', 'assets/subscriptions-gallery-1.webp', 'Subscription dashboard overview.', 1),
        ('ultimate-subscription-tracker', 'assets/subscriptions-gallery-2.webp', 'Renewal calendar view.', 2),
        ('ultimate-study-planner', 'assets/study-planner-gallery-1.webp', 'Weekly planner layout.', 1),
        ('ultimate-study-planner', 'assets/study-planner-gallery-2.webp', 'Task tracking board.', 2),
        ('smart-savings-tracker', 'assets/savings-gallery-1.webp', 'Savings goal dashboard overview.', 1),
        ('smart-savings-tracker', 'assets/savings-gallery-2.webp', 'Milestone tracker screen.', 2)
), mapped as (
    select map.id, data.image_src, data.image_alt, data.position
    from data
    join temp_product_map map on map.slug = data.slug
)
insert into public.product_gallery (product_id, image_src, image_alt, position)
select mapped.id, mapped.image_src, mapped.image_alt, mapped.position
from mapped
order by mapped.id, mapped.position;

-- Included items
with data(slug, included_item, position) as (
    values
        ('pomodoro', 'Notion Pomodoro template', 1),
        ('pomodoro', 'Focus session tracker', 2),
        ('budget-dashboard', 'Notion budget workspace', 1),
        ('budget-dashboard', 'Automated monthly reports', 2),
        ('pomodoro-pro', 'Advanced Pomodoro dashboard', 1),
        ('pomodoro-pro', 'Goal tracking database', 2),
        ('ultimate-subscription-tracker', 'Subscription database', 1),
        ('ultimate-subscription-tracker', 'Renewal reminder system', 2),
        ('ultimate-study-planner', 'Weekly and daily planner pages', 1),
        ('ultimate-study-planner', 'Assignment tracker', 2),
        ('smart-savings-tracker', 'Savings dashboard', 1),
        ('smart-savings-tracker', 'Milestone tracker', 2)
), mapped as (
    select map.id, data.included_item, data.position
    from data
    join temp_product_map map on map.slug = data.slug
)
delete from public.product_included_items pii
using mapped
where pii.product_id = mapped.id;

with data(slug, included_item, position) as (
    values
        ('pomodoro', 'Notion Pomodoro template', 1),
        ('pomodoro', 'Focus session tracker', 2),
        ('budget-dashboard', 'Notion budget workspace', 1),
        ('budget-dashboard', 'Automated monthly reports', 2),
        ('pomodoro-pro', 'Advanced Pomodoro dashboard', 1),
        ('pomodoro-pro', 'Goal tracking database', 2),
        ('ultimate-subscription-tracker', 'Subscription database', 1),
        ('ultimate-subscription-tracker', 'Renewal reminder system', 2),
        ('ultimate-study-planner', 'Weekly and daily planner pages', 1),
        ('ultimate-study-planner', 'Assignment tracker', 2),
        ('smart-savings-tracker', 'Savings dashboard', 1),
        ('smart-savings-tracker', 'Milestone tracker', 2)
), mapped as (
    select map.id, data.included_item, data.position
    from data
    join temp_product_map map on map.slug = data.slug
)
insert into public.product_included_items (product_id, included_item, position)
select mapped.id, mapped.included_item, mapped.position
from mapped
order by mapped.id, mapped.position;

-- FAQs
with data(slug, question, answer, position) as (
    values
        ('pomodoro', 'Does the timer keep running if I close the tab?', $$Yes. The timer stays in sync even if you close the tab, so you can come back and pick up where you left off.$$),
        ('pomodoro', 'Can I change the work/break lengths?', $$Absolutely — customize any durations you need, from quick sprints to long focus sessions.$$),
        ('budget-dashboard', 'Does this work for couples or families?', $$Yes! Duplicate the dashboard for shared budgets and invite collaborators with their own logins.$$),
        ('budget-dashboard', 'Can I import transactions?', $$You can quickly paste exports from banks or cards to keep everything up to date.$$),
        ('pomodoro-pro', 'What makes Pomodoro Pro different?', $$You get focus analytics, custom goals, and deep trends tracking built right in.$$),
        ('ultimate-subscription-tracker', 'How do renewal reminders work?', $$Set review cadences for each subscription and get email nudges before they renew.$$),
        ('ultimate-study-planner', 'Can I plan multiple classes?', $$Yes — organize assignments and study blocks by course so nothing slips through.$$),
        ('smart-savings-tracker', 'Will this help with multiple savings goals?', $$Track each goal separately and see combined progress at a glance.$$)
), mapped as (
    select map.id, data.question, data.answer, data.position
    from data
    join temp_product_map map on map.slug = data.slug
)
delete from public.product_faqs pf
using mapped
where pf.product_id = mapped.id;

with data(slug, question, answer, position) as (
    values
        ('pomodoro', 'Does the timer keep running if I close the tab?', $$Yes. The timer stays in sync even if you close the tab, so you can come back and pick up where you left off.$$),
        ('pomodoro', 'Can I change the work/break lengths?', $$Absolutely — customize any durations you need, from quick sprints to long focus sessions.$$),
        ('budget-dashboard', 'Does this work for couples or families?', $$Yes! Duplicate the dashboard for shared budgets and invite collaborators with their own logins.$$),
        ('budget-dashboard', 'Can I import transactions?', $$You can quickly paste exports from banks or cards to keep everything up to date.$$),
        ('pomodoro-pro', 'What makes Pomodoro Pro different?', $$You get focus analytics, custom goals, and deep trends tracking built right in.$$),
        ('ultimate-subscription-tracker', 'How do renewal reminders work?', $$Set review cadences for each subscription and get email nudges before they renew.$$),
        ('ultimate-study-planner', 'Can I plan multiple classes?', $$Yes — organize assignments and study blocks by course so nothing slips through.$$),
        ('smart-savings-tracker', 'Will this help with multiple savings goals?', $$Track each goal separately and see combined progress at a glance.$$)
), mapped as (
    select map.id, data.question, data.answer, data.position
    from data
    join temp_product_map map on map.slug = data.slug
)
insert into public.product_faqs (product_id, question, answer, position)
select mapped.id, mapped.question, mapped.answer, mapped.position
from mapped
order by mapped.id, mapped.position;

-- Benefits
with data(slug, title, description, position) as (
    values
        ('pomodoro', 'Stay focused faster', 'Jump into the first session in seconds with auto-starting timers.', 1),
        ('pomodoro', 'Gentle accountability', 'Sound nudges and counters keep you on track without stress.', 2),
        ('budget-dashboard', 'See everything clearly', 'One dashboard shows spending, income, debt, and savings progress.', 1),
        ('budget-dashboard', 'Plan with confidence', 'Know exactly where your money is going each week and month.', 2),
        ('pomodoro-pro', 'Measure deep work', 'Analytics reveal when you do your best focus work.', 1),
        ('pomodoro-pro', 'Set and hit goals', 'Built-in goal tracking keeps you motivated long term.', 2),
        ('ultimate-subscription-tracker', 'Stop surprise renewals', 'Catch duplicate or forgotten subscriptions before they bill you.', 1),
        ('ultimate-subscription-tracker', 'Feel organized', 'Track reviews, notes, and value so you keep only what serves you.', 2),
        ('ultimate-study-planner', 'Balance course loads', 'Plan assignments, exams, and downtime without overbooking.', 1),
        ('ultimate-study-planner', 'Reflect and improve', 'Track energy and progress so you can adjust and stay motivated.', 2),
        ('smart-savings-tracker', 'Celebrate progress', 'See milestones and momentum so you stay inspired to save.', 1),
        ('smart-savings-tracker', 'Plan the next step', 'Know exactly how much to add next to stay on track.', 2)
), mapped as (
    select map.id, data.title, data.description, data.position
    from data
    join temp_product_map map on map.slug = data.slug
)
delete from public.product_benefits pb
using mapped
where pb.product_id = mapped.id;

with data(slug, title, description, position) as (
    values
        ('pomodoro', 'Stay focused faster', 'Jump into the first session in seconds with auto-starting timers.', 1),
        ('pomodoro', 'Gentle accountability', 'Sound nudges and counters keep you on track without stress.', 2),
        ('budget-dashboard', 'See everything clearly', 'One dashboard shows spending, income, debt, and savings progress.', 1),
        ('budget-dashboard', 'Plan with confidence', 'Know exactly where your money is going each week and month.', 2),
        ('pomodoro-pro', 'Measure deep work', 'Analytics reveal when you do your best focus work.', 1),
        ('pomodoro-pro', 'Set and hit goals', 'Built-in goal tracking keeps you motivated long term.', 2),
        ('ultimate-subscription-tracker', 'Stop surprise renewals', 'Catch duplicate or forgotten subscriptions before they bill you.', 1),
        ('ultimate-subscription-tracker', 'Feel organized', 'Track reviews, notes, and value so you keep only what serves you.', 2),
        ('ultimate-study-planner', 'Balance course loads', 'Plan assignments, exams, and downtime without overbooking.', 1),
        ('ultimate-study-planner', 'Reflect and improve', 'Track energy and progress so you can adjust and stay motivated.', 2),
        ('smart-savings-tracker', 'Celebrate progress', 'See milestones and momentum so you stay inspired to save.', 1),
        ('smart-savings-tracker', 'Plan the next step', 'Know exactly how much to add next to stay on track.', 2)
), mapped as (
    select map.id, data.title, data.description, data.position
    from data
    join temp_product_map map on map.slug = data.slug
)
insert into public.product_benefits (product_id, title, description, position)
select mapped.id, mapped.title, mapped.description, mapped.position
from mapped
order by mapped.id, mapped.position;

commit;
