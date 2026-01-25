import crypto from 'crypto'
import CryptoJS from 'crypto-js'

// Encryption key - Loaded from environment variable (.env file)
// The key is an MD5 hash value used as the AES encryption key
// Set ENCRYPTION_KEY in your .env file (e.g., ENCRYPTION_KEY=350a04be296d966ed37a00199d107b59)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'seriecentrum-secret-key-2024-change-in-production'

/**
 * Encrypt email using AES encryption
 * @param {string} email - Email to encrypt
 * @returns {string} Encrypted email
 */
export const encryptEmail = (email) => {
  if (!email) return email
  try {
    const encrypted = CryptoJS.AES.encrypt(email, ENCRYPTION_KEY).toString()
    return encrypted
  } catch (error) {
    console.error('Error encrypting email:', error)
    return email
  }
}

/**
 * Decrypt email using AES decryption
 * @param {string} encryptedEmail - Encrypted email to decrypt
 * @returns {string} Decrypted email, or original if decryption fails
 */
export const decryptEmail = (encryptedEmail) => {
  if (!encryptedEmail) return encryptedEmail
  
  // If it doesn't look encrypted, return as-is
  if (!isEncrypted(encryptedEmail)) {
    return encryptedEmail
  }
  
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedEmail, ENCRYPTION_KEY)
    const decrypted = bytes.toString(CryptoJS.enc.Utf8)
    
    // If decryption resulted in empty string or same value, it likely failed
    if (!decrypted || decrypted.trim() === '') {
      return encryptedEmail
    }
    
    // Verify it looks like an email (contains @)
    if (decrypted.includes('@')) {
      return decrypted
    }
    
    // If it doesn't look like an email, decryption probably failed
    return encryptedEmail
  } catch (error) {
    // If decryption throws an error, return original
    return encryptedEmail
  }
}

/**
 * Check if a string is encrypted (heuristic check)
 * @param {string} str - String to check
 * @returns {boolean} True if string appears to be encrypted
 */
export const isEncrypted = (str) => {
  if (!str) return false
  // CryptoJS encrypted strings typically:
  // 1. Start with "U2FsdGVkX1" (base64 encoded "Salted__")
  // 2. Are longer than typical email addresses
  // 3. Don't contain @ symbol (emails always have @)
  // 4. Contain base64 characters and slashes
  if (str.startsWith('U2FsdGVkX1')) {
    return true
  }
  // Fallback: check if it looks like encrypted data (long, no @, contains /)
  return str.length > 30 && !str.includes('@') && (str.includes('/') || str.includes('+') || str.includes('='))
}
