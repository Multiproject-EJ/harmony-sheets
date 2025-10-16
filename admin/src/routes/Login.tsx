import { useEffect, useState } from 'react'
import { Box, Container, Grid, Stack, Typography } from '@mui/material'
import { supabase } from '../lib/supabaseClient'
import { isAdminUser } from '../lib/runtimeConfig'
import Dashboard from './Dashboard'
import DashboardPreview from '../components/DashboardPreview'
import DebugPanel from '../components/DebugPanel'

export default function Login() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [sessionChecked, setSessionChecked] = useState(false)
  const [sessionError, setSessionError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function checkExistingSession() {
      try {
        const {
          data: { session },
          error
        } = await supabase.auth.getSession()

        if (!isMounted) return

        setSessionError(error ? error.message : null)
        setIsAdmin(isAdminUser(session?.user))
      } catch (error) {
        if (!isMounted) return

        // eslint-disable-next-line no-console
        console.error('Failed to verify session', error)
        setIsAdmin(false)
        setSessionError(error instanceof Error ? error.message : String(error))
      } finally {
        if (isMounted) {
          setSessionChecked(true)
        }
      }
    }

    checkExistingSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return

      setSessionError(null)
      setIsAdmin(isAdminUser(session?.user))
    })

    return () => {
      isMounted = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  if (isAdmin && sessionChecked) {
    return <Dashboard />
  }

  return (
    <Box sx={{ bgcolor: 'grey.100', minHeight: '100vh', py: { xs: 6, md: 10 } }}>
      <Container maxWidth="lg">
        <Stack spacing={4}>
          <Stack spacing={1} textAlign="center">
            <Typography variant="overline" color="primary" fontWeight={600}>
              Harmony Sheets Admin
            </Typography>
            <Typography variant="h3" fontWeight={700}>
              Review admin diagnostics to troubleshoot access issues
            </Typography>
            <Typography variant="body1" color="text.secondary" maxWidth={720} mx="auto">
              Use the diagnostics panel to inspect configuration, bootstrap attempts, and
              Supabase connectivity. Once the blockers are resolved, sign in from the console or
              re-run the checks to verify access.
            </Typography>
          </Stack>

          <Grid container spacing={4} alignItems="stretch">
            <Grid item xs={12} md={4}>
              <DebugPanel
                sessionChecked={sessionChecked}
                isAdmin={isAdmin}
                sessionError={sessionError}
              />
            </Grid>

            <Grid item xs={12} md={8}>
              <DashboardPreview />
            </Grid>
          </Grid>
        </Stack>
      </Container>
    </Box>
  )
}
