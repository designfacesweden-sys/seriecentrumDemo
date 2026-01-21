# Snabbstart Guide - MongoDB Atlas Setup

## Steg-för-steg Installation

### 1. Installera Dependencies

```bash
npm install
```

### 2. Skapa MongoDB Atlas-konto

1. Gå till: https://www.mongodb.com/cloud/atlas/register
2. Skapa ett GRATIS konto
3. Följ instruktionerna i `MONGODB_SETUP.md`

### 3. Skapa .env-fil

Skapa en `.env` fil i projektets rotmapp:

```bash
cp .env.example .env
```

Redigera `.env` och lägg till din MongoDB connection string:

```env
MONGODB_URI=mongodb+srv://ditt-användarnamn:ditt-lösenord@cluster0.xxxxx.mongodb.net/seriecentrum?retryWrites=true&w=majority
PORT=3001
NODE_ENV=development
```

### 4. Starta Servern

```bash
npm run server
```

Du bör se:
```
✅ Ansluten till MongoDB
🚀 Server körs på http://localhost:3001
📊 Database: ✅ Connected
```

### 5. Testa API:et

Öppna en ny terminal och testa:

```bash
# Health check
curl http://localhost:3001/api/health

# Skapa en produkt
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Produkt",
    "price": 99.99,
    "category": "Serier",
    "description": "En testprodukt",
    "stock": 10
  }'
```

## Databasstruktur

### Collections (Tabeller)

1. **products** - Alla produkter
   - name, description, price, category, image, stock
   - Indexerat på: name, category

2. **users** - Användarkonton
   - email, name, phone
   - Indexerat på: email (unique)

3. **orders** - Beställningar
   - userId, items, total, shippingAddress, status
   - Indexerat på: userId, createdAt

4. **tournament_registrations** - Turneringsregistreringar
   - firstName, lastName, email, registeredAt

## API Endpoints

### Produkter
- `GET /api/products` - Hämta alla produkter (med pagination)
- `GET /api/products/:id` - Hämta en produkt
- `POST /api/products` - Skapa produkt
- `PUT /api/products/:id` - Uppdatera produkt
- `DELETE /api/products/:id` - Ta bort produkt
- `GET /api/products/categories` - Hämta alla kategorier

### Användare
- `GET /api/users` - Hämta alla användare
- `POST /api/users` - Skapa användare

### Beställningar
- `GET /api/orders` - Hämta alla beställningar
- `POST /api/orders` - Skapa beställning
- `PUT /api/orders/:id/status` - Uppdatera beställningsstatus

### Turneringar
- `GET /api/tournament/registrations` - Hämta registreringar
- `POST /api/tournament/register` - Registrera till turnering
- `DELETE /api/tournament/registrations/:id` - Ta bort registrering

## Gratis Tier Begränsningar

MongoDB Atlas M0 (Free):
- ✅ 512 MB storage
- ✅ Delad RAM
- ✅ Upp till 1000 användare
- ✅ Upp till 50,000 produkter
- ✅ Obegränsat antal beställningar
- ⚠️ Ingen automatisk backup
- ⚠️ Begränsad prestanda (men tillräckligt för utveckling)

## Felsökning

### "Database not available"
- Kontrollera att MongoDB Atlas-klustret är igång
- Verifiera connection string i `.env`
- Kontrollera att din IP är whitelistad i MongoDB Atlas

### "Authentication failed"
- Kontrollera användarnamn och lösenord i connection string
- Se till att databasanvändaren har rätt behörigheter

### Connection timeout
- Kontrollera nätverksanslutning
- Verifiera att IP-adressen är whitelistad i MongoDB Atlas

## Nästa Steg

1. Uppdatera admin-panelen för att använda MongoDB API:et
2. Skapa produktformulär i admin-panelen
3. Implementera användarhantering
4. Lägg till beställningshantering
