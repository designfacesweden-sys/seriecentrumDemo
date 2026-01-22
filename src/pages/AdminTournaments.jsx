import { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'

const API_URL = '/api'

const AdminTournaments = () => {
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTournament, setEditingTournament] = useState(null)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    startTime: '11:00',
    location: 'SerieCentrum, Hedvägen 155, 231 66 Trelleborg',
    cost: 395,
    format: 'Sealed',
    maxPlayers: 24,
    rules: '',
    timePerRound: 50,
    prizes: []
  })
  const [prizeInput, setPrizeInput] = useState({ position: '1', prize: '' })
  
  const prizePositions = [
    { value: '1', label: '1:a plats' },
    { value: '2', label: '2:a plats' },
    { value: '3', label: '3:e plats' },
    { value: '4', label: '4:e plats' },
    { value: '5', label: '5:e plats' },
    { value: '6', label: '6:e plats' },
    { value: '7', label: '7:e plats' },
    { value: '8', label: '8:e plats' }
  ]

  useEffect(() => {
    fetchTournaments()
  }, [])

  const fetchTournaments = async () => {
    try {
      const response = await fetch(`${API_URL}/tournaments`)
      
      const contentType = response.headers.get('content-type')
      
      if (!contentType || !contentType.includes('application/json')) {
        setError('Backend-servern körs inte. Starta servern med "npm run server"')
        setLoading(false)
        return
      }
      
      const data = await response.json()
      
      if (response.ok) {
        setTournaments(data)
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        setError(errorData.error || 'Kunde inte hämta turneringar')
      }
    } catch (error) {
      setError('Kunde inte ansluta till servern. Kontrollera att backend-servern körs.')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (tournament = null) => {
    if (tournament) {
      setEditingTournament(tournament._id)
      const prizes = tournament.prizes || []
      setFormData({
        name: tournament.name || '',
        description: tournament.description || '',
        startDate: tournament.startDate || '',
        startTime: tournament.startTime || '11:00',
        location: tournament.location || '',
        cost: tournament.cost || 0,
        format: tournament.format || 'Sealed',
        maxPlayers: tournament.maxPlayers || 24,
        rules: tournament.rules || '',
        timePerRound: tournament.timePerRound || 50,
        prizes: prizes
      })
      // Set prizeInput to first available position
      const usedPositions = prizes.map(p => {
        const pos = prizePositions.find(pp => pp.label === p.position)
        return pos ? pos.value : null
      }).filter(Boolean)
      const nextPosition = prizePositions.find(p => !usedPositions.includes(p.value))
      setPrizeInput({ position: nextPosition ? nextPosition.value : '1', prize: '' })
    } else {
      setEditingTournament(null)
      setFormData({
        name: '',
        description: '',
        startDate: '',
        startTime: '11:00',
        location: 'SerieCentrum, Hedvägen 155, 231 66 Trelleborg',
        cost: 395,
        format: 'Sealed',
        maxPlayers: 24,
        rules: '',
        timePerRound: 50,
        prizes: []
      })
      setPrizeInput({ position: '1', prize: '' })
    }
    setIsModalOpen(true)
    setError('')
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingTournament(null)
    setError('')
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleAddPrize = () => {
    if (prizeInput.position && prizeInput.prize) {
      // Check if position already exists by comparing position values
      const selectedPosition = prizePositions.find(p => p.value === prizeInput.position)
      if (!selectedPosition) {
        setError('Ogiltig plats vald')
        return
      }
      
      // Check if this position label already exists in prizes
      const positionExists = formData.prizes.some(p => p.position === selectedPosition.label)
      if (positionExists) {
        setError(`${selectedPosition.label} är redan tillagd`)
        return
      }
      
      setFormData({
        ...formData,
        prizes: [...formData.prizes, { 
          position: selectedPosition.label, 
          prize: prizeInput.prize 
        }]
      })
      
      // Set next available position
      const usedPositions = formData.prizes.map(p => {
        const pos = prizePositions.find(pp => pp.label === p.position)
        return pos ? pos.value : null
      }).filter(Boolean)
      usedPositions.push(prizeInput.position) // Add the one we just used
      const nextPosition = prizePositions.find(p => !usedPositions.includes(p.value))
      setPrizeInput({ position: nextPosition ? nextPosition.value : '1', prize: '' })
      setError('')
    }
  }

  const handleRemovePrize = (index) => {
    const newPrizes = formData.prizes.filter((_, i) => i !== index)
    setFormData({
      ...formData,
      prizes: newPrizes
    })
    // Update prizeInput to show first available position after removal
    const usedPositions = newPrizes.map(p => {
      const pos = prizePositions.find(pp => pp.label === p.position)
      return pos ? pos.value : null
    }).filter(Boolean)
    const nextPosition = prizePositions.find(p => !usedPositions.includes(p.value))
    setPrizeInput({ position: nextPosition ? nextPosition.value : '1', prize: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    setError('')
    setLoading(true)

    try {
      const url = editingTournament 
        ? `${API_URL}/tournaments/${editingTournament}`
        : `${API_URL}/tournaments`
      const method = editingTournament ? 'PUT' : 'POST'


      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })


      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Kunde inte spara turnering')
      }

      const responseData = await response.json()

      await fetchTournaments()
      handleCloseModal()
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Är du säker på att du vill ta bort denna turnering?')) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/tournaments/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchTournaments()
      }
    } catch (error) {
      // Silent error handling
    }
  }

  const handleStart = async (id) => {
    if (!window.confirm('Är du säker på att du vill starta denna turnering? Detta kan inte ångras.')) {
      return
    }

    try {
      const url = `${API_URL}/tournaments/${id}/start`
      const response = await fetch(url, {
        method: 'POST'
      })

      if (response.ok) {
        await fetchTournaments()
        alert('Turnering startad!')
      } else {
        const data = await response.json().catch(() => ({ error: 'Okänt fel' }))
        const errorMsg = data.error || 'Kunde inte starta turnering'
        if (data.currentParticipants !== undefined) {
          alert(`${errorMsg}\n\nNuvarande deltagare: ${data.currentParticipants}\nDu behöver minst 2 deltagare för att starta turneringen.`)
        } else {
          alert(errorMsg)
        }
      }
    } catch (error) {
      alert('Kunde inte starta turnering')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'rgba(107, 127, 255, 0.3)'
      case 'active': return 'rgba(76, 175, 80, 0.3)'
      case 'started': return 'rgba(255, 152, 0, 0.3)'
      case 'finished': return 'rgba(158, 158, 158, 0.3)'
      default: return 'rgba(255, 255, 255, 0.1)'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'upcoming': return 'Kommande'
      case 'active': return 'Aktiv'
      case 'started': return 'Pågår'
      case 'finished': return 'Avslutad'
      default: return status
    }
  }

  return (
    <AdminLayout>
      <section className="admin-section">
        <div className="admin-header">
          <h1>Turneringar</h1>
          <button className="admin-add-button" onClick={() => handleOpenModal()}>
            + Ny turnering
          </button>
        </div>

        {loading && tournaments.length === 0 ? (
          <div className="admin-empty">
            <p>Laddar...</p>
          </div>
        ) : tournaments.length === 0 ? (
          <div className="admin-empty">
            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>🏆</div>
            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 600 }}>Inga turneringar ännu</p>
            <p style={{ fontSize: '0.95rem', opacity: 0.7 }}>Skapa din första turnering för att komma igång</p>
          </div>
        ) : (
          <div className="admin-tournaments-grid">
            {tournaments.map((tournament) => (
              <div key={tournament._id} className="tournament-card-admin">
                <div className="tournament-card-header">
                  <h3>{tournament.name}</h3>
                  <span 
                    className="tournament-status"
                    style={{ backgroundColor: getStatusColor(tournament.status) }}
                  >
                    {getStatusText(tournament.status)}
                  </span>
                </div>
                <div className="tournament-card-info">
                  <p><strong>Datum:</strong> {tournament.startDate} {tournament.startTime}</p>
                  <p><strong>Format:</strong> {tournament.format}</p>
                  <p><strong>Deltagare:</strong> {tournament.participants?.length || 0} / {tournament.maxPlayers}</p>
                  <p><strong>Kostnad:</strong> {tournament.cost} kr</p>
                  {tournament.status === 'started' && (
                    <p><strong>Runda:</strong> {tournament.currentRound} / {tournament.rounds?.length || 0}</p>
                  )}
                </div>
                <div className="tournament-card-actions">
                  <button
                    className="edit-btn"
                    onClick={() => handleOpenModal(tournament)}
                  >
                    Redigera
                  </button>
                  {tournament.status === 'upcoming' && (
                    <button
                      className="submit-btn"
                      onClick={() => handleStart(tournament._id)}
                      disabled={(tournament.participants?.length || 0) < 2}
                      title={(tournament.participants?.length || 0) < 2 ? 'Behöver minst 2 deltagare för att starta' : ''}
                    >
                      Starta
                    </button>
                  )}
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(tournament._id)}
                  >
                    Ta bort
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tournament Modal */}
        {isModalOpen && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
              <h2 className="modal-title">
                {editingTournament ? 'Redigera turnering' : 'Ny turnering'}
              </h2>
              
              <form className="admin-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Namn *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="T.ex. Lorwyn Eclipsed Prerelease"
                  />
                </div>

                <div className="form-group">
                  <label>Beskrivning</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Beskrivning av turneringen..."
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Startdatum *</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Starttid</label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Plats</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="SerieCentrum, Hedvägen 155, 231 66 Trelleborg"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Kostnad (kr)</label>
                    <input
                      type="number"
                      name="cost"
                      value={formData.cost}
                      onChange={handleChange}
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label>Max antal spelare</label>
                    <input
                      type="number"
                      name="maxPlayers"
                      value={formData.maxPlayers}
                      onChange={handleChange}
                      min="2"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Format *</label>
                    <select
                      name="format"
                      value={formData.format}
                      onChange={handleChange}
                      required
                    >
                      <option value="Sealed">Sealed</option>
                      <option value="Draft">Draft</option>
                      <option value="Standard">Standard</option>
                      <option value="Modern">Modern</option>
                      <option value="Commander">Commander</option>
                      <option value="Pioneer">Pioneer</option>
                      <option value="Legacy">Legacy</option>
                      <option value="Vintage">Vintage</option>
                      <option value="Limited">Limited</option>
                      <option value="Constructed">Constructed</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Tid per runda (minuter)</label>
                    <input
                      type="number"
                      name="timePerRound"
                      value={formData.timePerRound}
                      onChange={handleChange}
                      min="30"
                      step="5"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Regler</label>
                  <textarea
                    name="rules"
                    value={formData.rules}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Turneringsregler och information..."
                  />
                </div>

                <div className="form-group">
                  <label>Priser</label>
                  <div className="prizes-list">
                    {formData.prizes
                      .sort((a, b) => {
                        // Sort by position number
                        const aPos = prizePositions.findIndex(p => p.label === a.position)
                        const bPos = prizePositions.findIndex(p => p.label === b.position)
                        if (aPos === -1 && bPos === -1) return 0
                        if (aPos === -1) return 1
                        if (bPos === -1) return -1
                        return aPos - bPos
                      })
                      .map((prize, index) => (
                        <div key={index} className="prize-row">
                          <span>{prize.position}: {prize.prize}</span>
                          <button
                            type="button"
                            className="remove-condition-btn"
                            onClick={() => handleRemovePrize(index)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    <div className="prize-input-row">
                      <select
                        value={prizeInput.position}
                        onChange={(e) => setPrizeInput({ ...prizeInput, position: e.target.value })}
                        className="prize-position-select"
                      >
                        {prizePositions
                          .filter(p => {
                            const usedPositions = formData.prizes.map(prize => {
                              const pos = prizePositions.find(pp => pp.label === prize.position)
                              return pos ? pos.value : null
                            }).filter(Boolean)
                            return !usedPositions.includes(p.value)
                          })
                          .map(pos => (
                            <option key={pos.value} value={pos.value}>
                              {pos.label}
                            </option>
                          ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Pris (t.ex. 395kr)"
                        value={prizeInput.prize}
                        onChange={(e) => setPrizeInput({ ...prizeInput, prize: e.target.value })}
                      />
                      <button
                        type="button"
                        className="add-condition-btn"
                        onClick={handleAddPrize}
                      >
                        + Lägg till
                      </button>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="form-message error">{error}</div>
                )}

                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={handleCloseModal}>
                    Avbryt
                  </button>
                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Sparar...' : editingTournament ? 'Uppdatera' : 'Skapa'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>
    </AdminLayout>
  )
}

export default AdminTournaments
