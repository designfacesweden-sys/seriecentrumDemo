import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { encryptEmail, decryptEmail, isEncrypted } from './encryption.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
let db;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/seriecentrum';

async function connectDB() {
  try {
    // Check if MONGODB_URI is set
    if (!MONGODB_URI || MONGODB_URI.includes('<cluster-url>') || MONGODB_URI.trim() === '') {
      console.log('❌ MONGODB_URI is not set or is invalid');
      console.log('💡 Create a .env file with: MONGODB_URI=your_connection_string');
      return null;
    }

    console.log('🔄 Attempting to connect to MongoDB...');
    console.log(`   URI: ${MONGODB_URI.replace(/:[^:@]+@/, ':****@')}`); // Hide password in logs

    const client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 20000, // Increased for Atlas
      connectTimeoutMS: 20000, // Increased for Atlas
      socketTimeoutMS: 30000, // Keep connections alive longer
      maxPoolSize: 10,
      retryWrites: true,
      retryReads: true
    });
    
    // Use Promise.race with longer timeout for Atlas connections
    const connectionStartTime = Date.now();
    await Promise.race([
      client.connect().then(() => {
        return true;
      }),
      new Promise((_, reject) => 
        setTimeout(() => {
          const elapsed = Date.now() - connectionStartTime;
          reject(new Error(`Connection timeout after ${elapsed}ms. Check: 1) IP whitelist in MongoDB Atlas, 2) Network connectivity, 3) Firewall settings`))
        }, 20000) // Increased to 20 seconds for Atlas
      )
    ]);
    
    db = client.db();
    
    // Test the connection
    await db.admin().ping();
    console.log('✅ MongoDB connection successful!');
    
    // Create indexes asynchronously in background (non-blocking)
    setImmediate(async () => {
      try {
        await db.collection('products').createIndex({ name: 'text', description: 'text' });
        await db.collection('products').createIndex({ category: 1 });
        await db.collection('products').createIndex({ createdAt: -1 });
        await db.collection('accounts').createIndex({ email: 1 }, { unique: true });
        await db.collection('accounts').createIndex({ createdAt: -1 });
        await db.collection('receipts').createIndex({ accountId: 1 });
        await db.collection('receipts').createIndex({ createdAt: -1 });
        await db.collection('receipts').createIndex({ orderNumber: 1 }, { unique: true, sparse: true });
        await db.collection('receipts').createIndex({ status: 1 });
        await db.collection('tournaments').createIndex({ status: 1 });
        await db.collection('tournaments').createIndex({ startDate: 1 });
        await db.collection('tournaments').createIndex({ createdAt: -1 });
        await db.collection('tournaments').createIndex({ 'participants.userId': 1 });
        await db.collection('tournaments').createIndex({ 'participants.email': 1 });
        console.log('✅ Database indexes created');
      } catch (indexError) {
        // Indexes might already exist, that's okay
        console.log('ℹ️  Index creation note:', indexError.message);
      }
    });
    
    return client;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    if (error.message.includes('authentication failed')) {
      console.log('💡 Check your MongoDB username and password in .env');
    } else if (error.message.includes('timeout')) {
      console.log('💡 MongoDB connection timeout. Check:');
      console.log('   1. IP whitelist in MongoDB Atlas (Network Access)');
      console.log('   2. Your internet connection');
      console.log('   3. MongoDB Atlas cluster is running');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.log('💡 Cannot resolve MongoDB hostname. Check your MONGODB_URI in .env');
    }
    return null;
  }
}

// Initialize database connection (completely non-blocking)
let mongoClient;
let dbConnectionStatus = 'connecting'; // 'connecting', 'connected', 'failed'
// Use setImmediate to ensure this doesn't block server startup
setImmediate(() => {
  connectDB().then(client => {
    mongoClient = client;
    if (client && db) {
      dbConnectionStatus = 'connected';
      console.log('✅ MongoDB connected successfully');
    } else {
      dbConnectionStatus = 'failed';
      console.log('⚠️  MongoDB connection returned but db is not set');
    }
  }).catch(err => {
    dbConnectionStatus = 'failed';
    console.log('❌ MongoDB connection failed:', err.message);
    console.log('💡 Tips för MongoDB Atlas:');
    console.log('   1. Gå till MongoDB Atlas Dashboard → Network Access');
    console.log('   2. Lägg till din IP-adress (eller 0.0.0.0/0 för alla IPs - mindre säkert)');
    console.log('   3. Kontrollera att användarnamn/lösenord är korrekt');
    console.log('   4. Kontrollera att databasnamnet i connection string är korrekt');
    console.log('💡 Om du använder lokal MongoDB, kontrollera att MongoDB körs: mongosh');
  });
});

// ==================== ACCOUNTS (Users) ====================

// Account registration
app.post('/api/users/register', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'Alla fält är obligatoriska' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Lösenordet måste vara minst 6 tecken' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Ogiltig e-postadress' });
    }

    // Normalize email for checking
    const normalizedEmail = email.toLowerCase().trim()
    
    // Check if account exists - handle both encrypted (old) and plain text (new) emails
    const allAccounts = await db.collection('accounts').find({}).toArray()
    const allUsers = await db.collection('users').find({}).toArray()
    
    // Check emails (decrypt old encrypted emails for comparison)
    const emailExists = [...allAccounts, ...allUsers].some(acc => {
      if (!acc.email) return false
      let accEmail = acc.email
      // Try to decrypt if it looks encrypted (for backward compatibility)
      if (isEncrypted(acc.email)) {
        try {
          const decrypted = decryptEmail(acc.email)
          if (decrypted && decrypted !== acc.email && decrypted.includes('@')) {
            accEmail = decrypted
          }
        } catch (e) {
          // Keep original if decryption fails
        }
      }
      return accEmail.toLowerCase().trim() === normalizedEmail
    })
    
    if (emailExists) {
      return res.status(400).json({ error: 'E-postadressen är redan registrerad' });
    }

    // Hash password using bcrypt
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    const account = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail, // Store email in plain text (no encryption)
      password: hashedPassword, // Hashed password
      tournamentHistory: [], // Array of tournament IDs
      orderHistory: [], // Array of receipt IDs
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('accounts').insertOne(account);
    
    // Also keep 'users' collection for backward compatibility
    await db.collection('users').insertOne(account);
    
    // Don't send password back
    const { password: _, ...accountWithoutPassword } = account;
    res.status(201).json({ user: accountWithoutPassword, message: 'Konto skapat!' });
  } catch (error) {
    res.status(500).json({ error: 'Kunde inte skapa konto' });
  }
});

