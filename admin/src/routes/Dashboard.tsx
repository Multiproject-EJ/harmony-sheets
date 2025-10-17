import { useEffect, useMemo, useState } from 'react'
import { Box, Button, Container, Stack, Typography } from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import AddIcon from '@mui/icons-material/Add'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { fetchProducts } from '../lib/stripeFunctions'
import type { ProductWithPrice } from '../lib/types'
import KpiCards from '../components/KpiCards'
import SalesChart from '../components/SalesChart'
import ProductTable from '../components/ProductTable'
import ProductDrawer from '../components/ProductDrawer'

export default function Dashboard() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<ProductWithPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] =
    useState<ProductWithPrice | null>(null)

  const kpis = useMemo(
    () => [
      { label: 'MRR', value: '$3,840', change: 12 },
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

  useEffect(() => {
    void loadProducts()
  }, [])

  async function loadProducts() {
    try {
      setLoading(true)
      const data = await fetchProducts()
      setProducts(data)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load products', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <Box sx={{ bgcolor: 'grey.100' }}>
      <Container sx={{ py: { xs: 6, md: 8 } }}>
        <Stack spacing={6}>
          <Stack spacing={3}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', md: 'center' }}
              spacing={2}
            >
              <Stack spacing={1}>
                <Typography variant="overline" color="primary" fontWeight={600}>
                  Harmony Sheets Admin
                </Typography>
                <Typography variant="h4" fontWeight={600}>
                  Business overview
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Track sales performance and customer growth across Harmony Sheets.
                </Typography>
              </Stack>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<LogoutIcon />}
                onClick={handleSignOut}
              >
                Sign out
              </Button>
            </Stack>

            <KpiCards kpis={kpis} />
            <SalesChart data={sales} />
          </Stack>

          <Stack spacing={3}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={2}
            >
              <Stack spacing={1}>
                <Typography variant="h4" fontWeight={600}>
                  Product catalog
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Create, update, and archive products synced with Stripe.
                </Typography>
              </Stack>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setSelectedProduct(null)
                  setDrawerOpen(true)
                }}
              >
                New product
              </Button>
            </Stack>

            <ProductTable
              products={products}
              loading={loading}
              onEdit={(product) => {
                setSelectedProduct(product)
                setDrawerOpen(true)
              }}
            />
          </Stack>
        </Stack>
      </Container>

      <ProductDrawer
        open={drawerOpen}
        product={selectedProduct}
        onClose={() => setDrawerOpen(false)}
        onUpdated={async () => {
          setDrawerOpen(false)
          await loadProducts()
        }}
      />
    </Box>
  )
}
