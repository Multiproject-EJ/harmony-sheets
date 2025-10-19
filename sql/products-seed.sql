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
    add column if not exists draft boolean default false,
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
        draft,
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
            false,
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
            false,
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
            false,
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
            false,
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
            false,
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
            false,
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
        draft = excluded.draft,
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

with data(slug, stars, quote) as (
    values
        ('pomodoro', '★★★★★', $$Loved by busy students, makers, and teams. 'It gets me started in 10 seconds.'$$),
        ('budget-dashboard', '★★★★★', $$Used by 1,000+ people to master their personal finances.$$),
        ('pomodoro-pro', '★★★★★', $$“Pomodoro Pro changed how I study and work — the analytics are gold.”$$),
        ('ultimate-subscription-tracker', '★★★★★', $$Customers trimmed an average of $42/month in unwanted subscriptions.$$),
        ('ultimate-study-planner', '★★★★★', $$“I finally feel in control of my course load and downtime.”$$),
        ('smart-savings-tracker', '★★★★★', $$Users report hitting savings milestones 27% faster with weekly check-ins.$$)
), mapped as (
    select map.id, data.stars, data.quote
    from data
    join temp_product_map map on map.slug = data.slug
)
insert into public.product_social_proof (product_id, stars, quote)
select mapped.id, mapped.stars, mapped.quote
from mapped
on conflict (product_id) do update set
    stars = excluded.stars,
    quote = excluded.quote;

delete from public.product_life_areas
where product_id in (select id from temp_product_map);

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

delete from public.product_badges
where product_id in (select id from temp_product_map);

with data(slug, badge, position) as (
    values
        ('pomodoro', 'One-time purchase', 1),
        ('pomodoro', 'No login', 2),
        ('pomodoro', 'Instant download', 3),
        ('pomodoro', 'Google Sheets compatible', 4),
        ('budget-dashboard', 'One-time purchase', 1),
        ('budget-dashboard', 'Instant Google Sheets setup', 2),
        ('budget-dashboard', 'Track income & expenses', 3),
        ('budget-dashboard', 'Visual dashboards', 4),
        ('pomodoro-pro', 'Advanced features', 1),
        ('pomodoro-pro', 'Goal tracking', 2),
        ('pomodoro-pro', 'Focus analytics', 3),
        ('pomodoro-pro', 'Google Sheets + Web', 4),
        ('ultimate-subscription-tracker', 'One-time purchase', 1),
        ('ultimate-subscription-tracker', 'Track renewals', 2),
        ('ultimate-subscription-tracker', 'Cancel reminders', 3),
        ('ultimate-subscription-tracker', 'Google Sheets compatible', 4),
        ('ultimate-study-planner', 'One-time purchase', 1),
        ('ultimate-study-planner', 'Focus blocks', 2),
        ('ultimate-study-planner', 'Study analytics', 3),
        ('ultimate-study-planner', 'Google Sheets compatible', 4),
        ('smart-savings-tracker', 'One-time purchase', 1),
        ('smart-savings-tracker', 'Goal tracking', 2),
        ('smart-savings-tracker', 'Progress visuals', 3),
        ('smart-savings-tracker', 'Google Sheets compatible', 4)
), mapped as (
    select map.id, data.badge, data.position
    from data
    join temp_product_map map on map.slug = data.slug
)
insert into public.product_badges (product_id, badge, position)
select mapped.id, mapped.badge, mapped.position
from mapped
order by mapped.id, mapped.position;

delete from public.product_features
where product_id in (select id from temp_product_map);

with data(slug, feature, position) as (
    values
        ('pomodoro', 'Auto-start Pomodoros and breaks', 1),
        ('pomodoro', '10+ color themes', 2),
        ('pomodoro', 'Today & Session counters', 3),
        ('pomodoro', 'Optional session logging', 4),
        ('budget-dashboard', 'Monthly income & expense tracking', 1),
        ('budget-dashboard', 'Smart budget categories', 2),
        ('budget-dashboard', 'Visual dashboards & charts', 3),
        ('budget-dashboard', 'Annual overview', 4),
        ('pomodoro-pro', 'Session analytics & history', 1),
        ('pomodoro-pro', 'Custom goals & streak tracking', 2),
        ('pomodoro-pro', 'Integrates with Google Calendar', 3),
        ('pomodoro-pro', 'Extended theme pack', 4),
        ('ultimate-subscription-tracker', 'Automatic monthly & annual cost rollups', 1),
        ('ultimate-subscription-tracker', 'Renewal heat map to forecast cash flow', 2),
        ('ultimate-subscription-tracker', 'Smart reminders for upcoming renewals', 3),
        ('ultimate-subscription-tracker', 'Cancellation checklist & notes', 4),
        ('ultimate-study-planner', 'Drag-and-drop weekly planner', 1),
        ('ultimate-study-planner', 'Exam and project countdowns', 2),
        ('ultimate-study-planner', 'Habit & energy check-ins', 3),
        ('ultimate-study-planner', 'Review dashboard for grades and wins', 4),
        ('smart-savings-tracker', 'Goal-based envelopes with target dates', 1),
        ('smart-savings-tracker', 'Progress bars that update automatically', 2),
        ('smart-savings-tracker', 'Motivation dashboard with wins & notes', 3),
        ('smart-savings-tracker', 'Savings habit tracker and reminders', 4)
), mapped as (
    select map.id, data.feature, data.position
    from data
    join temp_product_map map on map.slug = data.slug
)
insert into public.product_features (product_id, feature, position)
select mapped.id, mapped.feature, mapped.position
from mapped
order by mapped.id, mapped.position;

