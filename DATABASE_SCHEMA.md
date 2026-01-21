# Database Schema Documentation

## Overview
This document describes the MongoDB database structure for SerieCentrum. The database is organized into clear collections with proper relationships and indexes.

## Collections

### 1. `accounts` (User Accounts)
Stores all user account information.

**Schema:**
```javascript
{
  _id: ObjectId,
  firstName: String,          // Required
  lastName: String,           // Required
  email: String,              // Required, Unique, Lowercase
  password: String,           // Required (should be hashed in production)
  phone: String,              // Optional
  tournamentHistory: [String], // Array of tournament IDs
  orderHistory: [String],      // Array of receipt IDs
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `email` (unique)
- `createdAt` (descending)

**Relationships:**
- `tournamentHistory` → `tournaments._id`
- `orderHistory` → `receipts._id`

---

### 2. `receipts` (Order Receipts)
Stores all order receipts with complete order information.

**Schema:**
```javascript
{
  _id: ObjectId,
  accountId: String,          // Reference to accounts._id
  orderNumber: String,         // Unique order number (e.g., "SC-ABC123-XYZ")
  items: [{
    productId: String,         // Reference to products._id
    productName: String,
    condition: String,         // Product condition/quality
    quantity: Number,
    price: Number,
    subtotal: Number
  }],
  subtotal: Number,
  tax: Number,                // Can be calculated
  shipping: Number,            // Can be calculated
  total: Number,
  shippingAddress: {
    street: String,
    city: String,
    postalCode: String,
    country: String
  },
  paymentMethod: String,       // e.g., "card", "swish", "cash"
  status: String,              // "pending", "processing", "shipped", "delivered", "cancelled"
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `accountId`
- `orderNumber` (unique, sparse)
- `createdAt` (descending)
- `status`

**Relationships:**
- `accountId` → `accounts._id`
- `items[].productId` → `products._id`

---

### 3. `tournaments` (Tournaments with Results)
Stores all tournament information including participants, rounds, pairings, and results.

**Schema:**
```javascript
{
  _id: ObjectId,
  name: String,               // Required
  description: String,
  startDate: String,          // Required (YYYY-MM-DD)
  startTime: String,          // Required (HH:MM)
  location: String,
  cost: Number,               // Entry fee in SEK
  format: String,             // Required (e.g., "Sealed", "Draft", "Standard")
  maxPlayers: Number,
  rules: String,
  timePerRound: Number,       // Minutes per round
  prizes: [{
    position: String,         // e.g., "1:a plats", "2:a plats"
    prize: String             // Prize description
  }],
  status: String,             // "upcoming", "active", "started", "finished"
  participants: [{
    userId: ObjectId,         // Reference to accounts._id (optional)
    email: String,            // Required
    firstName: String,        // Required
    lastName: String,         // Required
    registeredAt: Date,
    wins: Number,             // Tournament statistics
    losses: Number,
    draws: Number,
    points: Number,           // 3 for win, 1 for draw, 0 for loss
    opponentMatchWinPercentage: Number,
    gameWinPercentage: Number
  }],
  rounds: [{
    roundNumber: Number,      // 1, 2, 3, etc.
    pairings: [{
      player1: {
        userId: ObjectId,
        email: String,
        firstName: String,
        lastName: String
      },
      player2: {
        userId: ObjectId,
        email: String,
        firstName: String,
        lastName: String
      } | null,               // null if bye
      result: {
        player1Wins: Number,
        player2Wins: Number,
        draws: Number
      } | null,
      completed: Boolean
    }],
    startedAt: Date,
    completed: Boolean
  }],
  currentRound: Number,       // Current round number
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `status`
- `startDate`
- `createdAt` (descending)
- `participants.userId`
- `participants.email`

**Relationships:**
- `participants[].userId` → `accounts._id`
- Tournament ID stored in `accounts.tournamentHistory`

---

### 4. `products` (Products)
Stores all product information with multiple condition/quality options.

**Schema:**
```javascript
{
  _id: ObjectId,
  name: String,               // Required
  description: String,
  price: Number,              // Lowest price from availableConditions
  category: String,           // Required
  image: String,
  stock: Number,              // Total stock from all conditions
  availableConditions: [{
    condition: String,        // e.g., "Mint", "Near Mint", "Played"
    price: Number,
    stock: Number
  }],
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- Text index on `name` and `description`
- `category`
- `createdAt` (descending)

---

### 5. `users` (Legacy/Backward Compatibility)
This collection is maintained for backward compatibility. New accounts should use the `accounts` collection.

**Note:** The API automatically syncs between `accounts` and `users` collections to ensure compatibility.

---

### 6. `orders` (Legacy/Backward Compatibility)
This collection is maintained for backward compatibility. New orders should use the `receipts` collection.

**Note:** The API automatically syncs between `receipts` and `orders` collections to ensure compatibility.

---

## Data Flow

### Account Registration
1. User registers → Creates document in `accounts` collection
2. Also creates document in `users` collection (backward compatibility)
3. Returns account without password

### Order Creation
1. User creates order → Creates document in `receipts` collection
2. Generates unique `orderNumber`
3. Also creates document in `orders` collection (backward compatibility)
4. Adds receipt ID to `accounts.orderHistory`
5. Returns receipt with order number

### Tournament Registration
1. User registers for tournament → Adds participant to `tournaments.participants`
2. Adds tournament ID to `accounts.tournamentHistory`
3. Returns updated tournament

### Tournament Results
1. Player submits result → Updates `tournaments.rounds[].pairings[].result`
2. Updates participant statistics (wins, losses, draws, points)
3. Updates tournament `updatedAt` timestamp
4. Returns updated tournament

---

## Best Practices

1. **Always use ObjectId for references** - Use `new ObjectId(id)` when querying
2. **Index frequently queried fields** - All foreign keys and search fields are indexed
3. **Keep passwords secure** - Never return passwords in API responses
4. **Use timestamps** - Always include `createdAt` and `updatedAt`
5. **Validate data** - Server validates all required fields before saving
6. **Handle errors gracefully** - All endpoints return proper error messages

---

## Migration Notes

If you have existing data in `users` or `orders` collections:
- The API automatically reads from both old and new collections
- New data is saved to both collections for compatibility
- Consider migrating old data to new collections for better organization

---

## API Endpoints Summary

### Accounts
- `POST /api/users/register` - Create new account
- `POST /api/users/login` - Login to account
- `GET /api/users/:id` - Get account with populated history
- `GET /api/users` - Get all accounts (admin)

### Receipts
- `POST /api/orders` - Create new receipt
- `GET /api/orders` - Get all receipts (filter by accountId)
- `PUT /api/orders/:id/status` - Update receipt status

### Tournaments
- `GET /api/tournaments` - Get all tournaments
- `GET /api/tournaments/active` - Get active/upcoming tournaments
- `GET /api/tournaments/:id` - Get tournament by ID
- `POST /api/tournaments` - Create tournament
- `PUT /api/tournaments/:id` - Update tournament
- `DELETE /api/tournaments/:id` - Delete tournament
- `POST /api/tournaments/:id/register` - Register for tournament
- `POST /api/tournaments/:id/start` - Start tournament
- `POST /api/tournaments/:id/rounds/:roundNumber/results` - Submit match result
- `POST /api/tournaments/:id/next-round` - Generate next round

### Products
- `GET /api/products` - Get all products (with pagination, search, filter)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/categories` - Get all categories
