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
 * @returns {string} Decrypted email
 */
export const decryptEmail = (encryptedEmail) => {
  if (!encryptedEmail) return encryptedEmail
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedEmail, ENCRYPTION_KEY)
    const decrypted = bytes.toString(CryptoJS.enc.Utf8)
    return decrypted || encryptedEmail // Return original if decryption fails
  } catch (error) {
    console.error('Error decrypting email:', error)
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
  // Encrypted strings typically have a specific format from crypto-js
  return str.includes('/') && str.length > 20
}