delete from public.product_gallery
where product_id in (select id from temp_product_map);

with data(slug, image_src, image_alt, position) as (
    values
        ('pomodoro', 'assets/Pomodoro1.webp', 'Screenshot of the Harmony Sheets Pomodoro timer', 1),
        ('budget-dashboard', 'assets/imgBudgetPro1.webp', 'Budget Dashboard overview in Google Sheets', 1),
        ('ultimate-subscription-tracker', 'assets/imgSubscriptions1.webp', 'Overview of the Ultimate Subscription Tracker', 1),
        ('ultimate-study-planner', 'assets/imgStudyPlanner1.webp', 'Weekly schedule inside the Ultimate Study Planner', 1),
        ('smart-savings-tracker', 'assets/imgSavings1.webp', 'Savings goals dashboard with progress bars', 1)
), mapped as (
    select map.id, data.image_src, data.image_alt, data.position
    from data
    join temp_product_map map on map.slug = data.slug
)
insert into public.product_gallery (product_id, image_src, image_alt, position)
select mapped.id, mapped.image_src, mapped.image_alt, mapped.position
from mapped
order by mapped.id, mapped.position;

delete from public.product_included_items
where product_id in (select id from temp_product_map);

with data(slug, included_item, position) as (
    values
        ('pomodoro', 'Pomodoro Timer (Web + Google Sheets sidebar compatible)', 1),
        ('pomodoro', 'Free updates', 2),
        ('pomodoro', 'Quick-start guide', 3),
        ('pomodoro', 'Email support', 4),
        ('budget-dashboard', 'Budget Dashboard Google Sheet', 1),
        ('budget-dashboard', 'Setup guide', 2),
        ('budget-dashboard', 'Email support', 3),
        ('budget-dashboard', 'Lifetime access', 4),
        ('pomodoro-pro', 'Pomodoro Pro app (Web + Sheets sidebar)', 1),
        ('pomodoro-pro', 'Analytics dashboard', 2),
        ('pomodoro-pro', 'Extended theme pack', 3),
        ('pomodoro-pro', 'Priority support', 4),
        ('ultimate-subscription-tracker', 'Subscription Tracker Google Sheet', 1),
        ('ultimate-subscription-tracker', 'Renewal reminder template', 2),
        ('ultimate-subscription-tracker', 'Setup & audit checklist', 3),
        ('ultimate-subscription-tracker', 'Email support', 4),
        ('ultimate-study-planner', 'Study Planner Google Sheet', 1),
        ('ultimate-study-planner', 'Semester roadmap template', 2),
        ('ultimate-study-planner', 'Reflection journal prompts', 3),
        ('ultimate-study-planner', 'Email support', 4),
        ('smart-savings-tracker', 'Savings Tracker Google Sheet', 1),
        ('smart-savings-tracker', 'Goal planning mini-guide', 2),
        ('smart-savings-tracker', 'Savings habit prompts', 3),
        ('smart-savings-tracker', 'Email support', 4)
), mapped as (
    select map.id, data.included_item, data.position
    from data
    join temp_product_map map on map.slug = data.slug
)
insert into public.product_included_items (product_id, included_item, position)
select mapped.id, mapped.included_item, mapped.position
from mapped
order by mapped.id, mapped.position;

delete from public.product_faqs
where product_id in (select id from temp_product_map);

