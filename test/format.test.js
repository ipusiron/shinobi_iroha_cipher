'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
test('整形済みファイルの最長行と行数', () => {
  const files = ['script.js', 'shinobi-logic.js', 'style.css', 'index.html',
    ...fs.readdirSync(__dirname).filter(f => f.endsWith('.js')).map(f => 'test/' + f)];
  const minimum = { 'style.css': 600, 'index.html': 200, 'script.js': 150, 'shinobi-logic.js': 80 };
  for (const file of files) {
    const lines = fs.readFileSync(path.join(root, file), 'utf8').split(/\r?\n/);
    const limit = file === 'index.html' ? 250 : 160;
    lines.forEach((line, i) => assert.ok([...line].length <= limit, file + ':' + (i + 1) + ' length=' + [...line].length));
    if (minimum[file]) assert.ok(lines.length >= minimum[file], file);
  }
});
