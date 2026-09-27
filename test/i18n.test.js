'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const I18n = require(path.join(root, 'i18n.js'));
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const html = read('index.html');
const script = read('script.js');
const JP = /[぀-ヿ一-鿿]/;

test('i18n 日本語と英語でキーの集合が同じ', () => {
  const ja = Object.keys(I18n.ja);
  const en = Object.keys(I18n.en);
  assert.deepEqual(ja.filter(k => !(k in I18n.en)), [], '英語に無いキーがある');
  assert.deepEqual(en.filter(k => !(k in I18n.ja)), [], '日本語に無いキーがある');
  assert.ok(ja.length >= 90, `キーが少なすぎる: ${ja.length}`);
});

test('i18n 差し込みの名前が日英で一致する', () => {
  const holes = value => [...String(value).matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');
  assert.deepEqual(Object.keys(I18n.ja).filter(k => holes(I18n.ja[k]) !== holes(I18n.en[k])), []);
});

test('i18n index.html が指すキーはすべて辞書にある', () => {
  const keys = new Set();
  for (const m of html.matchAll(/data-i18n(?:-[a-z-]+)?="([^"]+)"/g)) keys.add(m[1]);
  assert.ok(keys.size >= 80, `data-i18n が少なすぎる: ${keys.size}`);
  assert.deepEqual([...keys].filter(k => !(k in I18n.ja)), []);
});

test('i18n script.js が呼ぶキーはすべて辞書にある', () => {
  const keys = new Set();
  for (const m of script.matchAll(/\bI18n\.t\(\s*'([\w.]+)'/g)) keys.add(m[1]);
  for (const m of script.matchAll(/key:\s*'([\w.]+)'/g)) keys.add(m[1]);
  for (const m of script.matchAll(/'(msg\.[\w.]+)'/g)) keys.add(m[1]);
  assert.ok(keys.size >= 10, `t() の呼び出しが少なすぎる: ${keys.size}`);
  assert.deepEqual([...keys].filter(k => !(k in I18n.ja)), []);
});

test('i18n 英語の辞書に訳し忘れの日本語が残っていない', () => {
  // このツールが扱う対象は、英語表示でも日本語の文字のまま出す。
  //   app.langButton : 切り替えボタンは相手の言語を出すのが正しい
  //   table.legend / table.legendWhy : 旁と偏の漢字に英語の読みを添える凡例
  //   rules.chouonValue : 長音記号そのもの
  //   help.encryptStep2 / Step4 / decryptStep2 / Step4 : 入力例と出力例
  //   help.readRowValue / readColValue : 偏と旁の漢字に英語の読みを添える
  //   help.exampleLine1〜4 : 「て」を引く手順の実例
  const expected = new Set([
    'app.langButton', 'table.legend', 'table.legendWhy', 'rules.chouonValue',
    'help.encryptStep2', 'help.encryptStep4', 'help.decryptStep2', 'help.decryptStep4',
    'help.readRowValue', 'help.readColValue',
    'help.exampleLine1', 'help.exampleLine2', 'help.exampleLine3', 'help.exampleLine4'
  ]);
  const left = Object.keys(I18n.en).filter(k => !expected.has(k) && JP.test(I18n.en[k]));
  assert.deepEqual(left, [], `英語に日本語が残っている: ${left.join(' / ')}`);
  // 例外に挙げたキーが、実際に日本語を含んでいることも確かめる（惰性で増えないように）
  const unused = [...expected].filter(k => !JP.test(I18n.en[k]));
  assert.deepEqual(unused, [], `例外に挙げたが日本語を含まない: ${unused.join(' / ')}`);
});

test('i18n t() は差し込みを埋め、知らないキーで throw する', () => {
  assert.match(I18n.t('msg.skipped', { chars: 'A B', count: 2 }), /A B/);
  assert.match(I18n.t('msg.unknown', { tokens: 'ZZZ', count: 1 }), /ZZZ/);
  assert.match(I18n.t('msg.seion', { from: 'が', to: 'か' }), /が → か/);
  assert.throws(() => I18n.t('no.such.key'), /Unknown message/);
});

test('i18n 置換表の見出しは訳さず、辞書にも持たない', () => {
  // 「紫・黒・白・赤・黄・青・色」と「木・火・土・金・水・人・身」は暗号文そのものである。
  // 「てき」の暗号文は「身白 土黒」で、この見出しはその文字を引くための索引にあたる。
  // 訳すと表が自分の出力を説明できなくなるうえ、列幅が 38px から 72px へ広がって
  // 390px 幅で表が枠に収まらなくなる（実測）。
  for (const table of html.matchAll(/<table[^>]*>([\s\S]*?)<\/table>/g)) {
    const headerRow = table[1].match(/<tr>([\s\S]*?)<\/tr>/)[1];
    const columns = [...headerRow.matchAll(/<th[^>]*>(.*?)<\/th>/g)].map(m => m[1]).slice(0, 7);
    assert.deepEqual(columns, ['紫', '黒', '白', '赤', '黄', '青', '色']);
    assert.doesNotMatch(headerRow, /data-i18n/, '見出しに data-i18n を付けてはいけない');
    for (const cell of table[1].matchAll(/<td[^>]*class="last-column"[^>]*>(.*?)<\/td>/g)) {
      assert.match(cell[1], /^[木火土金水人身]$/);
    }
    assert.doesNotMatch(table[1], /data-i18n/, '表のセルに data-i18n を付けてはいけない');
  }
  const dictionary = JSON.stringify(I18n.en);
  for (const word of ['Purple', 'Yellow', 'Wood', 'Metal']) {
    // 凡例（table.legend・help.readRowValue ほか）で説明するのは可。見出しの置き換えは不可
    assert.ok(!new RegExp(`"[^"]*${word}[^"]*"`).test(JSON.stringify({
      a: I18n.en['table.irohaTitle'], b: I18n.en['table.shinobiTitle']
    })), word);
  }
  assert.match(dictionary, /purple/, '凡例で英語の色名を添えている');
});

test('shinobi-logic.js のかなと変換規則には触っていない', () => {
  // 扱う対象は言語を変えても変わらない。訳すのは画面の文言だけ
  const logic = read('shinobi-logic.js');
  assert.doesNotMatch(logic, /I18n|data-i18n|language/, '純ロジックに言語の概念を持ち込まない');
  assert.equal([...logic.matchAll(/"([いろはにほへとちりぬるをわかよたれそつねならむうゐのおくやまけふこえてあさきゆめみしゑひもせすん])":/g)].length, 48);
  for (const hen of ['木', '火', '土', '金', '水', '人', '身']) assert.ok(logic.includes(`"${hen}"`), hen);
  for (const t of ['紫', '黒', '白', '赤', '黄', '青', '色']) assert.ok(logic.includes(`"${t}"`), t);
  // 清音化の対応表がそのまま残っている
  assert.match(logic, /'が': 'か'/);
  assert.match(logic, /'ー': ''/);
});

test('i18n 状態で変わる表示を data-i18n に任せていない', () => {
  // apply() は属性もテキストも無条件に上書きするので、状態を持つものは付けてはいけない
  assert.doesNotMatch(html, /id="themeToggle"[^>]*data-i18n-aria-label/);
  assert.doesNotMatch(html, /class="copy-text"[^>]*data-i18n/);
  assert.doesNotMatch(html, /id="resultMessage"[^>]*data-i18n/);
  assert.doesNotMatch(html, /id="outputText"[^>]*data-i18n/);
  // 代わりに状態から組み立てている
  assert.match(script, /dataset\.state/);
  assert.match(script, /renderThemeToggle\(/);
  assert.match(script, /renderCopyButton\(/);
  assert.match(script, /renderNotices\(/);
  assert.doesNotMatch(script, /copyText\.textContent\s*=\s*['"]/);
});

test('i18n 通知はキーで覚えていて、文字列で持ち回っていない', () => {
  // 表示中の通知を訳された文字列で持つと、言語を変えたときに古い言語のまま残る
  assert.match(script, /resultNotices\s*=/);
  assert.match(script, /copyNotice\s*=/);
  assert.match(script, /notices\.push\(\{\s*key:/);
  assert.doesNotMatch(script, /notices\.push\('/);
  assert.doesNotMatch(script, /messages\.join\('／'\)/);
});

test('i18n 言語を変えたときに描き直す仕掛けがある', () => {
  assert.match(script, /I18n\.init\(\)/);
  assert.match(script, /languagechange/);
  assert.match(script, /retranslate\(/);
  assert.match(script, /langToggle/);
});

test('i18n 切り替えボタンの id は langToggle', () => {
  // 検証用のプローブがこの id を決め打ちで押す
  assert.match(html, /id="langToggle"/);
});

test('i18n i18n.js を他のスクリプトより先に読み込む', () => {
  assert.ok(html.indexOf('<script src="i18n.js"') < html.indexOf('<script src="shinobi-logic.js"'));
  assert.ok(html.indexOf('<script src="shinobi-logic.js"') < html.indexOf('<script src="script.js"'));
});

test('i18n noscript は両方の言語を出す', () => {
  const m = html.match(/<noscript>([\s\S]*?)<\/noscript>/);
  assert.ok(m, 'noscript が無い');
  assert.match(m[1], /JavaScript/);
  assert.match(m[1], JP, 'JSが動かないと切り替えられないので日本語も要る');
  // 1つのテキストノードにする。span で包むと既存の形の検査に引っかかる
  assert.doesNotMatch(m[1], /</);
});

test('i18n 子要素を持つ要素に data-i18n を付けていない', () => {
  // apply() は textContent を置き換えるので、子要素があると消える
  const bad = [];
  for (const m of html.matchAll(/<(\w+)([^>]*\sdata-i18n="[^"]+"[^>]*)>([\s\S]*?)<\/\1>/g)) {
    if (m[3].includes('<')) bad.push(m[1] + ': ' + m[3].slice(0, 40));
  }
  assert.deepEqual(bad, []);
});

test('i18n HTMLに書いた文言が日本語の辞書と一致する', () => {
  // 表示されないフォールバックが辞書と食い違っていると、i18n化で初めて内容が変わる
  const mismatched = [];
  for (const m of html.matchAll(/<(\w+)[^>]*\sdata-i18n="([\w.]+)"[^>]*>([^<&]*)<\/\1>/g)) {
    const expected = I18n.ja[m[2]];
    if (expected !== undefined && m[3] !== expected) mismatched.push(`${m[2]}: ${m[3]} != ${expected}`);
  }
  assert.deepEqual(mismatched, []);
  // 実際に突き合わせた件数が十分あること（正規表現が外れて0件になるのを防ぐ）
  const checked = [...html.matchAll(/<(\w+)[^>]*\sdata-i18n="([\w.]+)"[^>]*>([^<&]*)<\/\1>/g)]
    .filter(m => I18n.ja[m[2]] !== undefined);
  assert.ok(checked.length >= 45, `突き合わせた件数が少なすぎる: ${checked.length}`);
});

test('i18n HTMLに残る和文は、扱う対象のかなと暗号文だけである', () => {
  // data-i18n を持つ要素をタグごと落とした残りを見る
  let rest = html.replace(/<(\w+)[^>]*\sdata-i18n="[^"]+"[^>]*>[\s\S]*?<\/\1>/g, '');
  rest = rest.replace(/<!--[\s\S]*?-->/g, '');
  const lines = rest.split('\n').map(l => l.trim()).filter(l => JP.test(l));
  // 例外は次のとおり。いずれもツールが扱うデータか、JSが動かないときの表示である
  const allowed = [
    /meta name="description"/,
    /<title>/,
    /<noscript>/,
    /data-kana=/,
    /^<tr><td>/,
    /^<th>[紫黒白赤黄青色]<\/th>$/,
    /aria-label="(使い方・説明|ダークモードに切り替える|言語を切り替える|表示する内容|閉じる)"/,
    /title="(テーマ切り替え|結果をコピー|使い方・説明|日本語と英語を切り替える)"/,
    /alt="忍びいろはの構成表"/,
    /placeholder="ここにテキストを入力/,
    // JSが状態から書き換えるスロット。data-i18n を付けると押した直後の表示が巻き戻る
    /<span class="copy-text">コピー<\/span>/,
    // 清音変換ルールの矢印の左右。かなそのものなので訳さない
    /→[ぁ-ゖ]|→削除/,
    // ヘルプの実例。暗号文そのもの
    /「だいじょうぶ」→「たいしようふ」/
  ];
  const unexpected = lines.filter(line => !allowed.some(re => re.test(line)));
  assert.deepEqual(unexpected, [], `想定外の和文が残っている:\n${unexpected.join('\n')}`);
});

test('i18n 隣り合う文言のあいだに英語の空白がある', () => {
  // 英語は語のあいだに空白が要る。マークアップ側に空白が無い並びでは、
  // 辞書の文字列がそれを持っていないと Katakana:turned のようにくっつく
  const stuck = [];
  const adjacent = /data-i18n="([\w.]+)">[^<]*<\/\w+><(?:\w+)[^>]*data-i18n="([\w.]+)"/g;
  for (const m of html.matchAll(adjacent)) {
    const [, before, after] = m;
    const ok = /\s$/.test(I18n.en[before]) || /^[\s:]/.test(I18n.en[after]);
    if (!ok) stuck.push(`${before} + ${after} => ${I18n.en[before]}${I18n.en[after]}`);
  }
  assert.deepEqual(stuck, []);
  assert.ok([...html.matchAll(adjacent)].length >= 12, '並びが検出できていない');
  // ラベルのあとに素の和文（扱う対象のかな）が続く並びも同じ
  for (const m of html.matchAll(/data-i18n="([\w.]+)">[^<]*<\/strong>([^<\s])/g)) {
    assert.match(I18n.en[m[1]], /\s$/, `${m[1]} の英語が空白で終わっていない`);
  }
});

test('i18n README が日英で行き来できる', () => {
  const readme = read('README.md');
  const readmeEn = read('README.en.md');
  assert.match(readme, /\[English\]\(README\.en\.md\)/);
  assert.match(readmeEn, /\[日本語\]\(README\.md\)/);
  for (const entry of ['i18n.js', 'README.en.md', 'test/i18n.test.js']) {
    assert.ok(readme.includes(entry), `README.md の構造図に ${entry} が無い`);
  }
});
