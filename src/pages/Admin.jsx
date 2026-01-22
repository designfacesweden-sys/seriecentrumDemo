import { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'

const API_URL = '/api'

const Admin = () => {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadRegistrations()
  }, [])

  const loadRegistrations = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/tournament/registrations`)
      if (response.ok) {
        const data = await response.json()
        setRegistrations(data)
      }
    } catch (err) {
      // Error loading registrations
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Är du säker på att du vill ta bort denna registrering?')) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/tournament/registrations/${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        await loadRegistrations()
      } else {
        alert('Kunde inte ta bort registreringen')
      }
    } catch (error) {
      // Error deleting registration
      alert('Kunde inte ta bort registreringen')
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <AdminLayout>
      <section className="admin-page-section">
        <div className="admin-page-header">
          <h1 className="admin-page-title">Turneringsregistreringar</h1>
          <p className="admin-page-subtitle">Hantera alla turneringsregistreringar</p>
        </div>

        <div className="admin-page-content">
          <div className="admin-stats">
            <div className="stat-card">
              <div className="stat-value">{registrations.length}</div>
              <div className="stat-label">Totalt antal registreringar</div>
            </div>
          </div>

          {loading ? (
            <div className="admin-loading">Laddar registreringar...</div>
          ) : registrations.length === 0 ? (
            <div className="admin-empty">
              <p>Inga registreringar ännu.</p>
            </div>
          ) : (
            <div className="registrations-table-wrapper">
              <table className="registrations-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Förnamn</th>
                    <th>Efternamn</th>
                    <th>E-post</th>
                    <th>Registrerad</th>
                    <th>Åtgärder</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((registration, index) => (
                    <tr key={registration._id || registration.id}>
                      <td>{index + 1}</td>
                      <td>{registration.firstName}</td>
                      <td>{registration.lastName}</td>
                      <td>{registration.email}</td>
                      <td>{formatDate(registration.registeredAt)}</td>
                      <td>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(registration._id || registration.id)}
                          title="Ta bort registrering"
                        >
                          Ta bort
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </AdminLayout>
  )
}

export default Admin
