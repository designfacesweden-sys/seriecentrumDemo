import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children }) => {
  // Check if user is authenticated
  const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true'
  
  // Optional: Check if session is still valid (e.g., 8 hours)
  const loginTime = sessionStorage.getItem('adminLoginTime')
  if (loginTime) {
    const hoursSinceLogin = (Date.now() - parseInt(loginTime)) / (1000 * 60 * 60)
    if (hoursSinceLogin > 8) {
      sessionStorage.removeItem('adminAuthenticated')
      sessionStorage.removeItem('adminLoginTime')
      return <Navigate to="/admin" replace />
    }
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />
  }

  return children
}

export default ProtectedRoute
