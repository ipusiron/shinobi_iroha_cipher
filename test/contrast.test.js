'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const css = fs.readFileSync(path.join(__dirname, '../style.css'), 'utf8');
const parse = body => Object.fromEntries([...body.matchAll(/--([\w-]+):\s*(#[\da-f]+)/gi)].map(m => [m[1], m[2]]));
const light = parse(css.match(/:root\s*\{([^}]+)/)[1]);
const dark = { ...light, ...parse(css.match(/\[data-theme="dark"\]\s*\{([^}]+)/)[1]) };
function luminance(hex) {
  const expanded = hex.length === 4 ? '#' + [...hex.slice(1)].map(ch => ch + ch).join('') : hex;
  const values = expanded.slice(1).match(/../g).map(part => {
    const c = parseInt(part, 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
}
const pairs = [
  ...['bg-secondary', 'bg-primary', 'bg-tertiary', 'bg-gradient-start', 'bg-gradient-end', 'bg-select']
    .map(bg => ['text-primary', bg]),
  ...['bg-primary', 'bg-secondary', 'bg-tertiary', 'bg-gradient-start', 'bg-gradient-end'].map(bg => ['text-secondary', bg]),
  ...['bg-secondary', 'bg-primary', 'bg-tertiary', 'bg-gradient-start', 'bg-gradient-end'].map(bg => ['text-accent', bg]),
  ['text-link', 'bg-primary'], ['text-link', 'bg-secondary'],
  ['text-table-header', 'bg-table-header'], ['text-table-last', 'bg-table-last'],
  ['text-table-cell', 'bg-table-cell'], ['text-input', 'bg-textarea'], ['text-input', 'bg-output'],
  ['text-on-accent', 'accent-surface'], ['text-on-success', 'success-surface']
];
test('E-1 ライト・ダーク各25組と面の区別', () => {
  assert.equal(pairs.length, 25);
  for (const theme of [light, dark]) {
    for (const [fg, bg] of pairs) {
      const a = luminance(theme[fg]), b = luminance(theme[bg]);
      assert.ok((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) >= 4.5, fg + '/' + bg);
    }
    for (const bg of ['bg-tertiary', 'bg-table-cell']) {
      const a = luminance(theme['accent-surface']), b = luminance(theme[bg]);
      assert.ok((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) >= 3);
    }
  }
});
