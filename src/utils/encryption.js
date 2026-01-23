import CryptoJS from 'crypto-js'

// Encryption key - In production, this should be stored in environment variables
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
