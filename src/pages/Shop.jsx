import { useState, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

const Shop = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name-asc')
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false)
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const [availableCategories, setAvailableCategories] = useState([])
  const currentPage = parseInt(searchParams.get('page')) || 1

  useEffect(() => {
    const loadProducts = async () => {
      try {
        // Try to load from API first
        const response = await fetch('/api/products?limit=10000')
        if (response.ok) {
          const data = await response.json()
          // Map database products to shop format
          const mappedProducts = data.products.map(product => ({
            _id: product._id,
            name: product.name,
            price: `${product.price}Kr`,
            category: product.category || 'Serier',
            image: product.image || '',
            stock: product.stock || 0,
            availableConditions: product.availableConditions || [],
            condition: product.availableConditions && product.availableConditions.length > 0 
              ? product.availableConditions[0].condition 
              : null,
            availability: product.stock || 0,
            rating: product.rating || null,
            reviews_count: product.reviewsCount || 0,
            description: product.description || ''
          }))
          setProducts(mappedProducts)
          
          // Load categories from API
          try {
            const categoriesResponse = await fetch('/api/products/categories')
            if (categoriesResponse.ok) {
              const categoriesData = await categoriesResponse.json()
              const categoryOptions = [
                { value: 'all', label: 'Alla kategorier' },
                ...categoriesData.map(cat => ({
                  value: cat.toLowerCase().replace(/\s+/g, '-'),
                  label: cat
                }))
              ]
              setAvailableCategories(categoryOptions)
            }
          } catch (err) {
            // Could not load categories from API
          }
          
          setLoading(false)
          return
        }
      } catch (error) {
        // API not available, falling back to products.json
      }
      
      // Fallback to products.json if API fails
      try {
        const response = await fetch('/products.json')
        const data = await response.json()
        // Deduplicate products by name - keep only unique product names
        const uniqueProducts = []
        const seenNames = new Set()
        
        for (const product of data) {
          const name = (product.name || '').trim()
          if (name && !seenNames.has(name)) {
            seenNames.add(name)
            uniqueProducts.push(product)
          } else if (name && seenNames.has(name)) {
            // Product with same name exists - merge conditions
            const existingIndex = uniqueProducts.findIndex(p => (p.name || '').trim() === name)
            if (existingIndex !== -1) {
              const existing = uniqueProducts[existingIndex]
              
              // Initialize available_conditions if not exists
              if (!existing.available_conditions) {
                existing.available_conditions = []
                if (existing.condition) {
                  existing.available_conditions.push({
                    condition: existing.condition,
                    price: existing.price || '0',
                    availability: existing.availability || '0',
                    url: existing.url || ''
                  })
                }
              }
              
              // Add new condition if it doesn't exist
              if (product.condition) {
                const conditionExists = existing.available_conditions.some(
                  c => c.condition === product.condition
                )
                if (!conditionExists) {
                  existing.available_conditions.push({
                    condition: product.condition,
                    price: product.price || '0',
                    availability: product.availability || '0',
                    url: product.url || ''
                  })
                }
              }
            }
          }
        }
        
        setProducts(uniqueProducts)
        setLoading(false)
      } catch (error) {
        // Error loading products
        setLoading(false)
      }
    }
    
    loadProducts()
  }, [])

  const getProductsPerPage = () => {
    return window.innerWidth <= 768 ? 32 : 48
  }

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = !searchTerm || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      // Match category - handle both exact match and normalized match
      let matchesCategory = true
      if (categoryFilter !== 'all') {
        const productCategory = (product.category || '').toLowerCase().replace(/\s+/g, '-')
        const filterCategory = categoryFilter.toLowerCase()
        matchesCategory = productCategory === filterCategory || 
                         productCategory.includes(filterCategory) ||
                         filterCategory.includes(productCategory)
      }
      return matchesSearch && matchesCategory
    })

    // Sort products
    filtered.sort((a, b) => {
      const nameA = (a.name || '').trim()
      const nameB = (b.name || '').trim()
      // Handle both "10Kr" format and numeric price
      let priceA = 0
      let priceB = 0
      if (typeof a.price === 'number') {
        priceA = a.price
      } else {
        priceA = parseInt((a.price || '0').toString().replace(/[^\d]/g, '')) || 0
      }
      if (typeof b.price === 'number') {
        priceB = b.price
      } else {
        priceB = parseInt((b.price || '0').toString().replace(/[^\d]/g, '')) || 0
      }

      switch(sortBy) {
        case 'name-asc':
          return nameA.localeCompare(nameB, 'sv')
        case 'name-desc':
          return nameB.localeCompare(nameA, 'sv')
        case 'price-asc':
          return priceA - priceB
        case 'price-desc':
          return priceB - priceA
        default:
          return 0
      }
    })

    return filtered
  }, [products, searchTerm, categoryFilter, sortBy])

  const productsPerPage = getProductsPerPage()
  const totalPages = Math.ceil(filteredAndSortedProducts.length / productsPerPage)
  const startIndex = (currentPage - 1) * productsPerPage
  const endIndex = startIndex + productsPerPage
  const paginatedProducts = filteredAndSortedProducts.slice(startIndex, endIndex)

  const handlePageChange = (page) => {
    setSearchParams({ page: page.toString() })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Use dynamic categories if available, otherwise fallback to default
  const categories = availableCategories.length > 0 ? availableCategories : [
    { value: 'all', label: 'Alla kategorier' },
    { value: 'serier', label: 'Serier' },
    { value: 'serietidningar', label: 'Serietidningar' },
    { value: 'seriealbum', label: 'Seriealbum' },
    { value: 'magic-the-gathering', label: 'Magic: The Gathering' },
    { value: 'pvc-figurer', label: 'PVC Figurer' },
    { value: 'bradspel', label: 'Brädspel' },
    { value: 'bocker', label: 'Böcker' },
    { value: 'kortspel', label: 'Kortspel' },
    { value: 'annat', label: 'Annat' }
  ]

  const sortOptions = [
    { value: 'name-asc', label: 'Namn A-Z' },
    { value: 'name-desc', label: 'Namn Z-A' },
    { value: 'price-asc', label: 'Pris Lågt-Högt' },
    { value: 'price-desc', label: 'Pris Högt-Lågt' }
  ]

  const selectedCategory = categories.find(c => c.value === categoryFilter)?.label || 'Alla kategorier'
  const selectedSort = sortOptions.find(s => s.value === sortBy)?.label || 'Namn A-Z'

  useEffect(() => {
    const handleResize = () => {
      // Reset to page 1 if products per page changes significantly
      const newProductsPerPage = getProductsPerPage()
      if (Math.abs(newProductsPerPage - productsPerPage) > 10) {
        handlePageChange(1)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [productsPerPage])

  if (loading) {
    return (
      <section className="page-section">
        <div className="page-container">
          <p>Laddar produkter...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="page-section">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Butik</h1>
          <p className="page-description">Utforska vårt stora utbud av produkter</p>
        </div>

        {/* Filters and Search */}
        <div className="shop-controls">
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Sök produkter..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                handlePageChange(1)
              }}
            />
          </div>
          <div className="filter-container">
            <div className="category-dropdown-wrapper">
              <button
                type="button"
                className={`category-btn ${categoryDropdownOpen ? 'active' : ''}`}
                onClick={() => {
                  setCategoryDropdownOpen(!categoryDropdownOpen)
                  setSortDropdownOpen(false)
                }}
              >
                <span className="category-selected-text">{selectedCategory}</span>
                <svg className="category-arrow" width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {categoryDropdownOpen && (
                <div className="category-dropdown-menu active">
                  {categories.map(cat => (
                    <div
                      key={cat.value}
                      className="category-option"
                      onClick={() => {
                        setCategoryFilter(cat.value)
                        setCategoryDropdownOpen(false)
                        handlePageChange(1)
                      }}
                    >
                      {cat.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="sort-container">
            <div className="sort-dropdown-wrapper">
              <button
                type="button"
                className={`sort-btn ${sortDropdownOpen ? 'active' : ''}`}
                onClick={() => {
                  setSortDropdownOpen(!sortDropdownOpen)
                  setCategoryDropdownOpen(false)
                }}
              >
                <span className="sort-selected-text">{selectedSort}</span>
                <svg className="sort-arrow" width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {sortDropdownOpen && (
                <div className="sort-dropdown-menu active">
                  {sortOptions.map(option => (
                    <div
                      key={option.value}
                      className="sort-option"
                      onClick={() => {
                        setSortBy(option.value)
                        setSortDropdownOpen(false)
                      }}
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="products-grid">
          {paginatedProducts.map((product, index) => {
            const params = new URLSearchParams({
              name: product.name || '',
              price: (product.price || '0').replace(/[^\d]/g, '') || '0',
              category: product.category || 'all'
            })
            if (product.condition) params.set('condition', product.condition)
            if (product.url) params.set('original_url', product.url)
            if (product.available_conditions) {
              params.set('available_conditions', JSON.stringify(product.available_conditions))
            }

            return (
              <div
                key={index}
                className="product-card"
                data-category={product.category || 'all'}
              >
                <Link
                  to={`/produkt?${params.toString()}`}
                  className="product-image-wrapper"
                  style={{ textDecoration: 'none', display: 'block' }}
                >
                  {product.images && product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name || 'Produkt'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="product-image-placeholder">📦</div>
                  )}
                </Link>
                <div className="product-card-content">
                  <h3 style={{ cursor: 'default', textDecoration: 'none' }}>{product.name || 'Produkt utan namn'}</h3>
                  <div className="rating-stars">★★★★★</div>
                  <span className="review-count">(24)</span>
                  <span className="current-price">{product.price || '0'}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination-container">
            <div className="pagination-info">{productsPerPage}Kr</div>
            <div className="pagination">
              {currentPage > 1 ? (
                <button
                  className="pagination-link"
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  ‹ Föregående
                </button>
              ) : (
                <span className="pagination-link disabled">‹ Föregående</span>
              )}

              {(() => {
                const maxVisiblePages = 10
                let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
                let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
                
                if (endPage - startPage < maxVisiblePages - 1) {
                  startPage = Math.max(1, endPage - maxVisiblePages + 1)
                }

                const pages = []
                
                if (startPage > 1) {
                  pages.push(
                    <button
                      key={1}
                      className="pagination-link"
                      onClick={() => handlePageChange(1)}
                    >
                      1
                    </button>
                  )
                  if (startPage > 2) {
                    pages.push(<span key="ellipsis1" className="pagination-ellipsis">...</span>)
                  }
                }

                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      className={`pagination-link ${i === currentPage ? 'active' : ''}`}
                      onClick={() => handlePageChange(i)}
                    >
                      {i}
                    </button>
                  )
                }

                if (endPage < totalPages) {
                  if (endPage < totalPages - 1) {
                    pages.push(<span key="ellipsis2" className="pagination-ellipsis">...</span>)
                  }
                  pages.push(
                    <button
                      key={totalPages}
                      className="pagination-link"
                      onClick={() => handlePageChange(totalPages)}
                    >
                      {totalPages}
                    </button>
                  )
                }

                return pages
              })()}

              {currentPage < totalPages ? (
                <button
                  className="pagination-link"
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Nästa ›
                </button>
              ) : (
                <span className="pagination-link disabled">Nästa ›</span>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default Shop
