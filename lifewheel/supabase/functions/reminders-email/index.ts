import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendEmail } from '../_shared/email.ts';
import { isDue } from '../_shared/rrule.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async () => {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });
  const now = new Date();
  const { data: reminders, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('enabled', true);
  if (error) {
    console.error('Failed to load reminders', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  if (!reminders) {
    return new Response(JSON.stringify({ sent: 0 }));
  }
  const userIds = Array.from(new Set(reminders.map((reminder) => reminder.user_id)));
  const { data: profiles } = await supabase.from('profiles').select('*').in('user_id', userIds);
  let sent = 0;
  for (const reminder of reminders) {
    if (!isDue(reminder, now)) continue;
    const profile = profiles?.find((item) => item.user_id === reminder.user_id);
    if (!profile?.email) continue;
    const dedupeKey = `${reminder.id}-${now.toISOString().slice(0, 13)}`;
    const { data: existing } = await supabase
      .from('send_log')
      .select('id')
      .eq('dedupe_key', dedupeKey)
      .maybeSingle();
    if (existing) continue;
    await sendEmail(SUPABASE_URL, SERVICE_ROLE_KEY, {
      to: profile.email,
      subject: 'Life-Wheel Reminder',
      html: `<p>Hi ${profile.email},</p><p>You have a reminder for ${reminder.entity}.</p>`
    });
    await supabase.from('send_log').insert({
      user_id: reminder.user_id,
      reminder_id: reminder.id,
      channel: 'email',
      dedupe_key: dedupeKey
    });
    sent += 1;
  }
  return new Response(JSON.stringify({ sent }), { headers: { 'Content-Type': 'application/json' } });
});
