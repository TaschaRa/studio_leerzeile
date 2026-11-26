// Kleiner statischer Server für die lokale Vorschau (nur localhost, keine Abhängigkeiten).
// Hilfswerkzeug für Claude Code – gehört nicht zur Website.
// Start aus dem Projektordner:  node werkzeuge/vorschau-server.js . 8080
// Danach im Browser:            http://localhost:8080/website/index.html
const http = require('http');
const fs = require('fs');
const path = require('path');

const wurzel = path.resolve(process.argv[2] || '.');
const port = Number(process.argv[3] || 8080);
const typen = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };

http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  if (p === '/') { res.writeHead(302, { Location: '/website/index.html' }); return res.end(); }
  let datei = path.join(wurzel, p);
  if (!datei.startsWith(wurzel)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(datei) && fs.statSync(datei).isDirectory()) datei = path.join(datei, 'index.html');
  fs.readFile(datei, (err, daten) => {
    if (err) { res.writeHead(404); return res.end('Nicht gefunden'); }
    res.writeHead(200, { 'Content-Type': typen[path.extname(datei).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(daten);
  });
}).listen(port, '127.0.0.1', () => console.log(`Vorschau: http://localhost:${port}/website/index.html`));
