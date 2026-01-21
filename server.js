import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
let db;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/seriecentrum';

async function connectDB() {
  try {
    if (!MONGODB_URI || MONGODB_URI.includes('<cluster-url>') || MONGODB_URI.includes('localhost')) {
      console.warn('⚠️  MongoDB URI inte konfigurerad korrekt');
      console.warn('   Skapa en .env-fil med MONGODB_URI');
      console.warn('   Kör: npm run setup-env');
      return null;
    }

    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db();
    console.log('✅ Ansluten till MongoDB');
    console.log(`📊 Database: ${db.databaseName}`);
    
    // Create indexes for better performance
    try {
      // Products indexes
      await db.collection('products').createIndex({ name: 'text', description: 'text' });
      await db.collection('products').createIndex({ category: 1 });
      await db.collection('products').createIndex({ createdAt: -1 });
      
      // Accounts (users) indexes
      await db.collection('accounts').createIndex({ email: 1 }, { unique: true });
      await db.collection('accounts').createIndex({ createdAt: -1 });
      
      // Receipts (orders) indexes
      await db.collection('receipts').createIndex({ accountId: 1 });
      await db.collection('receipts').createIndex({ createdAt: -1 });
      await db.collection('receipts').createIndex({ orderNumber: 1 }, { unique: true, sparse: true });
      await db.collection('receipts').createIndex({ status: 1 });
      
      // Tournaments indexes
      await db.collection('tournaments').createIndex({ status: 1 });
      await db.collection('tournaments').createIndex({ startDate: 1 });
      await db.collection('tournaments').createIndex({ createdAt: -1 });
      await db.collection('tournaments').createIndex({ 'participants.userId': 1 });
      await db.collection('tournaments').createIndex({ 'participants.email': 1 });
      
      console.log('✅ Indexes skapade');
    } catch (indexError) {
      // Indexes might already exist, that's okay
      console.log('ℹ️  Indexes redan skapade eller kunde inte skapas');
    }
    
    return client;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    if (error.message.includes('authentication')) {
      console.error('   Kontrollera användarnamn och lösenord i .env');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('   Kontrollera kluster-URL i .env');
    }
    return null;
  }
}

// Initialize database connection
let mongoClient;
connectDB().then(client => {
  mongoClient = client;
  if (client) {
    console.log('✅ MongoDB anslutning klar');
  }
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  console.log('⚠️  Server körs i fallback-läge (localStorage)');
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

    // Check if account exists
    const existing = await db.collection('accounts').findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: 'E-postadressen är redan registrerad' });
    }

    // Simple password hash (in production, use bcrypt)
    const account = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password: password, // In production, hash this
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
    console.error('Error creating account:', error);
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

    // Try accounts collection first, fallback to users for backward compatibility
    let account = await db.collection('accounts').findOne({ 
      email: email.toLowerCase() 
    });
    
    if (!account) {
      account = await db.collection('users').findOne({ 
        email: email.toLowerCase() 
      });
    }

    if (!account || account.password !== password) {
      return res.status(401).json({ error: 'Ogiltig e-post eller lösenord' });
    }

    const { password: _, ...accountWithoutPassword } = account;
    res.json({ user: accountWithoutPassword, message: 'Inloggning lyckades!' });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Kunde inte logga in' });
  }
});

// Get account by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    // Try accounts collection first, fallback to users for backward compatibility
    let account = await db.collection('accounts').findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (!account) {
      account = await db.collection('users').findOne({ 
        _id: new ObjectId(req.params.id) 
      });
    }

    if (!account) {
      return res.status(404).json({ error: 'Konto hittades inte' });
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
    res.json(accountWithoutPassword);
  } catch (error) {
    console.error('Error fetching account:', error);
    res.status(500).json({ error: 'Kunde inte hämta konto' });
  }
});

// ==================== TOURNAMENTS ====================