// Account login
app.post('/api/users/login', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'E-post och lösenord krävs' });
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Find account by email - handle both encrypted (old) and plain text (new) emails
    const allAccounts = await db.collection('accounts').find({}).toArray()
    const allUsers = await db.collection('users').find({}).toArray()
    
    let account = null
    for (const acc of [...allAccounts, ...allUsers]) {
      if (!acc.email) continue
      
      try {
        let accEmail = acc.email
        
        // If email looks encrypted (old account), try to decrypt for comparison
        if (isEncrypted(acc.email)) {
          try {
            const decrypted = decryptEmail(acc.email)
            if (decrypted && decrypted !== acc.email && decrypted.includes('@')) {
              accEmail = decrypted
            }
          } catch (decryptErr) {
            // Keep original if decryption fails
            accEmail = acc.email
          }
        }
        
        // Normalize and compare
        const normalizedAccEmail = accEmail.toLowerCase().trim()
        if (normalizedAccEmail === normalizedEmail) {
          account = acc
          break
        }
      } catch (err) {
        // Skip accounts with errors
        continue
      }
    }

    // Verify account exists in database
    if (!account) {
      return res.status(401).json({ error: 'Inget konto hittades med denna e-postadress' });
    }

    // Verify password using bcrypt
    // User always enters password in plain text - we hash it and compare with stored hash
    // If password in DB is not hashed (old account), we need to handle it temporarily
    let isPasswordValid = false
    
    if (!account.password) {
      return res.status(401).json({ error: 'Felaktigt lösenord' });
    }
    
    try {
      // Check if password is hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
      if (account.password.startsWith('$2')) {
        // Normal case: compare plain text password (from user) with stored hash
        isPasswordValid = await bcrypt.compare(password, account.password)
      } else {
        // Legacy account with plain text password - compare directly and migrate
        // User enters plain text password, we compare with plain text in DB
        if (account.password === password) {
          isPasswordValid = true
          // Hash the user's password and update DB (one-time migration)
          const hashedPassword = await bcrypt.hash(password, 10)
          // Update password to hashed version in both collections
          await db.collection('accounts').updateOne(
            { _id: account._id },
            { $set: { password: hashedPassword, updatedAt: new Date() } }
          )
          await db.collection('users').updateOne(
            { _id: account._id },
            { $set: { password: hashedPassword, updatedAt: new Date() } }
          )
        }
      }
    } catch (bcryptError) {
      return res.status(500).json({ error: 'Fel vid lösenordsverifiering' });
    }
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Felaktigt lösenord' });
    }

    // Double-check account still exists (in case it was deleted between checks)
    const accountStillExists = await db.collection('accounts').findOne({ 
      _id: account._id 
    }) || await db.collection('users').findOne({ 
      _id: account._id 
    });

    if (!accountStillExists) {
      return res.status(401).json({ error: 'Kontot finns inte längre i systemet' });
    }

    const { password: _, ...accountWithoutPassword } = account;
    // Decrypt email if it's encrypted (for old accounts), otherwise use as-is
    if (isEncrypted(accountWithoutPassword.email)) {
      try {
        const decrypted = decryptEmail(accountWithoutPassword.email)
        if (decrypted && decrypted.includes('@')) {
          accountWithoutPassword.email = decrypted
        }
      } catch (e) {
        // Keep original if decryption fails
      }
    }
    
    res.json({ user: accountWithoutPassword, message: 'Inloggning lyckades!' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Kunde inte logga in' });
  }
});

// Migrate old passwords to hashed passwords (one-time migration endpoint)
// This endpoint should be secured in production (admin only)
app.post('/api/users/migrate-passwords', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    // Find all accounts with unhashed passwords (passwords that don't start with $2)
    const allAccounts = await db.collection('accounts').find({}).toArray()
    const allUsers = await db.collection('users').find({}).toArray()
    
    const accountsToMigrate = [...allAccounts, ...allUsers].filter(acc => {
      return acc.password && !acc.password.startsWith('$2')
    })

    if (accountsToMigrate.length === 0) {
      return res.json({ 
        message: 'Inga konton behöver migrering',
        migrated: 0 
      })
    }

    let migrated = 0
    const saltRounds = 10

    for (const account of accountsToMigrate) {
      try {
        // Hash the plain text password
        const hashedPassword = await bcrypt.hash(account.password, saltRounds)
        
        // Update in both collections
        await db.collection('accounts').updateOne(
          { _id: account._id },
          { $set: { password: hashedPassword, updatedAt: new Date() } }
        )
        
        await db.collection('users').updateOne(
          { _id: account._id },
          { $set: { password: hashedPassword, updatedAt: new Date() } }
        )
        
        migrated++
      } catch (error) {
        console.error(`Error migrating account ${account._id}:`, error)
      }
    }

    res.json({ 
      message: `Migrerade ${migrated} av ${accountsToMigrate.length} konton`,
      migrated,
      total: accountsToMigrate.length
    })
  } catch (error) {
    res.status(500).json({ error: 'Kunde inte migrera lösenord' })
  }
})

