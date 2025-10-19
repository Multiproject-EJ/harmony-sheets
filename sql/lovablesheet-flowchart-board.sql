-- Seed the Flowchart sticky board template for LovableSheet.
--
-- Update the admin_email constant below with the Supabase email address
-- of the Harmony Sheets admin who should own the seeded board, then run
-- this script inside the Supabase SQL editor. The script will look up the
-- admin's UUID, replace any existing Flowchart board owned by that admin,
-- and insert a fresh copy that matches the LovableSheet Flowchart preview.

do $$
declare
  admin_email constant text := 'replace-with-admin@example.com';
  admin_id uuid;
  flowchart_notes constant jsonb := '[
    {
      "color": "sunshine",
      "x": 32,
      "y": 40,
      "label": "Kickoff",
      "body": "Highlight the entry trigger and what resources must be gathered before work starts.",
      "placeholder": "Click to capture an idea"
    },
    {
      "color": "meadow",
      "x": 232,
      "y": 40,
      "label": "Decision lane",
      "body": "Document the yes/no split and assign owners for each branch so nothing stalls.",
      "placeholder": "Click to capture an idea"
    },
    {
      "color": "ocean",
      "x": 432,
      "y": 40,
      "label": "Parallel tasks",
      "body": "List the activities that can run concurrently to keep momentum and reduce idle time.",
      "placeholder": "Click to capture an idea"
    },
    {
      "color": "blossom",
      "x": 632,
      "y": 40,
      "label": "Wrap up",
      "body": "Capture the closing signals and follow-up steps that confirm the flow delivered its outcome.",
      "placeholder": "Click to capture an idea"
    }
  ]'::jsonb;
begin
  if admin_email = 'replace-with-admin@example.com' then
    raise exception 'Set admin_email to your Supabase admin email before running this script.';
  end if;

  select id
    into admin_id
  from auth.users
  where lower(email) = lower(admin_email)
  limit 1;

  if admin_id is null then
    raise exception 'Admin account with email % was not found. Update admin_email and rerun the script.', admin_email;
  end if;

  delete from public.lovablesheet_boards
  where lower(name) = 'flowchart'
    and created_by = admin_id;

  insert into public.lovablesheet_boards (name, notes, created_by, updated_by)
  values ('Flowchart', flowchart_notes, admin_id, admin_id);

  raise notice 'Seeded Flowchart board for % (user id=%).', admin_email, admin_id;
end;
$$;
