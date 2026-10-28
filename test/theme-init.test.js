'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const source = read('theme-init.js');

// theme-init.jsを、保存値とOS設定を差し替えた仮のwindowで動かし、<html>のdata-themeを返す
function run({ saved = null, prefersDark = false, storageThrows = false } = {}) {
  const attrs = {};
  const window = {
    localStorage: { getItem: () => { if (storageThrows) throw new Error('blocked'); return saved; } },
    matchMedia: () => ({ matches: prefersDark }),
    document: { documentElement: { setAttribute: (name, value) => { attrs[name] = value; } } }
  };
  vm.runInNewContext(source, { window });
  return attrs['data-theme'];
}

test('theme-init 保存値がなければOSの設定によらずライト', () => {
  assert.equal(run({ prefersDark: false }), 'light');
  assert.equal(run({ prefersDark: true }), 'light');
});

test('theme-init 保存値light・darkをそのまま使う', () => {
  assert.equal(run({ saved: 'dark', prefersDark: false }), 'dark');
  assert.equal(run({ saved: 'light', prefersDark: true }), 'light');
});

test('theme-init 想定外の保存値はライト', () => {
  assert.equal(run({ saved: 'blue' }), 'light');
  assert.equal(run({ saved: 'Dark', prefersDark: true }), 'light');
});

test('theme-init localStorageが使えなくても落ちず、ライト', () => {
  assert.equal(run({ storageThrows: true, prefersDark: true }), 'light');
});

test('theme-init index.htmlの<head>で、style.cssのあとに同期で読み込む', () => {
  const html = read('index.html');
  const head = html.slice(0, html.indexOf('</head>'));
  assert.ok(head.includes('<script src="theme-init.js"></script>'), '<head>にtheme-init.jsがない');
  assert.ok(head.indexOf('href="style.css"') < head.indexOf('theme-init.js'));
});
