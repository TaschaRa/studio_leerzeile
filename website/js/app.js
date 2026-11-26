/* studio.leerzeile – Verhalten der Seite
   Wird im <head> geladen, damit die Klasse "js" gesetzt ist, bevor die Seite
   gezeichnet wird (sonst blitzt die Handy-Navigation kurz offen auf). */

// 1. Zeigt dem CSS: JavaScript läuft. Nur dann wird die Navigation am Handy zugeklappt.
document.documentElement.classList.add('js');

/* 4. Einfache Sprache
   - Die einfache Fassung steht fest im HTML als data-einfach="…" am jeweiligen Element.
   - Getauscht wird NUR reiner Text: Elemente mit Kind-Elementen (Links, Buttons, Preise in <span> …)
     werden übersprungen, damit keine HTML-Struktur beschädigt wird. Die normale Fassung wird beim
     ersten Tausch in data-normal gemerkt.
   - Gespeichert wird erst nach einem Klick auf den Schalter, und nur "einfach" oder "normal".
   - Ohne JavaScript bleibt die normale Fassung sichtbar (der Schalter ist dann ausgeblendet). */
window.studioSprache = (function () {
  var SCHLUESSEL = 'studio-leerzeile-sprache';

  function gewaehlt() {
    try { return window.localStorage.getItem(SCHLUESSEL) === 'einfach' ? 'einfach' : 'normal'; }
    catch (e) { return 'normal'; }
  }

  function anwenden(wurzel, modus) {
    modus = modus || gewaehlt();
    (wurzel || document).querySelectorAll('[data-einfach]').forEach(function (el) {
      if (el.children.length) return;   /* nur reiner Text – nichts mit Links oder anderen Elementen */
      if (!el.hasAttribute('data-normal')) el.setAttribute('data-normal', el.textContent);
      el.textContent = modus === 'einfach' ? el.getAttribute('data-einfach') : el.getAttribute('data-normal');
    });
    document.documentElement.setAttribute('data-sprache', modus);
    document.querySelectorAll('.sprach-schalter').forEach(function (s) {
      s.setAttribute('aria-pressed', modus === 'einfach' ? 'true' : 'false');
    });
  }

  /* Ansage für Screenreader über eine unsichtbare Statuszeile */
  function ansagen(text) {
    var status = document.getElementById('sprach-status');
    if (!status) return;
    status.textContent = '';
    setTimeout(function () { status.textContent = text; }, 60);
  }

  function umschalten() {
    var neu = gewaehlt() === 'einfach' ? 'normal' : 'einfach';
    try { window.localStorage.setItem(SCHLUESSEL, neu); } catch (e) { /* Speicher gesperrt: gilt dann nur für diese Seite */ }
    anwenden(document, neu);
    ansagen(neu === 'einfach' ? 'Einfache Sprache ist an' : 'Normale Sprache ist an');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var status = document.createElement('p');
    status.id = 'sprach-status';
    status.className = 'sr-nur';
    status.setAttribute('role', 'status');
    document.body.appendChild(status);
    document.querySelectorAll('.sprach-schalter').forEach(function (s) { s.addEventListener('click', umschalten); });
    anwenden(document);
  });

  /* Zurück-Taste / Neuladen aus dem Browser-Zwischenspeicher: Wahl neu einlesen */
  window.addEventListener('pageshow', function () { anwenden(document); });

  return { anwenden: anwenden, gewaehlt: gewaehlt };
})();

document.addEventListener('DOMContentLoaded', function () {
  // 2. Kopfzeile (am Desktop feststehend): feine Linie beim Scrollen,
  //    Höhe merken, damit Sprungziele nicht hinter der Kopfzeile verschwinden
  var kopf = document.querySelector('.kopf');
  if (kopf) {
    var kopfAktualisieren = function () {
      kopf.classList.toggle('gescrollt', window.scrollY > 0);
      document.documentElement.style.setProperty('--kopf-hoehe', kopf.offsetHeight + 'px');
    };
    window.addEventListener('scroll', kopfAktualisieren, { passive: true });
    window.addEventListener('resize', kopfAktualisieren);
    kopfAktualisieren();
  }

  // 3. Menü-Schaltfläche: Navigation auf- und zuklappen
  var knopf = document.querySelector('.menue-knopf');
  var navi = document.getElementById('hauptnavigation');
  if (!knopf || !navi) return;

  function istOffen() {
    return knopf.getAttribute('aria-expanded') === 'true';
  }

  function setzeMenue(offen) {
    navi.classList.toggle('offen', offen);
    // aria-expanded sagt Screenreadern, ob das Menü auf- oder zugeklappt ist
    knopf.setAttribute('aria-expanded', offen ? 'true' : 'false');
  }

  knopf.addEventListener('click', function () {
    setzeMenue(!istOffen());
  });

  // Escape-Taste schließt das Menü und setzt den Fokus zurück auf "Menü"
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && istOffen()) {
      setzeMenue(false);
      knopf.focus();
    }
  });

  // Nach Antippen eines Navigationspunkts schließt sich das Menü
  navi.addEventListener('click', function (e) {
    if (e.target.closest('a')) setzeMenue(false);
  });
});
