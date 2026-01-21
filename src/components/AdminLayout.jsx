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

  // MTG Set Icons as SVG components - styled like Magic: The Gathering set symbols
  const MTGIcons = {
    crown: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        {/* Crown base */}
        <rect x="3" y="15" width="18" height="2.5" rx="0.5" fill="currentColor"/>
        {/* Three triangular points */}
        <path d="M7 15L5 7L9 7L7 15Z" fill="currentColor"/>
        <path d="M12 15L10 5L14 5L12 15Z" fill="currentColor"/>
        <path d="M17 15L15 7L19 7L17 15Z" fill="currentColor"/>
        {/* Gem in center */}
        <ellipse cx="12" cy="10" rx="1.5" ry="2.5" fill="white"/>
      </svg>
    ),
    romanIV: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        {/* Roman numeral I */}
        <rect x="6" y="3" width="3.5" height="18" rx="0.5" fill="currentColor"/>
        {/* Roman numeral V */}
        <path d="M12.5 3L18.5 12L12.5 21H16.5L21.5 12L16.5 3H12.5Z" fill="currentColor"/>
      </svg>
    ),
    geometric: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        {/* Hexagonal outline */}
        <path d="M12 1L15.5 4.5L19.5 3.5L20.5 7.5L23.5 11L20.5 14.5L20.5 19.5L16.5 20.5L12 23L7.5 20.5L3.5 21.5L3.5 19.5L0.5 14.5L3.5 11L3.5 7.5L7.5 4.5L12 1Z" fill="currentColor"/>
        {/* Inner star pattern */}
        <circle cx="12" cy="12" r="4.5" fill="white" opacity="0.25"/>
        <path d="M12 7L14.5 10L12 12L9.5 10L12 7Z" fill="white"/>
        <path d="M17 12L14.5 14.5L12 12L14.5 9.5L17 12Z" fill="white"/>
        <path d="M12 17L9.5 14.5L12 12L14.5 14.5L12 17Z" fill="white"/>
        <path d="M7 12L9.5 9.5L12 12L9.5 14.5L7 12Z" fill="white"/>
      </svg>
    ),
    eyeCircle: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        {/* Outer circle */}
        <circle cx="12" cy="12" r="11" fill="currentColor"/>
        {/* Inner circle (eye) */}
        <circle cx="8.5" cy="12" r="6" fill="white"/>
        {/* C shape inside */}
        <path d="M8.5 8C6 8 4 10 4 12C4 14 6 16 8.5 16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        {/* Speech bubble tail */}
        <path d="M21 18L23.5 20.5L21 23" fill="currentColor"/>
      </svg>
    ),
    swirl: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        {/* Globe/swirl pattern */}
        <circle cx="12" cy="12" r="11" fill="currentColor"/>
        {/* Swirling continents pattern */}
        <path d="M12 1C7 1 3 5 3 10C3 15 7 19 12 19C17 19 21 15 21 10C21 5 17 1 12 1Z" fill="white" opacity="0.35"/>
        <path d="M12 6C9 6 6 9 6 12C6 15 9 18 12 18C15 18 18 15 18 12C18 9 15 6 12 6Z" fill="white" opacity="0.5"/>
        <path d="M12 9C10.5 9 9 10.5 9 12C9 13.5 10.5 15 12 15C13.5 15 15 13.5 15 12C15 10.5 13.5 9 12 9Z" fill="currentColor" opacity="0.4"/>
      </svg>
    ),
    flag: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        {/* Flag pole */}
        <line x1="4" y1="3" x2="4" y2="21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="4" cy="3" r="2" fill="currentColor"/>
        {/* Waving flag */}
        <path d="M4 3L20 5.5L4 8L20 10.5L4 13L20 15.5L4 18" fill="currentColor"/>
        {/* Swallowtail cut */}
        <path d="M20 3L16.5 5.5L20 8" fill="white" opacity="0.15"/>
      </svg>
    ),
    letterM: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        {/* Circle background */}
        <circle cx="12" cy="12" r="11" fill="currentColor"/>
        {/* Stylized M letter */}
        <path d="M7 5L7 19M7 5L12 13L17 5M17 5L17 19" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    )
  }

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/admin/dashboard',
      icon: MTGIcons.crown
    },
    {
      id: 'tournament',
      label: 'Turneringar',
      path: '/admin/tournament',
      icon: MTGIcons.flag
    },
    {
      id: 'products',
      label: 'Produkter',
      path: '/admin/products',
      icon: MTGIcons.geometric
    },
    {
      id: 'orders',
      label: 'Beställningar',
      path: '/admin/orders',
      icon: MTGIcons.swirl
    },
    {
      id: 'settings',
      label: 'Inställningar',
      path: '/admin/settings',
      icon: MTGIcons.eyeCircle
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
              <span className="admin-nav-icon">{item.icon}</span>
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
