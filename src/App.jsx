import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { CartProvider } from './context/CartContext'
import { UserProvider } from './components/UserAuth'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Product from './pages/Product'
import Contact from './pages/Contact'
import FAQ from './pages/FAQ'
import VisitUs from './pages/VisitUs'
import Tournament from './pages/TournamentNew'
import Checkout from './pages/Checkout'
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

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])

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
          <Route path="/besok-oss" element={<VisitUs />} />
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
          <Route path="/checkout" element={<Checkout />} />
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
