import { useState, useEffect } from 'react'
import { useUser } from '../components/UserAuth'
import LoginModal from '../components/LoginModal'
import RegisterModal from '../components/RegisterModal'
import ResultModal from '../components/ResultModal'
import EnhancedResultModal from '../components/EnhancedResultModal'
import TournamentBracket from '../components/TournamentBracket'

const API_URL = '/api'

// Fake participants array for demonstration
const FAKE_PARTICIPANTS = [
  { firstName: 'Erik', lastName: 'Andersson', email: 'erik.andersson@example.com' },
  { firstName: 'Maria', lastName: 'Johansson', email: 'maria.johansson@example.com' },
  { firstName: 'Johan', lastName: 'Svensson', email: 'johan.svensson@example.com' },
  { firstName: 'Anna', lastName: 'Gustafsson', email: 'anna.gustafsson@example.com' },
  { firstName: 'Lars', lastName: 'Pettersson', email: 'lars.pettersson@example.com' },
  { firstName: 'Emma', lastName: 'Eriksson', email: 'emma.eriksson@example.com' },
  { firstName: 'Anders', lastName: 'Nilsson', email: 'anders.nilsson@example.com' },
  { firstName: 'Sara', lastName: 'Larsson', email: 'sara.larsson@example.com' },
  { firstName: 'Mikael', lastName: 'Karlsson', email: 'mikael.karlsson@example.com' },
  { firstName: 'Lisa', lastName: 'Olsson', email: 'lisa.olsson@example.com' },
  { firstName: 'Daniel', lastName: 'Berg', email: 'daniel.berg@example.com' },
  { firstName: 'Karin', lastName: 'Lindqvist', email: 'karin.lindqvist@example.com' },
  { firstName: 'Fredrik', lastName: 'Hansson', email: 'fredrik.hansson@example.com' },
  { firstName: 'Malin', lastName: 'Jönsson', email: 'malin.jonsson@example.com' },
  { firstName: 'Per', lastName: 'Lindberg', email: 'per.lindberg@example.com' },
  { firstName: 'Helena', lastName: 'Axelsson', email: 'helena.axelsson@example.com' },
  { firstName: 'Magnus', lastName: 'Sandberg', email: 'magnus.sandberg@example.com' },
  { firstName: 'Jenny', lastName: 'Holm', email: 'jenny.holm@example.com' },
  { firstName: 'Stefan', lastName: 'Lundqvist', email: 'stefan.lundqvist@example.com' },
  { firstName: 'Camilla', lastName: 'Bergström', email: 'camilla.bergstrom@example.com' }
]

