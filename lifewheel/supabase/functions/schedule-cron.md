# Supabase Schedule Configuration

Configure Supabase Scheduled Functions to keep reminders and questionnaires prepared.

## Reminder Dispatch
- Function: `reminders-email`
- Function: `reminders-push`
- Schedule: every 5 minutes (`*/5 * * * *`)

This cadence allows the functions to look ahead 10 minutes and deduplicate sends using the `send_log` table.

## Questionnaire Preparation
Create a SQL cron job or Edge Function that inserts upcoming questionnaire windows.

Example schedule definitions:

- Monthly: `0 6 1 * *` – runs at 06:00 UTC on the first of every month.
- Weekly: `0 6 * * 1` – runs every Monday at 06:00 UTC.
- Daily: `0 5 * * *` – runs daily at 05:00 UTC to ensure daily check-ins exist.

Each job should:
1. Check if a questionnaire already exists for the period and user.
2. Insert missing rows with `window_start` and `window_end` aligned to the user timezone.
3. Optionally enqueue reminders for upcoming windows.

Refer to Supabase docs: [https://supabase.com/docs/guides/functions/schedule-functions](https://supabase.com/docs/guides/functions/schedule-functions)
