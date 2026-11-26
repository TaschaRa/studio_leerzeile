// Erzeugt die 12 Produktseiten website/produkte/<slug_mit_unterstrich>.html aus daten/import/produkte.json.
// Hilfswerkzeug für Claude Code – gehört nicht zur Website.
//
// Start aus dem Projektordner:   node werkzeuge/produktseiten_erzeugen.js
// Immer neu ausführen, wenn sich in produkte.json Preise, Bestand, Texte oder Farben ändern.
// Die erzeugten Seiten nicht von Hand bearbeiten – Änderungen gehen beim nächsten Lauf verloren.
//
// Kopf- und Fußbereich werden aus website/impressum.html übernommen (Pfade um "../" ergänzt),
// damit sie mit den übrigen Seiten übereinstimmen.

'use strict';
const fs = require('fs');
const path = require('path');

const PROJEKT = path.resolve(__dirname, '..');
const WEB = path.join(PROJEKT, 'website');
const ZIEL = path.join(WEB, 'produkte');
const KATALOG = JSON.parse(fs.readFileSync(path.join(PROJEKT, 'daten', 'import', 'produkte.json'), 'utf8'));
const VORLAGE = fs.readFileSync(path.join(WEB, 'impressum.html'), 'utf8');
const NL = VORLAGE.includes('\r\n') ? '\r\n' : '\n';

// ---------- Hilfen ----------
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const cent = euro => Math.round(euro * 100);
const euroText = c => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(c / 100);
const seitenName = slug => String(slug).toLowerCase().replace(/-/g, '_') + '.html';
function fehler(text) { console.error('FEHLER: ' + text); process.exit(1); }

// Breite/Höhe einer PNG-Datei aus dem Dateikopf lesen (für width/height am <img>)
function pngGroesse(datei) {
  const b = fs.readFileSync(datei);
  if (b.toString('ascii', 1, 4) !== 'PNG') fehler(datei + ' ist keine PNG-Datei');
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}

// ---------- Vorlage: Kopf und Fuß aus impressum.html ----------
const mainAnfang = VORLAGE.indexOf('<main id="inhalt">');
const mainEnde = VORLAGE.indexOf('</main>');
if (mainAnfang < 0 || mainEnde < 0) fehler('<main> in impressum.html nicht gefunden');

// relative Pfade (href/src) eine Ebene tiefer: "css/…" → "../css/…", "../Logo/…" → "../../Logo/…"
function pfadeTiefer(html) {
  return html.replace(/\b(href|src)="([^"]*)"/g, (m, attr, wert) => {
    if (wert === '' || wert.startsWith('#') || /^[a-z]+:/i.test(wert) || wert.startsWith('/')) return m;
    return `${attr}="../${wert}"`;
  });
}

let kopf = pfadeTiefer(VORLAGE.slice(0, mainAnfang));
let fuss = pfadeTiefer(VORLAGE.slice(mainEnde + '</main>'.length));
// Seite bleibt auch im Dunkelmodus hell: color-scheme direkt nach dem viewport-Meta (falls die Vorlage es nicht schon hat)
if (!kopf.includes('<meta name="color-scheme" content="only light">')) {
  kopf = kopf.replace(/(<meta name="viewport"[^>]*>)/, '$1\n<meta name="color-scheme" content="only light">');
}
if (!kopf.includes('<meta name="color-scheme" content="only light">')) fehler('color-scheme-Meta konnte nicht eingefügt werden');
kopf = kopf.replace('<body data-seite="info">', '<body data-seite="produktseite" data-basis="../">');
if (!kopf.includes('data-seite="produktseite"')) fehler('<body data-seite="info"> in impressum.html nicht gefunden');
fuss = fuss.replace(' aria-current="page"', '');
// Produktseiten brauchen den Katalog nicht: shopdaten.js entfernen, shop.js bleibt
fuss = fuss.replace(/<script src="\.\.\/data\/shopdaten\.js"><\/script>\r?\n/, '');
if (fuss.includes('shopdaten.js')) fehler('shopdaten.js im Fußbereich nicht entfernbar');
if (!fuss.includes('<script src="../js/shop.js"></script>')) fehler('shop.js im Fußbereich nicht gefunden');

// ---------- Prüfen und erzeugen ----------
if (!fs.existsSync(ZIEL)) fs.mkdirSync(ZIEL);
const erzeugt = [];
const katName = id => (KATALOG.categories.find(k => k.id === id) || {}).name || fehler('Kategorie ' + id + ' fehlt');

