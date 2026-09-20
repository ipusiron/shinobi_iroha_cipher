'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const html = read('index.html');
const css = read('style.css');
const attrs = tag => Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(m => [m[1], m[2]]));
const tagById = id => [...html.matchAll(/<[^!/>][^>]*>/g)].map(m => m[0]).find(tag => attrs(tag).id === id);

test('head・CSP・通信なし・古典スクリプトの順序', () => {
  for (const name of ['viewport', 'description']) assert.match(html, new RegExp('name="' + name + '"'));
  assert.match(html, /name="referrer" content="no-referrer"/);
  assert.match(html, /<noscript>/);
  assert.match(html, /<link rel="icon" href="favicon.svg"/);
  const csp = attrs(html.match(/<meta[^>]+http-equiv="Content-Security-Policy"[^>]*>/)[0]).content;
  for (const directive of [
    "default-src 'self'", "script-src 'self'", "style-src 'self'", "img-src 'self' data:", "font-src 'self'",
    "connect-src 'none'", "object-src 'none'", "base-uri 'self'", "form-action 'self'"
  ]) assert.ok(csp.split(';').map(s => s.trim()).includes(directive), directive);
  assert.doesNotMatch(csp, /frame-ancestors|unsafe-inline|unsafe-eval/);
  assert.doesNotMatch(html, /\son\w+\s*=|\sstyle\s*=|<style\b|type="module"/i);
  assert.deepEqual([...html.matchAll(/<script([^>]*)>/g)].map(m => m[1]),
    [' src="shinobi-logic.js" defer', ' src="script.js" defer']);
  assert.doesNotMatch(html, /<(?:script|link|img)\b[^>]*(?:src|href)="https?:/i);
  assert.doesNotMatch(css, /@import|http/);
});

test('ARIA・主要ID・見出し・外部リンク', () => {
  for (const id of ['inputText', 'mode', 'outputText', 'resultMessage', 'cipherTable', 'copyButton',
    'helpButton', 'themeToggle', 'helpModal']) assert.ok(tagById(id), id);
  for (const id of ['outputText', 'resultMessage']) assert.equal(attrs(tagById(id))['aria-live'], 'polite');
  assert.match(html, /<label for="inputText"/);
  assert.match(html, /role="tablist"/);
  const tabs = [...html.matchAll(/<button[^>]*role="tab"[^>]*>/g)].map(m => attrs(m[0]));
  assert.equal(tabs.length, 2);
  for (const tab of tabs) {
    assert.ok(['true', 'false'].includes(tab['aria-selected']));
    const panel = attrs(tagById(tab['aria-controls']));
    assert.equal(panel.role, 'tabpanel');
    assert.equal(panel['aria-labelledby'], tab.id);
  }
  const modal = attrs(tagById('helpModal'));
  assert.equal(modal.role, 'dialog');
  assert.equal(modal['aria-modal'], 'true');
  assert.ok(tagById(modal['aria-labelledby']));
  for (const link of html.matchAll(/<a\b[^>]*href="https?:[^>]*>/g)) {
    assert.equal(attrs(link[0]).rel, 'noopener noreferrer');
  }
  const levels = [...html.matchAll(/<h([1-6])\b/g)].map(m => +m[1]);
  assert.equal(levels[0], 1);
  for (let i = 1; i < levels.length; i++) assert.ok(levels[i] <= levels[i - 1] + 1);
});

test('DOM非依存・禁止処理なし・npmとCIの固定契約', () => {
  const logic = read('shinobi-logic.js');
  const script = read('script.js');
  assert.doesNotMatch(logic, /document|window|localStorage/);
  for (const code of [logic, script]) {
    assert.doesNotMatch(code, /innerHTML|insertAdjacentHTML|document\.write|console\.log|Math\.random|eval/);
  }
  assert.doesNotMatch(script, /\.style\./);
  assert.deepEqual(JSON.parse(read('package.json')),
    { name: 'shinobi_iroha_cipher', private: true, scripts: { test: 'node --test' } });
  const workflow = read('.github/workflows/test.yml');
  for (const expected of ['push', 'pull_request', 'contents: read', 'node-version: 22', 'npm test']) {
    assert.ok(workflow.includes(expected));
  }
  assert.equal(read('.nojekyll'), '');
});

test('HTMLの2枚の表は48件・身紫だけ空きでロジックと一致', () => {
  const { IROHA_TO_PAIR } = require('../shinobi-logic.js');
  const tables = [...html.matchAll(/<table[^>]*>([\s\S]*?)<\/table>/g)];
  assert.equal(tables.length, 2);
  for (const table of tables) {
    const rows = [...table[1].matchAll(/<tr>([\s\S]*?)<\/tr>/g)];
    assert.equal(rows.length, 8);
    const columns = [...rows[0][1].matchAll(/<th[^>]*>(.*?)<\/th>/g)].map(m => m[1]).slice(0, 7);
    assert.deepEqual(columns, ['紫', '黒', '白', '赤', '黄', '青', '色']);
    let count = 0;
    for (const row of rows.slice(1)) {
      const cells = [...row[1].matchAll(/<td[^>]*>(.*?)<\/td>/g)].map(m => m[1]);
      assert.equal(cells.length, 8);
      cells.slice(0, 7).forEach((kana, i) => {
        if (kana) {
          assert.deepEqual(IROHA_TO_PAIR[kana], { hen: cells[7], tsukuri: columns[i] });
          count++;
        } else {
          assert.equal(cells[7] + columns[i], '身紫');
        }
      });
    }
    assert.equal(count, 48);
  }
});
