# studio.leerzeile – Regeln für Claude

Demo-Shop **studio.leerzeile**: kleine Papeterie (Schreibwaren, Notizbücher, Ordnen, Geschenksets). Übungsprojekt; alle Produkte, Preise, Firmen- und Kundendaten sind erfunden. Konzept: `studio-leerzeile_Konzept-und-Anweisungen.md`.

## Dateiaufbau
- `website/index.html` – Startseite (Inhalt und Struktur)
- `website/ueber-uns.html` – Über uns
- `website/impressum.html`, `website/datenschutz.html` – nur Platzhalter
- `website/kategorie.html?id=SCH|NP|OA|SG` – Produkte einer Kategorie
- `website/produkt.html?id=ST-…` – Produktdetail mit Farbwahl (Varianten-SKU, Bestand)
- `website/warenkorb.html` – Warenkorb (nur im Browser gespeichert, keine Bestellung)
  (alle sieben Seiten teilen Kopf- und Fußbereich sowie `css/style.css`, `js/app.js`, `data/shopdaten.js`, `js/shop.js`;
  Änderungen an Kopf oder Fuß deshalb in allen Seiten vornehmen; `<body data-seite="…">` sagt shop.js, welche Seite es ist)
- `website/css/style.css` – Gestaltung (Farben, Schriften, Abstände, Handy-Ansicht)
- `website/js/app.js` – Verhalten (Menü-Schaltfläche am Handy, feststehende Kopfzeile)
- `website/js/shop.js` – Shop: Katalog lesen, Kategorie-/Produkt-/Warenkorbseite aufbauen, Warenkorb (localStorage), Bild-Ausschnitte und Alternativtexte je Produkt
- `website/data/shopdaten.js` – Katalog als `window.STUDIO_CATALOG` (Kopie von `daten/import/shopdaten.js`, nicht von Hand bearbeiten)
- `daten/` – Lieferpaket: **`daten/import/produkte.json` ist die führende Datenquelle**; `shopdaten.js` ist daraus abgeleitet. Bilder aus `daten/assets` werden **nicht** benutzt.
- `Logo/` – Logo-Dateien (im HTML eingebunden über `../Logo/…`)
- `Bilder/` – Bilder (im HTML `../Bilder/…`, in der CSS-Datei `../../Bilder/…`)
  - `Bilder/produkte-zugeschnitten/` – Produktbilder für die Seite, Dateiname = Artikelnummer (z. B. `ST-SCH-001.png`). **Diese verwenden, nicht `Bilder/produkte/`.**
  - `Bilder/kategorien-zugeschnitten/` – Kategoriebilder `sch.png`, `np.png`, `oa.png`, `sg.png` für die Kategoriekacheln der Startseite.
- `sicherung/index.html` – unveränderte Kopie des ersten Entwurfs
- `sicherung/stand-2026-11-25-vor-import/` – Stand von `website/` und `CLAUDE.md` vor dem Produktimport
- `Claude outputs/` – Farbvergleiche und Entwurfsbilder
- `studio-leerzeile_Konzept-und-Anweisungen.md` – Projektkonzept
- `werkzeuge/vorschau-server.js` – lokaler Vorschau-Server (Hilfswerkzeug für Claude, gehört nicht zur Website)
- `.claude/launch.json` – startet den Vorschau-Server (`http://localhost:8080/website/index.html`)

Die Ordner `Logo` und `Bilder` bleiben im Projektordner; Pfade nicht verändern.

## Gestaltung
- Farben mit festen Rollen:
  - Hintergrund `#FAFAF7`
  - Text und Überschriften `#161616`
  - Terrakotta `#B8441F` – **nur für Handlungen** (Buttons, Warenkorb, Links, Fokus)
  - Salbeigrün `#3D5C4B` – Labels, feine Linien, leise Texte
  - Zartes Salbei `#E7ECE5` – Flächen, Kacheln, Bildplatzhalter
