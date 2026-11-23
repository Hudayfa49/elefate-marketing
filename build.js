// Plakt de header en footer in elke pagina. Draait automatisch bij elke deploy op Vercel.
// Wil je het menu of de footer aanpassen? Pas dan alleen de bestanden in de map "partials" aan.
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'dist');
const SKIP = new Set(['.git', '.github', '.vercel', 'node_modules', 'dist', 'partials', 'build.js', 'package.json', 'package-lock.json', 'vercel.json', 'README.md', '.gitignore']);

function read(name) {
  return fs.readFileSync(path.join(ROOT, 'partials', name), 'utf8').replace(/\n$/, '');
}
const header = read('header.html');
const footer = read('footer.html');
const cta = read('cta.html');
const progress = '<div class="progress" aria-hidden="true"><i></i></div>';

function options(text) {
  const o = {};
  const re = /(\w+)(?:="([^"]*)")?/g;
  let m;
  while ((m = re.exec(text))) o[m[1]] = m[2] === undefined ? true : m[2];
  return o;
}

function render(html, file) {
  const out = html.replace(/<!--@include\s+(header|footer)([^>]*?)-->/g, (all, name, rest) => {
    const o = options(rest);
    if (name === 'header') {
      return header
        .replace(/\{\{on:(\w+)\}\}/g, (_, k) => (o.active === k ? ' on' : ''))
        .replace(/\{\{cur:(\w+)\}\}/g, (_, k) => (o.active === k ? ' aria-current="page"' : ''))
        .replace('{{progress}}', o.progress ? progress : '');
    }
    return footer.replace('{{cta}}', o.nocta ? '' : cta);
  });
  if (out.includes('<!--@include') || /\{\{(on|cur):|\{\{progress\}\}|\{\{cta\}\}/.test(out)) {
    throw new Error('Niet alles is ingevuld in ' + file);
  }
  return out;
}

let pages = 0;
let files = 0;

function walk(dir, rel) {
  for (const name of fs.readdirSync(dir)) {
    if (name === '.DS_Store' || (rel === '' && SKIP.has(name))) continue;
    const src = path.join(dir, name);
    const dest = path.join(OUT, rel, name);
    if (fs.statSync(src).isDirectory()) {
      walk(src, path.join(rel, name));
    } else if (name.endsWith('.html')) {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, render(fs.readFileSync(src, 'utf8'), path.join(rel, name)));
      pages++;
    } else {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(src, dest);
      files++;
    }
  }
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
walk(ROOT, '');
console.log('Klaar: ' + pages + ' pagina\'s samengesteld, ' + files + ' andere bestanden gekopieerd.');
