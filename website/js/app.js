/* studio.leerzeile – Verhalten der Seite
   Wird im <head> geladen, damit die Klasse "js" gesetzt ist, bevor die Seite
   gezeichnet wird (sonst blitzt die Handy-Navigation kurz offen auf). */

// 1. Zeigt dem CSS: JavaScript läuft. Nur dann wird die Navigation am Handy zugeklappt.
document.documentElement.classList.add('js');

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
