import { useState } from 'react'

const API_URL = '/api'

const EnhancedResultModal = ({ isOpen, onClose, tournament, roundNumber, pairing, pairingIndex, onResultSubmitted }) => {
  const [formData, setFormData] = useState({
    result: '', // 'win', 'loss', 'draw'
    player1Wins: '',
    player2Wins: '',
    draws: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submissionStatus, setSubmissionStatus] = useState('idle') // 'idle', 'pending', 'confirmed', 'disputed'

  if (!isOpen || !pairing) return null

  const user = JSON.parse(sessionStorage.getItem('user') || 'null')
  const isPlayer1 = (pairing.player1?.userId?.toString() === user?._id) || 
                    (pairing.player1?.email === user?.email)

  const handleResultSelect = (result) => {
    setFormData(prev => ({
      ...prev,
      result,
      player1Wins: result === 'win' && isPlayer1 ? '2' : result === 'loss' && isPlayer1 ? '0' : prev.player1Wins,
      player2Wins: result === 'win' && !isPlayer1 ? '2' : result === 'loss' && !isPlayer1 ? '0' : prev.player2Wins
    }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const p1Wins = parseInt(formData.player1Wins) || 0
    const p2Wins = parseInt(formData.player2Wins) || 0
    const draws = parseInt(formData.draws) || 0

    if (p1Wins < 0 || p2Wins < 0 || draws < 0) {
      setError('Resultat kan inte vara negativa')
      return
    }

    if (p1Wins === 0 && p2Wins === 0 && draws === 0) {
      setError('Minst ett resultat måste anges')
      return
    }

    setLoading(true)
    setSubmissionStatus('pending')

    try {
      const submittedBy = user?._id || user?.email

      const response = await fetch(
        `${API_URL}/tournaments/${tournament._id}/rounds/${roundNumber}/results`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pairingIndex,
            player1Wins: p1Wins,
            player2Wins: p2Wins,
            draws,
            submittedBy
          })
        }
      )

      const data = await response.json()

      if (response.ok) {
        setSubmissionStatus('confirmed')
        setTimeout(() => {
          onResultSubmitted()
          onClose()
          setFormData({ result: '', player1Wins: '', player2Wins: '', draws: '' })
          setSubmissionStatus('idle')
        }, 1500)
      } else {
        setError(data.error || 'Kunde inte skicka in resultat')
        setSubmissionStatus('idle')
      }
    } catch (error) {
      setError('Något gick fel. Försök igen.')
      setSubmissionStatus('idle')
    } finally {
      setLoading(false)
    }
  }

  const opponent = isPlayer1 ? pairing.player2 : pairing.player1

  // Only allow submission if user is involved in the match
  if (!user || (!isPlayer1 && !(pairing.player2 && (pairing.player2?.userId?.toString() === user._id || pairing.player2?.email === user.email)))) {
    return null
  }

  return (
    <div className="result-modal-overlay-clean" onClick={onClose}>
      <div className="result-modal-content-clean" onClick={(e) => e.stopPropagation()}>
        <button className="result-modal-close-clean" onClick={onClose}>×</button>
        
        <div className="result-modal-header-clean">
          <h2>Skicka in resultat</h2>
          <div className="result-opponent-info">
            Motståndare: <strong>{opponent ? `${opponent.firstName} ${opponent.lastName}` : 'BYE'}</strong>
          </div>
        </div>

        {submissionStatus === 'pending' && (
          <div className="submission-status-clean pending">
            <div className="status-spinner-clean"></div>
            <p>Skickar in resultat...</p>
          </div>
        )}

        {submissionStatus === 'confirmed' && (
          <div className="submission-status-clean confirmed">
            <div className="status-checkmark-clean">✓</div>
            <p>Resultat skickat in!</p>
          </div>
        )}

        {submissionStatus === 'idle' && (
          <form className="result-form-clean" onSubmit={handleSubmit}>
            {error && <div className="form-error-clean">{error}</div>}

            <div className="score-inputs-clean">
              <div className="score-input-group-clean">
                <label>Du</label>
                <input
                  type="number"
                  min="0"
                  max="3"
                  value={isPlayer1 ? formData.player1Wins : formData.player2Wins}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    [isPlayer1 ? 'player1Wins' : 'player2Wins']: e.target.value 
                  }))}
                  placeholder="0"
                  className="score-input-clean"
                />
              </div>
              <div className="score-separator-clean">-</div>
              <div className="score-input-group-clean">
                <label>{opponent ? `${opponent.firstName}` : 'Motståndare'}</label>
                <input
                  type="number"
                  min="0"
                  max="3"
                  value={isPlayer1 ? formData.player2Wins : formData.player1Wins}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    [isPlayer1 ? 'player2Wins' : 'player1Wins']: e.target.value 
                  }))}
                  placeholder="0"
                  className="score-input-clean"
                />
              </div>
            </div>

            <div className="form-actions-clean">
              <button type="button" className="cancel-btn-clean" onClick={onClose}>
                Avbryt
              </button>
              <button type="submit" className="submit-btn-clean" disabled={loading}>
                {loading ? 'Skickar...' : 'Skicka in'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default EnhancedResultModal