for (const p of KATALOG.products.filter(x => x.active)) {
  const d = p.detail_page || {};
  const seite = seitenName(p.slug);
  if (!/^[a-z0-9_]+\.html$/.test(seite)) fehler(p.id + ': ungültiger Seitenname ' + seite);
  const preisCent = cent(p.price_gross_eur);
  if (!Number.isInteger(preisCent) || preisCent <= 0) fehler(p.id + ': ungültiger Preis');
  if (!p.variants || !p.variants.length) fehler(p.id + ': keine Farben');
  if (typeof p.description_einfach !== 'string' || !p.description_einfach.trim()) fehler(p.id + ': description_einfach fehlt in produkte.json');
  for (const v of p.variants) {
    if (!Number.isInteger(v.stock) || v.stock < 0) fehler(v.sku + ': ungültiger Bestand');
    if (cent(v.price_gross_eur) !== preisCent) fehler(v.sku + ': Variantenpreis weicht vom Produktpreis ab');
    if (!v.sku.startsWith(p.id + '-')) fehler(v.sku + ': SKU passt nicht zu ' + p.id);
  }
  const bilddatei = path.join(PROJEKT, 'Bilder', 'produkte-zugeschnitten', p.id + '.png');
  if (!fs.existsSync(bilddatei)) fehler(p.id + ': Bild fehlt (' + bilddatei + ')');
  const g = pngGroesse(bilddatei);

  const kat = katName(p.category_id);
  const erste = p.variants[0];
  const name = d.heading_h1 || p.name;

  const farbfelder = p.variants.map((v, i) => `              <label class="farbfeld" title="${esc(v.color)}">
                <input type="radio" name="farbe" value="${esc(v.sku)}" aria-label="${esc(v.color)}"
                       data-sku="${esc(v.sku)}" data-farbe="${esc(v.color)}" data-bestand="${v.stock}"${i === 0 ? ' checked' : ''}>
                <span class="farbpunkt" style="--farbe:${esc(v.color_hex)}" aria-hidden="true"></span>
              </label>`).join('\n');

  const technik = (d.technical_details || []).map(t =>
    `            <dt>${esc(t.name)}</dt><dd>${esc(t.value)}</dd>`).join('\n');

  const main = `<main id="inhalt">
  <div class="unterseite">
    <div class="inhalt">
      <nav class="brotkrumen" aria-label="Brotkrumen">
        <ol>
          <li><a href="../index.html">Startseite</a></li>
          <li><a href="../kategorie.html?id=${esc(p.category_id)}">${esc(kat)}</a></li>
          <li aria-current="page">${esc(name)}</li>
        </ol>
      </nav>

      <!-- Angaben für den Warenkorb (js/shop.js liest sie aus): erzeugt aus daten/import/produkte.json -->
      <div class="produkt-detail" data-produkt-id="${esc(p.id)}" data-name="${esc(p.name)}"
           data-preis-cent="${preisCent}" data-seite="${esc(seite)}">
        <div class="produkt-bild">
          <div class="kachelbild-rahmen">
            <img class="kachelbild" src="../../Bilder/produkte-zugeschnitten/${esc(p.id)}.png" width="${g.w}" height="${g.h}"
                 alt="${esc(d.image_alt || p.name)}">
          </div>
          <p class="bild-hinweis">${esc(d.image_color_note || 'Beispielbild – die abgebildete Farbe kann von der gewählten Variante abweichen.')} Produktabbildung KI-generiert.</p>
        </div>

        <div class="produkt-info">
          <p class="prod-kategorie"><a href="../kategorie.html?id=${esc(p.category_id)}">${esc(kat)}</a></p>
          <h1>${esc(name)}</h1>
          <p class="preis">${esc(euroText(preisCent))}</p>
          <p class="preishinweis">inkl. MwSt., zzgl. Versand</p>
          <p class="produkt-kurztext" data-einfach="${esc(p.description_einfach)}">${esc(d.short_description || p.description_short)}</p>
          <p class="produkt-text">${esc(d.long_description || p.description)}</p>

          <fieldset class="farbwahl">
            <legend>Farbe: <span class="farbname">${esc(erste.color)}</span></legend>
            <div class="farbfelder">
${farbfelder}
            </div>
          </fieldset>

          <div class="kaufzeile">
            <div class="mengenfeld">
              <label for="menge">Menge</label>
              <input id="menge" type="number" min="1" max="${Math.max(1, Math.min(10, erste.stock))}" value="1" inputmode="numeric">
            </div>
            <button class="knopf" type="button" id="in-den-warenkorb">${esc(d.call_to_action || 'In den Warenkorb')}</button>
          </div>
          <noscript><p class="kauf-status">Bitte aktivieren Sie JavaScript, um Artikel in den Warenkorb zu legen.</p></noscript>
          <p class="kauf-status" role="status"></p>

          <dl class="eckdaten">
            <dt>Artikelnummer</dt><dd class="sku">${esc(erste.sku)}</dd>
            <dt>Verfügbarkeit</dt><dd class="bestand-text">${erste.stock > 0 ? erste.stock + ' Stück auf Lager (Demo-Bestand)' : 'Derzeit nicht auf Lager'}</dd>
${technik}
            <dt>Versand</dt><dd data-einfach="Der Versand kostet 4,90 €. Ab einem Warenwert von 50 € ist der Versand kostenlos.">4,90 €, ab 50 € Warenwert versandkostenfrei</dd>
            <dt>Lieferzeit</dt><dd data-einfach="Die Lieferung dauert 2 bis 4 Werktage.">2–4 Werktage</dd>
            <dt>Rückgabe</dt><dd data-einfach="Sie können Artikel 30 Tage lang zurückgeben. Diese Regel ist nur ein Beispiel für den Übungs-Shop. Ihre Rechte aus dem Gesetz gelten immer.">30 Tage freiwillige Rückgabe (fiktive Demo-Angabe); Ihre gesetzlichen Verbraucherrechte bleiben unberührt.</dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
</main>`;

  let html = kopf + main + fuss;
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(name)} – studio.leerzeile</title>`);
  html = html.replace(/\r?\n/g, NL);
  fs.writeFileSync(path.join(ZIEL, seite), html, 'utf8');
  erzeugt.push(`${seite}  (${p.id}, ${euroText(preisCent)}, ${p.variants.map(v => v.sku.slice(-2) + ':' + v.stock).join(' ')})`);
}

// Nur eigene Dateien im Zielordner: übrige .html-Dateien melden (nicht löschen)
const fremde = fs.readdirSync(ZIEL).filter(f => f.endsWith('.html') && !erzeugt.some(e => e.startsWith(f + ' ')));
console.log(`${erzeugt.length} Produktseiten erzeugt in website/produkte/:`);
erzeugt.forEach(e => console.log('  ' + e));
if (fremde.length) console.log('Hinweis: nicht aus produkte.json stammende Dateien im Ordner: ' + fremde.join(', '));
