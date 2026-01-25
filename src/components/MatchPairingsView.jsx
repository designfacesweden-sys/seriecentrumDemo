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

  const user = JSON.parse(sessionStorage.getItem('user') || 'null')

  return (
    <div className="match-pairings-list">
      <div className="pairings-list-header">
        <h2>Runda {currentRound.roundNumber || tournament.rounds?.indexOf(currentRound) + 1}</h2>
        <div className="round-timer-display">
          {Math.floor(globalTimeRemaining / 60000)}:{(Math.floor((globalTimeRemaining % 60000) / 1000)).toString().padStart(2, '0')}
        </div>
      </div>

      <div className="matches-list-table">
        <div className="matches-list-header-row">
          <div className="match-col-table">Bord</div>
          <div className="match-col-players">Spelare</div>
          <div className="match-col-score">Resultat</div>
          <div className="match-col-action">Åtgärd</div>
        </div>

        {currentRound.pairings.map((pairing, index) => {
          const matchStatus = getMatchStatus(pairing)
          const tableNumber = index + 1
          const isUserMatch = isUserInMatch(pairing)
          const isPlayer1 = user && (
            (pairing.player1?.userId?.toString() === user._id) ||
            (pairing.player1?.email === user.email)
          )
          const isPlayer2 = user && pairing.player2 && (
            (pairing.player2?.userId?.toString() === user._id) ||
            (pairing.player2?.email === user.email)
          )

          return (
            <div 
              key={index} 
              className={`matches-list-row ${matchStatus} ${isUserMatch ? 'user-match-row' : ''}`}
            >
              <div className="match-col-table">
                <span className="table-number-badge">{tableNumber}</span>
              </div>
              
              <div className="match-col-players">
                <div className="player-row">
                  <span className={`player-name ${isPlayer1 ? 'you-indicator' : ''}`}>
                    {pairing.player1?.firstName} {pairing.player1?.lastName}
                    {isPlayer1 && <span className="you-badge">(Du)</span>}
                  </span>
                </div>
                <div className="player-row">
                  <span className={`player-name ${isPlayer2 ? 'you-indicator' : ''}`}>
                    {pairing.player2 ? (
                      <>
                        {pairing.player2.firstName} {pairing.player2.lastName}
                        {isPlayer2 && <span className="you-badge">(Du)</span>}
                      </>
                    ) : (
                      <span className="bye-indicator">BYE</span>
                    )}
                  </span>
                </div>
              </div>
              
              <div className="match-col-score">
                {matchStatus === 'completed' && pairing.result ? (
                  <div className="score-display">
                    {pairing.result.player1Wins} - {pairing.result.player2Wins}
                  </div>
                ) : (
                  <div className="score-pending">-</div>
                )}
              </div>
              
              <div className="match-col-action">
                {matchStatus !== 'completed' && pairing.player2 && (isPlayer1 || isPlayer2) ? (
                  <button
                    className="submit-score-btn"
                    onClick={() => onResultSubmit(pairing, currentRound.roundNumber || tournament.rounds?.indexOf(currentRound) + 1, index)}
                  >
                    Skicka in
                  </button>
                ) : matchStatus === 'completed' ? (
                  <span className="match-completed-badge">Klar</span>
                ) : (
                  <span className="match-waiting">-</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MatchPairingsView