// Verify account exists (for session validation)
app.get('/api/users/verify/:id', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const accountId = req.params.id;
    if (!accountId) {
      return res.status(400).json({ error: 'Konto-ID krävs' });
    }

    // Try accounts collection first, fallback to users for backward compatibility
    let account = await db.collection('accounts').findOne({ 
      _id: new ObjectId(accountId) 
    });
    
    if (!account) {
      account = await db.collection('users').findOne({ 
        _id: new ObjectId(accountId) 
      });
    }

    if (!account) {
      return res.status(404).json({ exists: false, error: 'Konto hittades inte i databasen' });
    }

    const { password: _, ...accountWithoutPassword } = account;
    // Decrypt email if encrypted (for old accounts)
    if (isEncrypted(accountWithoutPassword.email)) {
      try {
        const decrypted = decryptEmail(accountWithoutPassword.email)
        if (decrypted && decrypted.includes('@')) {
          accountWithoutPassword.email = decrypted
        }
      } catch (e) {
        // Keep original if decryption fails
      }
    }
    res.json({ exists: true, user: accountWithoutPassword });
  } catch (error) {
    res.status(500).json({ exists: false, error: 'Kunde inte verifiera konto' });
  }
});

// Get account by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const accountId = req.params.id;
    if (!accountId) {
      return res.status(400).json({ error: 'Konto-ID krävs' });
    }

    // Try accounts collection first, fallback to users for backward compatibility
    let account = await db.collection('accounts').findOne({ 
      _id: new ObjectId(accountId) 
    });
    
    if (!account) {
      account = await db.collection('users').findOne({ 
        _id: new ObjectId(accountId) 
      });
    }

    if (!account) {
      return res.status(404).json({ error: 'Konto hittades inte i databasen' });
    }

    // Populate order history
    if (account.orderHistory && account.orderHistory.length > 0) {
      const receipts = await db.collection('receipts').find({
        _id: { $in: account.orderHistory.map(id => new ObjectId(id)) }
      }).sort({ createdAt: -1 }).toArray();
      account.receipts = receipts;
    }

    // Populate tournament history
    if (account.tournamentHistory && account.tournamentHistory.length > 0) {
      const tournaments = await db.collection('tournaments').find({
        _id: { $in: account.tournamentHistory.map(id => new ObjectId(id)) }
      }).sort({ createdAt: -1 }).toArray();
      account.tournaments = tournaments;
    }

    const { password: _, ...accountWithoutPassword } = account;
    // Decrypt email if encrypted (for old accounts)
    if (isEncrypted(accountWithoutPassword.email)) {
      try {
        const decrypted = decryptEmail(accountWithoutPassword.email)
        if (decrypted && decrypted.includes('@')) {
          accountWithoutPassword.email = decrypted
        }
      } catch (e) {
        // Keep original if decryption fails
      }
    }
    res.json(accountWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Kunde inte hämta konto' });
  }
});

// ==================== TOURNAMENTS ====================

// Get all tournaments (admin endpoint - shows all including finished)
app.get('/api/tournaments', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    try {
      const tournaments = await db.collection('tournaments').find({}).sort({ createdAt: -1 }).toArray();
      res.json(tournaments || []);
    } catch (dbError) {
      // If collection doesn't exist, return empty array
      if (dbError.message && dbError.message.includes('not found')) {
        return res.json([]);
      }
      throw dbError;
    }
  } catch (error) {
    res.status(500).json({ 
      error: 'Kunde inte hämta turneringar',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get visible tournaments (includes upcoming, active, and started - excludes only finished)
// This allows people to see and register for upcoming tournaments before they're activated
// Uses the SAME logic as /api/tournaments but filters out "finished"
app.get('/api/tournaments/active', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    let allTournaments = [];
    try {
      allTournaments = await db.collection('tournaments').find({}).sort({ createdAt: -1 }).toArray();
    } catch (findError) {
      return res.json([]);
    }
    
    const tournaments = allTournaments.filter(t => {
      const status = t.status || 'upcoming';
      return status !== 'finished';
    });
    
    tournaments.sort((a, b) => {
      if (a.startDate && b.startDate) {
        return a.startDate.localeCompare(b.startDate);
      }
      if (a.startDate) return -1;
      if (b.startDate) return 1;
      return 0;
    });
    
    res.json(tournaments || []);
  } catch (error) {
    res.status(500).json({ 
      error: 'Kunde inte hämta turneringar',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get tournament by ID
app.get('/api/tournaments/:id', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }
    const tournament = await db.collection('tournaments').findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    if (!tournament) {
      return res.status(404).json({ error: 'Turnering hittades inte' });
    }
    res.json(tournament);
  } catch (error) {
    res.status(500).json({ error: 'Kunde inte hämta turnering' });
  }
});

// Create tournament
app.post('/api/tournaments', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const {
      name,
      description,
      startDate,
      startTime,
      location,
      cost,
      format,
      maxPlayers,
      rules,
      timePerRound,
      prizes
    } = req.body;

    if (!name || !startDate || !format) {
      return res.status(400).json({ error: 'Namn, datum och format är obligatoriska' });
    }

    const tournament = {
      name,
      description: description || '',
      startDate,
      startTime: startTime || '11:00',
      location: location || 'SerieCentrum, Hedvägen 155, 231 66 Trelleborg',
      cost: cost || 0,
      format,
      maxPlayers: maxPlayers || 24,
      rules: rules || '',
      timePerRound: timePerRound || 50,
      prizes: prizes || [],
      status: 'upcoming', // upcoming, active, started, finished
      participants: [],
      rounds: [],
      currentRound: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    
    const result = await db.collection('tournaments').insertOne(tournament);
    tournament._id = result.insertedId;
    
    res.status(201).json(tournament);
  } catch (error) {
    res.status(500).json({ error: 'Kunde inte skapa turnering' });
  }
});

// Update tournament
app.put('/api/tournaments/:id', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const updates = {
      ...req.body,
      updatedAt: new Date()
    };
    delete updates._id;

    const result = await db.collection('tournaments').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Turnering hittades inte' });
    }

    const tournament = await db.collection('tournaments').findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    res.json(tournament);
  } catch (error) {
    res.status(500).json({ error: 'Kunde inte uppdatera turnering' });
  }
});

