import { useState, useEffect } from 'react'

const API_URL = '/api'

const RegisterModal = ({ isOpen, onClose, onRegister, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Lösenorden matchar inte')
      return
    }

    if (formData.password.length < 6) {
      setError('Lösenordet måste vara minst 6 tecken')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password
        })
      })

      const data = await response.json()

      if (response.ok) {
        onRegister(data.user)
        onClose()
      } else {
        setError(data.error || 'Registrering misslyckades')
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
        <h2 className="modal-title">Skapa konto</h2>
        <p className="modal-subtitle">Med konto kan du spara din turneringshistorik</p>
        
        <form className="tournament-registration-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Förnamn *</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
              placeholder="Ditt förnamn"
            />
          </div>

          <div className="form-group">
            <label>Efternamn *</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
              placeholder="Ditt efternamn"
            />
          </div>

          <div className="form-group">
            <label>E-postadress *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="din.email@example.com"
            />
          </div>

          <div className="form-group">
            <label>Lösenord *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              placeholder="Minst 6 tecken"
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label>Bekräfta lösenord *</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              placeholder="Bekräfta lösenordet"
            />
          </div>

          {error && (
            <div className="form-message error">{error}</div>
          )}

          <button type="submit" className="register-button-large" disabled={loading}>
            {loading ? 'Skapar konto...' : 'SKAPA KONTO'}
          </button>

          <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
            Har du redan ett konto?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.8)',
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              Logga in här
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}

export default RegisterModal