- Funktions-Buttons (z. B. „In den Warenkorb“, „Zur Kollektion“): gefüllt in Terrakotta mit weißer Schrift. Nebenaktionen: umrandet in Terrakotta.
- Schriften: nur Systemschriften – Serife für Überschriften, Sans-Serif für Text und Bedienelemente. **Nichts von fremden Servern laden** (keine Schriften, Bilder, Skripte).
- Kontrast mindestens WCAG AA. Fließtext mindestens 16 px.
- Preise immer in Textfarbe `#161616`, nie in Terrakotta.
- Produkt- und Kategoriebilder einheitlich 4:3 mit `object-fit: cover`, randlos: `<div class="kachelbild-rahmen"><img class="kachelbild ausschnitt-…">`. Der Rahmen vergrößert das Bild um 3 %, damit die helle 1-px-Kante der Dateien nicht sichtbar ist. Motiv darf nicht abgeschnitten werden – Ausschnitt per Klasse wählen (`ausschnitt-mitte`, `ausschnitt-leicht-links`, `ausschnitt-links`, `ausschnitt-notizbuch`, `ausschnitt-unten`; Zuordnung je Produkt in `js/shop.js`) und jeden Zuschnitt auf Desktop und Handy prüfen. Jedes Bild braucht einen passenden Alternativtext. Bilddateien selbst nicht verändern.
- Im Fußbereich jeder Seite der dezente Hinweis „Produktbilder KI-generiert · Beispielbilder; Farben können abweichen.“ (klein, Salbeigrün). Auf der Produktseite zusätzlich unter dem Bild: ein Bild für alle Farbvarianten – nie so tun, als zeige das Foto die gewählte Farbe.
- Farbwahl: gewählte Farbe mit Ring in Textfarbe (kein Terrakotta), Farbfelder mindestens 44 px, Farbname immer auch als Text.
- Desktop (ab 901 px): Kopfzeile bleibt beim Scrollen oben stehen (Demo-Hinweis scrollt weg); das Logo führt auf der Startseite nach oben, auf Unterseiten zur Startseite. Am Handy scrollt die Kopfzeile normal mit.
- Desktop first gestaltet; die Handyansicht muss ansprechend und gut bedienbar sein:
  - unter 900 px Schaltfläche „Menü“, die die Navigation auf- und zuklappt; am Desktop ist die Navigation immer offen sichtbar
  - der Warenkorb bleibt immer sichtbar
  - ohne JavaScript bleibt die Navigation sichtbar
  - Tippflächen mindestens 44 px; bei 320 px Breite kein seitliches Scrollen

## Pflicht-Inhalte
- Preise immer mit „inkl. MwSt., zzgl. Versand“.
- Oben auf jeder Seite: „Demo-Shop: keine echten Bestellungen“.
- Impressum und Datenschutzerklärung nur als Platzhalter.
- Keine Bezahlfunktion. Keine echten Personendaten. Keine EAN/GTIN, keine echten Lieferanten.
- Bruttopreis ist führend; Netto = Brutto / 1,19 (auf 2 Stellen gerundet), MwSt. = Brutto − Netto. Kundinnen und Kunden sehen Bruttopreise.
- Warenkorb speichert pro Position Varianten-SKU, Farbe, Menge und Bruttopreis; Menge höchstens bis zum (Demo-)Bestand.
- Kein `fetch()` lokaler Dateien: Die Seiten müssen auch per Doppelklick (`file:///`) funktionieren.
- Passwörter und Schlüssel nur in `.env`, nie im Code oder im Chat.
- Kundinnen und Kunden mit „Sie“ ansprechen; Ton warm, ruhig, hochwertig, kurz.

## Arbeitsweise
- Auf Deutsch antworten.
- Vor Änderungen erst einen Plan zeigen; Änderungen danach kurz erklären.
- Git und GitHub nur auf meine Ansage (Commit, Push, Branches).
- Repository: `TaschaRa/studio_leerzeile` auf GitHub, **privat**, Branch `main`. Git-Identität nur für dieses Projekt: TaschaRa mit anonymer noreply-Adresse.
