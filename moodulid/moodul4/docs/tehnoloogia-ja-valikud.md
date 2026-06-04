# Moodul 4 tehnoloogia ja valikud

See fail selgitab, milliseid tehnoloogiaid Slow Pour back-endis kasutatakse ja miks need valitud said.

## Node.js

Node.js on JavaScripti käituskeskkond serveris. Valisin selle, sest sama keele loogikat saab kasutada nii front-endi kui ka back-endi poolel. See teeb projekti lihtsamaks ja kiiremaks hallata.

## Express

Express on Node.js veebiraamistik. See sobib hästi väikese ja keskmise suurusega veebirakenduse back-endiks, sest route'id, middleware'id ja vormide töötlemine on lihtsad ning loetavad.

Selles projektis kasutab Express:

- autentimise route'e
- kohvisortide API route'e
- kontaktivormi POST route'i
- sessioone
- turvalisuse middleware'e

## better-sqlite3

better-sqlite3 on SQLite andmebaasi teek Node.js jaoks. SQLite sobib eksamiprojekti jaoks, sest see ei vaja eraldi andmebaasiserverit ja andmebaas asub ühes failis.

Valiku põhjused:

- lihtne paigaldada ja käivitada
- sobib väikese kohvirostikoja andmete jaoks
- lihtne lisada andmebaasi dump või fail lõppväljundisse
- toetab parameetritega päringuid

Projektis kasutatakse parameetritega SQL-päringuid, mitte stringide kokkuliitmist. See vähendab SQL injection riski.

## Nunjucks

Nunjucks on mallimootor HTML-vaadete jaoks. See sobib Moodul 4 jaoks, sest Moodul 3 HTML/CSS/JS on tõlgendatud back-endi vaadeteks ja korduvad osad saab hoida eraldi mallides.

Projektis on Nunjucksi vaadetena olemas:

- avaleht
- kohvisortide leht
- detailleht
- kontaktivorm
- tellimusleht
- admini vaated

## bcrypt

bcrypt on paroolide turvaliseks räsimiseks. Paroole ei salvestata andmebaasi tavatekstina. Registreerimisel salvestatakse ainult parooli räsi.

See on vajalik, sest eksami back-endi osas hinnatakse turvalisust.

## express-session

express-session hoiab kasutaja sisselogimise olekut serveri sessioonis. Seda kasutatakse admini kaitstud route'ide jaoks.

Kui kasutaja ei ole sisse logitud, siis kaitstud route'id tagastavad veateate.

## helmet

Helmet lisab Express rakendusele turvalisuse HTTP päiseid. See aitab vähendada tavalisi veebiturbe riske.

## CSRF kaitse

Projektis kasutatakse CSRF kaitset, et vormipäringud vajaksid kehtivat tokenit. See aitab vältida olukorda, kus teine veebileht saadab kasutaja nimel vormipäringu.

## express-validator

express-validator kontrollib sisendvälju enne andmebaasi või maileri kasutamist.

Näited:

- e-post peab olema korrektne
- parool peab olema piisavalt pikk
- kohvisordi nimi ei tohi olla tühi
- hind peab olema number
- kontaktivormi sõnum peab olema piisava pikkusega

## dotenv

dotenv loeb seaded `.env` failist. Päris `.env` faili ei panda Giti.

Näited:

- sessiooni saladus
- andmebaasi asukoht
- SMTP andmed
- port

Repos on ainult `.env.example`, et näidata, millised muutujad on vajalikud.

## nodemailer

Nodemailer on kontaktivormi e-kirjade saatmiseks. Praegu on route stub kujul: arenduskeskkonnas logitakse kontaktivormi sisu konsooli, produktsioonis saab seadistada SMTP andmed `.env` failis.

## Kokkuvõte

Valitud stack on lihtne, loetav ja sobib eksami nõuetega:

- Node.js + Express server
- SQLite andmebaas
- Nunjucks vaated hilisemaks Moodul 3 tõlkimiseks
- bcrypt parooliräsideks
- sessioonid admini sisselogimiseks
- CSRF, Helmet ja validatsioon turvalisuseks
- dotenv saladuste hoidmiseks väljaspool Giti
- nodemailer kontaktivormi jaoks
