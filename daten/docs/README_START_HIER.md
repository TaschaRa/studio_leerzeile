# studio.leerzeile – Vorlesungspaket 26. November 2026

## Was ist enthalten?

| Datei / Ordner | Inhalt |
|---|---|
| `studio_leerzeile_Artikelliste.xlsx` | Alle Produktstammdaten, 36 Farbvarianten, Netto-/Bruttopreisformeln, Bilderübersicht, Testfälle und Einstellungen |
| `import/produkte.json` | Vollständiger maschinenlesbarer Katalog mit 4 Kategorien, 12 Produkten und je 3 Varianten |
| `import/shopdaten.js` | Derselbe Katalog als JS-Datei, nutzbar mit lokal geöffnetem `index.html` ohne JSON-`fetch()` |
| `import/produkte.csv` | Die 12 Elternartikel, UTF-8 mit Spaltenüberschriften |
| `import/varianten.csv` | Die 36 eigenständigen Varianten-SKUs |
| `import/kategorien.csv` | Alle vier Shop-Kategorien |
| `import/artikelliste_deutsch_semikolon.csv` | Deutsche CSV mit Semikolon und Dezimalkomma |
| `assets/products/` | 12 individuelle KI-generierte Demo-Produktbilder, `ST-...png` |
| `assets/categories/` | 4 Bilder für die derzeit leeren Kategorie-Karten |
| `Produktuebersicht_12_Artikel.png` | Visuelle Übersicht des Sortiments |
| `Kategorieansichten.png` | Vorschau der vier Kategorie-Karten |
| `docs/CLAUDE_CODE_IMPORT_PROMPT.md` | Fertiger Entwicklungsauftrag für Claude Code |

## Die wichtigsten Entscheidungen

- **Projekt:** studio.leerzeile, ausschließlich physische Schreibwaren/Papeterie, keine Downloads.
- **Produkte:** 12 Elternartikel in 4 Kategorien; je 3 Farbvarianten = **36 SKUs**.
- **Shoppreise:** Endkunden-**Bruttopreise** sind führend, Netto wird berechnet.
- **Umsatzsteuer:** für den Demokatalog 19 % Regelsteuersatz, vgl. §12 UStG: https://www.gesetze-im-internet.de/ustg_1980/__12.html
- **Bestände, EK-Preise, Lieferzeiten und Materialdaten sind erfundene Übungswerte.** Es gibt keine Lieferanten und keine echten Bestellungen.
- **Keine EAN/GTIN:** Solche Codes dürfen nicht erfunden und als echte Handelsnummern ausgegeben werden.
- **Musterbilder:** pro Produkt ein KI-generiertes Hauptbild. Das Bild zeigt eine Beispiel-Farbgebung und ändert sich bei anderen Farbvarianten noch nicht. Ein Hinweis dazu ist im Frontend sinnvoll.

## Vorschlag für deinen lokalen Projektordner

Du hast laut Screenshot die Website in `C:\projekt\studio_leerzeile\website\index.html`.

1. Sichere vorher den bestehenden Ordner beziehungsweise führe einen Git-Commit aus.
2. Kopiere den Inhalt von `assets/products/` nach `C:\projekt\studio_leerzeile\website\assets\products\`.
3. Kopiere `assets/categories/` nach `C:\projekt\studio_leerzeile\website\assets\categories\`.
4. Kopiere `import/shopdaten.js` nach `C:\projekt\studio_leerzeile\website\data\shopdaten.js`.
5. Kopiere `import/produkte.json` nach `C:\projekt\studio_leerzeile\website\data\produkte.json`.
6. Gib Claude Code den Inhalt aus `docs/CLAUDE_CODE_IMPORT_PROMPT.md` und lasse es zunächst **den vorhandenen Code prüfen**, bevor es etwas verändert.

### Warum gibt es JSON und JavaScript?

Dein Screenshot zeigt `index.html` als lokal geöffnete `file:///...`-Datei. Ein Browser kann `fetch('data/produkte.json')` in diesem Modus aus Sicherheitsgründen blockieren. Für die erste Vorlesung kann Claude Code deshalb die Datei `shopdaten.js` per normalem Script-Tag einbinden und `window.STUDIO_CATALOG` verwenden. Für spätere Datenbank-/Backend-Module kann dieselbe Datenstruktur über JSON oder eine Datenbank gepflegt werden.

**Nicht beide Datenformate gleichzeitig als getrennte, unabhängig bearbeitete Datenquellen verwenden.** Das JSON ist der führende Katalog; `shopdaten.js` wurde daraus abgeleitet.

## Preisberechnung (Beispiel)

Füllfederhalter „Signature“:
- Brutto: **59,90 €**
- Netto: **50,34 €**
- Enthaltene Umsatzsteuer (19 %): **9,56 €**
- Demo-EK netto: **23,50 €**
- Demo-Rohertrag netto vor weiteren Kosten: **26,84 €**

Formel: `Netto = RUNDEN(Brutto / 1,19; 2)` und `MwSt = Brutto - Netto`.
Bei deiner Website sollte für Privatkunden der **Bruttopreis** im Vordergrund stehen.

## Was morgen in der Vorlesung getestet werden kann

1. Eine Kategorie öffnen und auf die richtige Produktanzahl prüfen.
2. Produktdetailansicht mit Name, Preis, kurzer Beschreibung und KI-Bild.
3. Drei Farbfelder auswählen – die **Varianten-SKU** muss eindeutig wechseln.
4. Ein Produkt in den Warenkorb legen, Menge verändern und Produkt entfernen.
5. Warenwert und eventuelle Demo-Versandkosten kontrollieren.
6. Im Footer oder unter den Bildern dezent den Hinweis `Produktabbildungen KI-generiert · Demo` zeigen.

**Später gemäß Kursplan:** echte Datenspeicherung im Backend, Registrierungs-/Adminfunktionen, Demo-Bestellungen, Webanalyse, A/B-Test und KI-Geschenkberater.

## Gestaltungsvorgaben

Die bestehenden Seiten sollen möglichst unverändert bleiben:
- Schriftzug: `studio.leerzeile`, Claim `papier. ideen. lieblingsstücke.`
- Farben: Anthrazit `#22201D`, Salbeigrün `#3F5545`, Terrakotta `#A04E2F`, cremeweiß `#FAF8F4`.
- Hoher Weißraumanteil und ruhige Editorial-Fotografie.
- Keine zusätzlichen Animationen und keine Änderung der bestehenden Hero-Bilder für den Import.

Alle Medien und Daten sind ausschließlich für die Demowebsite erstellt.
