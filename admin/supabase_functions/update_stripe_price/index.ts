import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@16.5.0?target=deno&no-check'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

type UpdatePriceRequest = {
  productId: string
  priceId?: string
  price: number
  currency: string
  interval: 'month' | 'year' | 'one_time'
}

serve(async (req) => {
  const { productId, priceId, price, currency, interval } = (await req.json()) as UpdatePriceRequest

  const supabaseClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' })

  const stripePrice = await stripe.prices.create({
    currency,
    unit_amount: price,
    product: productId,
    recurring: interval === 'one_time' ? undefined : { interval }
  })

  if (priceId) {
    await stripe.prices.update(priceId, { active: false })
  }

  const { data: newPrice, error } = await supabaseClient
    .from('prices')
    .insert({
      product_id: productId,
      unit_amount: price,
      currency,
      interval,
      stripe_price_id: stripePrice.id
    })
    .select()
    .single()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }

  await supabaseClient.from('products').update({ default_price_id: newPrice.id }).eq('id', productId)

  return new Response(JSON.stringify({ price: newPrice }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
