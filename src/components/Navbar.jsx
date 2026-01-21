import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useUser } from './UserAuth'
import LoginModal from './LoginModal'
import RegisterModal from './RegisterModal'

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const { cart, removeFromCart, updateQuantity, getTotalPrice, getCartCount } = useCart()
  const { user, login, logout } = useUser()

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
    if (!mobileMenuOpen) {
      document.body.classList.add('menu-open')
    } else {
      document.body.classList.remove('menu-open')
    }
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
    document.body.classList.remove('menu-open')
  }

  const toggleCart = () => {
    setCartOpen(!cartOpen)
  }

  const closeCart = () => {
    setCartOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cartOpen && !e.target.closest('.cart-wrapper')) {
        setCartOpen(false)
      }
      if (accountOpen && !e.target.closest('.account-wrapper')) {
        setAccountOpen(false)
      }
    }
    if (cartOpen) {
      document.addEventListener('click', handleClickOutside)
      document.body.classList.add('cart-open')
    } else {
      document.body.classList.remove('cart-open')
    }
    if (accountOpen) {
      document.addEventListener('click', handleClickOutside)
    }
    return () => {
      document.removeEventListener('click', handleClickOutside)
      document.body.classList.remove('cart-open')
    }
  }, [cartOpen, accountOpen])

  const toggleAccount = () => {
    setAccountOpen(!accountOpen)
  }

  const closeAccount = () => {
    setAccountOpen(false)
  }

  const handleLogout = () => {
    logout()
    setAccountOpen(false)
  }

  const totalPrice = getTotalPrice()
  const cartCount = getCartCount()

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo-section">
            <Link to="/" id="navbar-logo-link">
              <img src="/images/logotyp.png" alt="Seriecentrum Logo" className="logo-image" />
            </Link>
          </div>
          <nav className={`main-nav ${mobileMenuOpen ? 'active' : ''} ${!mobileMenuOpen && mobileMenuOpen !== null ? 'closing' : ''}`}>
            <ul className="nav-list">
              <li className="nav-item">
                <Link to="/butik" className="nav-link" onClick={closeMobileMenu}>Butik</Link>
              </li>
              <li className="nav-item">
                <Link to="/fnm-turneringar" className="nav-link" onClick={closeMobileMenu}>FNM & Turneringar</Link>
              </li>
              <li className="nav-item">
                <Link to="/om-oss" className="nav-link" onClick={closeMobileMenu}>Om oss</Link>
              </li>
              <li className="nav-item">
                <Link to="/kontakta-oss" className="nav-link" onClick={closeMobileMenu}>Kontakta Oss</Link>
              </li>
            </ul>
          </nav>
          <div className="header-actions">
            <button className="contact-phone-btn">
              Fråga? Ring oss
            </button>
          </div>
          <div className={`account-wrapper ${accountOpen ? 'active' : ''}`}>
            <button 
              className="account-icon-btn" 
              aria-label="Konto"
              onClick={toggleAccount}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </button>
            <div className="account-dropdown">
              {user ? (
                <>
                  <div className="account-dropdown-header">
                    <div className="account-user-info">
                      <p className="account-user-name">{user.firstName} {user.lastName}</p>
                      <p className="account-user-email">{user.email}</p>
                    </div>
                  </div>
                  <div className="account-dropdown-menu">
                    <button className="account-menu-item" onClick={handleLogout}>
                      Logga ut
                    </button>
                  </div>
                </>
              ) : (
                <div className="account-dropdown-menu">
                  <button 
                    className="account-menu-item"
                    onClick={() => {
                      setAccountOpen(false)
                      setIsLoginModalOpen(true)
                    }}
                  >
                    Logga in
                  </button>
                  <button 
                    className="account-menu-item"
                    onClick={() => {
                      setAccountOpen(false)
                      setIsRegisterModalOpen(true)
                    }}
                  >
                    Skapa konto
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className={`cart-wrapper ${cartOpen ? 'active' : ''}`}>
            <button 
              className="cart-icon-btn" 
              id="cart-toggle" 
              aria-label="Visa varukorg"
              onClick={toggleCart}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {cartCount > 0 && <span className="cart-count" id="cart-count">{cartCount}</span>}
            </button>
            <div className="cart-dropdown" id="cart-dropdown">
              <div className="cart-dropdown-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <h3>Varukorg</h3>
                  <button 
                    className="cart-close-btn" 
                    id="cart-close-btn" 
                    aria-label="Stäng varukorg"
                    onClick={closeCart}
                    style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer', padding: '0.5rem', lineHeight: 1 }}
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="cart-dropdown-items" id="cart-items">
                {cart.length === 0 ? (
                  <p className="cart-empty">Din varukorg är tom</p>
                ) : (
                  cart.map((item, index) => (
                    <div key={index} className="cart-item">
                      <div className="cart-item-info">
                        <h4>{item.name}</h4>
                        {item.condition && <p>Skick: {item.condition}</p>}
                        <p className="cart-item-price">{item.price}</p>
                      </div>
                      <div className="cart-item-actions">
                        <button 
                          onClick={() => updateQuantity(item.name, item.condition || '', item.quantity - 1)}
                          className="cart-quantity-btn"
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.name, item.condition || '', item.quantity + 1)}
                          className="cart-quantity-btn"
                        >
                          +
                        </button>
                        <button 
                          onClick={() => removeFromCart(item.name, item.condition || '')}
                          className="cart-remove-btn"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="cart-dropdown-footer">
                <div className="cart-total">
                  <span>Totalt:</span>
                  <span className="cart-total-price" id="cart-total">{totalPrice} kr</span>
                </div>
                <Link 
                  to="/checkout" 
                  className={`checkout-btn ${cart.length === 0 ? 'disabled' : ''}`} 
                  id="checkout-btn"
                  onClick={(e) => {
                    if (cart.length === 0) {
                      e.preventDefault()
                    }
                  }}
                >
                  Gå till kassan
                </Link>
              </div>
            </div>
          </div>
          <button 
            className={`mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
            aria-label="Växla meny"
            onClick={toggleMobileMenu}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <button 
            className={`mobile-menu-close ${mobileMenuOpen ? 'active' : ''}`}
            aria-label="Stäng meny"
            onClick={closeMobileMenu}
            style={{ display: mobileMenuOpen ? 'flex' : 'none' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={(userData) => {
          login(userData)
          setIsLoginModalOpen(false)
        }}
        onSwitchToRegister={() => {
          setIsLoginModalOpen(false)
          setIsRegisterModalOpen(true)
        }}
      />

      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegister={(userData) => {
          login(userData)
          setIsRegisterModalOpen(false)
        }}
        onSwitchToLogin={() => {
          setIsRegisterModalOpen(false)
          setIsLoginModalOpen(true)
        }}
      />
    </header>
  )
}

export default Navbar