const Tournament = () => {
  const { user, login, logout } = useUser()
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const [registeringTournament, setRegisteringTournament] = useState(null)
  const [resultModal, setResultModal] = useState({ isOpen: false, pairing: null, roundNumber: 0, pairingIndex: 0, tournamentId: null })

  useEffect(() => {
    fetchTournaments()
  }, [])

  // Real-time updates: poll every 5 seconds for started tournaments
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTournaments()
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchTournaments = async () => {
    try {
      const response = await fetch(`${API_URL}/tournaments/active`)
      
      const contentType = response.headers.get('content-type')
      
      if (!contentType || !contentType.includes('application/json')) {
        setLoading(false)
        return
      }
      
      const data = await response.json()
      
      if (response.ok) {
        const visibleTournaments = data.filter(t => {
          const status = t.status || 'upcoming'
          return status !== 'finished'
        })
        
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

  const renderTournamentSchedule = (tournament) => {
    if (!tournament.rounds || tournament.rounds.length === 0) {
      return <p>Turneringen har inte startat ännu.</p>
    }

    return (
      <div className="tournament-schedule">
        <h3>Turneringsschema</h3>
        {tournament.rounds.map((round, roundIndex) => (
          <div key={roundIndex} className="round-section">
            <h4>Runda {round.roundNumber}</h4>
            <div className="pairings-list">
              {round.pairings.map((pairing, pairingIndex) => (
                <div key={pairingIndex} className="pairing-card">
                  <div className="pairing-players">
                    <div className="player-slot">
                      <span>{pairing.player1?.firstName} {pairing.player1?.lastName}</span>
                      {pairing.result && (
                        <span className="result-badge">
                          {pairing.result.player1Wins} - {pairing.result.player2Wins}
                        </span>
                      )}
                    </div>
                    <span className="vs">VS</span>
                    <div className="player-slot">
                      {pairing.player2 ? (
                        <>
                          <span>{pairing.player2.firstName} {pairing.player2.lastName}</span>
                          {pairing.result && (
                            <span className="result-badge">
                              {pairing.result.player2Wins} - {pairing.result.player1Wins}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="bye">BYE</span>
                      )}
                    </div>
                  </div>
                  {!pairing.completed && pairing.player2 && user && (
                    <div className="pairing-actions">
                      {(pairing.player1?.userId?.toString() === user._id || 
                        pairing.player1?.email === user.email ||
                        pairing.player2?.userId?.toString() === user._id ||
                        pairing.player2?.email === user.email) && (
                        <button
                          className="submit-result-btn"
                          onClick={() => {
                            setResultModal({
                              isOpen: true,
                              pairing,
                              roundNumber: round.roundNumber,
                              pairingIndex,
                              tournamentId: tournament._id
                            })
                          }}
                        >
                          Skicka in resultat
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderStandings = (tournament) => {
    if (!tournament.participants || tournament.participants.length === 0) {
      return null
    }

    const sorted = [...tournament.participants].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      return b.opponentMatchWinPercentage - a.opponentMatchWinPercentage
    })

    return (
      <div className="tournament-standings">
        <h3>Ställning</h3>
        <table className="standings-table">
          <thead>
            <tr>
              <th>Plats</th>
              <th>Namn</th>
              <th>Vinster</th>
              <th>Förluster</th>
              <th>Oavgjorda</th>
              <th>Poäng</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((participant, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{participant.firstName} {participant.lastName}</td>
                <td>{participant.wins || 0}</td>
                <td>{participant.losses || 0}</td>
                <td>{participant.draws || 0}</td>
                <td><strong>{participant.points || 0}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (loading) {
    return (
      <section className="page-section tournament-section">
        <div className="page-container">
          <p>Laddar turneringar...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="page-section tournament-section">
      <div className="page-container">
        <h1 className="page-title">FNM & Turneringar</h1>

        {tournaments.length === 0 ? (
          <div className="tournament-text-layout">
            <p>Inga aktiva turneringar för tillfället. Kolla tillbaka snart!</p>
          </div>
        ) : (
          <div className="tournaments-list-container">
            {tournaments.map((tournament) => (
              <div key={tournament._id} className="tournament-list-item">
                <div className="tournament-list-header">
                  <h2>{tournament.name}</h2>
                  <span className={`tournament-status-badge status-${tournament.status}`}>
                    {tournament.status === 'upcoming' ? 'Kommande' : 
                     tournament.status === 'active' ? 'Aktiv' : 
                     tournament.status === 'started' ? 'Pågår' : 
                     tournament.status || 'Kommande'}
                  </span>
                </div>

                <div className="tournament-list-info">
                  <div className="tournament-list-info-row">
                    <div className="tournament-list-info-item">
                      <strong>Datum:</strong> {tournament.startDate} {tournament.startTime}
                    </div>
                    <div className="tournament-list-info-item">
                      <strong>Plats:</strong> {tournament.location}
                    </div>
                    <div className="tournament-list-info-item">
                      <strong>Format:</strong> {tournament.format}
                    </div>
                    <div className="tournament-list-info-item">
                      <strong>Kostnad:</strong> {tournament.cost} kr
                    </div>
                    <div className="tournament-list-info-item">
                      <strong>Tid per runda:</strong> {tournament.timePerRound} minuter
                    </div>
                    <div className="tournament-list-info-item">
                      <strong>Deltagare:</strong> {tournament.participants?.length || 0} / {tournament.maxPlayers}
                    </div>
                  </div>
                </div>

                {tournament.description && (
                  <div className="tournament-list-description">
                    <p>{tournament.description}</p>
                  </div>
                )}

                <div className="tournament-list-content">
                  <div className="tournament-list-section">
                    {tournament.prizes && tournament.prizes.length > 0 && (
                      <div className="tournament-list-prizes">
                        <h3>Priser</h3>
                        <ul>
                          {tournament.prizes.map((prize, index) => (
                            <li key={index}>
                              <strong>{prize.position}:</strong> {prize.prize}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {(tournament.status === 'upcoming' || tournament.status === 'active') && (
                  <div className="tournament-list-register">
                    {isRegistered(tournament) ? (
                      <p className="registered-badge">Du är redan registrerad!</p>
                    ) : (
                      <div className="tournament-register-actions">
                        {!user && (
                          <p className="register-info-text">
                            Logga in eller skapa konto för att registrera dig till turneringen
                          </p>
                        )}
                        <button
                          className="register-button-large"
                          onClick={() => handleRegister(tournament._id)}
                        >
                          {user ? 'REGISTRERA DIG NU' : 'LOGGA IN FÖR ATT REGISTRERA DIG'}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {tournament.status === 'started' && (
                  <>
                    {user ? (
                      <>
                        <div className="tournament-participants-list">
                          <h3>Deltagare ({FAKE_PARTICIPANTS.length})</h3>
                          <div className="participants-grid">
                            {FAKE_PARTICIPANTS.map((participant, index) => (
                              <div key={index} className="participant-card">
                                <div className="participant-number">{index + 1}</div>
                                <div className="participant-name">
                                  {participant.firstName} {participant.lastName}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <TournamentBracket 
                          tournament={tournament} 
                          user={user}
                          onResultSubmit={(pairing, roundNumber, pairingIndex) => {
                            setResultModal({
                              isOpen: true,
                              pairing,
                              roundNumber,
                              pairingIndex,
                              tournamentId: tournament._id
                            })
                          }}
                        />
                      </>
                    ) : (
                      <div className="tournament-widget-view">
                        <div className="tournament-widget-card">
                          <div className="tournament-widget-card-header">
                            <h3 className="tournament-widget-card-title">{tournament.name}</h3>
                            <span className="tournament-widget-status tournament-widget-status-started">
                              Pågår
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
                                {FAKE_PARTICIPANTS.length} / {tournament.maxPlayers}
                              </span>
                            </div>
                          </div>

                          <div className="tournament-widget-login-prompt">
                            <p>Logga in för att se bracket och resultat</p>
                            <button
                              className="tournament-widget-register-btn"
                              onClick={() => setIsLoginModalOpen(true)}
                            >
                              Logga in
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}

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

        <EnhancedResultModal
          isOpen={resultModal.isOpen}
          onClose={() => setResultModal({ isOpen: false, pairing: null, roundNumber: 0, pairingIndex: 0, tournamentId: null })}
          tournament={resultModal.tournamentId ? tournaments.find(t => t._id === resultModal.tournamentId) : null}
          roundNumber={resultModal.roundNumber}
          pairing={resultModal.pairing}
          pairingIndex={resultModal.pairingIndex}
          onResultSubmitted={() => {
            fetchTournaments()
          }}
        />
      </div>
    </section>
  )
}

export default Tournament
