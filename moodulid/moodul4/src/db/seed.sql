-- Slow Pour — kohvisort seed data (Module 4)
-- Portable SQL (works with SQLite / MySQL / PostgreSQL with minor type tweaks).

CREATE TABLE IF NOT EXISTS kohvisort (
  id            INTEGER PRIMARY KEY,
  nimi          TEXT    NOT NULL,
  paritolu      TEXT    NOT NULL,
  rostitase     TEXT    NOT NULL,
  maitseprofiil TEXT    NOT NULL,   -- comma-separated tasting notes
  hind          REAL    NOT NULL,
  kaal          TEXT    NOT NULL,
  kirjeldus     TEXT    NOT NULL,
  pilt          TEXT
);

INSERT INTO kohvisort (id, nimi, paritolu, rostitase, maitseprofiil, hind, kaal, kirjeldus, pilt) VALUES
(1, 'Aeglane Hommik',     'Etioopia, Yirgacheffe',       'Hele',          'õistaim, sidrun, mesi',                 13.50, '250 g', 'Erefilmijaama oad Yirgacheffe mägedelt. Õrn ja lilleline, sidruse särtsuga. Parim käsitsi valatuna (V60).', 'coffee-light.webp'),
(2, 'Laisa Päeva Blend',  'Brasiilia + Colombia',        'Keskmine',      'šokolaad, sarapuupähkel, karamell',     12.00, '250 g', 'Meie igapäevane lemmik. Tasakaalukas, magus ja ümar — sobib nii espressoks kui filtriks.', 'coffee-medium.webp'),
(3, 'Öine Valss',         'Sumatra, Mandheling',         'Tume',          'tumešokolaad, tubakas, vürtsid',        13.00, '250 g', 'Täidlane ja tugev Sumatra. Madal hapsus, sügav keha. Tumeda šokolaadi ja vürtside noodid.', 'coffee-dark.webp'),
(4, 'Lavendli Tilk',      'Guatemala, Huehuetenango',    'Keskmine-hele', 'õie noodid, mandel, pruun suhkur',      14.50, '250 g', 'Meie allkirjaröst. Õrnad õienoodid ja mandlimagusus, kerge ja puhas.', 'coffee-light.webp'),
(5, 'Päikeseloojang',     'Keenia, Nyeri (AA)',          'Keskmine',      'mustsõstar, tomat, sidrunhape',         15.00, '250 g', 'Keenia AA elavus: ergas mustsõstar ja mahlakas hapsus. Särav ja keeruline.', 'coffee-medium.webp'),
(6, 'Vaikne Tund',        'Peruu, Cajamarca (mahe)',     'Hele',          'õun, pruun suhkur, pähkel',             13.50, '250 g', 'Mahe Peruu kõrgmäestiku oad. Pehme, magus ja kerge — õuna ja pähkli noodid.', 'coffee-light.webp'),
(7, 'Sügav Uni',          'India, Monsooned Malabar',    'Tume',          'maamuld, kakao, madal hapsus',          12.50, '250 g', 'Monsooned Malabar, küps ja maine. Peaaegu hapsuseta, kakao ja maamulla sügavus.', 'coffee-dark.webp'),
(8, 'Esimene Vihm',       'Costa Rica, Tarrazú',         'Keskmine',      'apelsin, kakao, karamell',              14.00, '250 g', 'Costa Rica Tarrazú elegants: apelsini särtsakus ja karamelli magusus tasakaalus.', 'coffee-medium.webp');
