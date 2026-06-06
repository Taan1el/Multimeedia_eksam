# Moodul 4 tehnoloogia ja valikud

## Node.js ja Express

Node.js võimaldab kasutada JavaScripti ka serveris. Express hoiab route'id ja
middleware'id lihtsad ning sobib selle projekti mahu jaoks hästi.

Express vastutab lehtede, vormide, autentimise, admini API ja veatöötluse eest.
Rakenduse loomine on eraldatud serveri käivitamisest, et Supertest saaks sama
rakendust testida ilma eraldi pordita.

## SQLite ja better-sqlite3

SQLite ei vaja eraldi andmebaasiserverit. See sobib lokaalseks eksamiprojektiks,
sest kogu andmebaas asub ühes failis.

`better-sqlite3` kasutab sünkroonset ja selget API-t. Repository-kihi päringud
on ette valmistatud ning kasutaja sisendit ei liideta SQL-stringi sisse. Samas
andmebaasis hoitakse kohvisorte, sündmusi, tellimusi, kasutajaid ja sessioone.

## Nunjucks

Nunjucks renderdab HTML-i serveris. Navigeerimine, footer, kaardid ja layout on
eraldi mallides, seega ei pea sama HTML-i igal lehel kopeerima. Automaatne
escaping jääb sisse.

## Vite, Tailwind CSS ja kohalikud fondid

Vite ehitab brauseri CSS-i ja JavaScripti. Tailwind on kasutusel koos projekti
enda disainitokenite ning põhistiilidega.

Fraunces, DM Sans ja Space Mono on repos WOFF2 failidena. Mobiilis kasutatakse
esialgsel laadimisel süsteemifonte. Server lisab ehitatud CSS-i otse HTML-i ning
gzipib vastused.

## GSAP ja ScrollTrigger

GSAP juhib sektsioonide ilmumist ja hero kerimisanimatsiooni. Motion-moodul
laaditakse alles esimese tegevuse järel. `prefers-reduced-motion` korral seda ei
laadita ning mobiilis jäetakse hero-video ära.

## Autentimine ja sessioonid

Paroolid räsitakse bcryptiga. `express-session` hoiab sisselogimise olekut ning
projekti enda SQLite store salvestab sessioonid andmebaasi. Küpsisel on
`HttpOnly`, `SameSite=Lax` ja piiratud eluiga.

## Vormid ja turvalisus

- `csrf-sync` lisab vormidele CSRF kaitse
- `express-validator` valideerib ja normaliseerib sisendi
- Helmet lisab turvapoliitikad ja HTTP päised
- `express-rate-limit` piirab tundlikke route'e
- productionis ei saadeta kasutajale sisemisi veadetaile
- `.env` hoiab sessiooni-, admini- ja SMTP seaded repost väljas

## E-post

Nodemailer saadab kontaktivormi kirja SMTP kaudu. Mailtrapi sandboxiga kontrolliti
tegelikku saatmisteed. Kui SMTP puudub, ei proovita välisele teenusele ühendust
luua ning arenduskeskkond kasutab fallback'i.

## Testid

Node'i test runner ja Supertest kontrollivad route'e, vorme, CSRF-i, autentimist,
CRUD-i ja veavastuseid eraldatud ajutise andmebaasiga.

Playwright kontrollib desktopi, tahvli ja mobiili vaateid. axe kontrollib WCAG
2.2 AA nõudeid ning html-validate kontrollib renderdatud HTML-i. Sama komplekt
käivitub GitHub Actionsis.

## Miks selline stack?

Projekt on piisavalt väike, et vältida keerukat infrastruktuuri, kuid sisaldab
päris backendi põhiosi: andmebaas, autentimine, sessioonid, valideerimine,
serveripoolsed vaated, e-post, testid ja turvapiirangud. Iga valitud teek täidab
konkreetset ülesannet ning seda saab kaitsmisel eraldi selgitada.
