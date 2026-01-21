import { useState, useEffect } from 'react'
import { useUser } from '../components/UserAuth'
import LoginModal from '../components/LoginModal'
import RegisterModal from '../components/RegisterModal'
import ResultModal from '../components/ResultModal'

const API_URL = '/api'

const Tournament = () => {
  const { user, login, logout } = useUser()
  const [tournaments, setTournaments] = useState([])
  const [selectedTournament, setSelectedTournament] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const [registeringTournament, setRegisteringTournament] = useState(null)
  const [resultModal, setResultModal] = useState({ isOpen: false, pairing: null, roundNumber: 0, pairingIndex: 0 })

  useEffect(() => {
    fetchTournaments()
  }, [])

  const fetchTournaments = async () => {
    try {
      const response = await fetch(`${API_URL}/tournaments/active`)
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Server returned non-JSON response. Is the backend server running?')
        setLoading(false)
        return
      }
      
      if (response.ok) {
        const data = await response.json()
        setTournaments(data)
        if (data.length > 0 && !selectedTournament) {
          setSelectedTournament(data[0])
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Error fetching tournaments:', errorData)
      }
    } catch (error) {
      console.error('Error fetching tournaments:', error)
      console.error('Make sure the backend server is running on port 3000')
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
        if (selectedTournament?._id === tournamentId) {
          const updated = await fetch(`${API_URL}/tournaments/${tournamentId}`).then(r => r.json())
          setSelectedTournament(updated)
        }
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
                              pairingIndex
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
          <div className="tournaments-layout">
            <div className="tournaments-list">
              <h2>Aktiva turneringar</h2>
              {tournaments.map((tournament) => (
                <div
                  key={tournament._id}
                  className={`tournament-card ${selectedTournament?._id === tournament._id ? 'active' : ''}`}
                  onClick={() => setSelectedTournament(tournament)}
                >
                  <h3>{tournament.name}</h3>
                  <p>{tournament.startDate} {tournament.startTime}</p>
                  <p>{tournament.format}</p>
                  <p>{tournament.participants?.length || 0} / {tournament.maxPlayers} deltagare</p>
                </div>
              ))}
            </div>

            {selectedTournament && (
              <div className="tournament-details">
                <div className="tournament-hero">
                  <h2>{selectedTournament.name}</h2>
                  <div className="tournament-info-grid">
                    <div className="tournament-info-item">
                      <strong>Datum:</strong> {selectedTournament.startDate} {selectedTournament.startTime}
                    </div>
                    <div className="tournament-info-item">
                      <strong>Plats:</strong> {selectedTournament.location}
                    </div>
                    <div className="tournament-info-item">
                      <strong>Format:</strong> {selectedTournament.format}
                    </div>
                    <div className="tournament-info-item">
                      <strong>Kostnad:</strong> {selectedTournament.cost} kr
                    </div>
                    <div className="tournament-info-item">
                      <strong>Tid per runda:</strong> {selectedTournament.timePerRound} minuter
                    </div>
                    <div className="tournament-info-item">
                      <strong>Deltagare:</strong> {selectedTournament.participants?.length || 0} / {selectedTournament.maxPlayers}
                    </div>
                  </div>

                  {selectedTournament.description && (
                    <div className="tournament-description">
                      <p>{selectedTournament.description}</p>
                    </div>
                  )}

                  {selectedTournament.rules && (
                    <div className="tournament-rules">
                      <h3>Regler</h3>
                      <p>{selectedTournament.rules}</p>
                    </div>
                  )}

                  {selectedTournament.prizes && selectedTournament.prizes.length > 0 && (
                    <div className="tournament-prizes">
                      <h3>Priser</h3>
                      <ul>
                        {selectedTournament.prizes.map((prize, index) => (
                          <li key={index}>
                            <strong>{prize.position}:</strong> {prize.prize}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(selectedTournament.status === 'upcoming' || selectedTournament.status === 'active') && (
                    <div className="tournament-register-section">
                      {isRegistered(selectedTournament) ? (
                        <p className="registered-badge">Du är redan registrerad!</p>
                      ) : (
                        <button
                          className="register-button-large"
                          onClick={() => handleRegister(selectedTournament._id)}
                        >
                          REGISTRERA DIG NU
                        </button>
                      )}
                    </div>
                  )}

                  {selectedTournament.status === 'started' && (
                    <>
                      {renderTournamentSchedule(selectedTournament)}
                      {renderStandings(selectedTournament)}
                    </>
                  )}
                </div>
              </div>
            )}
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

        <ResultModal
          isOpen={resultModal.isOpen}
          onClose={() => setResultModal({ isOpen: false, pairing: null, roundNumber: 0, pairingIndex: 0 })}
          tournament={selectedTournament}
          roundNumber={resultModal.roundNumber}
          pairing={resultModal.pairing}
          pairingIndex={resultModal.pairingIndex}
          onResultSubmitted={() => {
            fetchTournaments()
            if (selectedTournament) {
              fetch(`${API_URL}/tournaments/${selectedTournament._id}`)
                .then(r => r.json())
                .then(data => setSelectedTournament(data))
            }
          }}
        />
      </div>
    </section>
  )
}

export default Tournament
