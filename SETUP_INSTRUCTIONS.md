# Snabb Setup - MongoDB Atlas

## Dina MongoDB Credentials

- **Username:** `designfacesweden_db_user`
- **Password:** `SIsAb7vrekjNAk3g`

## Steg 1: Hämta ditt kluster-URL

1. Logga in på [MongoDB Atlas](https://cloud.mongodb.com)
2. Gå till ditt kluster
3. Klicka på "Connect"
4. Välj "Connect your application"
5. Kopiera kluster-URL:en (ser ut som: `cluster0.xxxxx.mongodb.net`)

## Steg 2: Skapa .env-fil

### Alternativ A: Använd setup-skriptet (Rekommenderat)

```bash
npm run setup-env
```

Följ instruktionerna och ange ditt kluster-URL.

### Alternativ B: Skapa manuellt

Skapa en fil som heter `.env` i projektets rotmapp med följande innehåll:

```env
# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://designfacesweden_db_user:SIsAb7vrekjNAk3g@<DITT-KLUSTER-URL>/seriecentrum?retryWrites=true&w=majority

# Server Port
PORT=3001

# Environment
NODE_ENV=development
```

**Ersätt `<DITT-KLUSTER-URL>`** med ditt faktiska kluster-URL (t.ex. `cluster0.xxxxx.mongodb.net`)

## Steg 3: Verifiera säkerhet

Kontrollera att `.env` INTE kommer att committas:

```bash
git status
```

`.env` ska INTE synas i listan!

## Steg 4: Installera dependencies

```bash
npm install
```

## Steg 5: Starta servern

```bash
npm run server
```

Du bör se:
```
✅ Ansluten till MongoDB
🚀 Server körs på http://localhost:3001
📊 Database: ✅ Connected
```

## Felsökning

### "Authentication failed"
- Kontrollera att användarnamn och lösenord är korrekt i `.env`
- Verifiera att användaren har rätt behörigheter i MongoDB Atlas

### "Connection timeout"
- Kontrollera att din IP-adress är whitelistad i MongoDB Atlas
- Gå till "Network Access" i MongoDB Atlas och lägg till din IP

### "Database not available"
- Kontrollera att klustret är igång i MongoDB Atlas
- Verifiera connection string-formatet

## Säkerhet

- ✅ `.env` är redan i `.gitignore`
- ✅ Credentials kommer INTE att committas till GitHub
- ⚠️  Dela ALDRIG dina credentials publikt
- ⚠️  Använd IP whitelisting i MongoDB Atlas för produktion

Läs mer i `SECURITY.md`
