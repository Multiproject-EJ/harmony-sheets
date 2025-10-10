import { supabase } from './supabaseClient'
import type { ProductWithPrice } from './types'

type CreateProductPayload = {
  name: string
  description?: string
  price: number
  currency: string
  interval: 'month' | 'year' | 'one_time'
}

type UpdatePricePayload = {
  productId: string
  priceId?: string
  price: number
  currency: string
  interval: 'month' | 'year' | 'one_time'
}

export async function fetchProducts(): Promise<ProductWithPrice[]> {
  const { data, error } = await supabase
    .from('products_with_prices')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as ProductWithPrice[]
}

export async function createStripeProduct(payload: CreateProductPayload) {
  const { data, error } = await supabase.functions.invoke('create_stripe_product', {
    body: payload
  })

  if (error) throw error
  return data
}

export async function updateStripePrice(payload: UpdatePricePayload) {
  const { data, error } = await supabase.functions.invoke('update_stripe_price', {
    body: payload
  })

  if (error) throw error
  return data
}
