import { useState, useEffect } from 'react'

const PersonalMatchHighlight = ({ tournament, user, onResultSubmit }) => {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  if (!tournament || !user || tournament.status !== 'started') {
    return null
  }

  const currentRound = tournament.rounds?.find(r => !r.completed) || 
                       tournament.rounds?.[tournament.rounds.length - 1]
  
  if (!currentRound || !currentRound.pairings) {
    return null
  }

  // Find user's match
  const userMatch = currentRound.pairings.find(pairing => {
    return (
      (pairing.player1?.userId?.toString() === user._id) ||
      (pairing.player1?.email === user.email) ||
      (pairing.player2?.userId?.toString() === user._id) ||
      (pairing.player2?.email === user.email)
    )
  })

  if (!userMatch) {
    return null
  }

  const isPlayer1 = (userMatch.player1?.userId?.toString() === user._id) || 
                    (userMatch.player1?.email === user.email)
  const opponent = isPlayer1 ? userMatch.player2 : userMatch.player1
  const tableNumber = currentRound.pairings.indexOf(userMatch) + 1

  const roundStartTime = new Date(currentRound.startedAt)
  const timePerRound = tournament.timePerRound || 50
  const roundEndTime = new Date(roundStartTime.getTime() + timePerRound * 60000)
  const timeRemaining = Math.max(0, roundEndTime - currentTime)
  const minutes = Math.floor(timeRemaining / 60000)
  const seconds = Math.floor((timeRemaining % 60000) / 1000)

  if (userMatch.completed) {
    return (
      <div className="personal-match-simple completed">
        <div className="personal-match-opponent">
          <div className="personal-match-label">Din match - Klar</div>
          <div className="personal-match-name">
            {opponent ? `${opponent.firstName} ${opponent.lastName}` : 'BYE'}
          </div>
          <div className="personal-match-table">Bord {tableNumber}</div>
        </div>
        {userMatch.result && (
          <div className="personal-match-score">
            {isPlayer1 ? (
              <>{userMatch.result.player1Wins} - {userMatch.result.player2Wins}</>
            ) : (
              <>{userMatch.result.player2Wins} - {userMatch.result.player1Wins}</>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="personal-match-simple">
      <div className="personal-match-opponent">
        <div className="personal-match-label">Din match</div>
        <div className="personal-match-name">
          {opponent ? `${opponent.firstName} ${opponent.lastName}` : 'BYE'}
        </div>
        <div className="personal-match-table">Bord {tableNumber}</div>
      </div>
      <div className="personal-match-timer">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      <button
        className="submit-result-btn-simple"
        onClick={() => onResultSubmit(
          userMatch, 
          currentRound.roundNumber || tournament.rounds?.indexOf(currentRound) + 1,
          currentRound.pairings.indexOf(userMatch)
        )}
      >
        Skicka in resultat
      </button>
    </div>
  )
}

export default PersonalMatchHighlight
