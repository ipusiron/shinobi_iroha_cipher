'use strict';

// 濁点・半濁点・促音を清音に変換するマッピング
const DAKUTEN_TO_SEION = {
  // 濁点 (が行)
  'が': 'か', 'ぎ': 'き', 'ぐ': 'く', 'げ': 'け', 'ご': 'こ',
  // 濁点 (ざ行)
  'ざ': 'さ', 'じ': 'し', 'ず': 'す', 'ぜ': 'せ', 'ぞ': 'そ',
  // 濁点 (だ行)
  'だ': 'た', 'ぢ': 'ち', 'づ': 'つ', 'で': 'て', 'ど': 'と',
  // 濁点 (ば行)
  'ば': 'は', 'び': 'ひ', 'ぶ': 'ふ', 'べ': 'へ', 'ぼ': 'ほ',
  // 半濁点 (ぱ行)
  'ぱ': 'は', 'ぴ': 'ひ', 'ぷ': 'ふ', 'ぺ': 'へ', 'ぽ': 'ほ',
  // 促音・長音
  'っ': 'つ',
  'ー': '', // 長音は除去
  // その他特殊文字
  'ゃ': 'や', 'ゅ': 'ゆ', 'ょ': 'よ',
  'ぁ': 'あ', 'ぃ': 'い', 'ぅ': 'う', 'ぇ': 'え', 'ぉ': 'お',
  'ゔ': 'う', 'ゕ': 'か', 'ゖ': 'け'
};

// 文字を清音に変換する関数
function normalizeToSeion(text) {
  return [...String(text).normalize('NFKC')].map(char => {
    const code = char.codePointAt(0);
    const kana = code >= 0x30A1 && code <= 0x30F6 ? String.fromCodePoint(code - 0x60) : char;
    return Object.prototype.hasOwnProperty.call(DAKUTEN_TO_SEION, kana) ? DAKUTEN_TO_SEION[kana] : kana;
  }).join('');
}

const IROHA_TO_PAIR = {
  "い": { hen: "木", tsukuri: "色" }, "ろ": { hen: "火", tsukuri: "色" }, "は": { hen: "土", tsukuri: "色" },
  "に": { hen: "金", tsukuri: "色" }, "ほ": { hen: "水", tsukuri: "色" }, "へ": { hen: "人", tsukuri: "色" },
  "と": { hen: "身", tsukuri: "色" }, "ち": { hen: "木", tsukuri: "青" }, "り": { hen: "火", tsukuri: "青" },
  "ぬ": { hen: "土", tsukuri: "青" }, "る": { hen: "金", tsukuri: "青" }, "を": { hen: "水", tsukuri: "青" },
  "わ": { hen: "人", tsukuri: "青" }, "か": { hen: "身", tsukuri: "青" }, "よ": { hen: "木", tsukuri: "黄" },
  "た": { hen: "火", tsukuri: "黄" }, "れ": { hen: "土", tsukuri: "黄" }, "そ": { hen: "金", tsukuri: "黄" },
  "つ": { hen: "水", tsukuri: "黄" }, "ね": { hen: "人", tsukuri: "黄" }, "な": { hen: "身", tsukuri: "黄" },
  "ら": { hen: "木", tsukuri: "赤" }, "む": { hen: "火", tsukuri: "赤" }, "う": { hen: "土", tsukuri: "赤" },
  "ゐ": { hen: "金", tsukuri: "赤" }, "の": { hen: "水", tsukuri: "赤" }, "お": { hen: "人", tsukuri: "赤" },
  "く": { hen: "身", tsukuri: "赤" }, "や": { hen: "木", tsukuri: "白" }, "ま": { hen: "火", tsukuri: "白" },
  "け": { hen: "土", tsukuri: "白" }, "ふ": { hen: "金", tsukuri: "白" }, "こ": { hen: "水", tsukuri: "白" },
  "え": { hen: "人", tsukuri: "白" }, "て": { hen: "身", tsukuri: "白" }, "あ": { hen: "木", tsukuri: "黒" },
  "さ": { hen: "火", tsukuri: "黒" }, "き": { hen: "土", tsukuri: "黒" }, "ゆ": { hen: "金", tsukuri: "黒" },
  "め": { hen: "水", tsukuri: "黒" }, "み": { hen: "人", tsukuri: "黒" }, "し": { hen: "身", tsukuri: "黒" },
  "ゑ": { hen: "木", tsukuri: "紫" }, "ひ": { hen: "火", tsukuri: "紫" }, "も": { hen: "土", tsukuri: "紫" },
  "せ": { hen: "金", tsukuri: "紫" }, "す": { hen: "水", tsukuri: "紫" }, "ん": { hen: "人", tsukuri: "紫" }
};

const PAIR_TO_IROHA = {};
for (const [kana, pair] of Object.entries(IROHA_TO_PAIR)) {
  const key = pair.hen + pair.tsukuri;
  PAIR_TO_IROHA[key] = kana;
}

// 表にない文字は除き、空白以外を通知用に返す
function encrypt(text) {
  const seion = normalizeToSeion(text);
  const tokens = [];
  const skipped = [];
  for (const char of seion) {
    if (Object.prototype.hasOwnProperty.call(IROHA_TO_PAIR, char)) {
      const pair = IROHA_TO_PAIR[char];
      tokens.push(pair.hen + pair.tsukuri);
    } else if (!/\s/u.test(char)) {
      skipped.push(char);
    }
  }
  return { cipher: tokens.join(' '), seion, skipped };
}

// 暗号文は空白で区切る。未知のかたまりは復号せず通知する
function decrypt(text) {
  const tokens = String(text).trim().split(/\s+/u).filter(Boolean);
  const unknown = [];
  const plain = tokens.map(token => {
    if (Object.prototype.hasOwnProperty.call(PAIR_TO_IROHA, token)) {
      return PAIR_TO_IROHA[token];
    }
    unknown.push(token);
    return '?';
  }).join('');
  return { plain, unknown };
}

// selectionStartと同じUTF-16位置で、直前のコードポイントを選ぶ
function kanaAtCursor(text, pos) {
  const input = String(text);
  const index = Math.max(0, Math.min(Number.isFinite(pos) ? Math.trunc(pos) - 1 : 0, input.length - 1));
  let start = 0;
  for (const char of input) {
    if (start + char.length > index) {
      const kana = normalizeToSeion(char);
      return Object.prototype.hasOwnProperty.call(IROHA_TO_PAIR, kana) ? kana : '';
    }
    start += char.length;
  }
  return '';
}

// 文字上ではそのかたまり、空白上・末尾では直前のかたまりを返す
function tokenAtCursor(text, pos) {
  const input = String(text);
  const index = Math.max(0, Math.min(Number.isFinite(pos) ? Math.trunc(pos) : 0, input.length));
  let previous = '';
  for (const match of input.matchAll(/\S+/gu)) {
    if (index < match.index) return previous;
    if (index < match.index + match[0].length) return match[0];
    previous = match[0];
  }
  return previous;
}

const ShinobiLogic = {
  DAKUTEN_TO_SEION, IROHA_TO_PAIR, PAIR_TO_IROHA, normalizeToSeion,
  encrypt, decrypt, tokenAtCursor, kanaAtCursor
};
globalThis.ShinobiLogic = ShinobiLogic;
if (typeof module === 'object' && module.exports) module.exports = ShinobiLogic;
