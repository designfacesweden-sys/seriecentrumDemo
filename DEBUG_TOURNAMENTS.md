# Debug Guide: Turneringar visas inte

## Steg 1: Kontrollera portar

**Problem:** Vite proxy och server måste använda samma port.

1. **Kontrollera server.js:**
   - Öppna `server.js`
   - Leta efter `const PORT = process.env.PORT || 3000;`
   - Servern kör på port **3000**

2. **Kontrollera vite.config.js:**
   - Öppna `vite.config.js`
   - Proxy ska peka på `http://localhost:3000` (inte 3001)

## Steg 2: Verifiera att servern körs

Öppna en ny terminal och kör:
```bash
curl http://localhost:3000/api/tournaments/active
```

Du bör få tillbaka JSON (antingen en tom array `[]` eller en array med turneringar).

Om du får ett fel:
- Servern körs inte → Starta med `npm run server`
- Fel port → Kontrollera PORT i server.js

## Steg 3: Kontrollera turneringens status

Turneringar visas bara om de har status:
- `upcoming`
- `active`
- `started`

Turneringar med status `finished` visas INTE.

**Kontrollera i admin panelen:**
1. Gå till `/admin/tournament`
2. Kolla turneringens status
3. Om status är "Avslutad" (finished), ändra till "Kommande" (upcoming)

## Steg 4: Kontrollera browser console

1. Öppna webbplatsen i webbläsaren
2. Öppna Developer Tools (F12)
3. Gå till "Console" tab
4. Leta efter felmeddelanden
5. Gå till "Network" tab
6. Ladda om sidan
7. Leta efter `/api/tournaments/active` request
8. Klicka på den och kolla:
   - Status code (ska vara 200)
   - Response (ska vara JSON array)

## Steg 5: Testa API direkt

Öppna i webbläsaren:
```
http://localhost:3000/api/tournaments/active
```

Du bör se JSON med turneringar.

## Steg 6: Kontrollera MongoDB

Om inga turneringar returneras, kontrollera databasen:

1. **Kontrollera att MongoDB är ansluten:**
   - Kolla server logs när du startar servern
   - Du bör se: "✅ Ansluten till MongoDB"

2. **Kontrollera turneringar i databasen:**
   - Gå till MongoDB Atlas
   - Öppna din databas
   - Kolla `tournaments` collection
   - Verifiera att turneringar finns och har rätt status

## Vanliga problem och lösningar

### Problem: "Cannot GET /api/tournaments/active"
**Lösning:** Servern körs inte eller på fel port

### Problem: Tom array `[]` returneras
**Lösning:** 
- Inga turneringar finns i databasen, eller
- Alla turneringar har status `finished`

### Problem: CORS error
**Lösning:** Kontrollera att CORS är aktiverat i server.js

### Problem: Proxy error
**Lösning:** 
- Kontrollera att vite.config.js proxy pekar på rätt port
- Starta om både dev server och backend server

## Snabb fix

Om inget fungerar, prova detta:

1. **Stoppa båda servrarna** (Ctrl+C)

2. **Uppdatera vite.config.js:**
   ```js
   proxy: {
     '/api': {
       target: 'http://localhost:3000',
       changeOrigin: true,
       secure: false
     }
   }
   ```

3. **Starta backend först:**
   ```bash
   npm run server
   ```
   Vänta tills du ser: "✅ Ansluten till MongoDB"

4. **Starta frontend i ny terminal:**
   ```bash
   npm run dev
   ```

5. **Testa API direkt:**
   Öppna: `http://localhost:3000/api/tournaments/active`

6. **Kontrollera turneringens status i admin panelen**