// Delete tournament
app.delete('/api/tournaments/:id', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const result = await db.collection('tournaments').deleteOne({ 
      _id: new ObjectId(req.params.id) 
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Turnering hittades inte' });
    }

    res.json({ message: 'Turnering borttagen' });
  } catch (error) {
    res.status(500).json({ error: 'Kunde inte ta bort turnering' });
  }
});

// Register user to tournament
app.post('/api/tournaments/:id/register', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { userId, email, firstName, lastName } = req.body;
    const tournamentId = req.params.id;

    // Require userId - user must have an account to register
    if (!userId) {
      return res.status(401).json({ error: 'Du måste vara inloggad för att registrera dig till turneringen' });
    }

    // Validate that the account exists
    let account = await db.collection('accounts').findOne({ 
      _id: new ObjectId(userId) 
    });
    
    if (!account) {
      account = await db.collection('users').findOne({ 
        _id: new ObjectId(userId) 
      });
    }

    if (!account) {
      return res.status(404).json({ error: 'Konto hittades inte. Vänligen logga in igen.' });
    }

    // Verify email matches account (decrypt if encrypted for old accounts)
    let accountEmail = account.email
    if (isEncrypted(account.email)) {
      try {
        const decrypted = decryptEmail(account.email)
        if (decrypted && decrypted.includes('@')) {
          accountEmail = decrypted
        }
      } catch (e) {
        // Keep original if decryption fails
      }
    }
    
    const normalizedAccountEmail = accountEmail.toLowerCase().trim()
    const normalizedInputEmail = email.toLowerCase().trim()
    
    if (normalizedAccountEmail !== normalizedInputEmail) {
      return res.status(400).json({ error: 'E-postadress matchar inte ditt konto' });
    }

    const tournament = await db.collection('tournaments').findOne({ 
      _id: new ObjectId(tournamentId) 
    });

    if (!tournament) {
      return res.status(404).json({ error: 'Turnering hittades inte' });
    }

    if (tournament.status === 'started' || tournament.status === 'finished') {
      return res.status(400).json({ error: 'Kan inte registrera sig till en pågående eller avslutad turnering' });
    }

    if (tournament.participants.length >= tournament.maxPlayers) {
      return res.status(400).json({ error: 'Turneringen är full' });
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if already registered (decrypt participant emails if encrypted for old data)
    const alreadyRegistered = tournament.participants.some(p => {
      if (p.userId && p.userId.toString() === userId) return true
      let pEmail = p.email
      if (isEncrypted(p.email)) {
        try {
          const decrypted = decryptEmail(p.email)
          if (decrypted && decrypted.includes('@')) {
            pEmail = decrypted
          }
        } catch (e) {
          // Keep original if decryption fails
        }
      }
      return pEmail.toLowerCase().trim() === normalizedEmail
    });

    if (alreadyRegistered) {
      return res.status(400).json({ error: 'Redan registrerad till turneringen' });
    }

    const participant = {
      userId: new ObjectId(userId), // Always require userId now
      email: normalizedEmail, // Store email in plain text (no encryption)
      firstName: firstName || account.firstName,
      lastName: lastName || account.lastName,
      registeredAt: new Date(),
      wins: 0,
      losses: 0,
      draws: 0,
      points: 0,
      opponentMatchWinPercentage: 0,
      gameWinPercentage: 0
    };

    await db.collection('tournaments').updateOne(
      { _id: new ObjectId(tournamentId) },
      { $push: { participants: participant } }
    );

    // If account exists, add tournament to their history
    if (userId) {
      await db.collection('accounts').updateOne(
        { _id: new ObjectId(userId) },
        { 
          $push: { tournamentHistory: tournamentId },
          $set: { updatedAt: new Date() }
        }
      );
      // Also update users collection for backward compatibility
      await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        { $push: { tournamentHistory: tournamentId } }
      );
    }

    res.json({ message: 'Registrerad till turneringen!', participant });
  } catch (error) {
    res.status(500).json({ error: 'Kunde inte registrera sig' });
  }
});

// Start tournament (create first round pairings)
app.post('/api/tournaments/:id/start', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const tournament = await db.collection('tournaments').findOne({ 
      _id: new ObjectId(req.params.id) 
    });

    if (!tournament) {
      return res.status(404).json({ error: 'Turnering hittades inte' });
    }

    if (tournament.status === 'started' || tournament.status === 'finished') {
      return res.status(400).json({ error: 'Turneringen är redan startad eller avslutad' });
    }

    // Get participants - allow any number (including 0 or 1)
    const participants = tournament.participants || [];
    const participantCount = participants.length;
    const pairings = [];
    
    // Customize tournament setup based on number of participants
    if (participantCount === 0) {
      // No participants - create empty tournament
      pairings.push({
        player1: null,
        player2: null,
        result: null,
        completed: false,
        note: 'Inga deltagare registrerade'
      });
    } else if (participantCount === 1) {
      // Single participant - give them a bye
      pairings.push({
        player1: participants[0],
        player2: null,
        result: { player1Wins: 2, player2Wins: 0, draws: 0 }, // Bye = win
        completed: true
      });
    } else {
      // Multiple participants - create pairings
      // Shuffle participants for round 1
      const shuffled = [...participants];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      // Create pairings
      for (let i = 0; i < shuffled.length; i += 2) {
        if (i + 1 < shuffled.length) {
          pairings.push({
            player1: shuffled[i],
            player2: shuffled[i + 1],
            result: null, // { player1Wins, player2Wins, draws }
            completed: false
          });
        } else {
          // Bye for odd number of players
          pairings.push({
            player1: shuffled[i],
            player2: null,
            result: { player1Wins: 2, player2Wins: 0, draws: 0 }, // Bye = win
            completed: true
          });
        }
      }
    }

    const round = {
      roundNumber: 1,
      pairings,
      startedAt: new Date(),
      completed: false
    };

    await db.collection('tournaments').updateOne(
      { _id: new ObjectId(req.params.id) },
      { 
        $set: { 
          status: 'started',
          currentRound: 1,
          updatedAt: new Date()
        },
        $push: { rounds: round }
      }
    );

    const updatedTournament = await db.collection('tournaments').findOne({ 
      _id: new ObjectId(req.params.id) 
    });

    res.json({ message: 'Turnering startad!', tournament: updatedTournament });
  } catch (error) {
    res.status(500).json({ error: 'Kunde inte starta turnering' });
  }
});

