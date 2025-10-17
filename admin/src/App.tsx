import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { Route, Routes, Navigate } from 'react-router-dom'
import Login from './routes/Login'
import Dashboard from './routes/Dashboard'
import AuthGate from './components/AuthGate'
import WebsiteHeader from './components/WebsiteHeader'
import WebsiteFooter from './components/WebsiteFooter'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6054d0'
    },
    secondary: {
      main: '#f48fb1'
    }
  }
})

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <WebsiteHeader />
        <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <AuthGate>
                  <Navigate to="/dashboard" replace />
                </AuthGate>
              }
            />
            <Route
              path="/dashboard"
              element={
                <AuthGate>
                  <Dashboard />
                </AuthGate>
              }
            />
            <Route path="/products" element={<Navigate to="/dashboard" replace />} />
            <Route path="/analytics" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Box>
        <WebsiteFooter />
      </Box>
    </ThemeProvider>
  )
}
