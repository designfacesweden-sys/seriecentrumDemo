import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const AdminLayout = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuthenticated')
    sessionStorage.removeItem('adminLoginTime')
    navigate('/admin')
  }

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/admin/dashboard',
      iconClass: 'ss ss-lea'
    },
    {
      id: 'tournament',
      label: 'Turneringar',
      path: '/admin/tournament',
      iconClass: 'ss ss-4ed'
    },
    {
      id: 'products',
      label: 'Produkter',
      path: '/admin/products',
      iconClass: 'ss ss-m15'
    },
    {
      id: 'orders',
      label: 'Beställningar',
      path: '/admin/orders',
      iconClass: 'ss ss-ody'
    },
    {
      id: 'settings',
      label: 'Inställningar',
      path: '/admin/settings',
      iconClass: 'ss ss-w17'
    }
  ]

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="admin-sidebar-header">
          <h2 className="admin-sidebar-logo">Admin</h2>
          <button 
            className="admin-sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`admin-nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="admin-nav-icon">
                <i className={item.iconClass}></i>
              </span>
              {sidebarOpen && <span className="admin-nav-label">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-nav-item logout" onClick={handleLogout}>
            <span className="admin-nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </span>
            {sidebarOpen && <span className="admin-nav-label">Logga ut</span>}
          </button>
        </div>
      </aside>

      <main className="admin-main-content">
        {children}
      </main>
    </div>
  )
}

export default AdminLayout
