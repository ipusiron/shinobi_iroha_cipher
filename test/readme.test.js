'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { encrypt, IROHA_TO_PAIR } = require('../shinobi-logic.js');
const root = path.join(__dirname, '..');
const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
const rowsOf = section => section.split('\n').filter(line => /^\|/.test(line))
  .filter(line => !/^\|[-\s|]+$/.test(line)).map(line => line.split('|').slice(1, -1).map(s => s.trim()));

test('README置換表48件と空きマス', () => {
  const section = readme.split('#### いろは仮名との対応')[1].split('2つの表により')[0];
  const [columns, ...rows] = rowsOf(section);
  assert.equal(rows.length, 7);
  assert.equal(columns.length, 8);
  let count = 0;
  for (const cells of rows) {
    assert.equal(cells.length, 8);
    cells.slice(0, 7).forEach((kana, i) => {
      if (kana === '-') assert.equal(cells[7] + columns[i], '身紫');
      else {
        assert.deepEqual(IROHA_TO_PAIR[kana], { hen: cells[7], tsukuri: columns[i] });
        count++;
      }
    });
  }
  assert.equal(count, 48);
});

test('README暗号化の例12件を再計算', () => {
  const section = readme.split('### 暗号化の例')[1].split('### ハイライト機能')[0];
  const rows = rowsOf(section).slice(1);
  assert.equal(rows.length, 12);
  for (const [input, seion, cipher] of rows) {
    assert.equal(encrypt(input).seion, seion);
    assert.equal(encrypt(input).cipher, cipher);
  }
});

test('脆弱性実証例の13トークン・異なり7種・頻度', () => {
  const section = readme.split('### 📊 脆弱性実証例')[1].split('### ツールの安全対策')[0];
  const get = label => section.match(new RegExp('- ' + label + '：`([^`]+)`'))[1];
  const result = encrypt(get('平文'));
  assert.equal(result.seion, get('清音'));
  assert.equal(result.cipher, get('暗号文'));
  const tokens = result.cipher.split(' ');
  assert.equal(tokens.length, 13);
  assert.equal(new Set(tokens).size, 7);
  assert.match(section, /トークン数：13/);
  assert.match(section, /異なり：7種/);
  const rows = rowsOf(section).slice(1);
  assert.equal(rows.length, 3);
  for (const [token, count, kana] of rows) {
    assert.equal(tokens.filter(t => t === token).length, Number(count));
    assert.equal(encrypt(kana).cipher, token);
  }
});

test('YAML構造・固定値・HEADとの一致・定型文', () => {
  const head = execFileSync('git', ['show', 'HEAD:README.md'], { cwd: root, encoding: 'utf8' });
  const block = text => text.match(/^<!--[\s\S]*?-->/)[0];
  const yaml = block(readme);
  const headYaml = block(head);
  const keys = text => [...text.matchAll(/^([a-z_]+):/gm)].map(m => m[1]);
  assert.deepEqual(keys(yaml), keys(headYaml));
  for (const key of ['category_ja', 'category_en', 'tags']) {
    assert.match(yaml, new RegExp(key + ':\\r?\\n  - '));
  }
  for (const key of ['id', 'slug', 'repo_url', 'demo_url', 'hub']) {
    const get = text => text.match(new RegExp('^' + key + ': (.+)$', 'm'))[1];
    assert.equal(get(yaml), get(headYaml));
  }
  assert.match(yaml, /id: day014/);
  assert.match(yaml, /slug: shinobi_iroha_cipher/);
  assert.match(yaml, /hub: true/);
  assert.match(readme, /Day014 - 生成AIで作るセキュリティツール100/);
  const about = text => text.split(/## 🛠️? このツールについて/)[1].trim();
  assert.equal(about(readme), about(head));
  assert.match(about(readme), /page_id=42163/);
});

test('README画像5枚の参照先が実在する', () => {
  const images = [...readme.matchAll(/!\[[^\]]*\]\((?!https?:)([^)]+)\)/g)].map(m => m[1]);
  assert.equal(images.length, 5);
  for (const image of images) assert.ok(fs.existsSync(path.join(root, image)), image);
  for (let i = 2; i <= 5; i++) assert.ok(images.includes('assets/screenshot' + i + '.png'));
});
