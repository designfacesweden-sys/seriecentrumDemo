# Debug: Varför visas inga turneringar?

## Steg 1: Kontrollera backend logs

När du gör en request till `/api/tournaments/active`, kolla backend-terminalen. Du bör se:

```
[GET /api/tournaments/active] Found X visible tournaments
[DEBUG] Total tournaments in database: X
[DEBUG] Tournament 1: "Turneringsnamn" - Status: "upcoming" - ID: ...
```

## Steg 2: Testa API direkt

Öppna i webbläsaren:
```
http://localhost:3001/api/tournaments
```

Detta visar ALLA turneringar oavsett status. Du bör se JSON med turneringar.

## Steg 3: Kontrollera turneringens status

1. Gå till admin panelen: `http://localhost:5173/admin/tournament`
2. Kolla turneringens status
3. Status ska vara en av:
   - "Kommande" (upcoming) ✅ VISAS
   - "Aktiv" (active) ✅ VISAS  
   - "Pågår" (started) ✅ VISAS
   - "Avslutad" (finished) ❌ VISAS INTE

## Steg 4: Kontrollera MongoDB

Om inga turneringar visas i admin-panelen heller:

1. Gå till MongoDB Atlas
2. Öppna din databas "seriecentrum"
3. Kolla collection "tournaments"
4. Verifiera att turneringar finns där
5. Kontrollera att de har ett "status" fält

## Steg 5: Skapa en ny turnering

Om inga turneringar finns:

1. Gå till `/admin/tournament`
2. Klicka "+ Ny turnering"
3. Fyll i:
   - Namn: "Test Turnering"
   - Startdatum: Välj ett framtida datum
   - Format: Välj något (t.ex. "Sealed")
4. Klicka "Skapa"
5. Status ska automatiskt bli "upcoming"

## Steg 6: Kontrollera backend logs efter skapande

När du skapar en turnering, kolla backend-terminalen. Du bör se:
```
Tournament created with status: upcoming
```

## Vanliga problem

### Problem: "Total tournaments in database: 0"
**Lösning:** Inga turneringar finns i databasen. Skapa en i admin-panelen.

### Problem: "Status: undefined"
**Lösning:** Turneringen saknar status-fält. Ta bort och skapa en ny.

### Problem: "Status: finished"
**Lösning:** Turneringen är avslutad och visas inte. Ändra status till "upcoming" i admin-panelen.

### Problem: Query returnerar tom array trots att turneringar finns
**Lösning:** Kontrollera att status-fältet är exakt "upcoming", "active", eller "started" (inte "Upcoming" med stor bokstav).

## Snabb test

1. Skapa en ny turnering i admin
2. Kolla backend logs - ska visa "Found 1 visible tournaments"
3. Ladda om webbplatsen
4. Turneringen ska nu visas
