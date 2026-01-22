import { useState } from 'react'
import { useCart } from '../context/CartContext'

const Checkout = () => {
  const { cart, getTotalPrice } = useCart()
  const [currentStep, setCurrentStep] = useState(1)
  const [shippingData, setShippingData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    postalCode: '',
    city: '',
    country: 'Sverige'
  })
  const [paymentData, setPaymentData] = useState({
    paymentMethod: '',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  })

  const totalPrice = getTotalPrice()
  const shippingCost = 49
  const finalTotal = totalPrice + shippingCost

  const handleShippingChange = (e) => {
    setShippingData({
      ...shippingData,
      [e.target.name]: e.target.value
    })
  }

  const handlePaymentChange = (e) => {
    setPaymentData({
      ...paymentData,
      [e.target.name]: e.target.value
    })
  }

  const handleShippingSubmit = (e) => {
    e.preventDefault()
    setCurrentStep(2)
  }

  const handlePaymentSubmit = (e) => {
    e.preventDefault()
    // Handle order submission here
    alert('Beställning genomförd!')
  }

  if (cart.length === 0) {
    return (
      <section className="page-section">
        <div className="page-container">
          <h1 className="page-title">Checkout</h1>
          <p>Din varukorg är tom. Lägg till produkter för att fortsätta.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="page-section checkout-section">
      <div className="page-container">
        <h1 className="page-title">Checkout</h1>
        
        {/* Step Indicator */}
        <div className="checkout-steps" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0,
          margin: '3rem auto 4rem',
          maxWidth: '500px',
          width: '100%',
          flexDirection: 'row'
        }}>
          <div className={`checkout-step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div className="step-number" style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              color: 'rgba(255, 255, 255, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
              fontWeight: 600,
              flexShrink: 0
            }}>{currentStep > 1 ? '✓' : '1'}</div>
            <div className="step-label" style={{ color: '#ffffff' }}>Frakt</div>
          </div>
          <div className="step-connector" style={{
            width: '120px',
            height: '2px',
            background: 'rgba(255, 255, 255, 0.2)',
            margin: '0 1.5rem',
            position: 'relative',
            top: '24px',
            flexShrink: 0
          }}></div>
          <div className={`checkout-step ${currentStep >= 2 ? 'active' : ''}`} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div className="step-number" style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: currentStep >= 2 ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.08)',
              border: currentStep >= 2 ? '2px solid rgba(255, 255, 255, 0.3)' : '2px solid rgba(255, 255, 255, 0.2)',
              color: currentStep >= 2 ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
              fontWeight: 600,
              flexShrink: 0
            }}>2</div>
            <div className="step-label" style={{ color: '#ffffff' }}>Betalning</div>
          </div>
        </div>

        <div className="checkout-content">
          {/* Left Column - Forms */}
          <div className="checkout-forms">
            {currentStep === 1 && (
              <div className="checkout-form-section">
                <h2 className="form-section-title">Fraktinformation</h2>
                <form onSubmit={handleShippingSubmit} className="checkout-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="firstName">Förnamn *</label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={shippingData.firstName}
                        onChange={handleShippingChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="lastName">Efternamn *</label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={shippingData.lastName}
                        onChange={handleShippingChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">E-post *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={shippingData.email}
                      onChange={handleShippingChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Telefonnummer *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={shippingData.phone}
                      onChange={handleShippingChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="address">Adress *</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={shippingData.address}
                      onChange={handleShippingChange}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="postalCode">Postnummer *</label>
                      <input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        value={shippingData.postalCode}
                        onChange={handleShippingChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="city">Stad *</label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={shippingData.city}
                        onChange={handleShippingChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="country">Land *</label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={shippingData.country}
                      onChange={handleShippingChange}
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="checkout-btn-primary"
                    style={{
                      padding: '1rem 2rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(20px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                      cursor: 'pointer',
                      width: '100%',
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      MozAppearance: 'none'
                    }}
                  >
                    Fortsätt till betalning
                  </button>
                </form>
              </div>
            )}

            {currentStep === 2 && (
              <div className="checkout-form-section">
                <h2 className="form-section-title">Betalningsinformation</h2>
                <form onSubmit={handlePaymentSubmit} className="checkout-form">
                  <div className="form-group">
                    <label htmlFor="paymentMethod">Betalningsmetod *</label>
                    <select
                      id="paymentMethod"
                      name="paymentMethod"
                      value={paymentData.paymentMethod}
                      onChange={handlePaymentChange}
                      required
                    >
                      <option value="">Välj betalningsmetod</option>
                      <option value="card">Kort</option>
                      <option value="swish">Swish</option>
                      <option value="invoice">Faktura</option>
                    </select>
                  </div>
                  {paymentData.paymentMethod === 'card' && (
                    <>
                      <div className="form-group">
                        <label htmlFor="cardNumber">Kortnummer *</label>
                        <input
                          type="text"
                          id="cardNumber"
                          name="cardNumber"
                          value={paymentData.cardNumber}
                          onChange={handlePaymentChange}
                          placeholder="1234 5678 9012 3456"
                          maxLength="19"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="cardName">Kortinnehavare *</label>
                        <input
                          type="text"
                          id="cardName"
                          name="cardName"
                          value={paymentData.cardName}
                          onChange={handlePaymentChange}
                          required
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="expiryDate">Giltigt till *</label>
                          <input
                            type="text"
                            id="expiryDate"
                            name="expiryDate"
                            value={paymentData.expiryDate}
                            onChange={handlePaymentChange}
                            placeholder="MM/ÅÅ"
                            maxLength="5"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="cvv">CVV *</label>
                          <input
                            type="text"
                            id="cvv"
                            name="cvv"
                            value={paymentData.cvv}
                            onChange={handlePaymentChange}
                            placeholder="123"
                            maxLength="3"
                            required
                          />
                        </div>
                      </div>
                    </>
                  )}
                  {paymentData.paymentMethod === 'swish' && (
                    <div className="payment-info-box">
                      <p>Du kommer att få ett Swish-meddelande när du bekräftar beställningen.</p>
                    </div>
                  )}
                  {paymentData.paymentMethod === 'invoice' && (
                    <div className="payment-info-box">
                      <p>Faktura skickas till den angivna e-postadressen.</p>
                    </div>
                  )}
                  <div className="checkout-actions">
                    <button 
                      type="button" 
                      className="checkout-btn-secondary"
                      onClick={() => setCurrentStep(1)}
                    >
                      Tillbaka
                    </button>
                    <button 
                      type="submit" 
                      className="checkout-btn-primary"
                      style={{
                        padding: '1rem 2rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(20px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                        cursor: 'pointer',
                        width: '100%',
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none'
                      }}
                    >
                      Slutför beställning
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="checkout-summary">
            <h2 className="summary-title">Din beställning</h2>
            <div className="summary-items">
              {cart.map((item, index) => (
                <div key={index} className="summary-item">
                  <div className="summary-item-info">
                    <h4>{item.name}</h4>
                    {item.condition && <p>Skick: {item.condition}</p>}
                    <p className="summary-item-price">{item.price}</p>
                  </div>
                  <div className="summary-item-quantity">
                    <span>x{item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="summary-totals">
              <div className="summary-row">
                <span>Delsumma</span>
                <span>{totalPrice} kr</span>
              </div>
              <div className="summary-row">
                <span>Frakt</span>
                <span>{shippingCost} kr</span>
              </div>
              <div className="summary-row summary-total">
                <span>Totalt</span>
                <span>{finalTotal} kr</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Checkout
