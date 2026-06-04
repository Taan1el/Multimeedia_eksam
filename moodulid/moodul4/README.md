# Slow Pour backend

Taaniel Vananurm MM-23

Moodul 4 sisaldab Slow Pour kohviröstikoja custom back-endi. Rakendus kasutab
Node.js, Expressi, SQLite andmebaasi ja Nunjucksi vaateid.

## Sisu

- avaleht, kohvisortide leht, detailleht, kontaktivorm ja tellimusleht
- admini sisselogimine
- kohvisortide lisamine, muutmine ja kustutamine
- SQLite andmebaasi migratsioon ja seemneandmed
- kontaktivormi ja tellimusvormi POST route'id
- turvakiht: bcrypt, sessioonid, CSRF, Helmet, serveripoolne valideerimine

## Paigaldus

```powershell
npm install
copy .env.example .env
npm run migrate
npm run dev
```

Rakendus käivitub aadressil:

```text
http://localhost:3004
```

Admini vaikimisi kasutaja arenduskeskkonnas:

```text
admin@slowpour.test
SlowPour123!
```

Enne avalikku kasutust tuleb `.env` failis muuta `SESSION_SECRET`,
`ADMIN_EMAIL` ja `ADMIN_PASSWORD`.

## Andmebaas

Migratsioon loob tabelid:

- `kohvisort`
- `users`
- `orders`

Seemneandmed asuvad failis `src/db/seed.sql`. Andmebaas luuakse vaikimisi
kausta `data/slow-pour.sqlite`, mida Gitti ega zipi ei lisata.

## Git

Repo link on failis `git-link.txt`.