with data(slug, question, answer, position) as (
    values
        ('pomodoro', 'Can I change Pomodoro and break lengths?', $$Yes, fully customizable.$$, 1),
        ('pomodoro', 'Does it require a subscription?', $$No. One-time purchase only.$$, 2),
        ('pomodoro', 'Does it work offline?', $$Yes, once loaded in your browser or Sheets sidebar.$$, 3),
        ('budget-dashboard', 'Can I use this with multiple accounts?', $$Yes, you can track any number of accounts.$$, 1),
        ('budget-dashboard', 'Do I need Excel?', $$No, it's designed for Google Sheets.$$, 2),
        ('budget-dashboard', 'Does it auto-import bank transactions?', $$Not yet — but CSV imports are supported.$$, 3),
        ('pomodoro-pro', 'How is Pro different from the regular Pomodoro?', $$Pro adds analytics, goals, integrations, and premium themes.$$, 1),
        ('pomodoro-pro', 'Can I upgrade from the standard Pomodoro?', $$Yes — email us for an upgrade discount.$$, 2),
        ('pomodoro-pro', 'Does it sync with Google Calendar?', $$Yes, optional integration is included.$$, 3),
        ('ultimate-subscription-tracker', 'Can I track both monthly and annual plans?', $$Yes, the tracker automatically rolls up any billing cadence.$$, 1),
        ('ultimate-subscription-tracker', 'Does it send reminder emails?', $$Use the built-in reminder log to copy events into your calendar.$$, 2),
        ('ultimate-subscription-tracker', 'Can I share it with my partner or team?', $$Yes, invite collaborators just like any Google Sheet.$$, 3),
        ('ultimate-study-planner', 'Is it only for college students?', $$No, it's flexible for any self-paced learning or certification prep.$$, 1),
        ('ultimate-study-planner', 'Can I plan group projects?', $$Yes, tag collaborators and track shared milestones.$$, 2),
        ('ultimate-study-planner', 'Does it support multiple terms?', $$Duplicate the planner for each term and archive past semesters.$$, 3),
        ('smart-savings-tracker', 'Can I track multiple goals at once?', $$Yes, manage unlimited goals with their own timelines.$$, 1),
        ('smart-savings-tracker', 'Does it connect to my bank?', $$Not automatically, but quick-entry forms make manual updates easy.$$, 2),
        ('smart-savings-tracker', 'Can couples share the tracker?', $$Yes, invite your partner and update together in Google Sheets.$$, 3)
), mapped as (
    select map.id, data.question, data.answer, data.position
    from data
    join temp_product_map map on map.slug = data.slug
)
insert into public.product_faqs (product_id, question, answer, position)
select mapped.id, mapped.question, mapped.answer, mapped.position
from mapped
order by mapped.id, mapped.position;

delete from public.product_benefits
where product_id in (select id from temp_product_map);

with data(slug, title, description, position) as (
    values
        ('pomodoro', 'Beat procrastination', 'Structured cycles make the first step effortless.', 1),
        ('pomodoro', 'Stay in flow', 'Auto-start Pomodoros and breaks keep you moving.', 2),
        ('pomodoro', 'Feel calm', 'Minimal UI and gentle alerts keep focus first.', 3),
        ('budget-dashboard', 'Know where your money goes', 'Automatic charts and breakdowns.', 1),
        ('budget-dashboard', 'Plan with confidence', 'Track savings goals and debt repayments.', 2),
        ('budget-dashboard', 'Stay motivated', 'Visual dashboards keep you engaged.', 3),
        ('pomodoro-pro', 'Track progress over time', 'Analytics dashboard reveals your productivity patterns.', 1),
        ('pomodoro-pro', 'Stay accountable', 'Custom goals and streaks keep you consistent.', 2),
        ('pomodoro-pro', 'Focus with style', 'Unlock premium themes and layouts.', 3),
        ('ultimate-subscription-tracker', 'Stop surprise renewals', 'Visual timeline keeps every billing date top of mind.', 1),
        ('ultimate-subscription-tracker', 'Lower recurring costs', 'Spot duplicate apps and negotiate before renewals hit.', 2),
        ('ultimate-subscription-tracker', 'Share with confidence', 'Collaborate on household or team subscriptions effortlessly.', 3),
        ('ultimate-study-planner', 'Stay on top of deadlines', 'Countdown trackers surface urgent assignments automatically.', 1),
        ('ultimate-study-planner', 'Protect your energy', 'Balance focus blocks with rest using mood and habit check-ins.', 2),
        ('ultimate-study-planner', 'Celebrate progress', 'Weekly reviews show wins, grades, and lessons learned.', 3),
        ('smart-savings-tracker', 'Visualize every deposit', 'Progress bars update instantly to show momentum.', 1),
        ('smart-savings-tracker', 'Stay motivated', 'Milestone celebrations and note prompts keep you inspired.', 2),
        ('smart-savings-tracker', 'Plan together', 'Great for households aligning on shared savings goals.', 3)
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
