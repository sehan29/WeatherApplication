import { useAuth0 } from '@auth0/auth0-react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import LoginScreen from './components/LoginScreen'

function LoadingScreen() {
  return (
    <main className="centered-screen" aria-live="polite">
      <div className="loader-mark" aria-hidden="true" />
      <p className="eyebrow">Weather desk</p>
      <h1>Preparing your dashboard</h1>
    </main>
  )
}

export default function App() {
  const { isLoading, isAuthenticated, error } = useAuth0()

  return (
    <Routes>
      <Route
        path="/"
        element={
          isLoading
            ? <LoadingScreen />
            : <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
        }
      />
      <Route
        path="/login"
        element={
          isLoading
            ? <LoadingScreen />
            : isAuthenticated
              ? <Navigate to="/dashboard" replace />
              : <LoginScreen authError={error} />
        }
      />
      <Route path="/dashboard" element={<ProtectedDashboard />} />
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
      />
    </Routes>
  )
}

function ProtectedDashboard() {
  const { isLoading, isAuthenticated } = useAuth0()
  const location = useLocation()

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Dashboard />
}
