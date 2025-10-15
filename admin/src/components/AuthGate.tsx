import { PropsWithChildren, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { supabase } from '../lib/supabaseClient'
import { isAdminUser } from '../lib/runtimeConfig'

export default function AuthGate({ children }: PropsWithChildren) {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    async function getInitialSession() {
      const {
        data: { session }
      } = await supabase.auth.getSession()

      const allowed = isAdminUser(session?.user)

      setIsAuthorized(allowed)
      setLoading(false)

      if (!allowed && location.pathname !== '/login') {
        navigate('/login')
      }
    }

    getInitialSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const allowed = isAdminUser(session?.user)
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
