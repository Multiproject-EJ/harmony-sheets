import { useMemo } from 'react'
import {
  AppBar,
  Box,
  Container,
  IconButton,
  Stack,
  Toolbar,
  Typography
} from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import KpiCards from '../components/KpiCards'
import SalesChart from '../components/SalesChart'

export default function Analytics() {
  const navigate = useNavigate()

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

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100' }}>
      <AppBar position="sticky" color="primary" enableColorOnDark>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Harmony Sheets — Analytics
          </Typography>
          <IconButton color="inherit" onClick={handleSignOut}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 4 }}>
        <Stack spacing={4}>
          <Stack spacing={1}>
            <Typography variant="h4" fontWeight={600}>
              Revenue performance
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Monitor high-level metrics and monthly recurring revenue.
            </Typography>
          </Stack>

          <KpiCards kpis={kpis} />
          <SalesChart data={sales} />
        </Stack>
      </Container>
    </Box>
  )
}
