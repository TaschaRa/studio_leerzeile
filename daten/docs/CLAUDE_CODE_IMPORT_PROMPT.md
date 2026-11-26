# Entwicklungsauftrag für Claude Code – studio.leerzeile (Produktdaten)

Du arbeitest an meinem bestehenden Demo-Webshop **studio.leerzeile**.
Der vorhandene Projektordner liegt unter `C:\projekt\studio_leerzeile`, die Startseite unter `website\index.html`.

## Ziel

Integriere die bereitgestellten **12 Produkte, 36 Farbvarianten und vier Kategorien** samt Bildmaterial in den bestehenden Webshop. Ich möchte die Produktdaten im morgigen Unterricht demonstrieren. Bitte keine komplette Neuentwicklung und keine Änderung des vorhandenen Markenlayouts.

## Verbindliche Regeln

1. **Zuerst Projekt lesen und beschreiben, wie es aktuell strukturiert ist.** Bestehende Dateien, Verlinkungen, Styles und Warenkorbverhalten prüfen.
2. **Vor Änderungen Backup oder Git-Commit erstellen.** Dateiänderungen nachvollziehbar durchführen und jeden Schritt in der Vorschau testen.
3. Vorhandene Header, Hero-Bilder, Farben, Typografie, Texte und Sektionen **erhalten**, sofern nicht unbedingt zur Integration nötig.
4. **Bestehende Platzhalterbilder** in den vier Kategoriekarten und vier Bestsellerkarten durch die gelieferten Bilder ersetzen. Anschließend Produkt- und Kategoriezuordnung prüfen.
5. Nutze die Datei `import/produkte.json` als **führende strukturierte Datenbasis**; `import/shopdaten.js` ist die abgeleitete Dateiversion für den Browserbetrieb ohne Server.
6. Die Website wird derzeit lokal durch Öffnen von `index.html` genutzt. **Kein `fetch()` von lokalen JSON-Dateien voraussetzen**, wenn dadurch `file:///` nicht mehr funktioniert. Nutze bei Bedarf `website/data/shopdaten.js` mit `window.STUDIO_CATALOG`; ein späterer lokaler Server/Backend ist okay, aber nicht Voraussetzung für morgen.
7. Produkt-/Variante-IDs eindeutig halten:
   - Elternartikel beispielsweise `ST-SCH-001`
   - Varianten beispielsweise `ST-SCH-001-IV`, `ST-SCH-001-SG`, `ST-SCH-001-AN`.
8. Farbvariante auswählen = **eindeutige Varianten-SKU und Bestand** im Warenkorb speichern.
9. Der **Bruttopreis ist führend**; der Nettoeinzelpreis errechnet sich aus `Brutto / 1,19`, auf 2 Stellen gerundet. USt = Brutto - Netto. Endkunden im Shop Bruttopreis anzeigen.
10. Ein Produkt hat zunächst **nur ein KI-generiertes Musterbild für alle drei Farbvarianten**. Beim Farbwechsel NICHT so tun, als wäre das Foto bereits passend eingefärbt. Später können Variantenbilder ergänzt werden.
11. Transparenz dezent integrieren, z. B. `Produktabbildungen KI-generiert · Beispielbilder; Farben können abweichen.` unter dem Produktbereich oder im Footer.
12. **KEINE echten Bestellungen, Zahlungsanbieter, persönlichen Echtdaten, EAN/GTIN oder echten Lieferanten** einbinden.
13. Keine Änderungen an späteren Modulanforderungen (Datenbank, Login, KI-Assistent, Tracking), wenn sie morgen noch nicht notwendig sind. Vorhandenes nicht zerstören.

## Inhalte des Pakets

- `import/produkte.json`: Katalog mit Kategorien und Untervarianten.
- `import/shopdaten.js`: derselbe Katalog für die lokale Vorschau.
- `assets/products/ST-*.png`: Produktbilder (12).
- `assets/categories/*.png`: Kategorieansichten (4).
- `studio_leerzeile_Artikelliste.xlsx`: Datenkontrolle mit Preisformeln und Testfällen.
- `docs/README_START_HIER.md`: Kontext, Dateipfade und Grenzen.

Lege im Webordner idealerweise `assets/products`, `assets/categories` und `data/shopdaten.js` an. Passe die relativen Bildpfade so an, dass sie von `website/index.html` aus funktionieren.

## Erwartetes Ergebnis

- Vier Kategorie-Karten mit passenden Bildern und richtigen Produktzahlen.
- Vier Bestseller-Karten mit eigenen Produktbildern.
- 12 Produktdetail-Datensätze mit Name, Beschreibung, Bruttopreis, Bild, 3 Farben und Lagerstand (fiktiv).
- Warenkorb berücksichtigt Varianten-SKU, Menge, Bruttopreis.
- Alle Bilder erscheinen auch beim lokalen Öffnen von `index.html`.
- Responsive Design bleibt intakt.
- Am Ende bitte kurz berichten: geänderte Dateien, Funktionstests, offene Punkte.

Starte **mit einer Bestandsaufnahme** und schlage danach in maximal fünf Punkten die minimal nötigen Dateiänderungen vor, bevor du sie ausführst.
