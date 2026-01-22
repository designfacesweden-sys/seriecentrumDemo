// Utility functions for localStorage management

const STORAGE_KEY = 'tournament_registrations'

export const getRegistrations = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    // Error reading registrations
    return []
  }
}

export const saveRegistration = (registration) => {
  try {
    const registrations = getRegistrations()
    
    // Check if email already exists
    const existing = registrations.find(
      reg => reg.email.toLowerCase() === registration.email.toLowerCase()
    )
    
    if (existing) {
      throw new Error('Denna e-postadress är redan registrerad')
    }
    
    const newRegistration = {
      id: Date.now().toString(),
      ...registration,
      registeredAt: new Date().toISOString()
    }
    
    registrations.push(newRegistration)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations))
    return newRegistration
  } catch (error) {
    throw error
  }
}

export const deleteRegistration = (id) => {
  try {
    const registrations = getRegistrations()
    const filtered = registrations.filter(reg => reg.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    return true
  } catch (error) {
    // Error deleting registration
    return false
  }
}
