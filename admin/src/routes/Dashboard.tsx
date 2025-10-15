import { useEffect, useMemo, useState } from 'react'
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  Stack,
  Toolbar,
  Typography
} from '@mui/material'
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
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductWithPrice | null>(null)

  const kpis = useMemo(
    () => [
      { label: 'Monthly recurring revenue', value: '$4,120', change: 9 },
      { label: 'Active subscribers', value: '517', change: 7 },
      { label: 'New customers', value: '68', change: 4 }
    ],
    []
  )

  const sales = useMemo(
    () => [
      { date: '2024-01-01', amount: 2280 },
      { date: '2024-02-01', amount: 2415 },
      { date: '2024-03-01', amount: 2595 },
      { date: '2024-04-01', amount: 2710 },
      { date: '2024-05-01', amount: 2890 },
      { date: '2024-06-01', amount: 3015 },
      { date: '2024-07-01', amount: 3140 },
      { date: '2024-08-01', amount: 3275 },
      { date: '2024-09-01', amount: 3435 },
      { date: '2024-10-01', amount: 3580 },
      { date: '2024-11-01', amount: 3720 },
      { date: '2024-12-01', amount: 3985 }
    ],
    []
  )

  useEffect(() => {
    void loadProducts()
  }, [])

  async function loadProducts() {
    try {
      setLoadingProducts(true)
      const data = await fetchProducts()
      setProducts(data)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load products', error)
    } finally {
      setLoadingProducts(false)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100' }}>
      <AppBar position="sticky" color="primary" enableColorOnDark>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Harmony Sheets — Admin dashboard
          </Typography>
          <IconButton color="inherit" onClick={handleSignOut}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 4 }}>
        <Stack spacing={5}>
          <Stack spacing={1}>
            <Typography variant="h4" fontWeight={600}>
              Business overview
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Monitor revenue trends and keep your product catalog up to date.
            </Typography>
          </Stack>

          <Stack spacing={3}>
            <Stack spacing={1}>
              <Typography variant="h6" fontWeight={600}>
                Sales & customers
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Track high-level performance metrics from the past year.
              </Typography>
            </Stack>
            <KpiCards kpis={kpis} />
            <SalesChart data={sales} />
          </Stack>

          <Divider />

          <Stack spacing={3}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', md: 'center' }}
              spacing={2}
            >
              <div>
                <Typography variant="h6" fontWeight={600}>
                  Product catalog
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Create, edit, and archive products synced with Stripe.
                </Typography>
              </div>
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
              loading={loadingProducts}
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
