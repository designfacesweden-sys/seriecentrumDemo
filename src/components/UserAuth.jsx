import { useState, createContext, useContext, useEffect } from 'react'

const API_URL = '/api'

const UserContext = createContext()

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })
  const [isVerifying, setIsVerifying] = useState(!!user)

  // Verify user account exists in database on mount and when user changes
  useEffect(() => {
    const verifyUser = async () => {
      if (!user || !user._id) {
        setIsVerifying(false)
        return
      }

      try {
        const response = await fetch(`${API_URL}/users/verify/${user._id}`)
        const data = await response.json()

        if (response.ok && data.exists) {
          // Account exists, update user data if needed
          if (data.user) {
            setUser(data.user)
            sessionStorage.setItem('user', JSON.stringify(data.user))
          }
        } else {
          // Account doesn't exist in database, log out
          // User account not found, logging out
          setUser(null)
          sessionStorage.removeItem('user')
        }
      } catch (error) {
        // Error verifying user account
        // On error, keep user logged in (might be network issue)
      } finally {
        setIsVerifying(false)
      }
    }

    verifyUser()
  }, [user?._id]) // Only verify when user ID changes

  const login = (userData) => {
    setUser(userData)
    sessionStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    sessionStorage.removeItem('user')
  }

  return (
    <UserContext.Provider value={{ user, login, logout, isVerifying }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within UserProvider')
  }
  return context
}
