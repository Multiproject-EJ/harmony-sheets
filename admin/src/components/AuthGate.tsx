import { PropsWithChildren, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { supabase } from '../lib/supabaseClient'

export default function AuthGate({ children }: PropsWithChildren) {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL as string

    async function getInitialSession() {
      const {
        data: { session }
      } = await supabase.auth.getSession()

      const userEmail = session?.user.email?.toLowerCase()
      const allowed = Boolean(adminEmail && userEmail === adminEmail.toLowerCase())

      setIsAuthorized(allowed)
      setLoading(false)

      if (!allowed && location.pathname !== '/login') {
        navigate('/login')
      }
    }

    getInitialSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const userEmail = session?.user.email?.toLowerCase()
      const adminEmailLower = adminEmail?.toLowerCase()
      const allowed = Boolean(adminEmailLower && userEmail === adminEmailLower)
      setIsAuthorized(allowed)
      if (!allowed) {
        navigate('/login')
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [location.pathname, navigate])

  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
