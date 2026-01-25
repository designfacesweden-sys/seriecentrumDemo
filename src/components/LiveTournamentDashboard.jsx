import { useState, useEffect } from 'react'

const LiveTournamentDashboard = ({ tournament, user }) => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [announcements, setAnnouncements] = useState([])

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
  
  if (!currentRound) {
    return null
  }

  const roundStartTime = new Date(currentRound.startedAt)
  const timePerRound = tournament.timePerRound || 50 // minutes
  const roundEndTime = new Date(roundStartTime.getTime() + timePerRound * 60000)
  const timeRemaining = Math.max(0, roundEndTime - currentTime)
  const minutes = Math.floor(timeRemaining / 60000)
  const seconds = Math.floor((timeRemaining % 60000) / 1000)

  const totalRounds = tournament.rounds?.length || 0
  const roundNumber = tournament.rounds?.indexOf(currentRound) + 1 || currentRound.roundNumber || 1

  return (
    <div className="live-tournament-header">
      <div className="live-tournament-info">
        <h1 className="live-tournament-name">{tournament.name}</h1>
        <div className="live-tournament-meta">
          <span className="live-round-info">Runda {roundNumber} av {totalRounds}</span>
          <span className="live-timer-display">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>
      </div>
    </div>
  )
}

export default LiveTournamentDashboard
