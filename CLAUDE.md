# studio.leerzeile – Regeln für Claude

Demo-Shop **studio.leerzeile**: kleine Papeterie (Schreibwaren, Notizbücher, Ordnen, Geschenksets). Übungsprojekt; alle Produkte, Preise, Firmen- und Kundendaten sind erfunden. Konzept: `studio-leerzeile_Konzept-und-Anweisungen.md`.

## Dateiaufbau
- `website/index.html` – Startseite (Inhalt und Struktur)
- `website/ueber-uns.html` – Über uns
- `website/impressum.html`, `website/datenschutz.html` – nur Platzhalter
- `website/kategorie.html?id=SCH|NP|OA|SG` – Produkte einer Kategorie
- `website/produkte/<seitenname>.html` – 12 Produktseiten mit Farbwahl, **erzeugt** von `werkzeuge/produktseiten_erzeugen.js` aus `daten/import/produkte.json` (Seitenname = Slug klein, „-“ → „_“, z. B. `fuellfederhalter_signature.html`; der Slug in `produkte.json` bleibt unverändert). Nicht von Hand bearbeiten.
- `website/warenkorb.html` – Warenkorb (nur im Browser gespeichert, keine Bestellung)
  (alle Seiten teilen Kopf- und Fußbereich sowie `css/style.css`, `js/app.js`, `js/shop.js`; die Produktseiten übernehmen Kopf und Fuß beim Erzeugen aus `impressum.html`.
  Änderungen an Kopf oder Fuß deshalb in allen Seiten in `website/` vornehmen und danach die Produktseiten neu erzeugen. `<body data-seite="…">` sagt shop.js, welche Seite es ist; Produktseiten haben zusätzlich `data-basis="../"`.)
- `website/css/style.css` – Gestaltung (Farben, Schriften, Abstände, Handy-Ansicht)
- `website/js/app.js` – Verhalten (Menü-Schaltfläche am Handy, feststehende Kopfzeile)
- `website/js/shop.js` – Shop: Warenkorb (localStorage), Produktseiten (liest data-Attribute), Startseite und Kategorieseiten (lesen den Katalog), Bild-Ausschnitte und Alternativtexte der Kacheln
- `website/data/shopdaten.js` – Katalog als `window.STUDIO_CATALOG` (Kopie von `daten/import/shopdaten.js`, nicht von Hand bearbeiten). **Nur noch von Startseite und Kategorieseite geladen**; Produktseiten und Warenkorb brauchen ihn nicht.
- `werkzeuge/produktseiten_erzeugen.js` – erzeugt die Produktseiten (`node werkzeuge/produktseiten_erzeugen.js` im Projektordner)
- `daten/` – Lieferpaket: **`daten/import/produkte.json` ist die führende Datenquelle**; `shopdaten.js` ist daraus abgeleitet. Bilder aus `daten/assets` werden **nicht** benutzt.
- **Keine Excel-Dateien im Projekt.** Produktdaten liegen in `daten/import/produkte.json`, ab dem 10.12. in einer Datenbank. (`*.xlsx`, `*.xls`, `*.xlsm` stehen in der `.gitignore`.)
- `Logo/` – Logo-Dateien (im HTML eingebunden über `../Logo/…`)
- `Logo/favicon/` – Favicon-Dateien (im `<head>` aller Seiten eingebunden)
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

**Dateinamen:** Neue Dateien klein, ohne Leerzeichen, mit Unterstrich statt Bindestrich (Wunsch des Dozenten), z. B. `produktseiten_erzeugen.js`. Bestehende Dateien bleiben unverändert.

