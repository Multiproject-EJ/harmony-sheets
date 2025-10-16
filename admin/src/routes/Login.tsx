import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import { supabase } from '../lib/supabaseClient'
import { getConfiguredAdminEmail, getNormalizedAdminEmail, isAdminUser } from '../lib/runtimeConfig'
import Dashboard from './Dashboard'
import DashboardPreview from '../components/DashboardPreview'

export default function Login() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [sessionChecked, setSessionChecked] = useState(false)

  const adminEmailDisplay = getConfiguredAdminEmail()
  const normalizedAdminEmail = getNormalizedAdminEmail()
  const adminEmailConfigured = Boolean(normalizedAdminEmail)

  useEffect(() => {
    let isMounted = true

    async function checkExistingSession() {
      try {
        const {
          data: { session }
        } = await supabase.auth.getSession()

        if (!isMounted) return

        setIsAdmin(isAdminUser(session?.user))
      } catch (error) {
        if (!isMounted) return

        // eslint-disable-next-line no-console
        console.error('Failed to verify session', error)
        setIsAdmin(false)
      } finally {
        if (isMounted) {
          setSessionChecked(true)
        }
      }
    }

    checkExistingSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return

      setIsAdmin(isAdminUser(session?.user))

      if (!isAdminUser(session?.user)) {
        setMessage(null)
        setError(null)
      }
    })

    return () => {
      isMounted = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  if (isAdmin && sessionChecked) {
    return <Dashboard />
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const normalizedEmail = email.trim().toLowerCase()
      if (!normalizedEmail) {
        setError('Enter the email address you use for the admin account.')
        return
      }

      if (adminEmailConfigured && normalizedEmail !== normalizedAdminEmail) {
        setError('Only the designated admin email can access this dashboard.')
        return
      }

      const { error: signInError } = await supabase.auth.signInWithOtp({ email: normalizedEmail })

      if (signInError) {
        setError(signInError.message)
        return
      }

      setMessage('Check your inbox for the magic link to sign in.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDemoLogin() {
    const normalizedEmailInput = email.trim().toLowerCase()
    const targetEmail =
      adminEmailConfigured && normalizedAdminEmail ? normalizedAdminEmail : normalizedEmailInput

    if (!targetEmail) {
      setError('Enter the admin email to use demo sign in.')
      return
    }

    setError(null)
    setMessage(null)
    setLoading(true)
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: 'password'
      })

      if (signInError) {
        setError(signInError.message)
        return
      }

      if (data?.session) {
        setIsAdmin(isAdminUser(data.session.user))
      }
    } finally {
      setLoading(false)
    }
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
              Preview the dashboard or sign in to manage your data
            </Typography>
            <Typography variant="body1" color="text.secondary" maxWidth={720} mx="auto">
              Explore the live product catalog preview, then sign in with the admin account to
              replace the demo data with your real-time metrics.
            </Typography>
          </Stack>

          <Grid container spacing={4} alignItems="stretch">
            <Grid item xs={12} md={4}>
              <Paper elevation={6} sx={{ p: { xs: 4, md: 5 }, height: '100%' }}>
                <Stack spacing={3} component="form" onSubmit={handleSubmit}>
                  <Stack spacing={1}>
                    <Typography variant="h5" fontWeight={600}>
                      Sign in to manage Harmony Sheets
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Enter the admin email to receive a magic link or use the demo credentials to
                      explore the full experience instantly.
                    </Typography>
                    {adminEmailDisplay && (
                      <Typography variant="body2" color="text.secondary">
                        Admin access is limited to <strong>{adminEmailDisplay}</strong>.
                      </Typography>
                    )}
                  </Stack>

                  <TextField
                    label="Admin email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    fullWidth
                    required
                  />

                  <Button type="submit" variant="contained" size="large" disabled={loading}>
                    Send magic link
                  </Button>

                  <Button
                    variant="outlined"
                    size="large"
                    disabled={loading || (!adminEmailConfigured && !email.trim())}
                    onClick={handleDemoLogin}
                  >
                    Demo sign in
                  </Button>

                  {message && <Alert severity="success">{message}</Alert>}
                  {error && <Alert severity="error">{error}</Alert>}
                </Stack>
              </Paper>
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
