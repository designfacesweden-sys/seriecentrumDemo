import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const AdminLogin = () => {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    // Check password
    if (password === 'Thomas123!') {
      // Store authentication in sessionStorage
      sessionStorage.setItem('adminAuthenticated', 'true')
      sessionStorage.setItem('adminLoginTime', Date.now().toString())
      navigate('/admin/dashboard')
    } else {
      setError('Felaktigt lösenord')
      setPassword('')
      setIsSubmitting(false)
    }
  }

  return (
    <section className="page-section admin-login-section">
      <div className="admin-login-container">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <div className="admin-lock-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h1 className="admin-login-title">Admin Panel</h1>
            <p className="admin-login-subtitle">Ange lösenord för att fortsätta</p>
          </div>

          <form className="admin-login-form" onSubmit={handleSubmit}>
            {error && (
              <div className="admin-login-error">
                {error}
              </div>
            )}

            <div className="admin-form-group">
              <label htmlFor="password">Lösenord</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                placeholder="Ange lösenord"
                required
                autoFocus
                autoComplete="off"
              />
            </div>

            <button 
              type="submit" 
              className="admin-login-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Loggar in...' : 'Logga in'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default AdminLogin