**Produktseiten und Katalog:** Name, Farbe, SKU, Preis in Cent und Bestand stehen als data-Attribute in den Produktseiten (`data-produkt-id`, `data-name`, `data-preis-cent`, `data-seite` am Produkt; `data-sku`, `data-farbe`, `data-bestand` an jeder Farbe). Ändern sich Preise, Bestand, Texte oder Farben in `produkte.json`, die Seiten mit `node werkzeuge/produktseiten_erzeugen.js` neu erzeugen (und `shopdaten.js` nach `website/data/` kopieren).

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
- Die Seite bleibt auch im dunklen Modus hell (`color-scheme: only light`): `<meta name="color-scheme" content="only light">` direkt nach dem viewport-Meta in jeder Seite (Produktseiten über `werkzeuge/produktseiten_erzeugen.js`), `color-scheme: light` in der `html`-Regel; **keine eigenen Dunkel-Farben** (kein `prefers-color-scheme: dark`).
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
- Versand- und Rückgabeaussagen überall gleich (Demo-Angaben, Ansprache „Sie“):
  - Versand 4,90 €, ab 50 € Warenwert versandkostenfrei (Werte wie `shop_policies_demo` im Katalog; im Warenkorb **fest in `js/shop.js`** – ändern sie sich im Katalog, dort von Hand nachziehen, ebenso 19 % MwSt.)
  - Lieferzeit 2–4 Werktage
  - 30 Tage freiwillige Rückgabe (fiktive Demo-Angabe); gesetzliche Verbraucherrechte bleiben unberührt
- Oben auf jeder Seite: „Demo-Shop: keine echten Bestellungen“.
- Impressum und Datenschutzerklärung nur als Platzhalter.
- Keine Bezahlfunktion. Keine echten Personendaten. Keine EAN/GTIN, keine echten Lieferanten.
- Bruttopreis ist führend; Netto = Brutto / 1,19 (auf 2 Stellen gerundet), MwSt. = Brutto − Netto. Kundinnen und Kunden sehen Bruttopreise.
- Kein `fetch()` lokaler Dateien: Die Seiten müssen auch per Doppelklick (`file:///`) funktionieren.

## Warenkorb
- Speicher (`localStorage`, Schlüssel `studio-leerzeile-warenkorb`) erst beim ersten Hinzufügen anlegen; ist der Warenkorb leer, den Eintrag ganz löschen (`removeItem`), nie `[]` speichern.
- Nur Artikel speichern (`sku`, `produkt_id`, `name`, `farbe`, `preis_cent`, `bestand`, `seite`, `menge`) – **keine Personendaten**, keine Eingabefelder für Namen oder Adressen. Der Warenkorb braucht keinen Katalog: Link aus `seite`, Bild aus `produkt_id`.
- `hinzufuegen(artikel, menge)` mit `artikel = { sku, produkt_id, name, farbe, preis_cent, bestand, seite }`; ungültige Werte (z. B. Preis keine ganze Zahl in Cent, `seite` nicht klein mit Unterstrich und `.html`) werden ohne Fehler abgelehnt. Produktseiten befüllen `artikel` aus ihren data-Attributen, Startseite/Kategorieseiten aus dem Katalog.
- Geld immer in ganzen **Cent** rechnen (Warenwert, Versand, Gesamtsumme, MwSt.); Katalogpreise einmal mit `Math.round(preis * 100)` umwandeln, erst bei der Anzeige in Euro (de-DE, z. B. „114,80 €“). Einträge ohne vollständige Angaben (z. B. ältere Formate ohne `bestand`/`seite` oder mit `preis_brutto`) und unlesbare Einträge werden beim Lesen ohne Fehler verworfen.
- Menge je Artikel 1 bis 10, nie über den (Demo-)Bestand; Buttons „−“/„+“ mit verständlichem `aria-label`, Tippflächen mindestens 44 px.
- Rückmeldungen (Hinzufügen, Menge, Entfernen, Bestellung) als Statusmeldung mit `role="status"`, damit Screenreader sie vorlesen.
- „Demo-Bestellung absenden“ zeigt nur eine Bestätigung und leert den Warenkorb – nichts wird bestellt oder bezahlt.
- Bei `pageshow` (z. B. Zurück-Taste) Zähler und Warenkorb neu aus dem Speicher lesen.
- Passwörter und Schlüssel nur in `.env`, nie im Code oder im Chat.
- Kundinnen und Kunden mit „Sie“ ansprechen; Ton warm, ruhig, hochwertig, kurz.

## Arbeitsweise
- Auf Deutsch antworten.
- Vor Änderungen erst einen Plan zeigen; Änderungen danach kurz erklären.
- Git und GitHub nur auf meine Ansage (Commit, Push, Branches).
- Repository: `TaschaRa/studio_leerzeile` auf GitHub, **privat**, Branch `main`. Git-Identität nur für dieses Projekt: TaschaRa mit anonymer noreply-Adresse.
