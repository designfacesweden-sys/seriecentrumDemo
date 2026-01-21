import { useState, useEffect } from 'react'
import { saveRegistration } from '../utils/storage'

const Tournament = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Close modal on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false)
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isModalOpen])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isModalOpen])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear message when user starts typing
    if (message.text) {
      setMessage({ type: '', text: '' })
    }
  }

  const openModal = () => {
    setIsModalOpen(true)
    setMessage({ type: '', text: '' })
    setFormData({ firstName: '', lastName: '', email: '' })
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setMessage({ type: '', text: '' })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage({ type: '', text: '' })

    try {
      // Validate form data
      if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
        setMessage({ type: 'error', text: 'Alla fält är obligatoriska' })
        setIsSubmitting(false)
        return
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        setMessage({ type: 'error', text: 'Ogiltig e-postadress' })
        setIsSubmitting(false)
        return
      }

      // Save to localStorage
      const registration = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase()
      }

      saveRegistration(registration)
      
      setMessage({ type: 'success', text: 'Registrering lyckades! Du är nu anmäld till turneringen.' })
      setFormData({ firstName: '', lastName: '', email: '' })
      
      // Close modal after 2 seconds on success
      setTimeout(() => {
        setIsModalOpen(false)
        setMessage({ type: '', text: '' })
      }, 2000)
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Något gick fel. Försök igen.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="page-section tournament-section">
      <div className="page-container">
        {/* Hero Banner Section */}
        <div className="tournament-hero">
          <div className="tournament-hero-image">
            <img 
              src="/images/banner_Lorwyn .jpg" 
              alt="Magic: The Gathering Lorwyn Eclipsed" 
              className="hero-banner-image"
            />
            <div className="hero-overlay-content">
              <h1 className="tournament-hero-title">Lorwyn Eclipsed</h1>
              <p className="tournament-hero-subtitle">Magic: The Gathering Prerelease</p>
            </div>
          </div>
        </div>

        {/* Main Content - Clean Text Layout */}
        <div className="tournament-text-layout">
          <div className="tournament-horizontal-sections">
            <div className="tournament-content-section">
              <h2 className="tournament-section-title">Event Information</h2>
              <div className="tournament-info-block">
                <p><strong>Datum:</strong> 17:e-18:e Januari 2026</p>
                <p><strong>Tid:</strong> 11:00 (Registrering: 10:00 - 11:00)</p>
                <p><strong>Plats:</strong> SerieCentrum, Hedvägen 155, 231 66 Trelleborg</p>
                <p><strong>Kostnad:</strong> <span className="highlight-text">395kr (6 Booster + 1 Special Kort)</span></p>
                <p><strong>Format:</strong> Sealed 6 Boosters Prerelease Kit</p>
                <p><strong>Team Size:</strong> 1v1</p>
                <p><strong>Check-in:</strong> 1 timme före start</p>
                <p><strong>Spelare:</strong> 24 per dag</p>
              </div>
            </div>

            <div className="tournament-content-section">
              <h2 className="tournament-section-title">Priser</h2>
              <div className="tournament-info-block">
                <p><strong>1:a plats - Vinnare:</strong> <span className="highlight-text">395kr</span></p>
                <p><strong>2:a plats - 1:a Runner Up:</strong> <span className="highlight-text">Prerelease Kit</span></p>
                <p><strong>3:e plats - 2:a Runner Up:</strong> <span className="highlight-text">6 Boosters</span></p>
                <p><strong>4:e plats - 3:e Runner Up:</strong> <span className="highlight-text">3 Boosters</span></p>
              </div>
            </div>
          </div>

          <div className="tournament-content-section">
            <h2 className="tournament-section-title">Registrera dig</h2>
            <div className="tournament-info-block">
              <p>För att vara helt säker på plats. Klicka på knappen nedan för att registrera dig till turneringen.</p>
              
              <div className="tournament-register-button">
                <button 
                  type="button"
                  className="register-button-large"
                  onClick={openModal}
                >
                  REGISTRERA DIG NU
                </button>
              </div>

              <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', opacity: 0.8 }}>
                Du kan också{' '}
                <a 
                  href="https://www.facebook.com/groups/magicpaseriecentrum" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="tournament-link"
                >
                  gå med i Facebook-gruppen: Magic på SerieCentrum
                </a>
              </p>
            </div>
          </div>

          {/* Registration Modal */}
          {isModalOpen && (
            <div className="modal-overlay" onClick={closeModal}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={closeModal} aria-label="Stäng">
                  ×
                </button>
                <h2 className="modal-title">Registrera dig till turneringen</h2>
                <p className="modal-subtitle">Fyll i formuläret nedan för att registrera dig</p>
                
                <form className="tournament-registration-form" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="modal-firstName">Förnamn *</label>
                    <input
                      type="text"
                      id="modal-firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      placeholder="Ditt förnamn"
                      autoFocus
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="modal-lastName">Efternamn *</label>
                    <input
                      type="text"
                      id="modal-lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      placeholder="Ditt efternamn"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="modal-email">E-postadress *</label>
                    <input
                      type="email"
                      id="modal-email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="din.email@example.com"
                    />
                  </div>

                  {message.text && (
                    <div className={`form-message ${message.type}`}>
                      {message.text}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className="register-button-large"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Registrerar...' : 'REGISTRERA DIG NU'}
                  </button>
                </form>
              </div>
            </div>
          )}

          <div className="tournament-content-section">
            <h2 className="tournament-section-title">Kontakt</h2>
            <div className="tournament-info-block">
              <p><strong>Tomas Gjäls</strong></p>
              <p>
                <a href="mailto:seriecentrum@hotmail.com" className="tournament-link">
                  seriecentrum@hotmail.com
                </a>
              </p>
              <p>
                <a href="tel:041014151" className="tournament-link">
                  0410-141 51
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Tournament