// Submit match result
app.post('/api/tournaments/:id/rounds/:roundNumber/results', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { pairingIndex, player1Wins, player2Wins, draws, submittedBy } = req.body;
    const tournamentId = req.params.id;
    const roundNumber = parseInt(req.params.roundNumber);

    const tournament = await db.collection('tournaments').findOne({ 
      _id: new ObjectId(tournamentId) 
    });

    if (!tournament) {
      return res.status(404).json({ error: 'Turnering hittades inte' });
    }

    const round = tournament.rounds[roundNumber - 1];
    if (!round) {
      return res.status(404).json({ error: 'Runda hittades inte' });
    }

    const pairing = round.pairings[pairingIndex];
    if (!pairing) {
      return res.status(404).json({ error: 'Parring hittades inte' });
    }

    // Verify submitter is one of the players
    const isPlayer1 = pairing.player1?.userId?.toString() === submittedBy || 
                      pairing.player1?.email === submittedBy;
    const isPlayer2 = pairing.player2?.userId?.toString() === submittedBy || 
                      pairing.player2?.email === submittedBy;

    if (!isPlayer1 && !isPlayer2) {
      return res.status(403).json({ error: 'Du kan bara skicka in resultat för dina egna matcher' });
    }

    // Update pairing result
    round.pairings[pairingIndex].result = { player1Wins, player2Wins, draws };
    round.pairings[pairingIndex].completed = true;

    // Update player stats
    const player1 = tournament.participants.find(p => 
      (pairing.player1.userId && p.userId && p.userId.toString() === pairing.player1.userId.toString()) ||
      (!pairing.player1.userId && p.email === pairing.player1.email)
    );
    const player2 = pairing.player2 ? tournament.participants.find(p => 
      (pairing.player2.userId && p.userId && p.userId.toString() === pairing.player2.userId.toString()) ||
      (!pairing.player2.userId && p.email === pairing.player2.email)
    ) : null;

    if (player1) {
      if (player1Wins > player2Wins) {
        player1.wins += 1;
        player1.points += 3;
      } else if (player1Wins < player2Wins) {
        player1.losses += 1;
      } else {
        player1.draws += 1;
        player1.points += 1;
      }
    }

    if (player2) {
      if (player2Wins > player1Wins) {
        player2.wins += 1;
        player2.points += 3;
      } else if (player2Wins < player1Wins) {
        player2.losses += 1;
      } else {
        player2.draws += 1;
        player2.points += 1;
      }
    }

    // Update tournament
    await db.collection('tournaments').updateOne(
      { _id: new ObjectId(tournamentId) },
      { 
        $set: { 
          rounds: tournament.rounds,
          participants: tournament.participants,
          updatedAt: new Date()
        }
      }
    );

    res.json({ message: 'Resultat uppdaterat!', tournament });
  } catch (error) {
    res.status(500).json({ error: 'Kunde inte skicka in resultat' });
  }
});

// Generate next round pairings (Swiss pairing)
app.post('/api/tournaments/:id/next-round', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const tournament = await db.collection('tournaments').findOne({ 
      _id: new ObjectId(req.params.id) 
    });

    if (!tournament) {
      return res.status(404).json({ error: 'Turnering hittades inte' });
    }

    // Check if current round is complete
    const currentRound = tournament.rounds[tournament.currentRound - 1];
    if (!currentRound || !currentRound.completed) {
      return res.status(400).json({ error: 'Nuvarande runda är inte klar' });
    }

    // Swiss pairing algorithm
    const participants = [...tournament.participants];
    
    // Sort by points (descending), then by opponent match win percentage
    participants.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.opponentMatchWinPercentage - a.opponentMatchWinPercentage;
    });

    const pairings = [];
    const used = new Set();

    // Try to pair players with similar records
    for (let i = 0; i < participants.length; i++) {
      if (used.has(i)) continue;

      let paired = false;
      // Try to find opponent with similar points
      for (let j = i + 1; j < participants.length; j++) {
        if (used.has(j)) continue;

        // Check if they haven't played before (simple check)
        const canPair = true; // In full implementation, check previous matchups

        if (canPair) {
          pairings.push({
            player1: participants[i],
            player2: participants[j],
            result: null,
            completed: false
          });
          used.add(i);
          used.add(j);
          paired = true;
          break;
        }
      }

      // If no pair found and odd number, give bye
      if (!paired && participants.length % 2 === 1) {
        pairings.push({
          player1: participants[i],
          player2: null,
          result: { player1Wins: 2, player2Wins: 0, draws: 0 },
          completed: true
        });
        used.add(i);
      }
    }

    const nextRound = {
      roundNumber: tournament.currentRound + 1,
      pairings,
      startedAt: new Date(),
      completed: false
    };

    await db.collection('tournaments').updateOne(
      { _id: new ObjectId(req.params.id) },
      { 
        $set: { 
          currentRound: tournament.currentRound + 1,
          updatedAt: new Date()
        },
        $push: { rounds: nextRound }
      }
    );

    const updatedTournament = await db.collection('tournaments').findOne({ 
      _id: new ObjectId(req.params.id) 
    });

    res.json({ message: 'Nästa runda skapad!', tournament: updatedTournament });
  } catch (error) {
    res.status(500).json({ error: 'Kunde inte skapa nästa runda' });
  }
});

