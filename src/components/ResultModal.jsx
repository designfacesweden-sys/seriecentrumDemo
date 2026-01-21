import { useState } from 'react'

const API_URL = '/api'

const ResultModal = ({ isOpen, onClose, tournament, roundNumber, pairing, pairingIndex, onResultSubmitted }) => {
  const [formData, setFormData] = useState({
    player1Wins: '',
    player2Wins: '',
    draws: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen || !pairing) return null

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

    try {
      const user = JSON.parse(sessionStorage.getItem('user'))
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
        onResultSubmitted()
        onClose()
      } else {
        setError(data.error || 'Kunde inte skicka in resultat')
      }
    } catch (error) {
      setError('Något gick fel. Försök igen.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2 className="modal-title">Skicka in resultat</h2>
        <p className="modal-subtitle">
          {pairing.player1?.firstName} {pairing.player1?.lastName} vs{' '}
          {pairing.player2 ? `${pairing.player2.firstName} ${pairing.player2.lastName}` : 'BYE'}
        </p>

        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="result-input-grid">
            <div className="result-input-group">
              <label>{pairing.player1?.firstName} {pairing.player1?.lastName} - Vinster</label>
              <input
                type="number"
                min="0"
                value={formData.player1Wins}
                onChange={(e) => setFormData({ ...formData, player1Wins: e.target.value })}
                placeholder="0"
                required
              />
            </div>

            <div className="result-input-group">
              <label>Oavgjorda</label>
              <input
                type="number"
                min="0"
                value={formData.draws}
                onChange={(e) => setFormData({ ...formData, draws: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="result-input-group">
              <label>
                {pairing.player2 ? `${pairing.player2.firstName} ${pairing.player2.lastName}` : 'BYE'} - Vinster
              </label>
              <input
                type="number"
                min="0"
                value={formData.player2Wins}
                onChange={(e) => setFormData({ ...formData, player2Wins: e.target.value })}
                placeholder="0"
                required
                disabled={!pairing.player2}
              />
            </div>
          </div>

          {error && (
            <div className="form-message error">{error}</div>
          )}

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Avbryt
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Skickar...' : 'Skicka in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ResultModal