// Get all tournaments
app.get('/api/tournaments', async (req, res) => {
  try {
    if (!db) {
      console.error('Database not available when fetching tournaments');
      return res.status(503).json({ error: 'Database not available' });
    }
    
    try {
      const tournaments = await db.collection('tournaments').find({}).sort({ createdAt: -1 }).toArray();
      res.json(tournaments || []);
    } catch (dbError) {
      console.error('Database error fetching tournaments:', dbError);
      // If collection doesn't exist, return empty array
      if (dbError.message && dbError.message.includes('not found')) {
        return res.json([]);
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Kunde inte hämta turneringar',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get active tournaments (includes upcoming, active, and started)
app.get('/api/tournaments/active', async (req, res) => {
  try {
    if (!db) {
      console.error('Database not available when fetching active tournaments');
      return res.status(503).json({ error: 'Database not available' });
    }
    
    try {
      const tournaments = await db.collection('tournaments').find({ 
        status: { $in: ['upcoming', 'active', 'started'] } 
      }).sort({ startDate: 1 }).toArray();
      res.json(tournaments || []);
    } catch (dbError) {
      console.error('Database error fetching active tournaments:', dbError);
      // If collection doesn't exist, return empty array
      if (dbError.message && dbError.message.includes('not found')) {
        return res.json([]);
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Error fetching active tournaments:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Kunde inte hämta aktiva turneringar',
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
    console.error('Error fetching tournament:', error);
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
    console.error('Error creating tournament:', error);
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
    console.error('Error updating tournament:', error);
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
    console.error('Error deleting tournament:', error);
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

    // Check if already registered
    const alreadyRegistered = tournament.participants.some(p => 
      (userId && p.userId && p.userId.toString() === userId) || 
      p.email === email.toLowerCase()
    );

    if (alreadyRegistered) {
      return res.status(400).json({ error: 'Redan registrerad till turneringen' });
    }

    const participant = {
      userId: userId ? new ObjectId(userId) : null,
      email: email.toLowerCase(),
      firstName,
      lastName,
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
    console.error('Error registering to tournament:', error);
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

    if (!tournament.participants || tournament.participants.length < 2) {
      return res.status(400).json({ 
        error: 'Behöver minst 2 deltagare för att starta',
        currentParticipants: tournament.participants?.length || 0
      });
    }

    if (tournament.status === 'started' || tournament.status === 'finished') {
      return res.status(400).json({ error: 'Turneringen är redan startad eller avslutad' });
    }

    // Create first round pairings (random for round 1)
    const participants = [...tournament.participants];
    const pairings = [];
    
    // Shuffle participants for round 1
    for (let i = participants.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [participants[i], participants[j]] = [participants[j], participants[i]];
    }

    // Create pairings
    for (let i = 0; i < participants.length; i += 2) {
      if (i + 1 < participants.length) {
        pairings.push({
          player1: participants[i],
          player2: participants[i + 1],
          result: null, // { player1Wins, player2Wins, draws }
          completed: false
        });
      } else {
        // Bye for odd number of players
        pairings.push({
          player1: participants[i],
          player2: null,
          result: { player1Wins: 2, player2Wins: 0, draws: 0 }, // Bye = win
          completed: true
        });
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
    console.error('Error starting tournament:', error);
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
    console.error('Error submitting result:', error);
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
    console.error('Error creating next round:', error);
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
    console.error('Error fetching registrations:', error);
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
    console.error('Error creating registration:', error);
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
    console.error('Error deleting registration:', error);
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
    if (search) {
      query.$text = { $search: search };
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
    console.error('Error fetching products:', error);
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
    console.error('Error fetching product:', error);
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
    console.error('Error creating product:', error);
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
    console.error('Error updating product:', error);
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
    console.error('Error deleting product:', error);
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
    console.error('Error fetching categories:', error);
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

    // Remove passwords from response
    const accountsWithoutPasswords = accounts.map(account => {
      const { password, ...accountWithoutPassword } = account;
      return accountWithoutPassword;
    });

    res.json(accountsWithoutPasswords);
  } catch (error) {
    console.error('Error fetching accounts:', error);
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

    // Check if account exists
    const existing = await db.collection('accounts').findOne({ 
      email: email.toLowerCase() 
    });

    if (existing) {
      return res.status(400).json({ 
        error: 'Konto med denna e-post finns redan' 
      });
    }

    const account = {
      firstName: firstName || '',
      lastName: lastName || '',
      email: email.toLowerCase(),
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
    res.status(201).json({ 
      message: 'Konto skapat', 
      user: accountWithoutPassword 
    });
  } catch (error) {
    console.error('Error creating account:', error);
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
    console.error('Error fetching receipts:', error);
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
    console.error('Error creating receipt:', error);
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
    console.error('Error updating receipt:', error);
    res.status(500).json({ error: 'Kunde inte uppdatera kvitto' });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  res.json({ 
    status: 'ok', 
    database: db ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Test tournaments endpoint
app.get('/api/tournaments/test', async (req, res) => {
  try {
    res.json({
      dbAvailable: !!db,
      dbName: db ? db.databaseName : 'N/A',
      collections: db ? (await db.listCollections().toArray()).map(c => c.name) : []
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Error handling middleware - must be before 404 handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler for API routes - must be after all API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    error: 'API endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server körs på http://localhost:${PORT}`);
  // Wait a moment for connection to establish
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log(`📊 Database: ${db ? '✅ Connected' : '❌ Not connected'}`);
  if (db) {
    console.log(`   Database name: ${db.databaseName}`);
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Stänger ner servern...');
  if (mongoClient) {
    await mongoClient.close();
    console.log('✅ MongoDB connection closed');
  }
  process.exit(0);
});