// ==================== TOURNAMENT REGISTRATIONS ====================

// Get all registrations
app.get('/api/tournament/registrations', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }
    const registrations = await db.collection('tournament_registrations').find({}).toArray();
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ error: 'Kunde inte hämta registreringar' });
  }
});

// Create a new registration
app.post('/api/tournament/register', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { firstName, lastName, email } = req.body;

    // Validation
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ 
        error: 'Alla fält är obligatoriska (förnamn, efternamn, email)' 
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Ogiltig e-postadress' 
      });
    }

    // Check if email already exists
    const existing = await db.collection('tournament_registrations').findOne({
      email: email.toLowerCase()
    });

    if (existing) {
      return res.status(400).json({ 
        error: 'Denna e-postadress är redan registrerad' 
      });
    }

    // Create new registration
    const newRegistration = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      registeredAt: new Date()
    };

    const result = await db.collection('tournament_registrations').insertOne(newRegistration);
    newRegistration._id = result.insertedId;

    res.status(201).json({ 
      message: 'Registrering lyckades!', 
      registration: newRegistration 
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Kunde inte spara registreringen' 
    });
  }
});

// Delete a registration
app.delete('/api/tournament/registrations/:id', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { id } = req.params;
    const result = await db.collection('tournament_registrations').deleteOne({ 
      _id: new ObjectId(id) 
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Registrering hittades inte' });
    }

    res.json({ message: 'Registrering borttagen' });
  } catch (error) {
    res.status(500).json({ error: 'Kunde inte ta bort registreringen' });
  }
});

// ==================== PRODUCTS ====================

// Get all products (with pagination)
app.get('/api/products', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 10000); // Max 10000
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const search = req.query.search;

    let query = {};
    if (category && category !== 'all') {
      query.category = category;
    }
    if (search && search.trim() !== '') {
      // Use regex search for case-insensitive matching on name and description
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await db.collection('products')
      .find(query)
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await db.collection('products').countDocuments(query);

    res.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Kunde inte hämta produkter' });
  }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const product = await db.collection('products').findOne({ 
      _id: new ObjectId(req.params.id) 
    });

    if (!product) {
      return res.status(404).json({ error: 'Produkt hittades inte' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Kunde inte hämta produkt' });
  }
});

// Create product
app.post('/api/products', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { name, description, price, category, image, stock, availableConditions } = req.body;

    if (!name || !category) {
      return res.status(400).json({ 
        error: 'Namn och kategori är obligatoriska' 
      });
    }

    // Calculate price and stock from conditions if available
    let finalPrice = parseFloat(price) || 0;
    let finalStock = parseInt(stock) || 0;
    
    if (availableConditions && Array.isArray(availableConditions) && availableConditions.length > 0) {
      const validConditions = availableConditions.filter(c => c.price > 0 || c.stock > 0);
      if (validConditions.length > 0) {
        finalStock = validConditions.reduce((sum, c) => sum + (parseInt(c.stock) || 0), 0);
        const prices = validConditions.map(c => parseFloat(c.price)).filter(p => p > 0);
        if (prices.length > 0) {
          finalPrice = Math.min(...prices);
        }
      }
    }

    const product = {
      name: name.trim(),
      description: description || '',
      price: finalPrice,
      category: category.trim(),
      image: image || '',
      stock: finalStock,
      availableConditions: availableConditions && Array.isArray(availableConditions) 
        ? availableConditions.filter(c => c.condition && (c.price > 0 || c.stock > 0))
        : [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('products').insertOne(product);
    product._id = result.insertedId;

    res.status(201).json({ 
      message: 'Produkt skapad', 
      product 
    });
  } catch (error) {
    res.status(500).json({ error: 'Kunde inte skapa produkt' });
  }
});

// Update product
app.put('/api/products/:id', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { id } = req.params;
    const { availableConditions, price, stock, ...otherFields } = req.body;
    
    // Calculate price and stock from conditions if available
    let finalPrice = parseFloat(price) || 0;
    let finalStock = parseInt(stock) || 0;
    
    if (availableConditions && Array.isArray(availableConditions) && availableConditions.length > 0) {
      const validConditions = availableConditions.filter(c => c.price > 0 || c.stock > 0);
      if (validConditions.length > 0) {
        finalStock = validConditions.reduce((sum, c) => sum + (parseInt(c.stock) || 0), 0);
        const prices = validConditions.map(c => parseFloat(c.price)).filter(p => p > 0);
        if (prices.length > 0) {
          finalPrice = Math.min(...prices);
        }
      }
    }
    
    const update = {
      ...otherFields,
      price: finalPrice,
      stock: finalStock,
      availableConditions: availableConditions && Array.isArray(availableConditions) 
        ? availableConditions.filter(c => c.condition && (c.price > 0 || c.stock > 0))
        : [],
      updatedAt: new Date()
    };
    delete update._id;

    const result = await db.collection('products').updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Produkt hittades inte' });
    }

    res.json({ message: 'Produkt uppdaterad' });
  } catch (error) {
    res.status(500).json({ error: 'Kunde inte uppdatera produkt' });
  }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { id } = req.params;
    const result = await db.collection('products').deleteOne({ 
      _id: new ObjectId(id) 
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Produkt hittades inte' });
    }

    res.json({ message: 'Produkt borttagen' });
  } catch (error) {
    res.status(500).json({ error: 'Kunde inte ta bort produkt' });
  }
});

