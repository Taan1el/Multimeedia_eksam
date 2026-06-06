# Multimeedia eksam: Slow Pour

Taaniel Vananurm, MM-23

Lõpurepo ühendab Slow Pour eksamitöö neli moodulit. Repo juures olevad HTML- ja
asset-failid moodustavad GitHub Pagesis töötava front-endi. Moodulite lähtekood
asub kaustas `moodulid/`.

## Sisu

- `index.html` ja teised HTML-failid: GitHub Pagesi build
- `assets/`: buildi JavaScript, fondid, pildid ja muud veebifailid
- `moodulid/moodul1`: veebikujunduse materjalid
- `moodulid/moodul2`: genereeritud pildid, promptid ja optimeeritud failid
- `moodulid/moodul3`: front-endi lähtekood
- `moodulid/moodul4`: Expressi backend, andmebaas, testid ja dokumentatsioon
- `moodulid/*.zip`: moodulite pakendatud versioonid
- `repo-lingid.txt`: repode ja avaliku lehe lingid

## Lähtekood ja build

Moodul 3 on front-endi põhiallikas. Moodul 4 kasutab sama visuaalset süsteemi,
kuid renderdab andmed ja vormid serveris. Lõpurepo ei ole eraldi kolmas
lähtekood, vaid nende moodulite peegel koos Pagesi buildiga.

Korduv sünkroonimine:

```powershell
node scripts/sync-exam.mjs
```

Skript:

1. kopeerib Moodul 3 ja Moodul 4 Gitis jälgitavad failid lõpureposse;
2. käivitab Moodul 3 production buildi;
3. uuendab root HTML-faile ja `assets/` kausta.

Skript ei loo ZIP-faile. Need tehakse uuesti alles lõpliku esitamise ajal.

## Kontrollitud kvaliteet

Moodul 4 sisaldab integratsiooni-, brauseri-, ligipääsetavuse ja HTML-i teste.
Viimase kontrolli tulemused:

[`moodulid/moodul4/docs/testid-ja-kvaliteet.md`](moodulid/moodul4/docs/testid-ja-kvaliteet.md)

Kohalikud lõppkontrollid andsid kolmel mobiili- ja kolmel desktopi Lighthouse
mõõtmisel igas kategoorias tulemuseks 100.

## Lingid

- GitHub Pages: https://taan1el.github.io/Multimeedia_eksam/
- repode täielik nimekiri: [`repo-lingid.txt`](repo-lingid.txt)
