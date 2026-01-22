const PrizeShowcase = ({ tournament }) => {
  if (!tournament || !tournament.prizes || tournament.prizes.length === 0) {
    return null
  }

  const getPrizeTier = (position) => {
    if (position.includes('1:a') || position.includes('1st')) return 'tier-1'
    if (position.includes('2:a') || position.includes('2nd')) return 'tier-2'
    if (position.includes('3:e') || position.includes('3rd')) return 'tier-3'
    return 'tier-other'
  }

  const getPrizeIcon = (position) => {
    if (position.includes('1:a') || position.includes('1st')) return '🥇'
    if (position.includes('2:a') || position.includes('2nd')) return '🥈'
    if (position.includes('3:e') || position.includes('3rd')) return '🥉'
    return '🎁'
  }

  return (
    <div className="prize-showcase-container">
      <div className="prize-showcase-header">
        <h3>Priser</h3>
        <div className="prize-showcase-subtitle">Turneringspriser</div>
      </div>

      <div className="prize-cards-grid">
        {tournament.prizes.map((prize, index) => {
          const tier = getPrizeTier(prize.position)
          const icon = getPrizeIcon(prize.position)

          return (
            <div key={index} className={`prize-card ${tier}`}>
              <div className="prize-card-header">
                <div className="prize-icon">{icon}</div>
                <div className="prize-position">{prize.position}</div>
              </div>
              <div className="prize-value">{prize.prize}</div>
              {tier === 'tier-1' && (
                <div className="prize-glow"></div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PrizeShowcase
