# Testid ja kvaliteedikontroll

Viimane täielik kohalik kontroll: 6. juuni 2026.

## Automaatkontroll

Käsk:

```powershell
npm run check
```

Tulemus:

| Kontroll | Tulemus |
| --- | --- |
| Vite production build | läbitud |
| Integratsioonitestid | 7 / 7 läbitud |
| Playwrighti testid | 10 läbitud, 2 oodatult vahele jäetud |
| Desktopi motion-test | läbitud |
| WCAG 2.2 AA axe kontroll | rikkumisi ei leitud |
| HTML valideerimine | läbitud |
| `npm audit --audit-level=high` | 0 haavatavust |

Kaks vahele jäetud testi on sama desktopi hero-video test tahvli ja mobiili
projektides. Nendes vaadetes videot teadlikult ei laadita.

## Kaetud vood

- avalikud lehed ja 404 vastus
- andmebaasist loetavad sündmused ja vabad kohad
- kohvisortide filtrid ja sortimine
- kontaktivormi ja tellimuse valideerimine
- CSRF tagasilükkamine
- admini sisselogimine ja kaitstud route
- kohvisortide lisamine, muutmine ja kustutamine
- sessiooni säilimine
- SMTP fallback
- desktopi, tahvli ja mobiili overflow
- tume teema, mobiilimenüü ja vähendatud liikumine

Testid kasutavad ajutist SQLite andmebaasi ega muuda päris arendusandmeid.

## Lighthouse

Tehti kolm puhast mobiili- ja kolm desktopi mõõtmist.

| Vaade | Katse | Performance | Accessibility | Best Practices | SEO |
| --- | ---: | ---: | ---: | ---: | ---: |
| Mobiil | 1 | 100 | 100 | 100 | 100 |
| Mobiil | 2 | 100 | 100 | 100 | 100 |
| Mobiil | 3 | 100 | 100 | 100 | 100 |
| Desktop | 1 | 100 | 100 | 100 | 100 |
| Desktop | 2 | 100 | 100 | 100 | 100 |
| Desktop | 3 | 100 | 100 | 100 | 100 |

Mobiili esialgne laadimine on umbes 91 KB. Custom fonte ega hero-videot mobiili
esimesel laadimisel ei küsita. Mõõdetud CLS oli kõigis lõppkatsetes 0.

## Turvakontroll

Kontrolliti:

- ettevalmistatud ja parameetritega SQL-päringud
- bcrypt parooliräsid
- SQLite sessioonide aegumine
- CSRF kaitse
- rate limit tundlikel route'idel
- turvapäised ja Content Security Policy
- turvalised productioni veavastused
- `.env` ja SQLite failide puudumine Gitist
- `/cart` ja `/ostukorv` puudumine backendist

## Pidev kontroll

`.github/workflows/quality.yml` käivitab pushi ja pull requesti korral buildi,
integratsioonitestid, auditi ning Chromiumi Playwrighti testid.
