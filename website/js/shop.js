/* studio.leerzeile – Shop: Katalog, Warenkorb und Darstellung
   Datenquelle: data/shopdaten.js (window.STUDIO_CATALOG). Führend ist daten/import/produkte.json;
   shopdaten.js ist daraus abgeleitet und wird hier nur gelesen, nie verändert.
   Der Warenkorb liegt nur in diesem Browser (localStorage) – Demo, keine Bestellung, keine Zahlung.
   Funktioniert auch beim direkten Öffnen der Datei (file:///), weil nichts per fetch() geladen wird. */
(function () {
  'use strict';

  var KATALOG = window.STUDIO_CATALOG;
  if (!KATALOG || !KATALOG.products) return;

  var SPEICHER_SCHLUESSEL = 'studio-leerzeile-warenkorb';
  var MWST_SATZ = KATALOG.vat_rate || 0.19;
  var BILD_HINWEIS = 'Beispielbild – die abgebildete Farbe kann von der gewählten Variante abweichen.';

  /* Bilder: die zugeschnittenen Dateien, Pfad aus der Artikelnummer abgeleitet
     (die Pfade "assets/…" in den Daten bleiben unverändert und werden hier nicht benutzt). */
  function produktBild(id) { return '../Bilder/produkte-zugeschnitten/' + id + '.png'; }

  /* 4:3-Ausschnitt je Motiv, damit nichts Wichtiges abgeschnitten wird (siehe css: .ausschnitt-…) */
  var AUSSCHNITT = {
    'ST-SCH-001': 'ausschnitt-mitte',
    'ST-SCH-002': 'ausschnitt-leicht-links',
    'ST-SCH-003': 'ausschnitt-mitte',
    'ST-SCH-004': 'ausschnitt-mitte',
    'ST-NP-001': 'ausschnitt-notizbuch',
    'ST-NP-002': 'ausschnitt-notizbuch',
    'ST-NP-003': 'ausschnitt-links',
    'ST-NP-004': 'ausschnitt-links',
    'ST-OA-001': 'ausschnitt-unten',
    'ST-OA-002': 'ausschnitt-mitte',
    'ST-SG-001': 'ausschnitt-unten',
    'ST-SG-002': 'ausschnitt-unten'
  };

  /* Alternativtexte beschreiben das gezeigte Beispielbild */
  var ALT = {
    'ST-SCH-001': 'Weißer Füllfederhalter mit goldener Feder in Nahaufnahme',
    'ST-SCH-002': 'Weißer Kugelschreiber mit goldenem Clip und goldener Spitze',
    'ST-SCH-003': 'Weißer Rollerball mit goldfarbener Spitze auf hellem Papier',
    'ST-SCH-004': 'Stifte-Etui aus terrakottafarbenem Leder mit goldenem Druckknopf',
    'ST-NP-001': 'Notizbuch mit hellem Leineneinband und terrakottafarbenem Gummiband',
    'ST-NP-002': 'Salbeigrünes Journal mit goldener Prägung „Daily Moments“',
    'ST-NP-003': 'Wochenplaner-Block mit Spalten für Montag bis Sonntag und To-do-Bereich',
    'ST-NP-004': 'Schreibtischblock „Focus“ mit Feldern für Prioritäten, Termine und Notizen',
    'ST-OA-001': 'Cremefarbene Dokumentenmappe mit goldenem Druckknopf',
    'ST-OA-002': 'Salbeigrüner Ringordner mit Leinenbezug und Rückenetikett',
    'ST-SG-001': 'Geschenkbox mit terrakottafarbenem Etui, weißem Stift und hellem Notizbuch',
    'ST-SG-002': 'Geschenkbox mit weißem Füllfederhalter, terrakottafarbenem Journal und Karten-Set'
  };

  /* ---------- Hilfsfunktionen ---------- */
  var euroFormat = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
  function euro(betrag) { return euroFormat.format(betrag); }
  function runden(x) { return Math.round(x * 100) / 100; }
  /* Brutto ist führend: Netto = Brutto / 1,19 (gerundet), MwSt. = Brutto – Netto */
  function nettoAus(brutto) { return runden(brutto / (1 + MWST_SATZ)); }

  function produktLink(id) { return 'produkt.html?id=' + encodeURIComponent(id); }
  function kategorieLink(id) { return 'kategorie.html?id=' + encodeURIComponent(id); }
  function parameter(name) { return new URLSearchParams(window.location.search).get(name); }

  function finde(liste, feld, wert) {
    for (var i = 0; i < liste.length; i++) if (liste[i][feld] === wert) return liste[i];
    return null;
  }
  function kategorie(id) { return finde(KATALOG.categories, 'id', id); }
  function produkt(id) { var p = finde(KATALOG.products, 'id', id); return p && p.active ? p : null; }
  function produkteVon(katId) {
    return KATALOG.products.filter(function (p) { return p.active && p.category_id === katId; });
  }
  function variante(sku) {
    for (var i = 0; i < KATALOG.products.length; i++) {
      var p = KATALOG.products[i];
      var v = finde(p.variants, 'sku', sku);
      if (v && p.active) return { produkt: p, variante: v };
    }
    return null;
  }

  /* Element bauen – Texte immer als Text, nie als HTML */
  function el(tag, attribute, kinder) {
    var e = document.createElement(tag);
    if (attribute) {
      Object.keys(attribute).forEach(function (k) {
        if (k === 'text') e.textContent = attribute[k];
        else if (k === 'class') e.className = attribute[k];
        else e.setAttribute(k, attribute[k]);
      });
    }
    (kinder || []).forEach(function (k) {
      if (k) e.appendChild(typeof k === 'string' ? document.createTextNode(k) : k);
    });
    return e;
  }

  function bildRahmen(id, alt) {
    return el('div', { class: 'kachelbild-rahmen' }, [
      el('img', {
        class: 'kachelbild ' + (AUSSCHNITT[id] || 'ausschnitt-mitte'),
        src: produktBild(id), alt: alt === undefined ? (ALT[id] || '') : alt, loading: 'lazy'
      })
    ]);
  }

  function stueck(n) { return n === 1 ? '1 Produkt' : n + ' Produkte'; }

  /* ---------- Warenkorb (Speicher) ----------
     Pro Position: Varianten-SKU, Produkt, Farbe, Bruttopreis, Menge. */
  function warenkorbLesen() {
    try {
      var daten = JSON.parse(window.localStorage.getItem(SPEICHER_SCHLUESSEL) || '[]');
      if (!Array.isArray(daten)) return [];
      return daten.filter(function (pos) {
        return pos && variante(pos.sku) && pos.menge > 0;
      });
    } catch (e) {
      return [];
    }
  }

  function warenkorbSpeichern(liste) {
    try { window.localStorage.setItem(SPEICHER_SCHLUESSEL, JSON.stringify(liste)); } catch (e) { /* z. B. privates Fenster */ }
    zaehlerAktualisieren(liste);
  }

  function positionAus(treffer, menge) {
    return {
      sku: treffer.variante.sku,
      produkt_id: treffer.produkt.id,
      name: treffer.produkt.name,
      farbe: treffer.variante.color,
      preis_brutto: treffer.variante.price_gross_eur,
      menge: menge
    };
  }

  /* legt Menge hinzu, höchstens bis zum (Demo-)Lagerbestand */
  function hinzufuegen(sku, menge) {
    var t = variante(sku);
    if (!t) return null;
    var liste = warenkorbLesen();
    var pos = finde(liste, 'sku', sku);
    var vorher = pos ? pos.menge : 0;
    var neu = Math.min(vorher + menge, t.variante.stock);
    if (neu > 0) {
      if (pos) { pos.menge = neu; pos.preis_brutto = t.variante.price_gross_eur; }
      else liste.push(positionAus(t, neu));
      warenkorbSpeichern(liste);
    }
    return { gewuenscht: menge, hinzu: neu - vorher, menge: neu, bestand: t.variante.stock, farbe: t.variante.color };
  }

  function mengeSetzen(sku, menge) {
    var t = variante(sku);
    var liste = warenkorbLesen();
    var pos = finde(liste, 'sku', sku);
    if (!t || !pos) return 0;
    var neu = Math.max(1, Math.min(Math.floor(menge) || 1, t.variante.stock));
    pos.menge = neu;
    warenkorbSpeichern(liste);
    return neu;
  }

  function entfernen(sku) {
    warenkorbSpeichern(warenkorbLesen().filter(function (pos) { return pos.sku !== sku; }));
  }

  function anzahl(liste) {
    return liste.reduce(function (s, pos) { return s + pos.menge; }, 0);
  }

  function zaehlerAktualisieren(liste) {
    var n = anzahl(liste || warenkorbLesen());
    document.querySelectorAll('a.warenkorb').forEach(function (a) { a.textContent = 'Warenkorb (' + n + ')'; });
  }

  /* Rückmeldung nach "In den Warenkorb" (role="status": wird vorgelesen) */
  function rueckmeldung(ziel, ergebnis) {
    ziel.textContent = '';
    if (!ergebnis) return;
    if (ergebnis.hinzu === 0) {
      ziel.textContent = 'Mehr ist in ' + ergebnis.farbe + ' nicht auf Lager (' + ergebnis.bestand + ' Stück).';
      return;
    }
    var text = ergebnis.hinzu < ergebnis.gewuenscht
      ? 'Nur ' + ergebnis.bestand + ' Stück in ' + ergebnis.farbe + ' auf Lager – jetzt ' + ergebnis.menge + ' Stück im Warenkorb. '
      : (ergebnis.hinzu > 1 ? ergebnis.hinzu + ' × ' : '') + ergebnis.farbe + ' in den Warenkorb gelegt. ';
    ziel.appendChild(document.createTextNode(text));
    ziel.appendChild(el('a', { href: 'warenkorb.html', text: 'Zum Warenkorb' }));
  }

  /* ---------- Produktkachel (Kategorieseite) ---------- */
  function produktKarte(p) {
    var erste = p.variants[0];
    var status = el('p', { class: 'kauf-status', role: 'status' });
    var knopf = el('button', { class: 'knopf', type: 'button', text: 'In den Warenkorb' });
    knopf.addEventListener('click', function () { rueckmeldung(status, hinzufuegen(erste.sku, 1)); });

    return el('article', { class: 'prod-karte' }, [
      el('a', { class: 'bild-link', href: produktLink(p.id) }, [bildRahmen(p.id)]),
      el('h2', { class: 'prod-name' }, [el('a', { href: produktLink(p.id), text: p.name })]),
      el('p', { class: 'prod-info', text: p.description_short }),
      el('p', { class: 'prod-farben', text: p.variants.length + ' Farben: ' + p.variants.map(function (v) { return v.color; }).join(', ') }),
      el('p', { class: 'preis', text: euro(p.price_gross_eur) }),
      el('p', { class: 'preishinweis', text: 'inkl. MwSt., zzgl. Versand' }),
      knopf,
      status
    ]);
  }

  function nichtGefunden(titelEl, textEl, text) {
    titelEl.textContent = text;
    textEl.textContent = '';
    textEl.appendChild(el('a', { class: 'textlink', href: 'index.html', text: 'Zurück zur Startseite' }));
  }

  function navigationMarkieren(katId) {
    document.querySelectorAll('.navi a').forEach(function (a) {
      if (a.getAttribute('href') === kategorieLink(katId)) a.setAttribute('aria-current', 'page');
    });
  }

  /* ---------- Startseite: Zahlen, Texte, Preise aus den Daten ---------- */
  function startseite() {
    document.querySelectorAll('[data-kategorie]').forEach(function (karte) {
      var span = karte.querySelector('.kat-anzahl');
      if (span) span.textContent = stueck(produkteVon(karte.getAttribute('data-kategorie')).length);
    });

    document.querySelectorAll('[data-produkt]').forEach(function (karte) {
      var p = produkt(karte.getAttribute('data-produkt'));
      if (!p) return;
      var name = karte.querySelector('.prod-name a');
      var info = karte.querySelector('.prod-info');
      var preis = karte.querySelector('.preis');
      var knopf = karte.querySelector('button.knopf');
      if (name) name.textContent = p.name;
      if (info) info.textContent = p.description_short;
      if (preis) preis.textContent = euro(p.price_gross_eur);
      if (knopf) {
        var status = el('p', { class: 'kauf-status', role: 'status' });
        knopf.insertAdjacentElement('afterend', status);
        knopf.addEventListener('click', function () { rueckmeldung(status, hinzufuegen(p.variants[0].sku, 1)); });
      }
    });
  }

  /* ---------- Kategorieseite ---------- */
  function kategorieSeite() {
    var titel = document.getElementById('seiten-titel');
    var text = document.getElementById('seiten-text');
    var liste = document.getElementById('produktliste');
    var k = kategorie(parameter('id'));
    if (!k) { nichtGefunden(titel, text, 'Kategorie nicht gefunden'); return; }

    var produkte = produkteVon(k.id);
    document.title = k.name + ' – studio.leerzeile';
    titel.textContent = k.name;
    /* geschützter Bindestrich (U+2011): kein Zeilenumbruch mitten in "Stifte-Etuis" */
    text.textContent = k.description.replace(/-/g, '‑') + ' · ' + stueck(produkte.length);
    produkte.forEach(function (p) { liste.appendChild(produktKarte(p)); });
    navigationMarkieren(k.id);
  }

  /* ---------- Produktdetailseite ---------- */
  function produktSeite() {
    var ziel = document.getElementById('produkt-detail');
    var titel = document.getElementById('seiten-titel');
    var text = document.getElementById('seiten-text');
    var p = produkt(parameter('id'));
    if (!p) { nichtGefunden(titel, text, 'Produkt nicht gefunden'); return; }
    document.getElementById('seitenkopf').remove();

    var k = kategorie(p.category_id);
    document.title = p.name + ' – studio.leerzeile';
    navigationMarkieren(p.category_id);

    var gewaehlt = finde(p.variants, 'sku', parameter('sku')) || p.variants[0];

    var skuFeld = el('dd', { class: 'sku' });
    var bestandFeld = el('dd');
    var farbname = el('span', { class: 'farbname' });
    var menge = el('input', { id: 'menge', type: 'number', min: '1', value: '1', inputmode: 'numeric' });
    var knopf = el('button', { class: 'knopf', type: 'button', text: 'In den Warenkorb' });
    var status = el('p', { class: 'kauf-status', role: 'status' });

    var farbfelder = el('div', { class: 'farbfelder' });
    p.variants.forEach(function (v) {
      var radio = el('input', { type: 'radio', name: 'farbe', value: v.sku, 'aria-label': v.color });
      if (v === gewaehlt) radio.checked = true;
      radio.addEventListener('change', function () { varianteZeigen(v); });
      farbfelder.appendChild(el('label', { class: 'farbfeld', title: v.color }, [
        radio,
        el('span', { class: 'farbpunkt', style: '--farbe:' + v.color_hex, 'aria-hidden': 'true' })
      ]));
    });

    function varianteZeigen(v) {
      gewaehlt = v;
      skuFeld.textContent = v.sku;
      farbname.textContent = v.color;
      bestandFeld.textContent = v.stock > 0 ? v.stock + ' Stück auf Lager (Demo-Bestand)' : 'Derzeit nicht auf Lager';
      menge.max = String(Math.max(1, v.stock));
      if (+menge.value > v.stock) menge.value = String(Math.max(1, v.stock));
      knopf.disabled = v.stock < 1;
      status.textContent = '';
    }

    knopf.addEventListener('click', function () {
      var m = Math.max(1, Math.floor(+menge.value) || 1);   /* Begrenzung auf den Bestand übernimmt hinzufuegen() */
      rueckmeldung(status, hinzufuegen(gewaehlt.sku, m));
      menge.value = '1';
    });

    var bild = el('div', { class: 'produkt-bild' }, [
      el('div', { class: 'kachelbild-rahmen' }, [
        el('img', { class: 'kachelbild', src: produktBild(p.id), alt: ALT[p.id] || p.name })
      ]),
      el('p', { class: 'bild-hinweis', text: BILD_HINWEIS })
    ]);

    var info = el('div', { class: 'produkt-info' }, [
      el('p', { class: 'prod-kategorie' }, [el('a', { href: kategorieLink(k.id), text: k.name })]),
      el('h1', { text: p.name }),
      el('p', { class: 'preis', text: euro(p.price_gross_eur) }),
      el('p', { class: 'preishinweis', text: 'inkl. MwSt., zzgl. Versand' }),
      el('p', { class: 'produkt-text', text: p.description }),
      el('fieldset', { class: 'farbwahl' }, [
        el('legend', null, ['Farbe: ', farbname]),
        farbfelder
      ]),
      el('div', { class: 'kaufzeile' }, [
        el('div', { class: 'mengenfeld' }, [el('label', { for: 'menge', text: 'Menge' }), menge]),
        knopf
      ]),
      status,
      el('dl', { class: 'eckdaten' }, [
        el('dt', { text: 'Artikelnummer' }), skuFeld,
        el('dt', { text: 'Verfügbarkeit' }), bestandFeld,
        el('dt', { text: 'Material' }), el('dd', { text: p.material }),
        el('dt', { text: 'Ausführung' }), el('dd', { text: p.specification })
      ])
    ]);

    ziel.appendChild(el('p', { class: 'zurueck-zeile' }, [
      el('a', { class: 'textlink', href: kategorieLink(k.id), text: '← Zurück zu ' + k.name })
    ]));
    ziel.appendChild(el('div', { class: 'produkt-detail' }, [bild, info]));
    varianteZeigen(gewaehlt);
  }

  /* ---------- Warenkorbseite ---------- */
  function warenkorbSeite() {
    var ziel = document.getElementById('warenkorb-inhalt');
    var status = document.getElementById('warenkorb-status');
    var titel = document.getElementById('seiten-titel');

    function summenAktualisieren(bereich) {
      var liste = warenkorbLesen();
      var summe = runden(liste.reduce(function (s, pos) {
        return s + variante(pos.sku).variante.price_gross_eur * pos.menge;
      }, 0));
      var netto = nettoAus(summe);
      bereich.querySelector('.wk-anzahl').textContent = anzahl(liste) + ' Artikel';
      bereich.querySelector('.wk-zwischensumme').textContent = euro(summe);
      bereich.querySelector('.wk-mwst').textContent = euro(runden(summe - netto));
    }

    function zeichnen() {
      ziel.textContent = '';
      var liste = warenkorbLesen();
      if (!liste.length) {
        ziel.appendChild(el('p', { class: 'wk-leer', text: 'Ihr Warenkorb ist leer.' }));
        ziel.appendChild(el('p', { class: 'ende' }, [el('a', { class: 'knopf hell', href: 'index.html#kat-titel', text: 'Zum Sortiment' })]));
        return;
      }

      var summenBereich = el('div', { class: 'wk-summen' }, [
        el('dl', null, [
          el('dt', { text: 'Anzahl' }), el('dd', { class: 'wk-anzahl' }),
          el('dt', { text: 'Zwischensumme' }), el('dd', { class: 'wk-zwischensumme gesamt' }),
          el('dt', { text: 'darin enthaltene MwSt. (' + Math.round(MWST_SATZ * 100) + ' %)' }), el('dd', { class: 'wk-mwst' }),
          el('dt', { text: 'Versand' }), el('dd', { text: 'wird im Demo-Shop nicht berechnet' })
        ]),
        el('p', { class: 'preishinweis', text: 'Alle Preise inkl. MwSt., zzgl. Versand.' }),
        el('p', { class: 'demo-box', text: 'Demo-Shop: Eine Bestellung oder Bezahlung ist hier nicht möglich.' }),
        el('p', { class: 'wk-aktionen' }, [el('a', { class: 'knopf hell', href: 'index.html#kat-titel', text: 'Weiter einkaufen' })])
      ]);

      var ul = el('ul', { class: 'wk-liste' });
      liste.forEach(function (pos, i) {
        var t = variante(pos.sku);
        var p = t.produkt, v = t.variante;
        var feldId = 'menge-' + i;
        var zeilensumme = el('p', { class: 'wk-zeilensumme preis', text: euro(runden(v.price_gross_eur * pos.menge)) });
        var mengenfeld = el('input', { id: feldId, type: 'number', min: '1', max: String(v.stock), value: String(pos.menge), inputmode: 'numeric' });
        var entfernenKnopf = el('button', { class: 'textknopf', type: 'button', text: 'Entfernen', 'aria-label': p.name + ' in ' + v.color + ' entfernen' });
        var li = el('li', { class: 'wk-posten' }, [
          el('a', { class: 'wk-bild bild-link', href: produktLink(p.id) + '&sku=' + encodeURIComponent(v.sku), tabindex: '-1', 'aria-hidden': 'true' }, [bildRahmen(p.id, '')]),
          el('div', { class: 'wk-text' }, [
            el('h2', { class: 'wk-name' }, [el('a', { href: produktLink(p.id) + '&sku=' + encodeURIComponent(v.sku), text: p.name })]),
            el('p', { class: 'wk-meta', text: 'Farbe: ' + v.color + ' · Art.-Nr. ' + v.sku }),
            el('p', { class: 'wk-einzel', text: euro(v.price_gross_eur) + ' je Stück' })
          ]),
          el('div', { class: 'wk-menge mengenfeld' }, [el('label', { for: feldId, text: 'Menge' }), mengenfeld]),
          zeilensumme,
          el('div', { class: 'wk-entfernen' }, [entfernenKnopf])
        ]);

        mengenfeld.addEventListener('change', function () {
          var gewuenscht = Math.floor(+mengenfeld.value) || 1;
          var neu = mengeSetzen(v.sku, gewuenscht);
          mengenfeld.value = String(neu);
          zeilensumme.textContent = euro(runden(v.price_gross_eur * neu));
          summenAktualisieren(summenBereich);
          status.textContent = gewuenscht > v.stock
            ? 'Nur ' + v.stock + ' Stück in ' + v.color + ' auf Lager – Menge angepasst.'
            : 'Menge geändert: ' + p.name + ', ' + v.color + ': ' + neu + ' Stück.';
        });

        entfernenKnopf.addEventListener('click', function () {
          entfernen(v.sku);
          status.textContent = p.name + ' in ' + v.color + ' wurde entfernt.';
          if (!warenkorbLesen().length) { zeichnen(); titel.focus(); return; }
          var naechster = li.nextElementSibling || li.previousElementSibling;
          li.remove();
          summenAktualisieren(summenBereich);
          var fokus = naechster && naechster.querySelector('.textknopf');
          (fokus || titel).focus();
        });

        ul.appendChild(li);
      });

      ziel.appendChild(ul);
      ziel.appendChild(summenBereich);
      summenAktualisieren(summenBereich);
    }

    zeichnen();
  }

  /* ---------- Start ---------- */
  zaehlerAktualisieren();
  window.addEventListener('storage', function () { zaehlerAktualisieren(); });

  var seite = document.body.getAttribute('data-seite');
  if (seite === 'start') startseite();
  else if (seite === 'kategorie') kategorieSeite();
  else if (seite === 'produkt') produktSeite();
  else if (seite === 'warenkorb') warenkorbSeite();
})();
