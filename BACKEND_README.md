# Backend Server för Turneringsregistreringar

## Installation

1. Installera dependencies:
```bash
npm install
```

## Starta servern

För att starta backend-servern, kör:
```bash
npm run server
```

Servern kommer att köra på `http://localhost:3001`

## API Endpoints

### GET /api/tournament/registrations
Hämtar alla registreringar.

### POST /api/tournament/register
Registrerar en ny deltagare.

**Request body:**
```json
{
  "firstName": "Förnamn",
  "lastName": "Efternamn",
  "email": "email@example.com"
}
```

### DELETE /api/tournament/registrations/:id
Tar bort en registrering med angivet ID.

## Data

Registreringar sparas i `data/tournament-registrations.json`.

## Viktigt

- Backend-servern måste köras för att formuläret och admin-sidan ska fungera.
- Starta både frontend (`npm run dev`) och backend (`npm run server`) för full funktionalitet.
