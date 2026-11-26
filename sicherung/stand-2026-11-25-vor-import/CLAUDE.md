# studio.leerzeile – Regeln für Claude

Demo-Shop **studio.leerzeile**: kleine Papeterie (Schreibwaren, Notizbücher, Ordnen, Geschenksets). Übungsprojekt; alle Produkte, Preise, Firmen- und Kundendaten sind erfunden. Konzept: `studio-leerzeile_Konzept-und-Anweisungen.md`.

## Dateiaufbau
- `website/index.html` – Startseite (Inhalt und Struktur)
- `website/ueber-uns.html` – Über uns
- `website/impressum.html`, `website/datenschutz.html` – nur Platzhalter
  (alle Seiten teilen Kopf- und Fußbereich sowie `css/style.css` und `js/app.js`;
  Änderungen an Kopf oder Fuß deshalb in allen vier Seiten vornehmen)
- `website/css/style.css` – Gestaltung (Farben, Schriften, Abstände, Handy-Ansicht)
- `website/js/app.js` – Verhalten (Menü-Schaltfläche am Handy)
- `Logo/` – Logo-Dateien (im HTML eingebunden über `../Logo/…`)
- `Bilder/` – Bilder (im HTML `../Bilder/…`, in der CSS-Datei `../../Bilder/…`)
  - `Bilder/produkte-zugeschnitten/` – Produktbilder für die Seite, Dateiname = Artikelnummer (z. B. `ST-SCH-001.png`). **Diese verwenden, nicht `Bilder/produkte/`.**
  - Kategoriekacheln zeigen das Bild des ersten Produkts der Kategorie (`…-001`).
- `sicherung/index.html` – unveränderte Kopie des ersten Entwurfs
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
- Produkt- und Kategoriebilder einheitlich 4:3 mit `object-fit: cover`, randlos: `<div class="kachelbild-rahmen"><img class="kachelbild ausschnitt-…">`. Der Rahmen vergrößert das Bild um 3 %, damit die helle 1-px-Kante der Dateien nicht sichtbar ist. Motiv darf nicht abgeschnitten werden – Ausschnitt per Klasse wählen (`ausschnitt-mitte`, `ausschnitt-notizbuch`, `ausschnitt-unten`) und jeden Zuschnitt auf Desktop und Handy prüfen. Jedes Bild braucht einen passenden Alternativtext. Bilddateien selbst nicht verändern.
- Im Fußbereich jeder Seite der dezente Hinweis „Produktbilder KI-generiert“ (klein, Salbeigrün).
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
- Keine Bezahlfunktion. Keine echten Personendaten.
- Passwörter und Schlüssel nur in `.env`, nie im Code oder im Chat.
- Kundinnen und Kunden mit „Sie“ ansprechen; Ton warm, ruhig, hochwertig, kurz.

## Arbeitsweise
- Auf Deutsch antworten.
- Vor Änderungen erst einen Plan zeigen; Änderungen danach kurz erklären.
- Git und GitHub nur auf meine Ansage.
