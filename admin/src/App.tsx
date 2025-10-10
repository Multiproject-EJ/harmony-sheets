import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { Route, Routes, Navigate } from 'react-router-dom'
import Login from './routes/Login'
import Products from './routes/Products'
import Analytics from './routes/Analytics'
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
              <Navigate to="/products" replace />
            </AuthGate>
          }
        />
        <Route
          path="/products"
          element={
            <AuthGate>
              <Products />
            </AuthGate>
          }
        />
        <Route
          path="/analytics"
          element={
            <AuthGate>
              <Analytics />
            </AuthGate>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </ThemeProvider>
  )
}
