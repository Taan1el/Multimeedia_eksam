# Slow Pour backend

Taaniel Vananurm, MM-23

Moodul 4 on Slow Pour kohviröstikoja Expressi rakendus. See kasutab Moodul 3
kujundust, kuid lehed renderdatakse serveris Nunjucksi mallidest ning andmed
tulevad SQLite andmebaasist.

## Funktsioonid

- avaleht, kohvisordid, detailleht, kontakt, tellimus ja footerilehed
- andmebaasist loetavad kohvid ja sündmuste vabade kohtade arv
- kohvisortide filtreerimine ja sortimine
- kontaktivormi e-kiri Nodemaileri kaudu
- tellimuste salvestamine andmebaasi
- admini registreerimine, sisselogimine ja kohvisortide CRUD
- SQLite sessioonid, mis säilivad serveri taaskäivitamisel
- hele ja tume teema, responsiivne menüü ning GSAP animatsioonid

## Käivitamine

```powershell
npm install
copy .env.example .env
npm run migrate
npm run dev
```

Rakendus avaneb aadressil `http://localhost:3004`.

Arenduskeskkonna algne admin:

```text
admin@slowpour.test
SlowPour123!
```

Need väärtused on ainult lokaalseks käivitamiseks. Enne avaldamist tuleb
serveri keskkonnamuutujates määrata uus `SESSION_SECRET`, `ADMIN_EMAIL` ja
`ADMIN_PASSWORD`.

## Testid

Kõik kontrollid saab käivitada ühe käsuga:

```powershell
npm run check
```

See teeb production buildi, käivitab integratsioonitestid, kontrollib lehti
Playwrighti ja axe'iga ning lõpetab `npm audit` kontrolliga.

Eraldi käsud:

```powershell
npm run test:integration
npm run test:browser
npm audit --audit-level=high
```

Viimase kohaliku kontrolli tulemused on failis
[`docs/testid-ja-kvaliteet.md`](docs/testid-ja-kvaliteet.md).

## Andmebaas

`npm run migrate` loob tabelid:

- `kohvisort`
- `event`
- `users`
- `orders`
- `sessions`

Seemneandmed on failis `src/db/seed.sql`. Vaikimisi andmebaas on
`data/slow-pour.sqlite`. Seda faili Gitti ei lisata.

Kõik andmebaasipäringud kasutavad ettevalmistatud SQL-lauseid ja parameetreid.

## Turvalisus

- bcrypt parooliräside jaoks
- serveripoolsed sessioonid SQLite'is
- CSRF tokenid vormidel ja olekut muutvatel päringutel
- Helmet ja piiratud Content Security Policy
- express-validator koos sisendi normaliseerimisega
- eraldi rate limit sisselogimisele, kontaktile, tellimusele ja admini API-le
- `HttpOnly` ja `SameSite=Lax` sessiooniküpsis
- saladused ainult `.env` failis või serveri keskkonnamuutujates
- productionis üldised veavastused ilma stack trace'ita

Rakendus ei paku `/cart` ega `/ostukorv` endpointi. Ostukorv jääb Moodul 3
front-endi funktsiooniks.

## E-post

SMTP seadistus loetakse `.env` failist. Kui SMTP-d pole määratud, kasutab
arenduskeskkond turvalist logimisfallback'i. Mailtrapi test ja ekraanipilt:

[`docs/mailtrap-test.md`](docs/mailtrap-test.md)

## Avaldamine

Repos olev `render.yaml` kirjeldab Renderi tasuta veebiteenust. Renderis tuleb
käsitsi lisada admini ja SMTP keskkonnamuutujad. Päris paroole ega SMTP võtmeid
repos ei ole.

Renderi tasuta failisüsteem ei ole püsiv. Kui backend peab productionis
andmeid üle taaskäivituste säilitama, vajab SQLite püsiketast või eraldi
andmebaasiteenust.

## Lisadokumendid

- [`docs/tehnoloogia-ja-valikud.md`](docs/tehnoloogia-ja-valikud.md)
- [`docs/testid-ja-kvaliteet.md`](docs/testid-ja-kvaliteet.md)
- [`docs/mailtrap-test.md`](docs/mailtrap-test.md)
