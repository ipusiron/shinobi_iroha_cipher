'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { encrypt, decrypt, normalizeToSeion, IROHA_TO_PAIR, PAIR_TO_IROHA } = require('../shinobi-logic.js');

// A-3の固定期待値（実装から生成しない）
const encryptionCases = [
  ["てき","てき","身白 土黒",[]],
  ["てきみゆ","てきみゆ","身白 土黒 人黒 金黒",[]],
  ["だいじょうぶ","たいしようふ","火黄 木色 身黒 木黄 土赤 金白",[]],
  ["しのび","しのひ","身黒 水赤 火紫",[]],
  ["にんじゃ","にんしや","金色 人紫 身黒 木白",[]],
  ["いろは","いろは","木色 火色 土色",[]],
  ["コーヒー","こひ","水白 火紫",[]],
  ["テキミユ","てきみゆ","身白 土黒 人黒 金黒",[]],
  ["ﾃｷ","てき","身白 土黒",[]],
  ["きょうと","きようと","土黒 木黄 土赤 身色",[]],
  ["てきABC漢字","てきABC漢字","身白 土黒",["A","B","C","漢","字"]],
  ["てき!","てき!","身白 土黒",["!"]],
  ["てき てき","てき てき","身白 土黒 身白 土黒",[]],
  ["","","",[]],
  ["   ","   ","",[]],
  ["ー","","",[]],
  ["ーー","","",[]],
  ["ヴぁいおりん","うあいおりん","土赤 木黒 木色 人赤 火青 人紫",[]],
  ["がぎぐげご","かきくけこ","身青 土黒 身赤 土白 水白",[]],
  ["ぱぴぷぺぽ","はひふへほ","土色 火紫 金白 人色 水色",[]],
  ["っっっ","つつつ","水黄 水黄 水黄",[]],
  ["ゐゑを","ゐゑを","金赤 木紫 水青",[]],
  ["Ａ１","A1","",["A","1"]],
  ["てき\nみゆ","てき\nみゆ","身白 土黒 人黒 金黒",[]]
];
for (const [input, seion, cipher, skipped] of encryptionCases) {
  test('A-3 暗号化 ' + JSON.stringify(input), () => {
    assert.deepEqual(encrypt(input), { seion, cipher, skipped });
  });
}

// A-4の固定期待値
const decryptionCases = [
  ["身白 土黒","てき",[]],
  ["身白　土黒","てき",[]],
  ["身白\n土黒","てき",[]],
  ["  身白 土黒  ","てき",[]],
  ["","",[]],
  ["   ","",[]],
  ["身白 ZZZ 土黒","て?き",["ZZZ"]],
  ["身白土黒","?",["身白土黒"]],
  ["人紫","ん",[]],
  ["木色 火色 土色","いろは",[]],
  ["身白 土黒 人黒 金黒","てきみゆ",[]]
];
for (const [input, plain, unknown] of decryptionCases) {
  test('A-4 復号 ' + JSON.stringify(input), () => {
    assert.deepEqual(decrypt(input), { plain, unknown });
  });
}

test('A-5 48文字・座標重複なし・全件往復', () => {
  const iroha = 'いろはにほへとちりぬるをわかよたれそつねならむうゐのおくやまけふこえてあさきゆめみしゑひもせすん';
  assert.equal(Object.keys(IROHA_TO_PAIR).length, 48);
  assert.equal(Object.keys(PAIR_TO_IROHA).length, 48);
  assert.equal(encrypt(iroha).cipher.split(' ').length, 48);
  assert.equal(decrypt(encrypt(iroha).cipher).plain, iroha);
  for (const ch of iroha) assert.equal(decrypt(encrypt(ch).cipher).plain, ch);
  assert.equal(PAIR_TO_IROHA['身紫'], undefined);
});

test('A-5 清音化・表外除去後の往復', () => {
  const cases = [
    ['だいじょうぶ', 'たいしようふ', '火黄 木色 身黒 木黄 土赤 金白', 'たいしようふ'],
    ['コーヒーをのむ', 'こひをのむ', '水白 火紫 水青 水赤 火赤', 'こひをのむ'],
    ['てきABC漢字みゆ', 'てきABC漢字みゆ', '身白 土黒 人黒 金黒', 'てきみゆ'],
    ['ヴぁいおりん', 'うあいおりん', '土赤 木黒 木色 人赤 火青 人紫', 'うあいおりん']
  ];
  for (const [input, seion, cipher, plain] of cases) {
    assert.equal(encrypt(input).seion, seion);
    assert.equal(encrypt(input).cipher, cipher);
    assert.equal(decrypt(cipher).plain, plain);
  }
  for (const [input] of encryptionCases) {
    const result = encrypt(input);
    const expected = [...result.seion].filter(ch => Object.hasOwn(IROHA_TO_PAIR, ch)).join('');
    assert.equal(decrypt(result.cipher).plain, expected);
  }
});

test('正規化・境界・不正入力', () => {
  assert.equal(normalizeToSeion('か\u3099ヴヵヶ'), 'かうかけ');
  assert.deepEqual(encrypt('😀てき'), { seion: '😀てき', cipher: '身白 土黒', skipped: ['😀'] });
  assert.equal(encrypt('て'.repeat(10000)).cipher.split(' ').length, 10000);
  assert.equal(decrypt(encrypt('て'.repeat(10000)).cipher).plain, 'て'.repeat(10000));
  for (const value of [null, undefined, 123, '', '　', 'ー', '😀']) {
    assert.doesNotThrow(() => encrypt(value));
    assert.doesNotThrow(() => decrypt(value));
    assert.doesNotThrow(() => normalizeToSeion(value));
  }
  assert.deepEqual(decrypt('toString constructor __proto__'), {
    plain: '???', unknown: ['toString', 'constructor', '__proto__']
  });
});