// Get categories
app.get('/api/products/categories', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    // Get distinct categories, filter out null/undefined/empty
    const categories = await db.collection('products').distinct('category');
    const filteredCategories = categories
      .filter(cat => cat && cat.trim() !== '')
      .sort();
    
    // If no categories exist, return default categories
    if (filteredCategories.length === 0) {
      return res.json([
        'Serier',
        'Serietidningar',
        'Seriealbum',
        'Magic: The Gathering',
        'PVC Figurer',
        'Brädspel',
        'Böcker',
        'Kortspel',
        'Annat'
      ]);
    }
    
    res.json(filteredCategories);
  } catch (error) {
    // Return default categories on error
    res.json([
      'Serier',
      'Serietidningar',
      'Seriealbum',
      'Magic: The Gathering',
      'PVC Figurer',
      'Brädspel',
      'Böcker',
      'Kortspel',
      'Annat'
    ]);
  }
});

// ==================== ACCOUNTS ====================

// Get all accounts
app.get('/api/users', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    // Get from accounts collection, fallback to users for backward compatibility
    let accounts = await db.collection('accounts').find({}).toArray();
    
    if (accounts.length === 0) {
      accounts = await db.collection('users').find({}).toArray();
    }

    // Remove passwords from response and decrypt emails if encrypted (for old accounts)
    const accountsWithoutPasswords = accounts.map(account => {
      const { password, ...accountWithoutPassword } = account;
      // Decrypt email if encrypted (for old accounts)
      if (isEncrypted(accountWithoutPassword.email)) {
        try {
          const decrypted = decryptEmail(accountWithoutPassword.email)
          if (decrypted && decrypted.includes('@')) {
            accountWithoutPassword.email = decrypted
          }
        } catch (e) {
          // Keep original if decryption fails
        }
      }
      return accountWithoutPassword;
    });

    res.json(accountsWithoutPasswords);
  } catch (error) {
    res.status(500).json({ error: 'Kunde inte hämta konton' });
  }
});

// Create account (admin endpoint)
app.post('/api/users', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { email, firstName, lastName, phone } = req.body;

    if (!email || (!firstName && !lastName)) {
      return res.status(400).json({ 
        error: 'E-post och namn är obligatoriska' 
      });
    }

    const normalizedEmail = email.toLowerCase().trim()
    
    // Check if account exists - need to decrypt emails in database to compare
    const allAccounts = await db.collection('accounts').find({}).toArray()
    const emailExists = allAccounts.some(acc => {
      const accEmail = isEncrypted(acc.email) ? decryptEmail(acc.email) : acc.email
      return accEmail.toLowerCase().trim() === normalizedEmail
    })

    if (emailExists) {
      return res.status(400).json({ 
        error: 'Konto med denna e-post finns redan' 
      });
    }

    const account = {
      firstName: firstName || '',
      lastName: lastName || '',
      email: normalizedEmail, // Store email in plain text (no encryption)
      phone: phone || '',
      tournamentHistory: [],
      orderHistory: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('accounts').insertOne(account);
    account._id = result.insertedId;

    // Also save to users collection for backward compatibility
    await db.collection('users').insertOne({
      ...account,
      name: `${firstName || ''} ${lastName || ''}`.trim()
    });

    const { password: _, ...accountWithoutPassword } = account;
    // Email is already in plain text, no need to decrypt
    res.status(201).json({ 
      message: 'Konto skapat', 
      user: accountWithoutPassword 
    });
  } catch (error) {
    res.status(500).json({ error: 'Kunde inte skapa konto' });
  }
});

// ==================== RECEIPTS (Orders) ====================

