import { useState, useEffect } from 'react'

const MatchPairingsView = ({ tournament, user, onResultSubmit }) => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [matchTimers, setMatchTimers] = useState({})

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  if (!tournament || tournament.status !== 'started') {
    return null
  }

  const currentRound = tournament.rounds?.find(r => !r.completed) || 
                       tournament.rounds?.[tournament.rounds.length - 1]
  
  if (!currentRound || !currentRound.pairings) {
    return (
      <div className="match-pairings-container">
        <div className="no-matches-message">
          <p>Inga matcher just nu. Väntar på nästa runda...</p>
        </div>
      </div>
    )
  }

  const roundStartTime = new Date(currentRound.startedAt)
  const timePerRound = tournament.timePerRound || 50 // minutes
  const roundEndTime = new Date(roundStartTime.getTime() + timePerRound * 60000)
  const globalTimeRemaining = Math.max(0, roundEndTime - currentTime)

  const getMatchStatus = (pairing) => {
    if (pairing.completed) return 'completed'
    if (pairing.result) return 'awaiting'
    return 'ongoing'
  }

  const isUserInMatch = (pairing) => {
    if (!user) return false
    return (
      (pairing.player1?.userId?.toString() === user._id) ||
      (pairing.player1?.email === user.email) ||
      (pairing.player2?.userId?.toString() === user._id) ||
      (pairing.player2?.email === user.email)
    )
  }

  return (
    <div className="match-pairings-container">
      <div className="pairings-header">
        <h3>Matchparringar - Runda {currentRound.roundNumber || tournament.rounds?.indexOf(currentRound) + 1}</h3>
        <div className="round-timer-badge">
          <span className="timer-icon">⏱</span>
          <span>{Math.floor(globalTimeRemaining / 60000)}:{(Math.floor((globalTimeRemaining % 60000) / 1000)).toString().padStart(2, '0')}</span>
        </div>
      </div>

      <div className="match-cards-grid">
        {currentRound.pairings.map((pairing, index) => {
          const matchStatus = getMatchStatus(pairing)
          const tableNumber = index + 1
          const isUserMatch = isUserInMatch(pairing)
          const timeRemaining = globalTimeRemaining

          return (
            <div 
              key={index} 
              className={`match-card ${matchStatus} ${isUserMatch ? 'user-match' : ''}`}
            >
              <div className="match-card-header">
                <div className="table-number">Bord {tableNumber}</div>
                <div className={`match-status-badge status-${matchStatus}`}>
                  {matchStatus === 'completed' ? 'Klar' : 
                   matchStatus === 'awaiting' ? 'Väntar på bekräftelse' : 
                   'Pågår'}
                </div>
              </div>

              <div className="match-players">
                <div className="player-info player-1">
                  <div className="player-name">
                    {pairing.player1?.firstName} {pairing.player1?.lastName}
                  </div>
                  {pairing.result && (
                    <div className="player-score">
                      {pairing.result.player1Wins} - {pairing.result.player2Wins}
                    </div>
                  )}
                </div>

                <div className="vs-divider">VS</div>

                <div className="player-info player-2">
                  <div className="player-name">
                    {pairing.player2 ? (
                      <>
                        {pairing.player2.firstName} {pairing.player2.lastName}
                      </>
                    ) : (
                      <span className="bye-indicator">BYE</span>
                    )}
                  </div>
                  {pairing.result && pairing.player2 && (
                    <div className="player-score">
                      {pairing.result.player2Wins} - {pairing.result.player1Wins}
                    </div>
                  )}
                </div>
              </div>

              {matchStatus !== 'completed' && !pairing.player2 && (
                <div className="match-timer">
                  <span className="timer-icon-small">⏱</span>
                  <span className="timer-text">
                    {Math.floor(timeRemaining / 60000)}:{(Math.floor((timeRemaining % 60000) / 1000)).toString().padStart(2, '0')}
                  </span>
                </div>
              )}

              {matchStatus !== 'completed' && pairing.player2 && (
                <div className="match-actions">
                  {isUserMatch ? (
                    <button
                      className="submit-result-button primary"
                      onClick={() => onResultSubmit(pairing, currentRound.roundNumber || tournament.rounds?.indexOf(currentRound) + 1, index)}
                    >
                      Skicka in resultat
                    </button>
                  ) : (
                    <div className="match-timer">
                      <span className="timer-icon-small">⏱</span>
                      <span className="timer-text">
                        {Math.floor(timeRemaining / 60000)}:{(Math.floor((timeRemaining % 60000) / 1000)).toString().padStart(2, '0')}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MatchPairingsView
