# Security Guidelines

## ⚠️ VIKTIGT: Skydd av känslig information

### .env-fil
- **ALDRIG** committa `.env`-filen till GitHub
- `.env` är redan i `.gitignore` och kommer INTE att committas
- Dela ALDRIG dina MongoDB-credentials publikt

### MongoDB Credentials
Dina MongoDB-credentials är känslig information:
- Username: `designfacesweden_db_user`
- Password: `SIsAb7vrekjNAk3g`

### Säkerhetsåtgärder

1. **Kontrollera .gitignore**
   ```bash
   # Verifiera att .env är i .gitignore
   cat .gitignore | grep .env
   ```

2. **Kontrollera git status**
   ```bash
   # .env ska INTE synas i git status
   git status
   ```

3. **Om .env redan är committad (OBS!):**
   ```bash
   # Ta bort från git history (om den redan committats)
   git rm --cached .env
   git commit -m "Remove .env from tracking"
   ```

4. **MongoDB Atlas säkerhet:**
   - Använd IP whitelisting i MongoDB Atlas
   - Begränsa till dina IP-adresser för produktion
   - Använd olika användare för utveckling och produktion
   - Rotera lösenord regelbundet

5. **För produktion:**
   - Använd miljövariabler på din hosting-plattform
   - Använd secrets management (t.ex. AWS Secrets Manager)
   - Aktivera MongoDB Atlas Network Access Rules

### Checklista innan commit

- [ ] `.env` är INTE i git status
- [ ] Inga lösenord i kod
- [ ] Inga API-nycklar i kod
- [ ] `.env.example` finns (utan riktiga credentials)
