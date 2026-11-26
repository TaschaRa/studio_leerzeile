/* studio.leerzeile – Shop: Warenkorb, Produktseiten, Startseite und Kategorieseiten
   - Warenkorb (warenkorb.html) und Produktseiten (produkte/*.html) brauchen KEIN shopdaten.js:
     Die Produktseiten liefern Name, Farbe, SKU, Preis in Cent, Bestand und Seitenname als data-Attribute;
     der Warenkorb speichert diese Angaben mit jedem Artikel.
   - Startseite und Kategorieseiten lesen weiter data/shopdaten.js (window.STUDIO_CATALOG).
   - Der Warenkorb liegt nur in diesem Browser (localStorage) – Demo, keine Bestellung, keine Zahlung.
   Funktioniert auch beim direkten Öffnen der Datei (file:///), weil nichts per fetch() geladen wird. */
(function () {
  'use strict';

  var KATALOG = window.STUDIO_CATALOG || null;   /* nur auf Startseite und Kategorieseiten geladen */

  var SPEICHER_SCHLUESSEL = 'studio-leerzeile-warenkorb';
  var MAX_MENGE = 10;   /* höchstens 10 Stück je Artikel (und nie mehr als der Demo-Bestand) */

  /* Feste Demo-Regeln (gleich wie shop_policies_demo in daten/import/produkte.json).
     Ändern sie sich dort, hier von Hand nachziehen – der Warenkorb lädt den Katalog nicht mehr. */
  var MWST_SATZ = 0.19;
  var VERSAND_CENT = 490;           /* 4,90 € */
  var VERSANDFREI_AB_CENT = 5000;   /* ab 50 € Warenwert versandkostenfrei */
  var LIEFERZEIT = '2–4 Werktage';

  /* Seiten in website/produkte/ setzen <body data-basis="../">, alle anderen nichts */
  var BASIS = document.body.getAttribute('data-basis') || '';

  /* ---------- Geld: immer in ganzen Cent rechnen ----------
     Euro-Preise (mit Komma) werden genau einmal in Cent umgewandelt.
     Erst bei der Anzeige wird wieder in Euro umgerechnet (deutsches Format, z. B. 114,80 €). */
  function cent(euroBetrag) { return Math.round(euroBetrag * 100); }
  function versandCent(warenwertCent) { return warenwertCent >= VERSANDFREI_AB_CENT ? 0 : VERSAND_CENT; }
  /* Brutto ist führend: Netto = Brutto / 1,19 auf ganze Cent gerundet, MwSt. = Brutto – Netto */
  function mwstCent(bruttoCent) { return bruttoCent - Math.round(bruttoCent / (1 + MWST_SATZ)); }

  var euroFormat = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
  /* Anzeige: Cent → Euro, z. B. 11480 → "114,80 €" */
  function euro(betragCent) { return euroFormat.format(betragCent / 100); }
  /* ganze Euro ohne Nachkommastellen, z. B. 5000 → "50 €" */
  function euroKurz(betragCent) { return betragCent % 100 === 0 ? (betragCent / 100) + ' €' : euro(betragCent); }
  function grenze(bestand) { return Math.min(MAX_MENGE, bestand); }

  /* ---------- Pfade ---------- */
  /* Seitenname aus dem Slug: klein, "-" → "_", z. B. fuellfederhalter-signature → fuellfederhalter_signature.html */
  function seitenName(slug) { return String(slug).toLowerCase().replace(/-/g, '_') + '.html'; }
  function produktSeiteLink(seite) { return BASIS + 'produkte/' + seite; }
  function kategorieLink(id) { return BASIS + 'kategorie.html?id=' + encodeURIComponent(id); }
  function warenkorbLink() { return BASIS + 'warenkorb.html'; }
  /* Bild aus der Produktnummer: die zugeschnittenen Dateien */
  function produktBild(produktId) { return BASIS + '../Bilder/produkte-zugeschnitten/' + produktId + '.png'; }
  function parameter(name) { return new URLSearchParams(window.location.search).get(name); }

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

  /* Alternativtexte der Kacheln (Kategorieseiten) beschreiben das gezeigte Beispielbild */
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
  function finde(liste, feld, wert) {
    for (var i = 0; i < liste.length; i++) if (liste[i][feld] === wert) return liste[i];
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

  function bildRahmen(produktId, alt) {
    return el('div', { class: 'kachelbild-rahmen' }, [
      el('img', {
        class: 'kachelbild ' + (AUSSCHNITT[produktId] || 'ausschnitt-mitte'),
        src: produktBild(produktId), alt: alt === undefined ? (ALT[produktId] || '') : alt, loading: 'lazy'
      })
    ]);
  }

  function stueck(n) { return n === 1 ? '1 Produkt' : n + ' Produkte'; }

  /* ---------- Artikel prüfen ----------
     artikel = { sku, produkt_id, name, farbe, preis_cent, bestand, seite }
     Ungültige Angaben → null (der Artikel wird nicht angenommen, kein Fehler). */
  function text(wert, maxLaenge) {
    return typeof wert === 'string' && wert.trim() !== '' && wert.length <= maxLaenge ? wert : null;
  }
  function ganzeZahl(wert) {
    var n = typeof wert === 'string' && wert.trim() !== '' ? Number(wert) : wert;
    return typeof n === 'number' && Number.isInteger(n) ? n : null;
  }
  function gueltigerArtikel(a) {
    if (!a || typeof a !== 'object') return null;
    var sku = text(a.sku, 40);
    var produktId = text(a.produkt_id, 40);
    var name = text(a.name, 160);
    var farbe = text(a.farbe, 60);
    var seite = text(a.seite, 120);
    var preisCent = ganzeZahl(a.preis_cent);
    var bestand = ganzeZahl(a.bestand);
    if (!sku || !/^[A-Z0-9-]+$/.test(sku)) return null;
    if (!produktId || !/^[A-Z0-9-]+$/.test(produktId) || sku.indexOf(produktId + '-') !== 0) return null;
    if (!name || !farbe) return null;
    if (!seite || !/^[a-z0-9_]+\.html$/.test(seite)) return null;           /* klein, Unterstrich, .html */
    if (preisCent === null || preisCent <= 0 || preisCent > 10000000) return null;
    if (bestand === null || bestand < 0 || bestand > 100000) return null;
    return { sku: sku, produkt_id: produktId, name: name, farbe: farbe, preis_cent: preisCent, bestand: bestand, seite: seite };
  }

  /* artikel aus dem Katalog bilden (nur Startseite und Kategorieseiten) */
  function artikelAusKatalog(p, v) {
    return {
      sku: v.sku, produkt_id: p.id, name: p.name, farbe: v.color,
      preis_cent: cent(v.price_gross_eur), bestand: v.stock, seite: seitenName(p.slug)
    };
  }

  /* ---------- Warenkorb (Speicher) ----------
     Nur Artikel, keine Personendaten. Pro Position: sku, produkt_id, name, farbe, preis_cent, bestand, seite, menge.
     Der Speichereintrag entsteht erst beim ersten Hinzufügen und wird gelöscht, sobald der Warenkorb leer ist. */
  function warenkorbLesen() {
    var daten;
    try {
      daten = JSON.parse(window.localStorage.getItem(SPEICHER_SCHLUESSEL) || '[]');
    } catch (e) {
      return [];   /* unlesbarer Eintrag: verwerfen, kein Fehler */
    }
    if (!Array.isArray(daten)) return [];
    var liste = [];
    daten.forEach(function (eintrag) {
      /* Einträge ohne vollständige Angaben (z. B. ältere Formate ohne bestand oder seite) werden verworfen */
      var a = gueltigerArtikel(eintrag);
      var menge = eintrag ? Math.floor(+eintrag.menge) : 0;
      if (!a || !(menge > 0) || finde(liste, 'sku', a.sku)) return;
      a.menge = Math.min(menge, grenze(a.bestand));
      if (a.menge > 0) liste.push(a);
    });
    return liste;
  }

  function warenkorbSpeichern(liste) {
    try {
      if (liste.length) window.localStorage.setItem(SPEICHER_SCHLUESSEL, JSON.stringify(liste));
      else window.localStorage.removeItem(SPEICHER_SCHLUESSEL);   /* leer: Eintrag ganz löschen */
    } catch (e) { /* z. B. Speicher gesperrt */ }
    zaehlerAktualisieren(liste);
  }

  /* legt Menge hinzu, höchstens 10 Stück je Artikel und nie mehr als der (Demo-)Lagerbestand.
     artikel = { sku, produkt_id, name, farbe, preis_cent, bestand, seite } */
  function hinzufuegen(artikel, menge) {
    var a = gueltigerArtikel(artikel);
    if (!a) return null;
    var liste = warenkorbLesen();
    var pos = finde(liste, 'sku', a.sku);
    var vorher = pos ? pos.menge : 0;
    var max = grenze(a.bestand);
    var neu = Math.min(vorher + menge, max);
    if (pos) {
      /* zuletzt übergebene Angaben übernehmen (Name, Farbe, Preis, Bestand, Seite) */
      Object.keys(a).forEach(function (k) { pos[k] = a[k]; });
      pos.menge = neu;
      if (neu < 1) liste = liste.filter(function (x) { return x !== pos; });   /* Bestand 0: Artikel raus */
      warenkorbSpeichern(liste);
    } else if (neu > 0) {
      a.menge = neu;
      liste.push(a);
      warenkorbSpeichern(liste);
    }
    return { gewuenscht: menge, hinzu: Math.max(0, neu - vorher), menge: neu, max: max, bestand: a.bestand, farbe: a.farbe };
  }

  function mengeSetzen(sku, menge) {
    var liste = warenkorbLesen();
    var pos = finde(liste, 'sku', sku);
    if (!pos) return 0;
    var neu = Math.max(1, Math.min(Math.floor(menge) || 1, grenze(pos.bestand)));
    pos.menge = neu;
    warenkorbSpeichern(liste);
    return neu;
  }

  /* Grund für eine Mengenbegrenzung, als verständlicher Satz */
  function grenzText(max, bestand, farbe) {
    return max < bestand
      ? 'Höchstens ' + MAX_MENGE + ' Stück je Artikel'
      : 'Nur ' + bestand + ' Stück in ' + farbe + ' auf Lager';
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

  /* ---------- Summen: EINE Berechnung für Warenkorb und Kasse ----------
     Grundlage sind die gespeicherten Artikel (preis_cent je Stück, menge) – ganze Cent, keine Kommazahlen. */
  function summenBerechnen(liste) {
    var warenwert = liste.reduce(function (s, pos) { return s + pos.preis_cent * pos.menge; }, 0);
    var versand = versandCent(warenwert);
    var gesamt = warenwert + versand;
    return { anzahl: anzahl(liste), warenwert: warenwert, versand: versand, gesamt: gesamt, mwst: mwstCent(gesamt) };
  }

  /* Summenliste (dl) für Warenkorb und Kasse, gefüllt mit summenEintragen() */
  function summenListe() {
    return el('dl', null, [
      el('dt', { text: 'Anzahl' }), el('dd', { class: 'wk-anzahl' }),
      el('dt', { text: 'Warenwert', 'data-einfach': 'Preis der Artikel' }), el('dd', { class: 'wk-warenwert' }),
      el('dt', { text: 'Versand' }), el('dd', { class: 'wk-versand' }),
      el('dt', { text: 'Gesamtsumme', 'data-einfach': 'Summe mit Versand' }), el('dd', { class: 'wk-gesamt gesamt' }),
      el('dt', { text: 'darin enthaltene MwSt. (' + Math.round(MWST_SATZ * 100) + ' %)', 'data-einfach': 'Davon Steuer (' + Math.round(MWST_SATZ * 100) + ' %)' }), el('dd', { class: 'wk-mwst' }),
      el('dt', { text: 'Lieferzeit', 'data-einfach': 'Lieferung in' }), el('dd', { text: LIEFERZEIT })
    ]);
  }

  function summenEintragen(bereich, s) {
    bereich.querySelector('.wk-anzahl').textContent = s.anzahl + ' Artikel';
    bereich.querySelector('.wk-warenwert').textContent = euro(s.warenwert);
    bereich.querySelector('.wk-versand').textContent = s.versand === 0 ? euro(0) + ' (versandkostenfrei)' : euro(s.versand);
    bereich.querySelector('.wk-gesamt').textContent = euro(s.gesamt);
    bereich.querySelector('.wk-mwst').textContent = euro(s.mwst);
  }

  function preisHinweisAbsatz() {
    return el('p', {
      class: 'preishinweis',
      text: 'Artikelpreise inkl. MwSt., zzgl. Versand. Versand ' + euro(VERSAND_CENT) + ', ab ' + euroKurz(VERSANDFREI_AB_CENT) + ' Warenwert versandkostenfrei.',
      'data-einfach': 'Alle Preise inkl. MwSt., zzgl. Versand. Das heißt: Die Steuer ist schon drin. Der Versand kommt noch dazu. Ab einem Warenwert von 50 € ist der Versand kostenlos.'
    });
  }

  /* Einfache Sprache (js/app.js): neu gebaute Texte gleich in der gewählten Fassung zeigen */
  function spracheAnwenden(wurzel) {
    if (window.studioSprache) window.studioSprache.anwenden(wurzel);
  }

  /* Rückmeldung nach "In den Warenkorb" (role="status": wird vorgelesen) */
  function rueckmeldung(ziel, ergebnis) {
    ziel.textContent = '';
    if (!ergebnis) {
      ziel.textContent = 'Dieser Artikel konnte nicht in den Warenkorb gelegt werden.';
      return;
    }
    var grund = grenzText(ergebnis.max, ergebnis.bestand, ergebnis.farbe);
    if (ergebnis.hinzu === 0) {
      ziel.appendChild(document.createTextNode(grund + ' – es sind bereits ' + ergebnis.menge + ' Stück im Warenkorb. '));
      ziel.appendChild(el('a', { href: warenkorbLink(), text: 'Zum Warenkorb' }));
      return;
    }
    var satz = ergebnis.hinzu < ergebnis.gewuenscht
      ? grund + ' – jetzt ' + ergebnis.menge + ' Stück im Warenkorb. '
      : (ergebnis.hinzu > 1 ? ergebnis.hinzu + ' × ' : '') + ergebnis.farbe + ' in den Warenkorb gelegt. ';
    ziel.appendChild(document.createTextNode(satz));
    ziel.appendChild(el('a', { href: warenkorbLink(), text: 'Zum Warenkorb' }));
  }

  /* ---------- Katalogseiten (brauchen data/shopdaten.js) ---------- */
  function kategorie(id) { return finde(KATALOG.categories, 'id', id); }
  function produkt(id) { var p = finde(KATALOG.products, 'id', id); return p && p.active ? p : null; }
  function produkteVon(katId) {
    return KATALOG.products.filter(function (p) { return p.active && p.category_id === katId; });
  }

  /* Produktkachel (Kategorieseite) */
  function produktKarte(p) {
    var erste = p.variants[0];
    var link = produktSeiteLink(seitenName(p.slug));
    var status = el('p', { class: 'kauf-status', role: 'status' });
    var knopf = el('button', { class: 'knopf', type: 'button', text: 'In den Warenkorb' });
    knopf.addEventListener('click', function () { rueckmeldung(status, hinzufuegen(artikelAusKatalog(p, erste), 1)); });

    return el('article', { class: 'prod-karte' }, [
      el('a', { class: 'bild-link', href: link }, [bildRahmen(p.id)]),
      el('h2', { class: 'prod-name' }, [el('a', { href: link, text: p.name })]),
      el('p', { class: 'prod-info', text: p.description_short }),
      el('p', { class: 'prod-farben', text: p.variants.length + ' Farben: ' + p.variants.map(function (v) { return v.color; }).join(', ') }),
      el('p', { class: 'preis', text: euro(cent(p.price_gross_eur)) }),
      el('p', { class: 'preishinweis', text: 'inkl. MwSt., zzgl. Versand' }),
      knopf,
      status
    ]);
  }

  function nichtGefunden(titelEl, textEl, meldungText) {
    titelEl.textContent = meldungText;
    textEl.textContent = '';
    textEl.appendChild(el('a', { class: 'textlink', href: BASIS + 'index.html', text: 'Zurück zur Startseite' }));
  }

  function navigationMarkieren(katId) {
    document.querySelectorAll('.navi a').forEach(function (a) {
      if (a.getAttribute('href') === kategorieLink(katId)) a.setAttribute('aria-current', 'page');
    });
  }

  /* Startseite: Zahlen, Texte, Preise aus den Daten */
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
      if (preis) preis.textContent = euro(cent(p.price_gross_eur));
      if (knopf) {
        var status = el('p', { class: 'kauf-status', role: 'status' });
        knopf.insertAdjacentElement('afterend', status);
        knopf.addEventListener('click', function () { rueckmeldung(status, hinzufuegen(artikelAusKatalog(p, p.variants[0]), 1)); });
      }
    });
  }

  /* Kategorieseite */
  function kategorieSeite() {
    var titel = document.getElementById('seiten-titel');
    var textEl = document.getElementById('seiten-text');
    var liste = document.getElementById('produktliste');
    var k = kategorie(parameter('id'));
    if (!k) { nichtGefunden(titel, textEl, 'Kategorie nicht gefunden'); return; }

    var produkte = produkteVon(k.id);
    document.title = k.name + ' – studio.leerzeile';
    titel.textContent = k.name;
    /* geschützter Bindestrich (U+2011): kein Zeilenumbruch mitten in "Stifte-Etuis" */
    textEl.textContent = k.description.replace(/-/g, '‑') + ' · ' + stueck(produkte.length);
    produkte.forEach(function (p) { liste.appendChild(produktKarte(p)); });
    navigationMarkieren(k.id);
  }

  /* ---------- Produktseiten (website/produkte/*.html, erzeugt aus produkte.json) ----------
     Alle Angaben kommen aus den data-Attributen der Seite – kein Katalog nötig. */
  function produktSeite() {
    var produktEl = document.querySelector('[data-produkt-id]');
    if (!produktEl) return;
    var farben = [].slice.call(produktEl.querySelectorAll('input[name="farbe"]'));
    var farbname = produktEl.querySelector('.farbname');
    var skuFeld = produktEl.querySelector('.sku');
    var bestandFeld = produktEl.querySelector('.bestand-text');
    var menge = produktEl.querySelector('#menge');
    var knopf = produktEl.querySelector('#in-den-warenkorb');
    var status = produktEl.querySelector('.kauf-status[role="status"]');
    if (!farben.length || !menge || !knopf || !status) return;

    function gewaehlt() { return finde(farben, 'checked', true) || farben[0]; }

    function artikelDerSeite() {
      var f = gewaehlt();
      return {
        sku: f.getAttribute('data-sku'),
        produkt_id: produktEl.getAttribute('data-produkt-id'),
        name: produktEl.getAttribute('data-name'),
        farbe: f.getAttribute('data-farbe'),
        preis_cent: produktEl.getAttribute('data-preis-cent'),
        bestand: f.getAttribute('data-bestand'),
        seite: produktEl.getAttribute('data-seite')
      };
    }

    function varianteZeigen() {
      var f = gewaehlt();
      var bestand = Number(f.getAttribute('data-bestand'));
      farbname.textContent = f.getAttribute('data-farbe');
      skuFeld.textContent = f.getAttribute('data-sku');
      bestandFeld.textContent = bestand > 0 ? bestand + ' Stück auf Lager (Demo-Bestand)' : 'Derzeit nicht auf Lager';
      menge.max = String(Math.max(1, grenze(bestand)));
      if (+menge.value > grenze(bestand)) menge.value = String(Math.max(1, grenze(bestand)));
      knopf.disabled = bestand < 1;
      status.textContent = '';
    }

    farben.forEach(function (f) { f.addEventListener('change', varianteZeigen); });
    knopf.addEventListener('click', function () {
      var m = Math.max(1, Math.floor(+menge.value) || 1);   /* Begrenzung auf 10 bzw. Bestand übernimmt hinzufuegen() */
      rueckmeldung(status, hinzufuegen(artikelDerSeite(), m));
      menge.value = '1';
    });

    /* ?sku=… (Link aus dem Warenkorb) wählt die passende Farbe vor */
    var wunsch = parameter('sku');
    farben.forEach(function (f) { if (wunsch && f.getAttribute('data-sku') === wunsch) f.checked = true; });
    varianteZeigen();
  }

  /* ---------- Warenkorbseite (ohne Katalog: alle Angaben stehen im Speicher) ---------- */
  var warenkorbNeuZeichnen = null;   /* wird gesetzt, wenn die Warenkorbseite aktiv ist (für pageshow) */

  function warenkorbSeite() {
    var ziel = document.getElementById('warenkorb-inhalt');
    var status = document.getElementById('warenkorb-status');
    var titel = document.getElementById('seiten-titel');

    function meldung(satz) { status.textContent = satz; }

    function summenAktualisieren(bereich) {
      summenEintragen(bereich, summenBerechnen(warenkorbLesen()));
    }

    function leerZeigen() {
      ziel.appendChild(el('p', { class: 'wk-leer', text: 'Ihr Warenkorb ist leer.', 'data-einfach': 'In Ihrem Warenkorb ist nichts.' }));
      ziel.appendChild(el('p', { class: 'ende' }, [el('a', { class: 'knopf hell', href: 'index.html#kat-titel', text: 'Zu den Produkten' })]));
    }

    function zeichnen() {
      ziel.textContent = '';
      var liste = warenkorbLesen();
      if (!liste.length) { leerZeigen(); spracheAnwenden(ziel); return; }

      var summenBereich = el('div', { class: 'wk-summen' }, [
        summenListe(),
        preisHinweisAbsatz(),
        el('p', { class: 'demo-box', text: 'Demo-Shop: Auch über die Kasse wird nichts bestellt und nichts bezahlt.',
          'data-einfach': 'Das ist ein Übungs-Shop. Auch an der Kasse kaufen Sie nichts wirklich. Sie bezahlen nichts.' }),
        el('div', { class: 'wk-aktionen' }, [
          el('a', { class: 'knopf', href: 'kasse.html', text: 'Als Gast zur Kasse' }),
          el('a', { class: 'knopf hell', href: 'index.html#kat-titel', text: 'Weiter einkaufen' })
        ])
      ]);

      var ul = el('ul', { class: 'wk-liste' });
      liste.forEach(function (pos, i) {
        var max = grenze(pos.bestand);
        var feldId = 'menge-' + i;
        var wer = pos.name + ' in ' + pos.farbe;
        var link = produktSeiteLink(pos.seite) + '?sku=' + encodeURIComponent(pos.sku);
        var zeilensumme = el('p', { class: 'wk-zeilensumme preis', text: euro(pos.preis_cent * pos.menge) });
        var mengenfeld = el('input', { id: feldId, type: 'number', min: '1', max: String(max), value: String(pos.menge), inputmode: 'numeric' });
        var minus = el('button', { class: 'mengen-knopf', type: 'button', text: '−', 'aria-label': 'Menge von ' + wer + ' verringern' });
        var plus = el('button', { class: 'mengen-knopf', type: 'button', text: '+', 'aria-label': 'Menge von ' + wer + ' erhöhen' });
        var entfernenKnopf = el('button', { class: 'textknopf', type: 'button', text: 'Entfernen', 'aria-label': wer + ' entfernen' });
        var li = el('li', { class: 'wk-posten' }, [
          el('a', { class: 'wk-bild bild-link', href: link, tabindex: '-1', 'aria-hidden': 'true' }, [bildRahmen(pos.produkt_id, '')]),
          el('div', { class: 'wk-text' }, [
            el('h2', { class: 'wk-name' }, [el('a', { href: link, text: pos.name })]),
            el('p', { class: 'wk-meta', text: 'Farbe: ' + pos.farbe + ' · Art.-Nr. ' + pos.sku }),
            el('p', { class: 'wk-einzel', text: euro(pos.preis_cent) + ' je Stück' })
          ]),
          el('div', { class: 'wk-menge mengenfeld' }, [
            el('label', { for: feldId, text: 'Menge' }),
            el('div', { class: 'mengen-steuerung' }, [minus, mengenfeld, plus])
          ]),
          zeilensumme,
          el('div', { class: 'wk-entfernen' }, [entfernenKnopf])
        ]);

        function knoepfeAnpassen(menge) {
          minus.disabled = menge <= 1;
          plus.disabled = menge >= max;
        }

        function mengeAendern(gewuenscht) {
          var neu = mengeSetzen(pos.sku, gewuenscht);
          mengenfeld.value = String(neu);
          zeilensumme.textContent = euro(pos.preis_cent * neu);
          knoepfeAnpassen(neu);
          summenAktualisieren(summenBereich);
          meldung(gewuenscht > max
            ? grenzText(max, pos.bestand, pos.farbe) + ' – Menge von ' + wer + ': ' + neu + ' Stück.'
            : 'Menge von ' + wer + ': ' + neu + ' Stück.');
        }

        mengenfeld.addEventListener('change', function () { mengeAendern(Math.floor(+mengenfeld.value) || 1); });
        minus.addEventListener('click', function () { mengeAendern((+mengenfeld.value || 1) - 1); });
        plus.addEventListener('click', function () { mengeAendern((+mengenfeld.value || 1) + 1); });
        knoepfeAnpassen(pos.menge);

        entfernenKnopf.addEventListener('click', function () {
          entfernen(pos.sku);
          meldung(wer + ' wurde entfernt.');
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
      spracheAnwenden(ziel);
    }

    warenkorbNeuZeichnen = function () { meldung(''); zeichnen(); };
    zeichnen();
  }

  /* ---------- Kasse (kasse.html): Gast-Bestellung als Demo ----------
     Datenbasis: dieselben gespeicherten Artikel wie im Warenkorb (warenkorbLesen) und dieselbe
     Berechnung (summenBerechnen). Die Preise stammen aus den Produktseiten, die das Skript aus
     daten/import/produkte.json erzeugt – shopdaten.js wird nicht gebraucht.
     Datenschutz: KEIN <form>, kein Absenden, kein Netzwerk, kein Speichern der Eingaben.
     Felder gibt es nur mit JavaScript; Enter löst nichts aus. */
  var KASSE_FELDER = [
    { id: 'kasse-name', label: 'Name', wert: 'Max Mustermann',
      gueltig: function (v) { return v.length >= 2; },
      fehler: 'Bitte geben Sie Ihren Namen ein. Er braucht mindestens 2 Zeichen.' },
    { id: 'kasse-email', label: 'E-Mail', wert: 'max.mustermann@example.com', typ: 'email', inputmode: 'email',
      gueltig: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); },
      fehler: 'Bitte geben Sie eine E-Mail-Adresse ein. Beispiel: name@example.com' },
    { id: 'kasse-strasse', label: 'Straße und Hausnummer', wert: 'Musterstraße 1',
      gueltig: function (v) { return v.length >= 4 && /[A-Za-zÄÖÜäöüß]/.test(v) && /\d/.test(v); },
      fehler: 'Bitte geben Sie Straße und Hausnummer ein. Beispiel: Musterstraße 1' },
    { id: 'kasse-plz', label: 'PLZ', labelEinfach: 'Postleitzahl (PLZ)', wert: '12345', inputmode: 'numeric', maxlength: '5',
      gueltig: function (v) { return /^\d{5}$/.test(v); },
      fehler: 'Bitte geben Sie Ihre Postleitzahl ein. Sie hat 5 Ziffern.' },
    { id: 'kasse-ort', label: 'Ort', wert: 'Musterstadt',
      gueltig: function (v) { return v.length >= 2; },
      fehler: 'Bitte geben Sie Ihren Ort ein.' }
  ];

  var kasseNeuZeichnen = null;   /* für pageshow (Zurück-Taste): Formular frisch aufbauen */

  function kasseSeite() {
    var ziel = document.getElementById('kasse-inhalt');
    var status = document.getElementById('kasse-status');
    var titel = document.getElementById('seiten-titel');
    if (!ziel || !status) return;

    /* alle Eingabefelder leeren – nach der Demo-Bestellung und bevor die Seite verlassen wird */
    function felderLeeren() {
      ziel.querySelectorAll('input').forEach(function (f) { f.value = ''; });
    }

    function leerZeigen() {
      ziel.appendChild(el('p', { class: 'wk-leer', text: 'Ihr Warenkorb ist leer.', 'data-einfach': 'In Ihrem Warenkorb ist nichts.' }));
      ziel.appendChild(el('p', { class: 'ende' }, [el('a', { class: 'knopf hell', href: 'index.html#kat-titel', text: 'Zu den Produkten' })]));
    }

    function uebersicht(liste) {
      var ul = el('ul', { class: 'kasse-artikel' });
      liste.forEach(function (pos) {
        ul.appendChild(el('li', null, [
          el('span', { class: 'kasse-artikel-name' }, [pos.name + ' · ' + pos.farbe]),
          el('span', { class: 'kasse-artikel-menge' }, [pos.menge + ' × ' + euro(pos.preis_cent)]),
          el('span', { class: 'kasse-artikel-summe preis' }, [euro(pos.preis_cent * pos.menge)])
        ]));
      });
      var summen = el('div', { class: 'wk-summen kasse-summen' }, [summenListe(), preisHinweisAbsatz()]);
      summenEintragen(summen, summenBerechnen(liste));
      return el('section', { class: 'kasse-uebersicht', 'aria-labelledby': 'kasse-titel-bestellung' }, [
        el('h2', { id: 'kasse-titel-bestellung', text: 'Ihre Bestellung' }),
        ul,
        summen,
        el('p', null, [el('a', { class: 'textlink', href: 'warenkorb.html', text: 'Warenkorb ändern' })])
      ]);
    }

    function formularBereich(liste) {
      var fehlerBox = el('div', { class: 'fehler-box', role: 'alert', tabindex: '-1' });
      var felder = KASSE_FELDER.map(function (f) {
        var fehlerId = f.id + '-fehler';
        var eingabe = el('input', {
          id: f.id, type: f.typ || 'text', value: f.wert,
          autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false',
          'aria-describedby': fehlerId
        });
        if (f.inputmode) eingabe.setAttribute('inputmode', f.inputmode);
        if (f.maxlength) eingabe.setAttribute('maxlength', f.maxlength);
        /* Enter löst nichts aus (es gibt kein Formular; zur Sicherheit trotzdem abfangen) */
        eingabe.addEventListener('keydown', function (e) { if (e.key === 'Enter') e.preventDefault(); });
        var label = el('label', { for: f.id, text: f.label });
        if (f.labelEinfach) label.setAttribute('data-einfach', f.labelEinfach);
        return {
          def: f, eingabe: eingabe, fehlerText: el('p', { class: 'feld-fehler', id: fehlerId, hidden: '' }),
          box: null, label: label
        };
      });

      var knopf = el('button', { class: 'knopf', type: 'button', text: 'Demo-Bestellung absenden' });

      function pruefen() {
        var fehlerListe = [];
        felder.forEach(function (x) {
          var ok = x.def.gueltig(x.eingabe.value.trim());
          x.eingabe.setAttribute('aria-invalid', ok ? 'false' : 'true');
          x.box.classList.toggle('ungueltig', !ok);
          x.fehlerText.hidden = ok;
          x.fehlerText.textContent = ok ? '' : 'Fehler: ' + x.def.fehler;
          if (!ok) fehlerListe.push(x);
        });
        fehlerBox.textContent = '';
        if (fehlerListe.length) {
          fehlerBox.appendChild(el('p', { class: 'fehler-titel', text: 'Bitte prüfen Sie diese Angaben:' }));
          var ul = el('ul');
          fehlerListe.forEach(function (x) {
            var link = el('a', { href: '#' + x.def.id, text: x.def.label + ': ' + x.def.fehler });
            link.addEventListener('click', function (e) { e.preventDefault(); x.eingabe.focus(); });
            ul.appendChild(el('li', null, [link]));
          });
          fehlerBox.appendChild(ul);
          fehlerBox.focus();
        }
        return fehlerListe.length === 0;
      }

      knopf.addEventListener('click', function () {
        if (!pruefen()) return;
        /* Demo: nichts wird gesendet oder gespeichert – Eingaben sofort verwerfen */
        felderLeeren();
        warenkorbSpeichern([]);   /* Warenkorb leeren, Zähler → 0 */
        ziel.textContent = '';
        status.textContent = '';
        status.appendChild(el('span', {
          text: 'Vielen Dank – das war eine Demo-Bestellung, es wurde nichts bestellt und nichts bezahlt. ',
          'data-einfach': 'Vielen Dank. Das war nur eine Übung. Sie haben nichts bestellt. Sie haben nichts bezahlt. '
        }));
        status.appendChild(el('a', { class: 'textlink', href: 'index.html#kat-titel', text: 'Weiter einkaufen' }));
        spracheAnwenden(status);
        titel.focus();
      });

      var feldElemente = felder.map(function (x) {
        x.box = el('div', { class: 'kasse-feld' }, [x.label, x.eingabe, x.fehlerText]);
        return x.box;
      });

      return el('section', { class: 'kasse-angaben', 'aria-labelledby': 'kasse-titel-angaben' }, [
        el('h2', { id: 'kasse-titel-angaben', text: 'Ihre Angaben (Beispieldaten)', 'data-einfach': 'Ihre Daten (nur Beispiele)' }),
        el('p', { class: 'demo-box kasse-hinweis', text: 'Demo: Bitte nur erfundene Angaben verwenden. Es wird nichts gespeichert und nichts gesendet.',
          'data-einfach': 'Das ist nur eine Übung. Bitte geben Sie keine echten Daten ein. Wir speichern nichts. Wir schicken nichts weg.' }),
        el('p', { class: 'kasse-einleitung', text: 'Sie können die Demo-Kasse ohne Kundenkonto und ohne Anmeldung ausprobieren.',
          'data-einfach': 'Sie können die Demo-Kasse ohne Anmeldung ausprobieren. Sie brauchen kein Konto.' }),
        fehlerBox
      ].concat(feldElemente, [
        el('p', { class: 'kasse-aktion' }, [knopf])
      ]));
    }

    function zeichnen() {
      felderLeeren();
      ziel.textContent = '';
      status.textContent = '';
      var liste = warenkorbLesen();
      if (!liste.length) { leerZeigen(); spracheAnwenden(ziel); return; }
      ziel.appendChild(el('div', { class: 'kasse-raster' }, [uebersicht(liste), formularBereich(liste)]));
      spracheAnwenden(ziel);
    }

    /* Eingaben nicht im Zwischenspeicher des Browsers (Zurück-Taste) liegen lassen */
    window.addEventListener('pagehide', felderLeeren);
    kasseNeuZeichnen = zeichnen;
    zeichnen();
  }

  /* ---------- Start ---------- */
  /* zum Nachvollziehen im Browser (Konsole): studioWarenkorb.hinzufuegen(artikel, menge) */
  window.studioWarenkorb = { hinzufuegen: hinzufuegen, lesen: warenkorbLesen };

  zaehlerAktualisieren();
  window.addEventListener('storage', function () { zaehlerAktualisieren(); });

  /* Zurück-Taste: Seiten aus dem Browser-Zwischenspeicher zeigen sonst einen veralteten Stand.
     pageshow kommt bei jedem Anzeigen der Seite – Zähler und Warenkorb neu aus dem Speicher lesen. */
  window.addEventListener('pageshow', function (ereignis) {
    zaehlerAktualisieren();
    if (ereignis.persisted && warenkorbNeuZeichnen) warenkorbNeuZeichnen();
    if (ereignis.persisted && kasseNeuZeichnen) kasseNeuZeichnen();   /* Formular frisch, Eingaben verworfen */
  });

  var seite = document.body.getAttribute('data-seite');
  if (seite === 'warenkorb') warenkorbSeite();
  else if (seite === 'kasse') kasseSeite();
  else if (seite === 'produktseite') produktSeite();
  else if (KATALOG && seite === 'start') startseite();
  else if (KATALOG && seite === 'kategorie') kategorieSeite();
})();
