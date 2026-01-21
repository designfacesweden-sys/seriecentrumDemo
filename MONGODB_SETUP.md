# MongoDB Atlas Setup Guide

## Steg 1: Skapa MongoDB Atlas-konto

1. Gå till [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Klicka på "Try Free" eller "Sign Up"
3. Fyll i dina uppgifter och skapa ett konto
4. Verifiera din e-postadress

## Steg 2: Skapa ett kluster (Cluster)

1. Efter inloggning kommer du till "Deploy a Cloud Database"
2. Välj **FREE** tier (M0 Sandbox)
3. Välj en Cloud Provider (AWS, Google Cloud, eller Azure)
4. Välj en region nära dig (t.ex. Stockholm för bästa prestanda)
5. Klicka på "Create Cluster"
6. Detta tar 3-5 minuter att skapa

## Steg 3: Skapa en databasanvändare

1. När klustret är klart, gå till "Database Access" i vänstermenyn
2. Klicka på "Add New Database User"
3. Välj "Password" som autentiseringsmetod
4. Ange ett användarnamn och lösenord (SPARA DETTA!)
5. Under "Database User Privileges", välj "Atlas admin" eller "Read and write to any database"
6. Klicka på "Add User"

## Steg 4: Whitelist din IP-adress

1. Gå till "Network Access" i vänstermenyn
2. Klicka på "Add IP Address"
3. För utveckling, klicka på "Allow Access from Anywhere" (0.0.0.0/0)
   - **OBS:** För produktion bör du bara tillåta specifika IP-adresser
4. Klicka på "Confirm"

## Steg 5: Hämta Connection String

1. Gå till "Database" i vänstermenyn
2. Klicka på "Connect" på ditt kluster
3. Välj "Connect your application"
4. Välj "Node.js" som driver och version (4.1 eller senare)
5. Kopiera connection string (ser ut ungefär så här):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Ersätt `<username>` och `<password>` med dina inloggningsuppgifter

## Steg 6: Skapa .env-fil

Skapa en `.env` fil i projektets rotmapp:

```env
MONGODB_URI=mongodb+srv://ditt-användarnamn:ditt-lösenord@cluster0.xxxxx.mongodb.net/seriecentrum?retryWrites=true&w=majority
PORT=3001
NODE_ENV=development
```

## Steg 7: Installera dependencies

```bash
npm install mongodb dotenv
```

## Gratis Tier Begränsningar (M0)

- **512 MB storage** - Räckvidd för ~50,000 produkter + 1000 användare + beställningar
- **Shared RAM** - Delad resurs med andra användare
- **Ingen backup** - Men du kan exportera data manuellt
- **Begränsad prestanda** - Men tillräckligt för utveckling och små projekt

## Tips för att optimera

1. **Indexera vanliga sökningar** - Lägg till index på produktnamn, kategori, etc.
2. **Använd projektion** - Hämta bara de fält du behöver
3. **Paginering** - Dela upp stora listor i sidor
4. **Caching** - Cache ofta använda data i frontend

## Nästa steg

Efter att du har skapat kontot och fått connection string, uppdatera `.env`-filen och starta servern!
