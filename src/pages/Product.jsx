import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const Product = () => {
  const [searchParams] = useSearchParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedCondition, setSelectedCondition] = useState('')
  const [selectedConditionData, setSelectedConditionData] = useState(null)
  const [conditionDropdownOpen, setConditionDropdownOpen] = useState(false)
  const [addToCartText, setAddToCartText] = useState('Lägg i varukorg')
  const { addToCart } = useCart()

  const productName = decodeURIComponent(searchParams.get('name') || '')
  const productPrice = searchParams.get('price')
  const productCategory = searchParams.get('category')
  const originalUrl = searchParams.get('original_url')
  const availableConditionsParam = searchParams.get('available_conditions')

  useEffect(() => {
    fetch('/products.json')
      .then(response => response.json())
      .then(products => {
        let foundProduct = null

        if (originalUrl) {
          foundProduct = products.find(p => p.url === decodeURIComponent(originalUrl))
        }

        if (!foundProduct && productName) {
          // Find product by name (should be unique after deduplication)
          foundProduct = products.find(p => (p.name || '').trim() === productName.trim())
          
          // If still not found, try to find any product with similar name
          if (!foundProduct) {
            foundProduct = products.find(p => 
              (p.name || '').toLowerCase().trim() === productName.toLowerCase().trim()
            )
          }
        }

        if (foundProduct) {
          setProduct(foundProduct)
          
          // Get available conditions
          let availableConditions = []
          if (foundProduct.available_conditions && foundProduct.available_conditions.length > 0) {
            availableConditions = foundProduct.available_conditions
          } else if (availableConditionsParam) {
            try {
              availableConditions = JSON.parse(decodeURIComponent(availableConditionsParam))
            } catch (e) {
              // Error parsing available conditions
            }
          }

          // Set default condition (first available one)
          if (availableConditions.length > 0) {
            // Filter to only available conditions (availability > 0)
            const available = availableConditions.filter(cond => {
              const avail = typeof cond === 'object' ? cond.availability : cond
              if (typeof avail === 'string') {
                const lower = avail.toLowerCase()
                return !lower.includes('ej') && !lower.includes('slut') && lower !== '0'
              }
              return parseInt(avail || '0') > 0
            })
            
            if (available.length > 0) {
              const defaultCond = typeof available[0] === 'object' ? available[0].condition : available[0]
              const defaultData = typeof available[0] === 'object' ? available[0] : null
              setSelectedCondition(defaultCond)
              setSelectedConditionData(defaultData)
            } else if (availableConditions.length > 0) {
              // All are unavailable, but still allow selection
              const first = availableConditions[0]
              const firstCond = typeof first === 'object' ? first.condition : first
              const firstData = typeof first === 'object' ? first : null
              setSelectedCondition(firstCond)
              setSelectedConditionData(firstData)
            }
          }
        } else {
          // Fallback to URL params
          setProduct({
            name: productName,
            price: productPrice ? `${productPrice} kr` : '0',
            category: productCategory || 'all',
            images: [],
            description: 'Ingen beskrivning tillgänglig för denna produkt.'
          })
        }
        setLoading(false)
      })
      .catch(error => {
        // Error loading products
        setLoading(false)
      })
  }, [productName, originalUrl, productPrice, productCategory, availableConditionsParam])

  const getAvailableConditions = () => {
    if (product?.available_conditions && product.available_conditions.length > 0) {
      return product.available_conditions
    }
    if (availableConditionsParam) {
      try {
        return JSON.parse(decodeURIComponent(availableConditionsParam))
      } catch (e) {
        return []
      }
    }
    return []
  }

  const isConditionAvailable = (conditionData) => {
    if (typeof conditionData === 'string') {
      return true // Fallback for old format
    }
    const avail = conditionData.availability || '0'
    if (typeof avail === 'string') {
      const lower = avail.toLowerCase()
      return !lower.includes('ej') && !lower.includes('slut') && lower !== '0'
    }
    return parseInt(avail || '0') > 0
  }

  const handleConditionSelect = (conditionData) => {
    if (typeof conditionData === 'object') {
      setSelectedCondition(conditionData.condition)
      setSelectedConditionData(conditionData)
      // Update product price and availability
      setProduct(prev => ({
        ...prev,
        price: conditionData.price || prev.price,
        availability: conditionData.availability || prev.availability
      }))
    } else {
      setSelectedCondition(conditionData)
      setSelectedConditionData(null)
    }
    setConditionDropdownOpen(false)
  }

  const handleAddToCart = () => {
    if (!selectedCondition || !product) return
    
    // Use price from selected condition if available
    const priceToUse = selectedConditionData?.price || product.price || productPrice || '0'
    const finalPrice = typeof priceToUse === 'string' && !priceToUse.includes('kr') 
      ? `${priceToUse} kr` 
      : priceToUse

    addToCart({
      name: product.name,
      price: finalPrice,
      condition: selectedCondition,
      category: product.category || productCategory || 'all',
      image: product.images?.[0] || null
    })

    setAddToCartText('Tillagd produkt')
    setTimeout(() => {
      setAddToCartText('Lägg i varukorg')
    }, 1500)
  }

  if (loading) {
    return (
      <section className="page-section product-detail-section">
        <div className="page-container">
          <p>Laddar produkt...</p>
        </div>
      </section>
    )
  }

  if (!product) {
    return (
      <section className="page-section product-detail-section">
        <div className="page-container">
          <p>Produkt hittades inte.</p>
        </div>
      </section>
    )
  }

  const availableConditions = getAvailableConditions()
  // Use price from selected condition if available, otherwise use product price
  const price = selectedConditionData?.price || product.price || (productPrice ? `${productPrice} kr` : '0')
  const finalPrice = typeof price === 'string' && !price.includes('kr') && !price.includes('Kr') 
    ? `${price}${price.includes('kr') || price.includes('Kr') ? '' : ' kr'}` 
    : price
  const hasImage = product.images && product.images.length > 0

  return (
    <section className="page-section product-detail-section">
      <div className="page-container">
        <div className="product-detail-container">
          <div className="product-detail-image">
            {hasImage ? (
              <img
                src={product.images[0]}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
              />
            ) : (
              <div className="product-image-placeholder-large">📦</div>
            )}
          </div>
          <div className="product-detail-info">
            <h1 className="product-detail-title">{product.name}</h1>
            <div className="product-detail-rating">
              <div className="rating-stars">★★★★★</div>
              <span className="review-count">(24)</span>
            </div>
            <div className="product-detail-pricing">
              <span className="current-price">{finalPrice}</span>
            </div>
            {availableConditions.length > 0 && (
              <div className="product-detail-condition">
                <label htmlFor="product-condition">Skick:</label>
                <div className="custom-dropdown">
                  <button
                    className={`custom-dropdown-button ${conditionDropdownOpen ? 'active' : ''}`}
                    type="button"
                    onClick={() => setConditionDropdownOpen(!conditionDropdownOpen)}
                  >
                    <span className="dropdown-selected-text">
                      {selectedCondition || 'Välj skick'}
                    </span>
                    <svg className="dropdown-arrow" width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  {conditionDropdownOpen && (
                    <div className="custom-dropdown-menu active">
                      {availableConditions.map((conditionData, index) => {
                      const condition = typeof conditionData === 'object' ? conditionData.condition : conditionData
                      const conditionPrice = typeof conditionData === 'object' ? conditionData.price : null
                      const conditionAvailability = typeof conditionData === 'object' ? conditionData.availability : null
                      const isAvailable = isConditionAvailable(conditionData)
                      const isSelected = selectedCondition === condition
                      
                      return (
                        <div
                          key={index}
                          className={`dropdown-option ${isSelected ? 'selected' : ''} ${!isAvailable ? 'unavailable' : ''}`}
                          onClick={() => {
                            if (isAvailable) {
                              handleConditionSelect(conditionData)
                            }
                          }}
                          style={{
                            opacity: isAvailable ? 1 : 0.5,
                            cursor: isAvailable ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.75rem 1.25rem'
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <span style={{ fontWeight: isSelected ? 600 : 500 }}>
                              {condition}
                            </span>
                            {conditionAvailability && (
                              <span style={{ fontSize: '0.75rem', color: isAvailable ? 'rgba(255, 255, 255, 0.6)' : '#f87171' }}>
                                {isAvailable 
                                  ? `Tillgänglig: ${conditionAvailability}` 
                                  : 'Ej tillgänglig'}
                              </span>
                            )}
                          </div>
                          {conditionPrice && (
                            <span style={{ marginLeft: '1rem', fontWeight: 700, color: '#ffffff', fontSize: '1rem' }}>
                              {conditionPrice}
                            </span>
                          )}
                        </div>
                      )
                    })}
                    </div>
                  )}
                </div>
              </div>
            )}
            {product.availability && (
              <div className="product-detail-availability" style={{ margin: '1rem 0', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                <strong>Lagerstatus:</strong>{' '}
                <span style={{
                  color: product.availability === '1' || product.availability.toLowerCase() === 'i lager'
                    ? '#4ade80'
                    : product.availability.toLowerCase().includes('ej') || product.availability.toLowerCase().includes('slut')
                    ? '#f87171'
                    : 'inherit'
                }}>
                  {product.availability === '1' || product.availability.toLowerCase() === 'i lager'
                    ? 'I lager'
                    : product.availability.toLowerCase().includes('ej') || product.availability.toLowerCase().includes('slut')
                    ? product.availability
                    : `Tillgängliga: ${product.availability}`}
                </span>
              </div>
            )}
            <div className="product-detail-description">
              <p>{product.description || 'Ingen beskrivning tillgänglig för denna produkt.'}</p>
            </div>
            <div className="product-detail-actions">
              <button
                className="add-to-cart-btn-large"
                onClick={handleAddToCart}
                disabled={!selectedCondition || (selectedConditionData && !isConditionAvailable(selectedConditionData))}
              >
                {addToCartText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Product
