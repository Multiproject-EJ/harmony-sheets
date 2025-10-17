import { type ElementType, useEffect, useState } from 'react'
import { Box, Button, Chip, Container, Divider, Paper, Stack, Typography } from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { isAdminUser } from '../lib/runtimeConfig'

type AdminSpace = {
  id: 'admin-console' | 'lovablesheet'
  label: string
  description: string
  href: string
  icon: ElementType
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [adminConfirmed, setAdminConfirmed] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadUser() {
      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (!isMounted) return

      setUserEmail(user?.email ?? null)
      setAdminConfirmed(isAdminUser(user))
    }

    loadUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return
      const user = session?.user ?? null
      setUserEmail(user?.email ?? null)
      setAdminConfirmed(isAdminUser(user))
    })

    return () => {
      isMounted = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const spaces: AdminSpace[] = [
    {
      id: 'admin-console',
      label: 'Admin dashboard',
      description: 'Manage diagnostics and confirm your administrator session.',
      href: '/admin/',
      icon: AdminPanelSettingsIcon
    },
    {
      id: 'lovablesheet',
      label: 'LovableSheet workspace',
      description: 'Access the private LovableSheet template and brain board.',
      href: '/LovableSheet.html',
      icon: SpaceDashboardIcon
    }
  ]

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
          <Stack spacing={4}>
            <Stack spacing={1.5}>
              <Typography variant="overline" color="primary" fontWeight={600}>
                Admin Space
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                Welcome back{userEmail ? `, ${userEmail}` : ''}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Supabase has confirmed your administrator status. The secure areas below are now
                unlocked for your session.
              </Typography>
              <Chip
                color={adminConfirmed ? 'success' : 'default'}
                variant={adminConfirmed ? 'filled' : 'outlined'}
                label={adminConfirmed ? 'Admin access confirmed' : 'Verifying admin access…'}
                sx={{ alignSelf: 'flex-start' }}
              />
            </Stack>

            <Divider flexItem />

            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={600}>
                Unlocked spaces
              </Typography>
              <Stack spacing={2}>
                {spaces.map((space) => {
                  const Icon = space.icon
                  return (
                    <Paper
                      key={space.id}
                      elevation={0}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 3,
                        p: { xs: 2.5, md: 3 },
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 2,
                        alignItems: { xs: 'flex-start', sm: 'center' }
                      }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center" flex={1}>
                        <Icon color="primary" fontSize="medium" />
                        <Stack spacing={0.5}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {space.label}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {space.description}
                          </Typography>
                        </Stack>
                      </Stack>
                      <Button
                        component="a"
                        href={space.href}
                        target={space.id === 'lovablesheet' ? '_blank' : undefined}
                        rel={space.id === 'lovablesheet' ? 'noopener noreferrer' : undefined}
                        variant={space.id === 'admin-console' ? 'contained' : 'outlined'}
                        endIcon={space.id === 'lovablesheet' ? <OpenInNewIcon /> : undefined}
                      >
                        Open space
                      </Button>
                    </Paper>
                  )
                })}
              </Stack>
            </Stack>

            <Divider flexItem />

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
