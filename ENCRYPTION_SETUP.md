# Encryption and Password Hashing Setup

## Overview
This system implements encryption for email addresses and password hashing for user accounts.

## Dependencies
- `bcryptjs`: For password hashing (pure JavaScript, no native compilation needed)
- `crypto-js`: For AES encryption/decryption of email addresses

## Installation
Run the following command to install the required packages:
```bash
npm install bcryptjs crypto-js
```

## Implementation Details

### Password Hashing
- Passwords are hashed using `bcryptjs` with 10 salt rounds
- Passwords are never stored in plain text
- Password comparison is done using `bcrypt.compare()`

### Email Encryption
- Email addresses are encrypted using AES encryption (crypto-js)
- Encryption key is stored in environment variable `ENCRYPTION_KEY`
- Default key: `'seriecentrum-secret-key-2024-change-in-production'`
- **IMPORTANT**: Change the encryption key in production!

### Files Modified
1. **server.js**: Updated registration and login endpoints
2. **encryption.js**: New utility file for encryption/decryption functions
3. **package.json**: Added bcryptjs and crypto-js dependencies

### Endpoints Updated
- `POST /api/users/register`: Encrypts email and hashes password
- `POST /api/users/login`: Decrypts email for comparison, verifies hashed password
- `GET /api/users/verify/:id`: Decrypts email before returning
- `GET /api/users/:id`: Decrypts email before returning
- `GET /api/users`: Decrypts all emails before returning
- `POST /api/accounts`: Encrypts email when creating account
- `POST /api/tournaments/:id/register`: Handles encrypted emails in participants

### Environment Variables
Add to your `.env` file:
```
ENCRYPTION_KEY=your-secure-encryption-key-here
```

### Migration Notes
- Existing accounts with plain text emails will still work (backward compatible)
- New registrations will have encrypted emails and hashed passwords
- When logging in, the system checks if email is encrypted and handles both cases

### Security Considerations
1. **Change the encryption key** in production
2. Store `ENCRYPTION_KEY` securely (environment variable, not in code)
3. Use HTTPS in production to protect data in transit
4. Consider implementing rate limiting for login attempts
5. Consider adding email verification for new accounts
