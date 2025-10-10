export type Product = {
  id: string
  name: string
  description: string | null
  status: 'active' | 'archived'
  default_price_id: string | null
  created_at: string
}

export type Price = {
  id: string
  product_id: string
  nickname: string | null
  unit_amount: number | null
  currency: string
  interval: 'month' | 'year' | 'one_time'
  created_at: string
}

export type ProductWithPrice = Product & {
  price: Price | null
}

export type Kpi = {
  label: string
  value: string
  change: number
}

export type Sale = {
  date: string
  amount: number
}
