const fs = require('fs');
const path = require('path');
const vm = require('vm');
const mocks = require('./mocks/appsScript');

function walk(dir, out) {
  out = out || [];
  fs.readdirSync(dir).forEach(function (f) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  });
  return out;
}

const srcDir = path.join(__dirname, '..', 'src');
const files = walk(srcDir).filter(function (f) { return f.endsWith('.gs'); }).sort();
const code = files.map(function (f) { return fs.readFileSync(f, 'utf8'); }).join('\n;\n');

const sandbox = Object.assign({}, mocks, { console: console });
vm.createContext(sandbox);
try {
  vm.runInContext(code, sandbox, { filename: 'cc-bundle.gs' });
} catch (err) {
  console.error('Failed to load src into sandbox:', err);
  throw err;
}

global.cc = sandbox;
