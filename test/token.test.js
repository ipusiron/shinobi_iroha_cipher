'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { kanaAtCursor, tokenAtCursor, PAIR_TO_IROHA } = require('../shinobi-logic.js');

const kanaCases = [
  ["てき",1,"て"],
  ["てき",2,"き"],
  ["てき",0,"て"],
  ["が",1,"か"],
  ["ー",1,""],
  ["こー",2,""],
  ["A",1,""],
  ["",0,""],
  ["テキ",2,"き"],
  ["てき ",3,""]
];
for (const [text, pos, expected] of kanaCases) {
  test('C-2 ' + JSON.stringify([text, pos]), () => assert.equal(kanaAtCursor(text, pos), expected));
}

const tokenCases = [
  ["身白 土黒",0,"身白","て"],
  ["身白 土黒",1,"身白","て"],
  ["身白 土黒",2,"身白","て"],
  ["身白 土黒",3,"土黒","き"],
  ["身白 土黒",4,"土黒","き"],
  ["身白 土黒",5,"土黒","き"],
  ["身白  土黒",3,"身白","て"],
  ["身白　土黒",3,"土黒","き"],
  ["  身白 土黒  ",0,"",""],
  ["  身白 土黒  ",13,"土黒","き"],
  ["",0,"",""],
  ["   ",2,"",""],
  ["ZZZ 土黒",2,"ZZZ",""],
  ["身白土黒",2,"身白土黒",""]
];
for (const [text, pos, expected, kana] of tokenCases) {
  test('C-3 ' + JSON.stringify([text, pos]), () => {
    assert.equal(tokenAtCursor(text, pos), expected);
    assert.equal(PAIR_TO_IROHA[expected] || '', kana);
  });
}
test('UTF-16カーソルと空・範囲外', () => {
  assert.equal(kanaAtCursor('😀て', 2), '');
  assert.equal(kanaAtCursor('😀て', 3), 'て');
  for (const value of [null, undefined, 1]) {
    assert.doesNotThrow(() => kanaAtCursor(value, NaN));
    assert.doesNotThrow(() => tokenAtCursor(value, -5));
  }
});
