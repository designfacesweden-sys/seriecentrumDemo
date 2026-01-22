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

  return (
    <div className="enhanced-result-modal-overlay" onClick={onClose}>
      <div className="enhanced-result-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="enhanced-modal-close" onClick={onClose}>×</button>
        
        <div className="enhanced-modal-header">
          <h2>Skicka in resultat</h2>
          <div className="match-info-summary">
            <div className="match-opponent">
              Motståndare: <strong>{opponent ? `${opponent.firstName} ${opponent.lastName}` : 'BYE'}</strong>
            </div>
          </div>
        </div>

        {submissionStatus === 'pending' && (
          <div className="submission-status pending">
            <div className="status-spinner"></div>
            <p>Skickar in resultat...</p>
          </div>
        )}

        {submissionStatus === 'confirmed' && (
          <div className="submission-status confirmed">
            <div className="status-checkmark">✓</div>
            <p>Resultat skickat in!</p>
          </div>
        )}

        {submissionStatus === 'idle' && (
          <form className="enhanced-result-form" onSubmit={handleSubmit}>
            {error && <div className="form-error">{error}</div>}

            <div className="result-quick-select">
              <div className="quick-select-label">Välj resultat:</div>
              <div className="quick-select-buttons">
                <button
                  type="button"
                  className={`quick-select-btn ${formData.result === 'win' ? 'active' : ''}`}
                  onClick={() => handleResultSelect('win')}
                >
                  Vinst
                </button>
                <button
                  type="button"
                  className={`quick-select-btn ${formData.result === 'loss' ? 'active' : ''}`}
                  onClick={() => handleResultSelect('loss')}
                >
                  Förlust
                </button>
                <button
                  type="button"
                  className={`quick-select-btn ${formData.result === 'draw' ? 'active' : ''}`}
                  onClick={() => handleResultSelect('draw')}
                >
                  Oavgjort
                </button>
              </div>
            </div>

            <div className="result-details-section">
              <div className="details-label">Spelresultat (valfritt):</div>
              <div className="result-inputs-grid">
                <div className="result-input-group">
                  <label>{pairing.player1?.firstName || 'Spelare 1'} vinster</label>
                  <input
                    type="number"
                    min="0"
                    max="3"
                    value={formData.player1Wins}
                    onChange={(e) => setFormData(prev => ({ ...prev, player1Wins: e.target.value }))}
                    placeholder="0"
                  />
                </div>
                <div className="result-input-group">
                  <label>Oavgjorda</label>
                  <input
                    type="number"
                    min="0"
                    max="3"
                    value={formData.draws}
                    onChange={(e) => setFormData(prev => ({ ...prev, draws: e.target.value }))}
                    placeholder="0"
                  />
                </div>
                <div className="result-input-group">
                  <label>{pairing.player2?.firstName || 'Spelare 2'} vinster</label>
                  <input
                    type="number"
                    min="0"
                    max="3"
                    value={formData.player2Wins}
                    onChange={(e) => setFormData(prev => ({ ...prev, player2Wins: e.target.value }))}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={onClose}>
                Avbryt
              </button>
              <button type="submit" className="submit-btn primary" disabled={loading}>
                {loading ? 'Skickar...' : 'Bekräfta resultat'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default EnhancedResultModal
