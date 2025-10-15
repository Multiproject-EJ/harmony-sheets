import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { Route, Routes, Navigate } from 'react-router-dom'
import Login from './routes/Login'
import Dashboard from './routes/Dashboard'
import AuthGate from './components/AuthGate'

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
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </ThemeProvider>
  )
}
