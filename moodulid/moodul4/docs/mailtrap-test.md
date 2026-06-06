# Mailtrapi test

Kontaktivormi e-kirjade saatmist testiti Mailtrapi sandboxiga. Rakendus kasutab
Nodemailerit ja loeb SMTP seadistuse `.env` failist. SMTP parooli ega muid
saladusi Gitti ei lisata.

Testi eesmärk oli kontrollida, et kontaktivormi `POST /kontakt` route võtab
vormiandmed vastu ja saadab kirja välise SMTP teenuse kaudu.

## Tõendus

Lisa siia ekraanipilt Mailtrapi sandboxist pärast testkirja saatmist:

```text
docs/assets/mailtrap-kontaktivorm.png
```

Ekraanipildil peaks olema näha:

- Mailtrapi sandbox
- kirja pealkiri `Slow Pour kontaktivorm`
- saatja `Slow Pour <no-reply@slowpour.test>`
- saaja `tere@slowpour.ee`
- testkirja sisu

## Kasutatud seadistus

```env
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=...
SMTP_PASS=...
CONTACT_TO=tere@slowpour.ee
CONTACT_FROM="Slow Pour <no-reply@slowpour.test>"
```

`SMTP_USER` ja `SMTP_PASS` on päris projektis ainult lokaalses `.env` failis või
serveri keskkonnamuutujates.
