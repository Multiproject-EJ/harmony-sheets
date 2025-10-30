import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'https://deno.land/x/webpush@v1.4.0/mod.ts';
import { isDue } from '../_shared/rrule.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!;
const CONTACT_EMAIL = Deno.env.get('CONTACT_EMAIL') || 'support@example.com';

serve(async () => {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });
  webpush.setVapidDetails(`mailto:${CONTACT_EMAIL}`, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  const now = new Date();
  const { data: reminders, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('enabled', true)
    .eq('channel', 'push');
  if (error) {
    console.error('Failed to load reminders', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  if (!reminders) {
    return new Response(JSON.stringify({ sent: 0 }));
  }
  const { data: subscriptions } = await supabase
    .from('push_subscriptions')
    .select('*')
    .in('user_id', reminders.map((reminder) => reminder.user_id));
  let sent = 0;
  for (const reminder of reminders) {
    if (!isDue(reminder, now)) continue;
    const subs = subscriptions?.filter((sub) => sub.user_id === reminder.user_id) || [];
    const payload = JSON.stringify({
      title: 'Life-Wheel Reminder',
      body: `Check your ${reminder.entity}.`,
      data: { route: reminder.entity === 'habit' ? 'habits' : 'dashboard', reminderId: reminder.id }
    });
    for (const sub of subs) {
      const subscriptionPayload = sub.keys_json?.endpoint
        ? sub.keys_json
        : { endpoint: sub.endpoint, keys: sub.keys_json?.keys };
      try {
        await webpush.sendNotification(subscriptionPayload as any, payload);
        sent += 1;
      } catch (err) {
        console.error('Push send failed', err);
      }
    }
  }
  return new Response(JSON.stringify({ sent }), { headers: { 'Content-Type': 'application/json' } });
});
