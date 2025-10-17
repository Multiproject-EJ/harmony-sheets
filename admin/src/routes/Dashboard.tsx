import { Box, Button, Container, Paper, Stack, Typography } from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function Dashboard() {
  const navigate = useNavigate()

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <Box sx={{ bgcolor: 'grey.100', flex: 1 }}>
      <Container sx={{ py: { xs: 6, md: 8 }, display: 'flex', justifyContent: 'center' }}>
        <Paper
          elevation={0}
          sx={{
            maxWidth: 480,
            width: '100%',
            p: { xs: 4, md: 6 },
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper'
          }}
        >
          <Stack spacing={3}>
            <Stack spacing={1}>
              <Typography variant="overline" color="primary" fontWeight={600}>
                Harmony Sheets Admin
              </Typography>
              <Typography variant="h4" fontWeight={600}>
                You're logged in
              </Typography>
              <Typography variant="body1" color="text.secondary">
                This minimal admin area confirms your access. Additional tools will return
                here in the future.
              </Typography>
            </Stack>

            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                Need to switch accounts?
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<LogoutIcon />}
                onClick={handleSignOut}
                sx={{ alignSelf: 'flex-start' }}
              >
                Sign out
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </Box>
  )
}
