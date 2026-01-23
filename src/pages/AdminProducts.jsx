import { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'

const API_URL = '/api'

const AdminProducts = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [expandedProductId, setExpandedProductId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    stock: '',
    condition: ''
  })
  const [availableConditions, setAvailableConditions] = useState([
    { condition: '', price: '', stock: '' }
  ])

  useEffect(() => {
    loadProducts()
    loadCategories()
  }, [page, searchTerm, selectedCategory])

  const loadProducts = async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      })
      if (searchTerm) params.append('search', searchTerm)
      if (selectedCategory) params.append('category', selectedCategory)

      const response = await fetch(`${API_URL}/products?${params}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        setError(errorData.error || 'Kunde inte ladda produkter')
        setProducts([])
        return
      }
      
      const data = await response.json()
      setProducts(data.products || [])
      if (data.pagination) {
        setTotalPages(data.pagination.pages || 1)
        setTotalProducts(data.pagination.total || 0)
      } else {
        setTotalPages(1)
        setTotalProducts(data.products?.length || 0)
      }
    } catch (err) {
      setError('Kunde inte ansluta till servern. Kontrollera att backend-servern körs.')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/products/categories`)
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      } else {
        // Fallback to default categories if API fails
        setCategories([
          'Serier',
          'Serietidningar',
          'Seriealbum',
          'Magic: The Gathering',
          'PVC Figurer',
          'Brädspel',
          'Böcker',
          'Kortspel',
          'Annat'
        ])
      }
    } catch (err) {
      // Error loading categories
      // Fallback to default categories on error
      setCategories([
        'Serier',
        'Serietidningar',
        'Seriealbum',
        'Magic: The Gathering',
        'PVC Figurer',
        'Brädspel',
        'Böcker',
        'Kortspel',
        'Annat'
      ])
    }
  }

  const handleOpenModal = (product = null) => {
    if (product) {
      // For editing, use inline expansion instead of modal
      if (expandedProductId === product._id) {
        setExpandedProductId(null)
        setEditingProduct(null)
        return
      }
      setExpandedProductId(product._id)
      setEditingProduct(product._id)
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        category: product.category || '',
        image: product.image || '',
        stock: product.stock?.toString() || '',
        condition: ''
      })
      // Load existing conditions
      if (product.availableConditions && product.availableConditions.length > 0) {
        const conditions = product.availableConditions.map(c => ({
          condition: c.condition || '',
          price: c.price?.toString() || '',
          stock: c.stock?.toString() || ''
        }))
        setAvailableConditions(conditions)
      } else {
        // Reset to default with one empty condition
        setAvailableConditions([
          { condition: '', price: '', stock: '' }
        ])
      }
    } else {
      // For adding new product, still use modal
      setEditingProduct(null)
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        image: '',
        stock: '',
        condition: ''
      })
      // Reset conditions - start with one empty condition
      setAvailableConditions([
        { condition: '', price: '', stock: '' }
      ])
      setIsModalOpen(true)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingProduct(null)
    setExpandedProductId(null)
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image: '',
      stock: '',
      condition: ''
    })
    setAvailableConditions([
      { condition: '', price: '', stock: '' }
    ])
  }

  const handleCloseInline = () => {
    setExpandedProductId(null)
    setEditingProduct(null)
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image: '',
      stock: '',
      condition: ''
    })
    setAvailableConditions([
      { condition: '', price: '', stock: '' }
    ])
  }

  const handleUpdateCondition = (index, field, value) => {
    const updated = [...availableConditions]
    updated[index] = { ...updated[index], [field]: value }
    setAvailableConditions(updated)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Process available conditions - include all with condition name and at least price or stock
      // Allow stock = 0 as long as there's a condition name and price
      const processedConditions = availableConditions
        .filter(c => {
          const hasConditionName = c.condition && c.condition.trim() !== ''
          const hasPrice = c.price && parseFloat(c.price) > 0
          const hasStock = c.stock && parseInt(c.stock) > 0
          // Include if it has a name and either price or stock (or both)
          return hasConditionName && (hasPrice || hasStock)
        })
        .map(c => ({
          condition: c.condition.trim(),
          price: parseFloat(c.price) || 0,
          stock: parseInt(c.stock) || 0  // Allow 0, don't default to 0 if empty
        }))

      // Validate that at least one condition exists
      if (processedConditions.length === 0) {
        setError('Du måste lägga till minst en kvalitet med pris eller lager')
        setLoading(false)
        return
      }

      // Calculate total stock from conditions
      const totalStock = processedConditions.reduce((sum, c) => sum + c.stock, 0)
      
      // Get lowest price from conditions
      const prices = processedConditions.map(c => c.price).filter(p => p > 0)
      const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0

      const productData = {
        name: formData.name.trim(),
        description: formData.description || '',
        category: formData.category.trim(),
        image: formData.image || '',
        price: lowestPrice,
        stock: totalStock,
        availableConditions: processedConditions
      }

      const url = editingProduct 
        ? `${API_URL}/products/${editingProduct}`
        : `${API_URL}/products`
      
      const method = editingProduct ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      })

      if (response.ok) {
        if (expandedProductId) {
          handleCloseInline()
        } else {
          handleCloseModal()
        }
        loadProducts()
        loadCategories()
      } else {
        const data = await response.json()
        setError(data.error || 'Kunde inte spara produkt')
      }
    } catch (err) {
      setError('Kunde inte ansluta till servern')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Är du säker på att du vill ta bort denna produkt?')) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadProducts()
      } else {
        alert('Kunde inte ta bort produkt')
      }
    } catch (err) {
      alert('Kunde inte ansluta till servern')
    }
  }

  const handleImportProducts = async () => {
    if (!window.confirm('Detta kommer att radera alla befintliga produkter och importera från products.json. Fortsätt?')) {
      return
    }

    setImporting(true)
    setError('')
    try {
      const response = await fetch(`${API_URL}/products/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (response.ok) {
        alert(`✅ ${data.message}\nTotalt: ${data.total} produkter\nUnika: ${data.unique} produkter`)
        loadProducts()
        loadCategories()
      } else {
        setError(data.error || 'Kunde inte importera produkter')
        alert(data.error || 'Kunde inte importera produkter')
      }
    } catch (err) {
      setError('Kunde inte ansluta till servern')
      alert('Kunde inte ansluta till servern. Kontrollera att backend-servern körs.')
    } finally {
      setImporting(false)
    }
  }

  return (
    <AdminLayout>
      <section className="admin-page-section">
        <div className="admin-page-header">
          <div className="admin-header-content">
            <div>
              <h1 className="admin-page-title">Produkter</h1>
              <p className="admin-page-subtitle">
                Hantera alla produkter
                {totalProducts > 0 && (
                  <span style={{ marginLeft: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', fontWeight: 400 }}>
                    ({totalProducts} {totalProducts === 1 ? 'produkt' : 'produkter'})
                  </span>
                )}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <button 
                className="admin-add-button"
                onClick={handleImportProducts}
                disabled={importing}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                {importing ? 'Importerar...' : 'Importera produkter'}
              </button>
              <button 
                className="admin-add-button"
                onClick={() => handleOpenModal()}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Lägg till produkt
              </button>
            </div>
          </div>
        </div>

        <div className="admin-page-content">
          {/* Search and Filter */}
          <div className="admin-filters">
            <div className="admin-search-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input
                type="text"
                placeholder="Sök produkter..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(1)
                }}
              />
            </div>
            <select
              className="admin-filter-select"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                setPage(1)
              }}
            >
              <option value="">Alla kategorier</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="admin-error-message">{error}</div>
          )}

          {loading && products.length === 0 ? (
            <div className="admin-loading">Laddar produkter...</div>
          ) : products.length === 0 ? (
            <div className="admin-empty">
              <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📦</div>
              <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 600 }}>Inga produkter hittades</p>
              <p style={{ fontSize: '0.95rem', opacity: 0.7 }}>Skapa din första produkt för att komma igång</p>
            </div>
          ) : (
            <>
              <div className="products-list-container">
                <table className="products-list-table">
                  <thead>
                    <tr>
                      <th className="col-image">Bild</th>
                      <th className="col-name">Namn</th>
                      <th className="col-category">Kategori</th>
                      <th className="col-price">Pris</th>
                      <th className="col-stock">Lager</th>
                      <th className="col-conditions">Kvaliteter</th>
                      <th className="col-actions">Åtgärder</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => {
                      // Calculate total stock - convert to number and sum all conditions
                      // Make sure we handle all cases: string, number, null, undefined
                      let totalStock = 0
                      if (product.availableConditions && product.availableConditions.length > 0) {
                        totalStock = product.availableConditions.reduce((sum, c) => {
                          let stockValue = 0
                          if (c.stock !== null && c.stock !== undefined && c.stock !== '') {
                            if (typeof c.stock === 'string') {
                              stockValue = parseInt(c.stock, 10)
                              if (isNaN(stockValue)) stockValue = 0
                            } else if (typeof c.stock === 'number') {
                              stockValue = c.stock
                            }
                          }
                          return sum + stockValue
                        }, 0)
                      } else if (product.stock !== null && product.stock !== undefined && product.stock !== '') {
                        if (typeof product.stock === 'string') {
                          totalStock = parseInt(product.stock, 10) || 0
                        } else {
                          totalStock = product.stock || 0
                        }
                      }
                      const conditionsCount = product.availableConditions?.length || 0
                      const lowestPrice = product.availableConditions?.length > 0 
                        ? Math.min(...product.availableConditions.map(c => c.price || 0).filter(p => p > 0))
                        : product.price || 0
                      
                      const isExpanded = expandedProductId === product._id
                      
                      return (
                        <>
                          <tr key={product._id} className={`product-row ${isExpanded ? 'expanded' : ''}`}>
                          <td className="col-image">
                            {product.image ? (
                              <img 
                                src={product.image} 
                                alt={product.name}
                                className="product-list-image"
                                onError={(e) => {
                                  e.target.style.display = 'none'
                                  e.target.nextSibling.style.display = 'flex'
                                }}
                              />
                            ) : null}
                            <div className="product-list-image-placeholder" style={{ display: product.image ? 'none' : 'flex' }}>
                              <span>📦</span>
                            </div>
                          </td>
                          <td className="col-name">
                            <div className="product-list-name">{product.name}</div>
                            {product.description && (
                              <div className="product-list-description" title={product.description}>
                                {product.description.length > 60 
                                  ? product.description.substring(0, 60) + '...' 
                                  : product.description}
                              </div>
                            )}
                          </td>
                          <td className="col-category">
                            <span className="category-badge">{product.category}</span>
                          </td>
                          <td className="col-price">
                            <span className="price-value">{lowestPrice > 0 ? `${lowestPrice} kr` : '-'}</span>
                            {product.availableConditions && product.availableConditions.length > 1 && (
                              <div className="price-range">
                                {Math.max(...product.availableConditions.map(c => c.price || 0))} kr
                              </div>
                            )}
                          </td>
                          <td className="col-stock">
                            <span className="stock-value">{totalStock}</span>
                          </td>
                          <td className="col-conditions">
                            {conditionsCount > 0 ? (
                              <div className="conditions-badge">
                                {conditionsCount} {conditionsCount === 1 ? 'kvalitet' : 'kvaliteter'}
                              </div>
                            ) : (
                              <span className="no-conditions">-</span>
                            )}
                          </td>
                          <td className="col-actions">
                            <div className="product-list-actions">
                              <button
                                className={`edit-btn-small ${isExpanded ? 'active' : ''}`}
                                onClick={() => handleOpenModal(product)}
                                title="Redigera"
                              >
                                {isExpanded ? 'Stäng' : 'Redigera'}
                              </button>
                              <button
                                className="delete-btn-small"
                                onClick={() => handleDelete(product._id)}
                                title="Ta bort"
                              >
                                Ta bort
                              </button>
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="product-edit-row">
                            <td colSpan="7" className="product-edit-cell">
                              <div className="product-edit-form">
                                <h3 className="product-edit-title">Redigera produkt</h3>
                                <form className="admin-form" onSubmit={handleSubmit}>
                                  <div className="form-group">
                                    <label>Namn *</label>
                                    <input
                                      type="text"
                                      value={formData.name}
                                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                                      required
                                    />
                                  </div>

                                  <div className="form-group">
                                    <label>Beskrivning</label>
                                    <textarea
                                      value={formData.description}
                                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                                      rows="3"
                                    />
                                  </div>

                                  <div className="form-row-inline">
                                    <div className="form-group">
                                      <label>Kategori *</label>
                                      <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                                        required
                                        className="form-select"
                                      >
                                        <option value="">Välj kategori</option>
                                        {categories.map(cat => (
                                          <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                      </select>
                                    </div>

                                    <div className="form-group">
                                      <label>Bild-URL</label>
                                      <input
                                        type="url"
                                        value={formData.image}
                                        onChange={(e) => setFormData({...formData, image: e.target.value})}
                                        placeholder="https://example.com/image.jpg"
                                      />
                                    </div>
                                  </div>

                                  <div className="form-group">
                                    <label>Kvalitet/Skick * (Lägg till olika kvaliteter med olika priser och lager)</label>
                                    <div className="conditions-list">
                                      <div className="condition-header-row">
                                        <div className="condition-name">
                                          <label className="condition-label">Kvalitet</label>
                                        </div>
                                        <div className="condition-price">
                                          <label className="condition-label">Pris (kr)</label>
                                        </div>
                                        <div className="condition-stock">
                                          <label className="condition-label">Lager</label>
                                        </div>
                                        <div className="condition-actions-header"></div>
                                      </div>
                                      {availableConditions.map((condition, index) => (
                                        <div key={index} className="condition-row">
                                          <div className="condition-name">
                                            <input
                                              type="text"
                                              value={condition.condition}
                                              onChange={(e) => handleUpdateCondition(index, 'condition', e.target.value)}
                                              placeholder="Kvalitet (t.ex. Mint, Very Good)"
                                              className="condition-input"
                                            />
                                          </div>
                                          <div className="condition-price">
                                            <input
                                              type="number"
                                              step="0.01"
                                              value={condition.price}
                                              onChange={(e) => handleUpdateCondition(index, 'price', e.target.value)}
                                              placeholder="Pris"
                                              className="condition-input"
                                            />
                                          </div>
                                          <div className="condition-stock">
                                            <input
                                              type="number"
                                              value={condition.stock}
                                              onChange={(e) => handleUpdateCondition(index, 'stock', e.target.value)}
                                              placeholder="Lager"
                                              className="condition-input"
                                            />
                                          </div>
                                          <button
                                            type="button"
                                            className="remove-condition-btn"
                                            onClick={() => {
                                              const updated = availableConditions.filter((_, i) => i !== index)
                                              setAvailableConditions(updated.length > 0 ? updated : [{ condition: '', price: '', stock: '' }])
                                            }}
                                          >
                                            ×
                                          </button>
                                        </div>
                                      ))}
                                      <button
                                        type="button"
                                        className="add-condition-btn"
                                        onClick={() => {
                                          setAvailableConditions([...availableConditions, { condition: '', price: '', stock: '' }])
                                        }}
                                      >
                                        + Lägg till kvalitet
                                      </button>
                                    </div>
                                  </div>

                                  {error && (
                                    <div className="form-message error">{error}</div>
                                  )}

                                  <div className="form-actions">
                                    <button type="button" className="cancel-btn" onClick={handleCloseInline}>
                                      Avbryt
                                    </button>
                                    <button type="submit" className="submit-btn" disabled={loading}>
                                      {loading ? 'Sparar...' : 'Uppdatera'}
                                    </button>
                                  </div>
                                </form>
                              </div>
                            </td>
                          </tr>
                        )}
                        </>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="admin-pagination">
                  <button
                    className="pagination-btn"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Föregående
                  </button>
                  <button
                    className="pagination-btn"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Nästa
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Product Modal */}
        {isModalOpen && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
              <h2 className="modal-title">
                {editingProduct ? 'Redigera produkt' : 'Ny produkt'}
              </h2>
              
              <form className="admin-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Namn *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Beskrivning</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label>Kategori *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                    className="form-select"
                  >
                    <option value="">Välj kategori</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Bild-URL</label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="form-group">
                  <label>Kvalitet/Skick * (Lägg till olika kvaliteter med olika priser och lager)</label>
                  <div className="conditions-list">
                    <div className="condition-header-row">
                      <div className="condition-name">
                        <label className="condition-label">Kvalitet</label>
                      </div>
                      <div className="condition-price">
                        <label className="condition-label">Pris (kr)</label>
                      </div>
                      <div className="condition-stock">
                        <label className="condition-label">Lager</label>
                      </div>
                      <div className="condition-actions-header"></div>
                    </div>
                    {availableConditions.map((condition, index) => (
                      <div key={index} className="condition-row">
                        <div className="condition-name">
                          <input
                            type="text"
                            value={condition.condition}
                            onChange={(e) => handleUpdateCondition(index, 'condition', e.target.value)}
                            placeholder="Kvalitet (t.ex. Mint, Very Good)"
                            className="condition-input"
                          />
                        </div>
                        <div className="condition-price">
                          <input
                            type="number"
                            step="0.01"
                            value={condition.price}
                            onChange={(e) => handleUpdateCondition(index, 'price', e.target.value)}
                            placeholder="Pris"
                            className="condition-input"
                          />
                        </div>
                        <div className="condition-stock">
                          <input
                            type="number"
                            value={condition.stock}
                            onChange={(e) => handleUpdateCondition(index, 'stock', e.target.value)}
                            placeholder="Lager"
                            className="condition-input"
                          />
                        </div>
                        <button
                          type="button"
                          className="remove-condition-btn"
                          onClick={() => {
                            const updated = availableConditions.filter((_, i) => i !== index)
                            // Always keep at least one condition row
                            setAvailableConditions(updated.length > 0 ? updated : [{ condition: '', price: '', stock: '' }])
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="add-condition-btn"
                      onClick={() => {
                        setAvailableConditions([...availableConditions, { condition: '', price: '', stock: '' }])
                      }}
                    >
                      + Lägg till kvalitet
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="form-message error">{error}</div>
                )}

                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={handleCloseModal}>
                    Avbryt
                  </button>
                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Sparar...' : editingProduct ? 'Uppdatera' : 'Skapa'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>
    </AdminLayout>
  )
}

export default AdminProducts
