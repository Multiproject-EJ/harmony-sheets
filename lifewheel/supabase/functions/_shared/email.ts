import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail(clientUrl: string, serviceKey: string, payload: EmailPayload) {
  const client = createClient(clientUrl, serviceKey, {
    auth: { persistSession: false }
  });
  const { error } = await client.functions.invoke('sb-send-email', {
    body: payload
  });
  if (error) {
    throw error;
  }
}
