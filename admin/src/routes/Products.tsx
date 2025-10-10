import { useEffect, useState } from 'react'
import {
  AppBar,
  Box,
  Button,
  Container,
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
import ProductTable from '../components/ProductTable'
import ProductDrawer from '../components/ProductDrawer'

export default function Products() {
  const [products, setProducts] = useState<ProductWithPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductWithPrice | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadProducts()
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
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100' }}>
      <AppBar position="sticky" color="primary" enableColorOnDark>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Harmony Sheets — Products
          </Typography>
          <IconButton color="inherit" onClick={handleSignOut}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <div>
            <Typography variant="h4" fontWeight={600} gutterBottom>
              Product catalog
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create, update, and archive products synced with Stripe.
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
          loading={loading}
          onEdit={(product) => {
            setSelectedProduct(product)
            setDrawerOpen(true)
          }}
        />
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
