# Guide: Importera Produkter till MongoDB

## Steg 1: Säkerställ att servern körs

```bash
npm run server
```

Servern måste köra för att importen ska fungera.

## Steg 2: Kör import-skriptet

I en **ny terminal**, kör:

```bash
npm run import-products
```

Detta kommer att:
1. Läsa alla produkter från `products.json`
2. Gruppera produkter med samma namn
3. Extrahera kategorier från URL:er och namn
4. Konvertera priser från "10Kr" till nummer
5. Importera till MongoDB
6. Skapa index för snabbare sökningar

## Vad som händer

- **Deduplicering**: Produkter med samma namn grupperas
- **Kategorier**: Extraheras automatiskt från URL:er eller produktnamn
- **Conditions**: Olika skick (Very Good, Fine, Good) sparas i `availableConditions`
- **Priser**: Konverteras från "10Kr" till nummer (10)
- **Lager**: Beräknas från alla tillgängliga conditions

## Efter importen

1. **Butiken** kommer automatiskt att hämta produkter från MongoDB
2. **Admin-panelen** kan användas för att skapa/redigera/ta bort produkter
3. **Kategorier** kommer att visas korrekt

## Felsökning

### "MONGODB_URI saknas"
→ Kontrollera att `.env`-filen finns och innehåller `MONGODB_URI`

### "Connection failed"
→ Kontrollera att MongoDB Atlas-klustret är igång
→ Verifiera att din IP är whitelistad i MongoDB Atlas

### "products.json not found"
→ Kontrollera att `products.json` finns i projektets rotmapp

## Kategorier som skapas

- **Serietidningar** - Fantomen, Donald, Kalle, etc.
- **Seriealbum** - Album och samlingar
- **Magic: The Gathering** - MTG-produkter
- **PVC Figurer** - Figurer
- **Brädspel** - Brädspel
- **Serier** - Standardkategori för övrigt

## Uppdatera produkter

Efter importen kan du:
- Lägga till nya produkter via admin-panelen
- Redigera befintliga produkter
- Ta bort produkter
- Alla ändringar sparas i MongoDB
