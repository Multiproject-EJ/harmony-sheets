import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@16.5.0?target=deno&no-check'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

type CreateProductRequest = {
  name: string
  description?: string
  price: number
  currency: string
  interval: 'month' | 'year' | 'one_time'
}

serve(async (req) => {
  const { name, description, price, currency, interval } = (await req.json()) as CreateProductRequest

  const supabaseClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' })

  const product = await stripe.products.create({ name, description })
  const stripePrice = await stripe.prices.create({
    product: product.id,
    unit_amount: price,
    currency,
    recurring: interval === 'one_time' ? undefined : { interval }
  })

  const { data: productRow, error: productError } = await supabaseClient
    .from('products')
    .insert({
      name,
      description,
      stripe_product_id: product.id,
      status: 'active'
    })
    .select()
    .single()

  if (productError) {
    return new Response(JSON.stringify({ error: productError.message }), { status: 400 })
  }

  const { data: priceRow, error: priceError } = await supabaseClient
    .from('prices')
    .insert({
      product_id: productRow.id,
      unit_amount: price,
      currency,
      interval,
      stripe_price_id: stripePrice.id
    })
    .select()
    .single()

  if (priceError) {
    return new Response(JSON.stringify({ error: priceError.message }), { status: 400 })
  }

  await supabaseClient
    .from('products')
    .update({ default_price_id: priceRow.id })
    .eq('id', productRow.id)

  return new Response(JSON.stringify({ product: productRow, price: priceRow }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
