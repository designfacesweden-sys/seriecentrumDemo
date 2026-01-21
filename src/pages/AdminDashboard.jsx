import { useState, useEffect } from 'react'
import { getRegistrations } from '../utils/storage'
import AdminLayout from '../components/AdminLayout'

const AdminDashboard = () => {
  const [registrations, setRegistrations] = useState([])

  useEffect(() => {
    const data = getRegistrations()
    setRegistrations(data)
  }, [])

  const stats = [
    {
      title: 'Turneringsregistreringar',
      value: registrations.length,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
      color: '#6B7FFF'
    },
    {
      title: 'Produkter',
      value: 0,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
      ),
      color: '#4CAF50'
    },
    {
      title: 'Beställningar',
      value: 0,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
      ),
      color: '#FF9800'
    },
    {
      title: 'Intäkter',
      value: '0 kr',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      ),
      color: '#F44336'
    }
  ]

  return (
    <AdminLayout>
      <section className="admin-page-section">
        <div className="admin-page-header">
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-subtitle">Översikt över webbplatsen</p>
        </div>

        <div className="admin-page-content">
          <div className="dashboard-stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="dashboard-stat-card">
                <div className="dashboard-stat-icon" style={{ color: stat.color }}>
                  {stat.icon}
                </div>
                <div className="dashboard-stat-content">
                  <div className="dashboard-stat-value">{stat.value}</div>
                  <div className="dashboard-stat-title">{stat.title}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="dashboard-recent-section">
            <h2 className="dashboard-section-title">Senaste registreringar</h2>
            {registrations.length === 0 ? (
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
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.slice(0, 5).map((registration, index) => (
                      <tr key={registration.id}>
                        <td>{index + 1}</td>
                        <td>{registration.firstName}</td>
                        <td>{registration.lastName}</td>
                        <td>{registration.email}</td>
                        <td>{new Date(registration.registeredAt).toLocaleDateString('sv-SE')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </AdminLayout>
  )
}

export default AdminDashboard
