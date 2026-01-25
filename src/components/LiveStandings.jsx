import { useState, useEffect } from 'react'

const LiveStandings = ({ tournament }) => {
  const [standings, setStandings] = useState([])

  useEffect(() => {
    if (!tournament || !tournament.participants) {
      setStandings([])
      return
    }

    const sorted = [...tournament.participants].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      if (b.opponentMatchWinPercentage !== a.opponentMatchWinPercentage) {
        return b.opponentMatchWinPercentage - a.opponentMatchWinPercentage
      }
      return (b.wins || 0) - (a.wins || 0)
    })

    setStandings(sorted)
  }, [tournament])

  if (!tournament || !tournament.participants || tournament.participants.length === 0) {
    return null
  }

  const getRankColor = (rank) => {
    if (rank === 1) return 'gold'
    if (rank === 2) return 'silver'
    if (rank === 3) return 'bronze'
    return 'default'
  }

  return (
    <div className="standings-list-clean">
      <h2 className="standings-list-title">Ställning</h2>
      <div className="standings-list-table">
        <div className="standings-list-header-row">
          <div className="standings-col-rank">#</div>
          <div className="standings-col-name">Spelare</div>
          <div className="standings-col-points">Poäng</div>
          <div className="standings-col-record">W-L</div>
        </div>
        {standings.map((participant, index) => {
          const rank = index + 1
          const wins = participant.wins || 0
          const losses = participant.losses || 0
          const points = participant.points || 0

          return (
            <div key={index} className={`standings-list-row ${rank <= 3 ? 'top-' + rank : ''}`}>
              <div className="standings-col-rank">{rank}</div>
              <div className="standings-col-name">
                {participant.firstName} {participant.lastName}
              </div>
              <div className="standings-col-points">{points}</div>
              <div className="standings-col-record">{wins}-{losses}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default LiveStandings
