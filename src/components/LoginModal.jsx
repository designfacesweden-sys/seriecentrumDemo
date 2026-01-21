import { useState, useEffect } from 'react'

const API_URL = '/api'

const LoginModal = ({ isOpen, onClose, onLogin, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        onLogin(data.user)
        onClose()
      } else {
        setError(data.error || 'Inloggning misslyckades')
      }
    } catch (error) {
      setError('Något gick fel. Försök igen.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2 className="modal-title">Logga in</h2>
        
        <form className="tournament-registration-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>E-postadress</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="din.email@example.com"
            />
          </div>

          <div className="form-group">
            <label>Lösenord</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              placeholder="Ditt lösenord"
            />
          </div>

          {error && (
            <div className="form-message error">{error}</div>
          )}

          <button type="submit" className="register-button-large" disabled={loading}>
            {loading ? 'Loggar in...' : 'LOGGA IN'}
          </button>

          <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
            Har du inget konto?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.8)',
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              Registrera dig här
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}

export default LoginModal
