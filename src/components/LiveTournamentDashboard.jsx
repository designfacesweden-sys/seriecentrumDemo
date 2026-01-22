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
    <div className="live-dashboard">
      <div className="live-dashboard-header">
        <div className="global-timer-section">
          <div className="timer-label">Runda {roundNumber} av {totalRounds}</div>
          <div className="global-timer">
            <span className="timer-value">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className="timer-label-small">Återstående tid</span>
          </div>
        </div>
        
        <div className="tournament-status-indicator">
          <span className="status-dot live"></span>
          <span className="status-text">LIVE</span>
        </div>
      </div>

      {announcements.length > 0 && (
        <div className="announcements-section">
          {announcements.map((announcement, idx) => (
            <div key={idx} className="announcement-card">
              <div className="announcement-icon">📢</div>
              <div className="announcement-content">
                <div className="announcement-title">{announcement.title}</div>
                <div className="announcement-text">{announcement.text}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default LiveTournamentDashboard
