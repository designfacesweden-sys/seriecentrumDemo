import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useUser } from './UserAuth'
import LoginModal from './LoginModal'
import RegisterModal from './RegisterModal'

const API_URL = '/api'

const TournamentWidget = () => {
  const { user, login } = useUser()
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const [registeringTournament, setRegisteringTournament] = useState(null)

  useEffect(() => {
    fetchTournaments()
  }, [])

  const fetchTournaments = async () => {
    try {
      const response = await fetch(`${API_URL}/tournaments/active`)
      
      if (response.ok) {
        const data = await response.json()
        const visibleTournaments = data
          .filter(t => t.status !== 'finished')
          .slice(0, 3)
        setTournaments(visibleTournaments)
      }
    } catch (error) {
      // Silent error handling
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (tournamentId) => {
    if (!user) {
      setRegisteringTournament(tournamentId)
      setIsLoginModalOpen(true)
      return
    }

    try {
      const response = await fetch(`${API_URL}/tournaments/${tournamentId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert('Registrerad till turneringen!')
        fetchTournaments()
      } else {
        alert(data.error || 'Kunde inte registrera sig')
      }
    } catch (error) {
      alert('Något gick fel. Försök igen.')
    }
  }

  const handleLogin = (userData) => {
    login(userData)
    setIsLoginModalOpen(false)
    if (registeringTournament) {
      handleRegister(registeringTournament)
      setRegisteringTournament(null)
    }
  }

  const handleRegisterUser = (userData) => {
    login(userData)
    setIsRegisterModalOpen(false)
    if (registeringTournament) {
      handleRegister(registeringTournament)
      setRegisteringTournament(null)
    }
  }

  const isRegistered = (tournament) => {
    if (!user || !tournament.participants) return false
    return tournament.participants.some(p => 
      (p.userId && user._id && p.userId.toString() === user._id) ||
      p.email === user.email
    )
  }

  if (loading) {
    return (
      <section className="tournament-widget-section">
        <div className="container">
          <div className="tournament-widget">
            <p>Laddar turneringar...</p>
          </div>
        </div>
      </section>
    )
  }

  if (tournaments.length === 0) {
    return null // Don't show widget if no tournaments
  }

  return (
    <>
      <section className="tournament-widget-section">
        <div className="container">
          <div className="tournament-widget">
            <div className="tournament-widget-header">
              <h2 className="tournament-widget-title">Kommande Turneringar</h2>
              <Link to="/fnm-turneringar" className="tournament-widget-link">
                Se alla →
              </Link>
            </div>
            
            <div className="tournament-widget-grid">
              {tournaments.map((tournament) => (
                <div key={tournament._id} className="tournament-widget-card">
                  <div className="tournament-widget-card-header">
                    <h3 className="tournament-widget-card-title">{tournament.name}</h3>
                    <span className={`tournament-widget-status tournament-widget-status-${tournament.status}`}>
                      {tournament.status === 'upcoming' ? 'Kommande' : 'Aktiv'}
                    </span>
                  </div>
                  
                  <div className="tournament-widget-card-info">
                    <div className="tournament-widget-info-row">
                      <span className="tournament-widget-info-label">📅 Datum:</span>
                      <span className="tournament-widget-info-value">
                        {tournament.startDate} {tournament.startTime}
                      </span>
                    </div>
                    <div className="tournament-widget-info-row">
                      <span className="tournament-widget-info-label">🎮 Format:</span>
                      <span className="tournament-widget-info-value">{tournament.format}</span>
                    </div>
                    <div className="tournament-widget-info-row">
                      <span className="tournament-widget-info-label">💰 Kostnad:</span>
                      <span className="tournament-widget-info-value">{tournament.cost} kr</span>
                    </div>
                    <div className="tournament-widget-info-row">
                      <span className="tournament-widget-info-label">👥 Deltagare:</span>
                      <span className="tournament-widget-info-value">
                        {tournament.participants?.length || 0} / {tournament.maxPlayers}
                      </span>
                    </div>
                  </div>

                  {isRegistered(tournament) ? (
                    <div className="tournament-widget-registered">
                      ✓ Du är registrerad!
                    </div>
                  ) : (
                    <button
                      className="tournament-widget-register-btn"
                      onClick={() => handleRegister(tournament._id)}
                    >
                      {user ? 'Registrera dig' : 'Logga in för att registrera'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false)
          setRegisteringTournament(null)
        }}
        onLogin={handleLogin}
        onSwitchToRegister={() => {
          setIsLoginModalOpen(false)
          setIsRegisterModalOpen(true)
        }}
      />

      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => {
          setIsRegisterModalOpen(false)
          setRegisteringTournament(null)
        }}
        onRegister={handleRegisterUser}
        onSwitchToLogin={() => {
          setIsRegisterModalOpen(false)
          setIsLoginModalOpen(true)
        }}
      />
    </>
  )
}

export default TournamentWidget
