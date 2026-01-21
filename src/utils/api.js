const API_URL = '/api'

/**
 * Helper function to fetch from API with proper error handling
 */
export const apiFetch = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })

    // Check if response is JSON
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server returned non-JSON response. Is the backend server running on port 3000?')
    }

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    return data
  } catch (error) {
    if (error.message.includes('non-JSON')) {
      throw error
    }
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Kunde inte ansluta till servern. Kontrollera att backend-servern körs med "npm run server"')
    }
    throw error
  }
}

export default API_URL
