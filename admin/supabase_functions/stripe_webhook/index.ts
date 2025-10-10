import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@16.5.0?target=deno&no-check'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()

  if (!signature) {
    return new Response('Missing Stripe signature', { status: 400 })
  }

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' })
  const supabaseClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, Deno.env.get('STRIPE_WEBHOOK_SECRET')!)
  } catch (error) {
    return new Response(`Webhook Error: ${error instanceof Error ? error.message : 'Unknown error'}`, {
      status: 400
    })
  }

  if (event.type === 'product.updated') {
    const product = event.data.object as Stripe.Product

    await supabaseClient
      .from('products')
      .update({
        name: product.name,
        description: product.description ?? null,
        status: product.active ? 'active' : 'archived'
      })
      .eq('stripe_product_id', product.id)
  }

  if (event.type === 'price.updated') {
    const price = event.data.object as Stripe.Price

    await supabaseClient
      .from('prices')
      .update({
        unit_amount: price.unit_amount ?? null,
        currency: price.currency,
        interval: price.recurring?.interval ?? 'one_time'
      })
      .eq('stripe_price_id', price.id)
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
