import { useState } from 'react'
import { Alert, Button, Container, Paper, Stack, TextField, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const adminEmail = (import.meta.env.VITE_ADMIN_EMAIL as string)?.toLowerCase()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const normalizedEmail = email.toLowerCase()
      if (!adminEmail || normalizedEmail !== adminEmail) {
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
    if (!adminEmail) {
      setError('Demo sign in requires VITE_ADMIN_EMAIL to be configured.')
      return
    }

    setError(null)
    setMessage(null)
    setLoading(true)
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: 'password'
      })

      if (signInError) {
        setError(signInError.message)
        return
      }

      if (data?.session) {
        navigate('/products')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ display: 'grid', minHeight: '100vh', placeItems: 'center' }}>
      <Paper elevation={6} sx={{ p: 5, width: '100%' }}>
        <Stack spacing={3} component="form" onSubmit={handleSubmit}>
          <Stack spacing={1}>
            <Typography variant="h4" fontWeight={600} textAlign="center">
              Harmony Sheets Admin
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Sign in with the admin email to manage products and pricing.
            </Typography>
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

          <Button variant="outlined" size="large" disabled={loading} onClick={handleDemoLogin}>
            Demo sign in
          </Button>

          {message && <Alert severity="success">{message}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </Paper>
    </Container>
  )
}
