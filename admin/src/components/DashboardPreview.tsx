import { useMemo } from 'react'
import { Box, Paper, Stack, Typography } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import KpiCards from './KpiCards'
import SalesChart from './SalesChart'
import ProductTable from './ProductTable'
import type { ProductWithPrice } from '../lib/types'

const demoProducts: ProductWithPrice[] = [
  {
    id: 'demo-product-1',
    name: 'Harmony Sheets Starter',
    description: 'Perfect for freelancers launching their first business templates.',
    status: 'active',
    default_price_id: 'demo-price-1',
    created_at: '2024-01-10T00:00:00.000Z',
    price: {
      id: 'demo-price-1',
      product_id: 'demo-product-1',
      nickname: 'Monthly',
      unit_amount: 1900,
      currency: 'usd',
      interval: 'month',
      created_at: '2024-01-10T00:00:00.000Z'
    }
  },
  {
    id: 'demo-product-2',
    name: 'Harmony Sheets Pro',
    description: 'Advanced automation bundles for established creators and teams.',
    status: 'active',
    default_price_id: 'demo-price-2',
    created_at: '2023-11-18T00:00:00.000Z',
    price: {
      id: 'demo-price-2',
      product_id: 'demo-product-2',
      nickname: 'Annual',
      unit_amount: 14900,
      currency: 'usd',
      interval: 'year',
      created_at: '2023-11-18T00:00:00.000Z'
    }
  },
  {
    id: 'demo-product-3',
    name: 'Harmony Sheets Lifetime',
    description: 'One-time access to every sheet, dashboard, and automation update.',
    status: 'archived',
    default_price_id: 'demo-price-3',
    created_at: '2023-08-05T00:00:00.000Z',
    price: {
      id: 'demo-price-3',
      product_id: 'demo-product-3',
      nickname: 'Lifetime',
      unit_amount: 29900,
      currency: 'usd',
      interval: 'one_time',
      created_at: '2023-08-05T00:00:00.000Z'
    }
  }
]

export default function DashboardPreview() {
  const theme = useTheme()
  const subtlePrimary = alpha(theme.palette.primary.main, 0.08)
  const subtleSecondary = alpha(theme.palette.secondary.main, 0.1)
  const surfaceBorder = alpha(theme.palette.primary.main, 0.12)

  const kpis = useMemo(
    () => [
      { label: 'MRR (demo)', value: '$3,840', change: 12 },
      { label: 'Active subscribers', value: '482', change: 8 },
      { label: 'Conversion rate', value: '6.4%', change: -2 }
    ],
    []
  )

  const sales = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, index) => ({
        date: `2024-${String(index + 1).padStart(2, '0')}-01`,
        amount: Math.round(2000 + Math.random() * 1500)
      })),
    []
  )

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 4, md: 5 },
        height: '100%',
        borderRadius: 4,
        border: '1px solid',
        borderColor: surfaceBorder,
        background: `linear-gradient(135deg, ${subtlePrimary} 0%, ${subtleSecondary} 100%)`,
        color: theme.palette.text.primary,
        backdropFilter: 'blur(12px)'
      }}
    >
      <Stack spacing={4} height="100%">
        <Stack spacing={1}>
          <Typography variant="h5" fontWeight={600}>
            Dashboard preview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This is a live preview using demo data. Sign in to replace it with your product
            catalog and customer metrics.
          </Typography>
        </Stack>

        <KpiCards kpis={kpis} />
        <SalesChart data={sales} />

        <Box>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={2}
            mb={2}
          >
            <Stack spacing={0.5}>
              <Typography variant="h6" fontWeight={600}>
                Product catalog
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Browse the sample plans that mimic your Stripe-connected products.
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Editing is disabled in preview mode
            </Typography>
          </Stack>

          <ProductTable products={demoProducts} loading={false} />
        </Box>

        <Typography variant="body2" color="text.secondary" textAlign="center">
          Sign in with your admin account to see real orders, revenue, and catalog updates.
        </Typography>
      </Stack>
    </Paper>
  )
}
