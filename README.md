# Seriecentrum - React Webbshop

Modern React-applikation för Seriecentrum, Sveriges sydligaste seriebutik.

## Teknologi

- **React 18** - UI-bibliotek
- **Vite** - Build tool och dev server
- **React Router** - Navigation och routing
- **Vanilla CSS** - Styling (behåller originaldesign)

## Installation

1. Installera dependencies:
```bash
npm install
```

2. Starta utvecklingsserver:
```bash
npm run dev
```

3. Öppna webbläsaren på `http://localhost:3000`

## Build för produktion

```bash
npm run build
```

Byggda filer hamnar i `dist/` mappen.

## Projektstruktur

```
seriecentrumDemo/
├── public/
│   ├── images/          # Alla bilder
│   └── products.json    # Produktdata
├── src/
│   ├── components/      # React-komponenter
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   ├── pages/          # Sidor
│   │   ├── Home.jsx
│   │   ├── Shop.jsx
│   │   ├── Product.jsx
│   │   ├── Contact.jsx
│   │   └── FAQ.jsx
│   ├── context/        # React Context
│   │   └── CartContext.jsx
│   ├── App.jsx         # Huvudapplikation
│   ├── main.jsx        # Entry point
│   └── styles.css      # Globala styles
├── package.json
└── vite.config.js
```

## Funktioner

- ✅ Produktkatalog med sök och filter
- ✅ Produktdetaljsida
- ✅ Varukorg (localStorage)
- ✅ Responsiv design (desktop & mobil)
- ✅ React Router navigation
- ✅ Hero carousel på startsidan

## Noteringar

- Alla scraping-relaterade Python-filer har tagits bort
- Gamla HTML/JS-filer har tagits bort
- `products.json` och `images/` behålls för produktdata