// Generate unique order number
function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SC-${timestamp}-${random}`;
}

// Get all receipts
app.get('/api/orders', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const accountId = req.query.userId || req.query.accountId;
    const query = accountId ? { accountId: accountId } : {};

    // Try receipts collection first, fallback to orders for backward compatibility
    let receipts = await db.collection('receipts')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    
    if (receipts.length === 0) {
      receipts = await db.collection('orders')
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();
    }

    res.json(receipts);
  } catch (error) {
    res.status(500).json({ error: 'Kunde inte hämta kvitton' });
  }
});

// Create receipt (order)
app.post('/api/orders', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { userId, accountId, items, total, shippingAddress, paymentMethod } = req.body;
    const finalAccountId = accountId || userId;

    if (!finalAccountId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        error: 'Konto-ID och produkter är obligatoriska' 
      });
    }

    const orderNumber = generateOrderNumber();
    const receipt = {
      accountId: finalAccountId,
      orderNumber,
      items: items.map(item => ({
        productId: item.productId || item._id,
        productName: item.name,
        condition: item.condition || 'Standard',
        quantity: item.quantity || 1,
        price: parseFloat(item.price) || 0,
        subtotal: (parseFloat(item.price) || 0) * (item.quantity || 1)
      })),
      subtotal: parseFloat(total) || 0,
      tax: 0, // Can be calculated if needed
      shipping: 0, // Can be calculated if needed
      total: parseFloat(total) || 0,
      shippingAddress: shippingAddress || {},
      paymentMethod: paymentMethod || 'unknown',
      status: 'pending', // pending, processing, shipped, delivered, cancelled
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('receipts').insertOne(receipt);
    receipt._id = result.insertedId;

    // Also save to orders collection for backward compatibility
    await db.collection('orders').insertOne({
      ...receipt,
      userId: finalAccountId
    });

    // Add receipt to account's order history
    await db.collection('accounts').updateOne(
      { _id: new ObjectId(finalAccountId) },
      { 
        $push: { orderHistory: receipt._id.toString() },
        $set: { updatedAt: new Date() }
      }
    );

    res.status(201).json({ 
      message: 'Kvitto skapat', 
      receipt,
      order: receipt // For backward compatibility
    });
  } catch (error) {
    res.status(500).json({ error: 'Kunde inte skapa kvitto' });
  }
});

// Update receipt status
app.put('/api/orders/:id/status', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { id } = req.params;
    const { status } = req.body;

    // Update receipts collection
    const result = await db.collection('receipts').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status,
          updatedAt: new Date()
        } 
      }
    );

    // Also update orders collection for backward compatibility
    await db.collection('orders').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status,
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Kvitto hittades inte' });
    }

    res.json({ message: 'Kvittostatus uppdaterad' });
  } catch (error) {
    res.status(500).json({ error: 'Kunde inte uppdatera kvitto' });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  res.json({ 
    status: 'ok', 
    database: db ? 'connected' : 'disconnected',
    dbConnectionStatus: dbConnectionStatus,
    mongodbUri: MONGODB_URI ? (MONGODB_URI.includes('mongodb+srv') ? 'MongoDB Atlas' : 'Local MongoDB') : 'Not set',
    timestamp: new Date().toISOString()
  });
});

// Test tournaments endpoint
app.get('/api/tournaments/test', async (req, res) => {
  try {
    
    const dbStatus = {
      dbAvailable: !!db,
      dbName: db ? db.databaseName : 'N/A',
      collections: []
    };
    
    if (db) {
      const collections = await db.listCollections().toArray();
      dbStatus.collections = collections.map(c => c.name);
      if (dbStatus.collections.includes('tournaments')) {
        const count = await db.collection('tournaments').countDocuments();
        
        if (count > 0) {
          const all = await db.collection('tournaments').find({}).toArray();
          dbStatus.tournaments = all;
        }
      }
    }
    
    res.json(dbStatus);
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Error handling middleware - must be before 404 handler
app.use((err, req, res, next) => {
  res.status(500).json({ 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Import products from products.json
app.post('/api/products/import', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const fs = await import('fs');
    const productsPath = path.join(__dirname, 'products.json');

    // Check if file exists
    if (!fs.existsSync(productsPath)) {
      return res.status(404).json({ error: 'products.json file not found' });
    }

    // Read and parse products.json
    const fileContent = fs.readFileSync(productsPath, 'utf8');
    const rawProducts = JSON.parse(fileContent);

    // Extract category from URL or name
    function extractCategory(product) {
      if (product.url) {
        const urlMatch = product.url.match(/path=(\d+_\d+_\d+)/);
        if (urlMatch) {
          const path = urlMatch[1];
          if (path.includes('70_75')) return 'Serietidningar';
          if (path.includes('70_76')) return 'Seriealbum';
          if (path.includes('70_77')) return 'Magic: The Gathering';
          if (path.includes('70_78')) return 'PVC Figurer';
          if (path.includes('70_79')) return 'Brädspel';
        }
      }
      const name = (product.name || '').toLowerCase();
      if (name.includes('fantomen') || name.includes('donald') || name.includes('kalle')) {
        return 'Serietidningar';
      }
      if (name.includes('album') || name.includes('samling')) {
        return 'Seriealbum';
      }
      if (name.includes('magic') || name.includes('mtg')) {
        return 'Magic: The Gathering';
      }
      return 'Serier';
    }

    // Parse price from "10Kr" format
    function parsePrice(priceStr) {
      if (!priceStr) return 0;
      const match = priceStr.toString().match(/(\d+)/);
      return match ? parseFloat(match[1]) : 0;
    }

    // Group products by name and merge conditions
    const productMap = new Map();
    
    for (const product of rawProducts) {
      const name = (product.name || '').trim();
      if (!name) continue;
      
      if (!productMap.has(name)) {
        const category = extractCategory(product);
        const price = parsePrice(product.price);
        const image = product.images && product.images.length > 0 ? product.images[0] : '';
        
        productMap.set(name, {
          name: name,
          description: product.description || '',
          price: price,
          category: category,
          image: image,
          stock: parseInt(product.availability) || 0,
          originalUrl: product.url || '',
          availableConditions: [],
          rating: product.rating || null,
          reviewsCount: product.reviews_count || 0,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      const existing = productMap.get(name);
      if (product.condition) {
        const conditionPrice = parsePrice(product.price);
        const conditionStock = parseInt(product.availability) || 0;
        
        const existingCondition = existing.availableConditions.find(
          c => c.condition === product.condition
        );
        
        if (!existingCondition) {
          existing.availableConditions.push({
            condition: product.condition,
            price: conditionPrice,
            stock: conditionStock,
            url: product.url || ''
          });
        } else {
          if (conditionStock > existingCondition.stock) {
            existingCondition.stock = conditionStock;
          }
        }
        
        existing.stock = existing.availableConditions.reduce(
          (sum, c) => sum + c.stock, 0
        );
        
        const minPrice = Math.min(
          ...existing.availableConditions.map(c => c.price).filter(p => p > 0)
        );
        if (minPrice > 0) {
          existing.price = minPrice;
        }
      }
    }
    
    const processedProducts = Array.from(productMap.values());

    // Clear existing products
    await db.collection('products').deleteMany({});

    // Insert products in batches
    const batchSize = 1000;
    let inserted = 0;
    
    for (let i = 0; i < processedProducts.length; i += batchSize) {
      const batch = processedProducts.slice(i, i + batchSize);
      await db.collection('products').insertMany(batch);
      inserted += batch.length;
    }

    // Create indexes
    await db.collection('products').createIndex({ name: 'text', description: 'text' });
    await db.collection('products').createIndex({ category: 1 });
    await db.collection('products').createIndex({ createdAt: -1 });

    res.json({ 
      success: true, 
      message: `Importerade ${inserted} produkter`,
      total: inserted,
      unique: processedProducts.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Kunde inte importera produkter', details: error.message });
  }
});

// 404 handler for API routes - must be after all API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    error: 'API endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Start server immediately (don't wait for database)
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`💾 Database status: ${db ? '✅ Connected' : '⏳ Connecting...'}`);
  if (!db) {
    console.log('⚠️  Server started but database is not yet connected');
    console.log('   API will return 503 until database connection is established');
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  if (mongoClient) {
    await mongoClient.close();
  }
  process.exit(0);
});
