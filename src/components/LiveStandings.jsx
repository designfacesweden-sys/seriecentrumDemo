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
    <div className="live-standings-container">
      <div className="standings-header">
        <h3>Ställning</h3>
        <div className="standings-update-indicator">
          <span className="update-dot"></span>
          Live uppdatering
        </div>
      </div>

      <div className="standings-table-wrapper">
        <table className="standings-table-live">
          <thead>
            <tr>
              <th className="rank-col">Plats</th>
              <th className="name-col">Spelare</th>
              <th className="points-col">Poäng</th>
              <th className="record-col">Match</th>
              <th className="games-col">Spel</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((participant, index) => {
              const rank = index + 1
              const wins = participant.wins || 0
              const losses = participant.losses || 0
              const draws = participant.draws || 0
              const totalMatches = wins + losses + draws
              const points = participant.points || 0

              return (
                <tr key={index} className={`rank-${getRankColor(rank)}`}>
                  <td className="rank-cell">
                    <span className="rank-number">{rank}</span>
                    {rank <= 3 && <span className="rank-medal">🏆</span>}
                  </td>
                  <td className="name-cell">
                    {participant.firstName} {participant.lastName}
                  </td>
                  <td className="points-cell">
                    <strong>{points}</strong>
                  </td>
                  <td className="record-cell">
                    <span className="record-wins">{wins}</span>
                    <span className="record-separator">-</span>
                    <span className="record-losses">{losses}</span>
                    {draws > 0 && (
                      <>
                        <span className="record-separator">-</span>
                        <span className="record-draws">{draws}</span>
                      </>
                    )}
                  </td>
                  <td className="games-cell">
                    {totalMatches > 0 ? (
                      <span className="games-played">{totalMatches}</span>
                    ) : (
                      <span className="games-pending">-</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default LiveStandings
