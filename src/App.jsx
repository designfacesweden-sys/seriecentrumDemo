import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { UserProvider } from './components/UserAuth'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Product from './pages/Product'
import Contact from './pages/Contact'
import FAQ from './pages/FAQ'
import Tournament from './pages/TournamentNew'
import Admin from './pages/Admin'
import AdminTournaments from './pages/AdminTournaments'
import AdminDashboard from './pages/AdminDashboard'
import AdminProducts from './pages/AdminProducts'
import AdminOrders from './pages/AdminOrders'
import AdminSettings from './pages/AdminSettings'
import AdminLogin from './pages/AdminLogin'
import ProtectedRoute from './components/ProtectedRoute'
import { Navigate } from 'react-router-dom'

function AdminLoginWrapper() {
  const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true'
  
  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />
  }
  
  return <AdminLogin />
}

function AppContent() {
  const location = useLocation()
  const isAdminPage = location.pathname.startsWith('/admin')

  return (
    <div className="app">
      {!isAdminPage && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/butik" element={<Shop />} />
          <Route path="/produkt" element={<Product />} />
          <Route path="/kontakta-oss" element={<Contact />} />
          <Route path="/vanliga-fragor" element={<FAQ />} />
          <Route path="/fnm-turneringar" element={<Tournament />} />
          <Route path="/fnm-och-turneringar" element={<Tournament />} />
              <Route path="/admin" element={<AdminLoginWrapper />} />
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/tournament" 
                element={
                  <ProtectedRoute>
                    <AdminTournaments />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/tournament-registrations" 
                element={
                  <ProtectedRoute>
                    <Admin />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/products" 
                element={
                  <ProtectedRoute>
                    <AdminProducts />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/orders" 
                element={
                  <ProtectedRoute>
                    <AdminOrders />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/settings" 
                element={
                  <ProtectedRoute>
                    <AdminSettings />
                  </ProtectedRoute>
                } 
              />
          <Route path="/checkout" element={<div className="page-section"><div className="page-container"><h1>Checkout</h1><p>Checkout-sidan kommer snart...</p></div></div>} />
        </Routes>
      </main>
      {!isAdminPage && <Footer />}
    </div>
  )
}

function App() {
  return (
    <CartProvider>
      <UserProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </UserProvider>
    </CartProvider>
  )
}

export default App
