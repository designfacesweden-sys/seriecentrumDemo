import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => 
        item.name === product.name && item.condition === product.condition
      )
      if (existing) {
        return prev.map(item =>
          item.name === product.name && item.condition === product.condition
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (productName, condition) => {
    setCart(prev => prev.filter(item => 
      !(item.name === productName && item.condition === condition)
    ))
  }

  const updateQuantity = (productName, condition, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productName, condition)
      return
    }
    setCart(prev => prev.map(item =>
      item.name === productName && item.condition === condition
        ? { ...item, quantity }
        : item
    ))
  }

  const clearCart = () => {
    setCart([])
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      const price = parseInt(item.price.replace(/[^\d]/g, '')) || 0
      return total + (price * item.quantity)
    }, 0)
  }

  const getCartCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getCartCount
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
