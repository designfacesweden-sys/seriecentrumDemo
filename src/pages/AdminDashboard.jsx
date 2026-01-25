import { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'
import { apiFetch } from '../utils/api'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    tournamentRegistrations: 0,
    lowStockProducts: 0,
    newOrdersToday: 0,
    activeTournaments: 0,
    upcomingTournaments: 0,
    outOfStockProducts: 0,
    pendingOrders: 0,
    avgOrderValue: 0
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Load products
      const productsRes = await apiFetch('/products?limit=1000')
      const products = productsRes.products || []
      
      // Calculate total stock
      const totalStock = products.reduce((sum, product) => {
        if (product.availableConditions && product.availableConditions.length > 0) {
          return sum + product.availableConditions.reduce((condSum, cond) => condSum + (parseInt(cond.stock) || 0), 0)
        }
        return sum + (parseInt(product.stock) || 0)
      }, 0)
      
      // Count low stock products (less than 10 items)
      const lowStockProducts = products.filter(product => {
        if (product.availableConditions && product.availableConditions.length > 0) {
          const total = product.availableConditions.reduce((sum, cond) => sum + (parseInt(cond.stock) || 0), 0)
          return total < 10 && total > 0
        }
        const stock = parseInt(product.stock) || 0
        return stock < 10 && stock > 0
      }).length

      // Load receipts/orders
      let receipts = []
      try {
        const receiptsRes = await apiFetch('/receipts')
        receipts = Array.isArray(receiptsRes) ? receiptsRes : []
      } catch (err) {
        // If receipts endpoint doesn't exist, use empty array
      }
      
      // Calculate total revenue
      const totalRevenue = receipts.reduce((sum, receipt) => {
        return sum + (parseFloat(receipt.total || receipt.amount || 0) || 0)
      }, 0)
      
      // Count new orders today
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const newOrdersToday = receipts.filter(receipt => {
        const orderDate = new Date(receipt.createdAt || receipt.date)
        orderDate.setHours(0, 0, 0, 0)
        return orderDate.getTime() === today.getTime()
      }).length

      // Load accounts (customers)
      let accounts = []
      try {
        const accountsRes = await apiFetch('/accounts')
        accounts = Array.isArray(accountsRes) ? accountsRes : []
      } catch (err) {
        // If accounts endpoint doesn't exist, use empty array
      }

      // Load tournaments
      let tournaments = []
      try {
        const tournamentsRes = await apiFetch('/tournaments')
        tournaments = Array.isArray(tournamentsRes) ? tournamentsRes : []
      } catch (err) {
        // If tournaments endpoint doesn't exist, use empty array
      }
      
      const tournamentRegistrations = tournaments.reduce((sum, tournament) => {
        return sum + (tournament.participants?.length || 0)
      }, 0)
      
      const activeTournaments = tournaments.filter(t => t.status === 'active' || t.status === 'started').length
      const upcomingTournaments = tournaments.filter(t => t.status === 'upcoming').length
      
      // Count out of stock products
      const outOfStockProducts = products.filter(product => {
        if (product.availableConditions && product.availableConditions.length > 0) {
          const total = product.availableConditions.reduce((sum, cond) => sum + (parseInt(cond.stock) || 0), 0)
          return total === 0
        }
        return (parseInt(product.stock) || 0) === 0
      }).length
      
      // Calculate pending orders
      const pendingOrders = receipts.filter(receipt => {
        const status = receipt.status?.toLowerCase() || 'levererad'
        return status === 'pending' || status === 'väntande' || status === 'behandlas'
      }).length
      
      // Calculate average order value
      const avgOrderValue = receipts.length > 0 
        ? receipts.reduce((sum, receipt) => sum + (parseFloat(receipt.total || receipt.amount || 0) || 0), 0) / receipts.length
        : 0

      // Get recent orders (last 5)
      const sortedReceipts = [...receipts].sort((a, b) => {
        const dateA = new Date(a.createdAt || a.date || 0)
        const dateB = new Date(b.createdAt || b.date || 0)
        return dateB - dateA
      }).slice(0, 5)

      setStats({
        totalProducts: products.length,
        totalStock: totalStock,
        totalOrders: receipts.length,
        totalRevenue: totalRevenue,
        totalCustomers: accounts.length,
        tournamentRegistrations: tournamentRegistrations,
        lowStockProducts: lowStockProducts,
        newOrdersToday: newOrdersToday,
        activeTournaments: activeTournaments,
        upcomingTournaments: upcomingTournaments,
        outOfStockProducts: outOfStockProducts,
        pendingOrders: pendingOrders,
        avgOrderValue: avgOrderValue
      })
      setRecentOrders(sortedReceipts)
    } catch (error) {
      // Error loading data
    } finally {
      setLoading(false)
    }
  }

  const dashboardStats = [
    {
      title: 'Totalt produkter',
      value: stats.totalProducts.toLocaleString('sv-SE'),
      category: 'produkter',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
      )
    },
    {
      title: 'Totalt lager',
      value: stats.totalStock.toLocaleString('sv-SE'),
      category: 'produkter',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="9" y1="3" x2="9" y2="21"></line>
          <line x1="3" y1="9" x2="21" y2="9"></line>
        </svg>
      )
    },
    {
      title: 'Lågt lager',
      value: stats.lowStockProducts,
      category: 'produkter',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      ),
      highlight: stats.lowStockProducts > 0
    },
    {
      title: 'Produkter utan lager',
      value: stats.outOfStockProducts,
      category: 'produkter',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      ),
      highlight: stats.outOfStockProducts > 0
    },
    {
      title: 'Totala intäkter',
      value: `${Math.round(stats.totalRevenue).toLocaleString('sv-SE')} kr`,
      category: 'försäljning',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      )
    },
    {
      title: 'Beställningar',
      value: stats.totalOrders,
      category: 'försäljning',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
      )
    },
    {
      title: 'Väntande beställningar',
      value: stats.pendingOrders,
      category: 'försäljning',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      ),
      highlight: stats.pendingOrders > 0
    },
    {
      title: 'Nya beställningar (idag)',
      value: stats.newOrdersToday,
      category: 'försäljning',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      )
    },
    {
      title: 'Genomsnittligt ordervärde',
      value: `${Math.round(stats.avgOrderValue).toLocaleString('sv-SE')} kr`,
      category: 'försäljning',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      )
    },
    {
      title: 'Kunder',
      value: stats.totalCustomers,
      category: 'interaktioner',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      )
    },
    {
      title: 'Aktiva turneringar',
      value: stats.activeTournaments,
      category: 'interaktioner',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
          <path d="M2 17l10 5 10-5"></path>
          <path d="M2 12l10 5 10-5"></path>
        </svg>
      )
    },
    {
      title: 'Kommande turneringar',
      value: stats.upcomingTournaments,
      category: 'interaktioner',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      )
    }
  ]

  const filteredStats = selectedCategory === 'all' 
    ? dashboardStats 
    : dashboardStats.filter(stat => stat.category === selectedCategory)

  return (
    <AdminLayout>
      <section className="admin-page-section">
        <div className="admin-page-header">
          <div>
            <h1 className="admin-page-title">Dashboard</h1>
            <p className="admin-page-subtitle">Översikt över webbplatsen</p>
          </div>
          <div className="dashboard-category-selector">
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="dashboard-category-select"
            >
              <option value="all">Alla</option>
              <option value="produkter">Produkter</option>
              <option value="försäljning">Försäljning</option>
              <option value="interaktioner">Interaktioner</option>
            </select>
          </div>
        </div>

        <div className="admin-page-content">
          {loading ? (
            <div className="admin-loading">Laddar dashboard...</div>
          ) : (
            <>
              <div className="dashboard-stats-grid">
                {filteredStats.map((stat, index) => (
                  <div key={index} className={`dashboard-stat-card ${stat.highlight ? 'highlight' : ''}`}>
                    <div className="dashboard-stat-icon">
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
                <h2 className="dashboard-section-title">Senaste beställningar</h2>
                {recentOrders.length === 0 ? (
                  <div className="admin-empty">
                    <p>Inga beställningar ännu.</p>
                  </div>
                ) : (
                  <div className="registrations-table-wrapper">
                    <table className="registrations-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Kund</th>
                          <th>Totalt</th>
                          <th>Datum</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((order, index) => (
                          <tr key={order._id || index}>
                            <td>{index + 1}</td>
                            <td>{order.customerName || order.email || 'Okänd kund'}</td>
                            <td>{order.total ? `${Math.round(order.total).toLocaleString('sv-SE')} kr` : order.amount ? `${Math.round(order.amount).toLocaleString('sv-SE')} kr` : '0 kr'}</td>
                            <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('sv-SE') : order.date ? new Date(order.date).toLocaleDateString('sv-SE') : '-'}</td>
                            <td>{order.status || 'Levererad'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </AdminLayout>
  )
}

export default AdminDashboard
