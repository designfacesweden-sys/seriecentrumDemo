# Tournament Setup Guide

## Why No Tournaments Are Showing

The website shows "Inga aktiva turneringar för tillfället" (No active tournaments) because:

1. **No tournaments have been created yet** - You need to create tournaments in the admin panel
2. **Backend server is not running** - The API needs to be running to fetch tournaments
3. **Tournament has wrong status** - Only tournaments with status `upcoming`, `active`, or `started` are shown

## How to Create a Tournament

### Step 1: Start the Backend Server

Make sure the backend server is running:

```bash
npm run server
```

Or if you have a different script:

```bash
node server.js
```

The server should start on `http://localhost:3000` (or port 3001 if using Vite proxy).

### Step 2: Access Admin Panel

1. Go to `http://localhost:5173/admin` (or your frontend URL)
2. Enter password: `Thomas123!`
3. Navigate to "Turneringar" in the sidebar

### Step 3: Create a Tournament

1. Click the "+ Ny turnering" button
2. Fill in the required fields:
   - **Namn** (Name): e.g., "Lorwyn Eclipsed Prerelease"
   - **Startdatum** (Start Date): Select a future date
   - **Format**: Choose from dropdown (e.g., "Sealed", "Draft")
   - **Starttid** (Start Time): e.g., "11:00"
   - **Kostnad** (Cost): e.g., 395
   - **Max antal spelare** (Max Players): e.g., 24
   - **Tid per runda** (Time per Round): e.g., 50 minutes

3. Optional fields:
   - **Beskrivning** (Description)
   - **Plats** (Location) - defaults to SerieCentrum address
   - **Regler** (Rules)
   - **Priser** (Prizes) - Add prizes for 1st, 2nd, 3rd place, etc.

4. Click "Skapa" (Create)

### Step 4: Verify Tournament Status

When you create a tournament, it automatically gets status `upcoming`, which means it will appear on the website.

**Tournament Statuses:**
- `upcoming` - Tournament is created but not started (SHOWN on website)
- `active` - Tournament is active (SHOWN on website)
- `started` - Tournament has started (SHOWN on website)
- `finished` - Tournament is completed (NOT shown on website)

### Step 5: Check the Website

1. Go to `http://localhost:5173/fnm-turneringar`
2. You should now see your tournament listed
3. Users can click on it to see details and register

## Troubleshooting

### No tournaments showing after creation

1. **Check backend is running:**
   ```bash
   curl http://localhost:3000/api/tournaments/active
   ```
   Should return JSON array (empty `[]` if no tournaments)

2. **Check tournament status:**
   - Go to admin panel → Turneringar
   - Verify the tournament has status "Kommande" (upcoming)

3. **Check browser console:**
   - Open browser DevTools (F12)
   - Check Console tab for errors
   - Check Network tab to see if API call is successful

4. **Check database:**
   - Verify MongoDB connection is working
   - Check that tournaments collection exists
   - Verify tournament document has correct status field

### Backend not connecting to database

1. Check `.env` file has correct MongoDB URI:
   ```
   MONGODB_URI=mongodb+srv://designfacesweden_db_user:SIsAb7vrekjNAk3g@seriecentrum.g5xkl5d.mongodb.net/?appName=SerieCentrum
   ```

2. Check server logs for connection errors

3. Verify MongoDB Atlas network access allows your IP

## Quick Test

To quickly test if everything works:

1. Create a test tournament in admin panel
2. Set date to tomorrow
3. Set status should be "upcoming" automatically
4. Check website - tournament should appear
5. Click on tournament - should show details
6. Try registering (will need to create account first)

## Next Steps

After creating a tournament:
1. Users can register for it
2. When you have at least 2 participants, you can "Starta" (Start) the tournament
3. Once started, rounds and pairings will be created
4. Players can submit results
5. Standings will be calculated automatically
