# Snabb Fix: Inga turneringar visas

## Problemet
API:et returnerar 200 OK men 0 turneringar. Detta betyder att antingen:
1. Inga turneringar finns i databasen
2. Turneringarna har fel status

## Lösning

### Steg 1: Kolla backend-terminalen
När du laddar sidan, kolla backend-terminalen. Du bör se:
```
[GET /api/tournaments/active] Found X visible tournaments
[DEBUG] Total tournaments in database: X
[DEBUG] Tournament 1: "Namn" - Status: "upcoming" - ID: ...
```

**Om du ser "Total tournaments in database: 0":**
→ Inga turneringar finns. Gå till steg 2.

**Om du ser turneringar men "Found 0 visible tournaments":**
→ Turneringarna har fel status. Gå till steg 3.

### Steg 2: Skapa en turnering
1. Gå till: `http://localhost:5173/admin/tournament`
2. Klicka "+ Ny turnering"
3. Fyll i:
   - Namn: "Test Turnering"
   - Startdatum: Välj framtida datum
   - Format: Välj något
4. Klicka "Skapa"
5. Status ska automatiskt bli "upcoming"

### Steg 3: Kontrollera status
1. I admin-panelen, kolla turneringens status
2. Status måste vara:
   - "Kommande" (upcoming) ✅
   - "Aktiv" (active) ✅
   - "Pågår" (started) ✅
3. Om status är "Avslutad" (finished) → Ändra till "Kommande"

### Steg 4: Testa direkt
Öppna i webbläsaren:
```
http://localhost:3001/api/tournaments
```

Detta visar ALLA turneringar. Om du ser turneringar här men inte på `/api/tournaments/active`, har de fel status.

### Steg 5: Kontrollera MongoDB
1. Gå till MongoDB Atlas
2. Öppna databasen "seriecentrum"
3. Kolla collection "tournaments"
4. Verifiera att turneringar finns
5. Kontrollera "status" fältet - ska vara "upcoming", "active", eller "started"

## Snabb test
1. Skapa ny turnering i admin
2. Kolla backend logs - ska visa "Found 1 visible tournaments"
3. Ladda om webbplatsen
4. Turneringen ska nu visas!
