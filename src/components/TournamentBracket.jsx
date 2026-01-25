import { useState, useEffect } from 'react'

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

const TournamentBracket = ({ tournament, user, onResultSubmit }) => {
  const [bracketData, setBracketData] = useState(null)

  // Generate bracket rounds for participants
  const generateBracketRounds = (participants) => {
    const rounds = []
    let currentRoundParticipants = [...participants]
    let roundNumber = 1

    // Calculate number of rounds needed (log2 of participants, rounded up)
    const numRounds = Math.ceil(Math.log2(participants.length))

    for (let round = 0; round < numRounds; round++) {
      const pairings = []
      
      // Create pairings for this round
      for (let i = 0; i < currentRoundParticipants.length; i += 2) {
        const player1 = currentRoundParticipants[i]
        const player2 = currentRoundParticipants[i + 1] || null
        
        pairings.push({
          player1,
          player2,
          completed: false,
          result: null
        })
      }

      rounds.push({
        roundNumber: roundNumber++,
        pairings,
        bracketType: 'winners'
      })

      // For next round, we need half the number of participants (winners)
      // For now, we'll create placeholder participants for visualization
      const nextRoundCount = Math.ceil(currentRoundParticipants.length / 2)
      currentRoundParticipants = Array(nextRoundCount).fill(null).map((_, i) => ({
        firstName: `Winner`,
        lastName: `${roundNumber}`,
        email: `winner${i}@example.com`
      }))
    }

    return rounds
  }

  useEffect(() => {
    if (!tournament) {
      setBracketData(null)
      return
    }

    // Always use FAKE_PARTICIPANTS for demonstration (20 players)
    // Check if tournament rounds exist and have all 20 participants in first round
    const hasValidRounds = tournament.rounds && 
                          tournament.rounds.length > 0 && 
                          tournament.rounds[0].pairings &&
                          tournament.rounds[0].pairings.length >= 10 // 10 matches = 20 players

    if (hasValidRounds) {
      const allRounds = tournament.rounds.map((round, index) => ({
        ...round,
        index,
        roundNumber: round.roundNumber || index + 1
      }))

      setBracketData({
        rounds: allRounds
      })
    } else {
      // Always generate bracket with all 20 fake participants
      const generatedRounds = generateBracketRounds(FAKE_PARTICIPANTS)
      setBracketData({
        rounds: generatedRounds
      })
    }
  }, [tournament])

  if (!bracketData || !bracketData.rounds || bracketData.rounds.length === 0) {
    return (
      <div className="bracket-exact-wrapper">
        <div className="bracket-exact-container">
          <div className="bracket-empty">
            <p>Ingen bracket-data tillgänglig</p>
          </div>
        </div>
      </div>
    )
  }

  const getWinner = (pairing) => {
    if (!pairing.result) return null
    if (pairing.result.player1Wins > pairing.result.player2Wins) {
      return pairing.player1
    } else if (pairing.result.player2Wins > pairing.result.player1Wins) {
      return pairing.player2
    }
    return null // Draw
  }

  const isWinner = (pairing, player) => {
    const winner = getWinner(pairing)
    if (!winner || !player) return false
    return (
      (winner.userId?.toString() === player.userId?.toString()) ||
      (winner.email === player.email) ||
      (winner.firstName === player.firstName && winner.lastName === player.lastName)
    )
  }

  const renderTeam = (player, pairing, isTop, roundIndex, matchIndex, allRounds) => {
    if (!player) {
      return (
        <div className="bracket-team-box" key={`${roundIndex}-${matchIndex}-${isTop ? 'top' : 'bottom'}`}>
          <div className="bracket-team-bar pending"></div>
          <div className="bracket-team-name">BYE</div>
        </div>
      )
    }

    const playerName = `${player.firstName || ''} ${player.lastName || ''}`.trim()
    const hasWon = pairing && pairing.result && isWinner(pairing, player)
    const isCompleted = pairing && pairing.completed

    return (
      <div className="bracket-team-box" key={`${roundIndex}-${matchIndex}-${isTop ? 'top' : 'bottom'}`}>
        <div className={`bracket-team-bar ${hasWon ? 'winner' : isCompleted ? 'loser' : 'pending'}`}></div>
        <div className="bracket-team-name">{playerName || 'BYE'}</div>
      </div>
    )
  }

  const renderMatch = (pairing, roundIndex, matchIndex, allRounds) => {
    const isUserMatch = user && (
      (pairing.player1?.userId?.toString() === user._id) ||
      (pairing.player1?.email === user.email) ||
      (pairing.player2?.userId?.toString() === user._id) ||
      (pairing.player2?.email === user.email)
    )

    const isPlayer1 = user && (
      (pairing.player1?.userId?.toString() === user._id) ||
      (pairing.player1?.email === user.email)
    )
    const isPlayer2 = user && pairing.player2 && (
      (pairing.player2?.userId?.toString() === user._id) ||
      (pairing.player2?.email === user.email)
    )

    return (
      <div key={matchIndex} className="bracket-match-exact">
        {renderTeam(pairing.player1, pairing, true, roundIndex, matchIndex, allRounds)}
        {renderTeam(pairing.player2, pairing, false, roundIndex, matchIndex, allRounds)}
        {!pairing.completed && pairing.player2 && (isPlayer1 || isPlayer2) && (
          <button
            className="bracket-submit-btn-exact"
            onClick={() => onResultSubmit && onResultSubmit(
              pairing,
              pairing.roundNumber || roundIndex + 1,
              matchIndex
            )}
          >
            Skicka in
          </button>
        )}
      </div>
    )
  }

  const renderRound = (round, roundIndex, allRounds) => {
    if (!round.pairings || round.pairings.length === 0) return null

    const isFinal = roundIndex === allRounds.length - 1

    return (
      <div key={roundIndex} className="bracket-round-exact">
        <div className="bracket-round-matches">
          {round.pairings.map((pairing, matchIndex) => 
            renderMatch(pairing, roundIndex, matchIndex, allRounds)
          )}
        </div>
        {isFinal && round.pairings.length === 1 && getWinner(round.pairings[0]) && (
          <div className="bracket-trophy">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V11a2 2 0 0 0-2-2h-2"></path>
              <path d="M6 1v3"></path>
              <path d="M18 1v3"></path>
              <path d="M6 13h12"></path>
              <path d="M12 7v6"></path>
            </svg>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bracket-exact-wrapper">
      <div className="bracket-exact-title">
        <h1>TOURNAMENT BRACKET</h1>
        <div className="bracket-title-bar"></div>
      </div>
      <div className="bracket-exact-container">
        <div className="bracket-rounds-exact">
          {bracketData.rounds.map((round, index) => 
            renderRound(round, index, bracketData.rounds)
          )}
        </div>
      </div>
    </div>
  )
}

export default TournamentBracket
