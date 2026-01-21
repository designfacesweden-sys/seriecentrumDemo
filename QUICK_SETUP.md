# 🚀 Snabbstart - MongoDB Setup

## Dina Credentials (REDAN KONFIGURERADE)

- **Username:** `designfacesweden_db_user`
- **Password:** `SIsAb7vrekjNAk3g`

## Steg 1: Hämta kluster-URL från MongoDB Atlas

1. Gå till [MongoDB Atlas](https://cloud.mongodb.com)
2. Klicka på ditt kluster
3. Klicka "Connect"
4. Välj "Connect your application"
5. Kopiera URL:en (ser ut som: `cluster0.xxxxx.mongodb.net`)

## Steg 2: Skapa .env-fil

Kör detta kommando:

```bash
npm run setup-env
```

Eller skapa manuellt en `.env`-fil med:

```env
MONGODB_URI=mongodb+srv://designfacesweden_db_user:SIsAb7vrekjNAk3g@<DITT-KLUSTER-URL>/seriecentrum?retryWrites=true&w=majority
PORT=3001
NODE_ENV=development
```

**Ersätt `<DITT-KLUSTER-URL>`** med ditt kluster-URL!

## Steg 3: Installera & Starta

```bash
# Installera dependencies
npm install

# Starta servern
npm run server
```

## ✅ Kontrollera att det fungerar

Du bör se:
```
✅ Ansluten till MongoDB
📊 Database: seriecentrum
✅ Indexes skapade
🚀 Server körs på http://localhost:3001
📊 Database: ✅ Connected
```

## 🔒 Säkerhet

- ✅ `.env` är i `.gitignore` - kommer INTE att committas
- ✅ Dina credentials är säkra
- ⚠️  Dela ALDRIG `.env`-filen eller credentials publikt

## 🆘 Felsökning

**"MongoDB URI inte konfigurerad"**
→ Skapa `.env`-filen (se steg 2)

**"Authentication failed"**
→ Kontrollera användarnamn/lösenord i MongoDB Atlas

**"Connection timeout"**
→ Lägg till din IP i MongoDB Atlas "Network Access"

**"ENOTFOUND"**
→ Kontrollera kluster-URL i `.env`

---

📖 Läs mer: `SETUP_INSTRUCTIONS.md` eller `SECURITY.md`
