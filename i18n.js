'use strict';

// 日本語と英語の文言。画面を書くスクリプトは言語ごとの文字列を持たない。
//
// このツールが扱う対象は訳さない。具体的には次のものである。
//   - いろは仮名48文字（表のセル、清音変換ルールの矢印の左右）
//   - 旁（つくり）の「紫・黒・白・赤・黄・青・色」と偏（へん）の「木・火・土・金・水・人・身」
// 後者は暗号文そのものである。「てき」の暗号文は「身白 土黒」であり、表の見出しは
// その文字を引くための索引にあたる。英語の色名に置き換えると、表が自分の出力を
// 説明できなくなる。代わりに table.legend で英語の対応を添える。
const I18n = (() => {
  const ja = {
    'app.title': '忍びいろはの暗号ツール（Shinobi Iroha Cipher Tool）',
    'app.description':
      '『万川集海』の忍びいろは暗号を体験するツールです。清音に直したかなを偏と旁の組み合わせで暗号化・復号できます。',
    'app.headingMain': '忍びいろはの暗号ツール',
    'app.headingSub': '（Shinobi Iroha Cipher Tool）',
    'app.langButton': 'EN',
    'app.langAria': '言語を切り替える',
    'app.langTitle': '日本語と英語を切り替える',
    'app.helpAria': '使い方・説明',
    'app.themeTitle': 'テーマ切り替え',
    'theme.toDark': 'ダークモードに切り替える',
    'theme.toLight': 'ライトモードに切り替える',
    'noscript': 'このツールを使うには、ブラウザーのJavaScriptを有効にしてください。',

    'tabs.aria': '表示する内容',
    'tab.cipher': '暗号化・復号',
    'tab.table': '置換表',

    'cipher.modeLabel': 'モード選択:',
    'mode.encrypt': '暗号化',
    'mode.decrypt': '復号',
    'cipher.inputLabel': '変換するテキスト（10,000文字まで）',
    'cipher.inputPlaceholder': 'ここにテキストを入力（リアルタイムで変換されます）',
    'cipher.convert': '変換',
    'cipher.outputLabel': '変換結果:',

    'copy.title': '結果をコピー',
    'copy.label': 'コピー',
    'copy.done': 'コピー完了',
    'copy.failed': 'コピー失敗',
    'copy.empty': '空です',
    'msg.copied': 'コピーしました',
    'msg.copyFailed': 'コピーできませんでした。結果を選択してコピーしてください',

    'msg.separator': '／',
    'msg.tooLong': '入力は10,000文字までです。先頭10,000文字だけ変換しました。',
    'msg.seion': '清音に直してから変換しました：{from} → {to}',
    'msg.skipped': '変換できない文字を除きました：{chars}（{count}文字）',
    'msg.skippedMore': '変換できない文字を除きました：{chars} ほか（{count}文字）',
    'msg.unknown': '復号できないかたまりがあります：{tokens}（{count}個）',
    'msg.unknownMore': '復号できないかたまりがあります：{tokens} ほか（{count}個）',

    'table.description':
      '下の2つの表を見比べることで、平文文字（いろは仮名）と暗号文文字（忍びいろは）の対応関係がわかります。',
    'table.irohaTitle': 'いろは仮名（平文）',
    'table.axisRowPrefix': '縦軸（右端）が',
    'table.hen': '偏（へん）',
    'table.axisColPrefix': '、横軸（上部）が',
    'table.tsukuri': '旁（つくり）',
    // 見出しの漢字は暗号文そのものなので訳さない。英語の対応はここで添える
    'table.legend': '列の見出しは旁（つくり）、右端の列は偏（へん）です。',
    'table.legendWhy':
      '見出しの漢字は暗号文に現れる文字そのものなので、言語を変えても入れ替えません。',
    'table.shinobiTitle': '忍びいろは（暗号文）',
    'table.shinobiSubtitle': '同じ位置にある文字同士が対応します',
    'table.imageAlt': '忍びいろはの構成表',

    'rules.heading': '自動清音変換ルール',
    'rules.intro': '忍びいろは暗号表にない文字は、以下のルールで自動的に清音に変換されます。',
    'rules.dakuten': '濁点：',
    'rules.handakuten': '半濁点：',
    'rules.sokuon': '促音：',
    'rules.chouon': '長音：',
    'rules.chouonValue': 'ー→削除',
    'rules.small': '小文字：',
    'rules.etc': ' など',
    'rules.katakana': 'カタカナ：',
    'rules.katakanaValue': '平仮名に直してから清音化',
    'rules.nfkc': 'NFKC正規化：',
    'rules.nfkcValue': '半角カタカナ・分解された濁点を統一',
    'rules.extraSeion': '追加の清音化：',
    'rules.notInTable': '表にない文字：',
    'rules.notInTableValue': '英数字・漢字・記号を除き、除いた文字を画面に表示',
    'rules.footnote':
      '復号できないかたまりは?になり、画面に知らせます。'
      + '復号モードでもカーソル位置のかたまりに対応するセルが光ります。',

    'footer.repoPrefix': '🔗 GitHubリポジトリはこちら（',
    'footer.repoSuffix': '）',

    'help.title': '忍びいろは暗号について',
    'help.close': '閉じる',
    'help.aboutHeading': '📚 忍びいろは暗号とは',
    'help.aboutBody':
      '忍びいろは暗号は、江戸時代の忍術書『万川集海』に記載されている古典暗号です。'
      + 'ひらがなを漢字の「偏（へん）」と「旁（つくり）」の組み合わせで表現することで、文字を隠す技術です。',
    'help.usageHeading': '🎯 使い方',
    'help.encryptHeading': '暗号化の場合',
    'help.encryptStep1': 'モード選択で「暗号化」を選択',
    'help.encryptStep2': 'テキスト入力欄にひらがなを入力（例：「てき」）',
    'help.encryptStep3': '「変換」ボタンをクリック',
    'help.encryptStep4': '結果：「身白 土黒」のように表示されます',
    'help.autoLabel': '📝 自動変換機能：',
    'help.autoBody': '濁点・半濁点・促音は自動的に清音に変換されます',
    'help.exampleLabel': '例：',
    'help.decryptHeading': '復号の場合',
    'help.decryptStep1': 'モード選択で「復号」を選択',
    'help.decryptStep2': '暗号文を半角・全角スペースまたは改行で区切って入力（例：「身白 土黒」）',
    'help.decryptStep3': '「変換」ボタンをクリック',
    'help.decryptStep4': '結果：「てき」のように表示されます',
    'help.decryptNote':
      '復号できないかたまりは?になり、画面に通知します。カーソル位置のかたまりに対応する表のセルが光ります。',
    'help.detailHeading': '文字変換の詳細',
    'help.readHeading': '📊 変換表の見方',
    'help.readIntro': 'テーブルは以下のように読みます。',
    'help.readRowLabel': '縦軸（右端）',
    'help.readRowValue': '：偏（木、火、土、金、水、人、身）',
    'help.readColLabel': '横軸（上部）',
    'help.readColValue': '：旁（紫、黒、白、赤、黄、青、色）',
    'help.readCrossLabel': '交点',
    'help.readCrossValue': '：該当するひらがな',
    'help.exampleLine1': '「て」を暗号化する場合',
    'help.exampleLine2': '→ テーブルで「て」を探す',
    'help.exampleLine3': '→ 「身」の行、「白」の列にある',
    'help.exampleLine4': '→ 暗号文は「身白」',
    'help.featuresHeading': '💡 機能説明',
    'help.featureRealtimeLabel': '⚡ リアルタイム変換',
    'help.featureRealtimeValue': '：文字を入力すると即座に暗号化結果を表示',
    'help.featureCopyLabel': '📋 コピーボタン',
    'help.featureCopyValue': '：変換結果を瞬時にクリップボードにコピー',
    'help.featureThemeLabel': '🌙/☀️ テーマ切り替え',
    'help.featureThemeValue': '：ダークモード・ライトモードの切り替え',
    'help.featureLangLabel': '🌐 日英切り替え',
    'help.featureLangValue': '：画面の文言を日本語と英語で切り替え（選択は保存されます）',
    'help.featureResponsiveLabel': '📱 レスポンシブ対応',
    'help.featureResponsiveValue': '：スマートフォンでも快適に利用可能',
    'help.bansenHeading': '📖 万川集海について',
    'help.bansenBody':
      '『万川集海』は1676年（延宝4年）に藤林保武によって編纂された伊賀流忍術の教本です。'
      + 'この書物には忍術の心得、武器、暗号技術など、忍者の知識が体系的にまとめられており、'
      + '現存する最も重要な忍術書の一つとされています。'
  };

  const en = {
    'app.title': 'Shinobi Iroha Cipher Tool',
    'app.description':
      'Try the shinobi iroha cipher from the Bansenshukai. Kana are cleared of voicing marks, '
      + 'then written as a kanji built from a left part and a right part.',
    'app.headingMain': 'Shinobi Iroha Cipher',
    'app.headingSub': '(Bansenshūkai ninja cipher)',
    'app.langButton': '日本語',
    'app.langAria': 'Switch language',
    'app.langTitle': 'Switch between Japanese and English',
    'app.helpAria': 'How to use this tool',
    'app.themeTitle': 'Switch theme',
    'theme.toDark': 'Switch to dark mode',
    'theme.toLight': 'Switch to light mode',
    'noscript': 'This tool needs JavaScript. Please turn it on in your browser.',

    'tabs.aria': 'What to show',
    'tab.cipher': 'Encrypt and decrypt',
    'tab.table': 'Substitution table',

    'cipher.modeLabel': 'Mode:',
    'mode.encrypt': 'Encrypt',
    'mode.decrypt': 'Decrypt',
    'cipher.inputLabel': 'Text to convert (up to 10,000 characters)',
    'cipher.inputPlaceholder': 'Type here. The result updates as you type.',
    'cipher.convert': 'Convert',
    'cipher.outputLabel': 'Result:',

    'copy.title': 'Copy the result',
    'copy.label': 'Copy',
    'copy.done': 'Copied',
    'copy.failed': 'Copy failed',
    'copy.empty': 'Nothing yet',
    'msg.copied': 'Copied the result to the clipboard',
    'msg.copyFailed': 'Could not copy. Select the result and copy it by hand.',

    'msg.separator': ' / ',
    'msg.tooLong': 'The limit is 10,000 characters. Only the first 10,000 were converted.',
    'msg.seion': 'Cleared the voicing marks first: {from} → {to}',
    'msg.skipped': 'Left out {count} character(s) the table has no entry for: {chars}',
    'msg.skippedMore': 'Left out {count} character(s) the table has no entry for: {chars} and more',
    'msg.unknown': 'Could not decrypt {count} group(s): {tokens}',
    'msg.unknownMore': 'Could not decrypt {count} group(s): {tokens} and more',

    'table.description':
      'Read the two grids side by side and you have the whole key: the same square, filled once '
      + 'with the plaintext kana and once with the cipher characters built from them.',
    'table.irohaTitle': 'Iroha kana (plaintext)',
    'table.axisRowPrefix': 'Each row, labelled at the right edge, gives the ',
    'table.hen': 'hen',
    'table.axisColPrefix': ' (the left part of a kanji). Each column, labelled at the top, gives the ',
    'table.tsukuri': 'tsukuri (the right part).',
    // 見出しの漢字は暗号文そのものなので訳さない。英語の対応はここで添える
    'table.legend':
      'Column headings are the tsukuri: 紫 purple, 黒 black, 白 white, 赤 red, '
      + '黄 yellow, 青 blue, 色 colour. The right-hand column gives the hen: '
      + '木 wood, 火 fire, 土 earth, 金 metal, 水 water, 人 person, '
      + '身 body.',
    'table.legendWhy':
      'The kanji in the headings are left as they are in both languages, because they are the '
      + 'ciphertext itself: て comes out as 身白, and this grid is how you look that up.',
    'table.shinobiTitle': 'Shinobi iroha (ciphertext)',
    'table.shinobiSubtitle': 'The character in the same square is the one it maps to',
    'table.imageAlt': 'The grid of shinobi iroha characters',

    'rules.heading': 'How kana are cleared before encrypting',
    'rules.intro':
      'The grid holds only the 48 plain kana, so anything else is reduced to a plain kana first, '
      + 'by these rules.',
    'rules.dakuten': 'Voiced (dakuten): ',
    'rules.handakuten': 'Half-voiced (handakuten): ',
    'rules.sokuon': 'Small tsu (sokuon): ',
    'rules.chouon': 'Long vowel mark: ',
    'rules.chouonValue': 'ー→dropped',
    'rules.small': 'Small kana: ',
    'rules.etc': ' and so on',
    'rules.katakana': 'Katakana: ',
    'rules.katakanaValue': 'turned into hiragana, then cleared',
    'rules.nfkc': 'NFKC normalisation: ',
    'rules.nfkcValue': 'half-width katakana and separated voicing marks are folded together',
    'rules.extraSeion': 'Further clearing: ',
    'rules.notInTable': 'Characters not in the grid: ',
    'rules.notInTableValue':
      'letters, digits, kanji and punctuation are left out, and the tool tells you which ones',
    'rules.footnote':
      'A group that cannot be decrypted becomes ? and is reported on screen. In decrypt mode the '
      + 'cell matching the group under the cursor lights up as well.',

    'footer.repoPrefix': '🔗 GitHub repository: ',
    'footer.repoSuffix': '',

    'help.title': 'About the shinobi iroha cipher',
    'help.close': 'Close',
    'help.aboutHeading': '📚 What the cipher is',
    'help.aboutBody':
      'The shinobi iroha cipher is recorded in the Bansenshūkai, a manual of ninja craft compiled '
      + 'in 1676, during the Edo period. A Japanese kanji is normally built from a part on the '
      + 'left, the hen, and a part on the right, the tsukuri. The cipher lays the 48 kana of the '
      + 'iroha order out on a seven-by-seven grid, gives every row a hen and every column a '
      + 'tsukuri, and writes each kana as the character those two parts would form. The result '
      + 'looks like ordinary, if unfamiliar, writing rather than a message in code, which is '
      + 'where its concealment came from.',
    'help.usageHeading': '🎯 How to use it',
    'help.encryptHeading': 'To encrypt',
    'help.encryptStep1': 'Set the mode to Encrypt',
    'help.encryptStep2': 'Type kana into the text box (say てき, "enemy")',
    'help.encryptStep3': 'Press Convert',
    'help.encryptStep4': 'The result looks like 身白 土黒',
    'help.autoLabel': '📝 Clearing happens for you:',
    'help.autoBody': 'voicing marks and the small tsu are reduced to plain kana automatically',
    'help.exampleLabel': 'For example: ',
    'help.decryptHeading': 'To decrypt',
    'help.decryptStep1': 'Set the mode to Decrypt',
    'help.decryptStep2': 'Separate the groups with a space or a line break (say 身白 土黒)',
    'help.decryptStep3': 'Press Convert',
    'help.decryptStep4': 'The result looks like てき',
    'help.decryptNote':
      'A group that cannot be decrypted becomes ? and is reported on screen. The cell matching '
      + 'the group under the cursor lights up.',
    'help.detailHeading': 'The clearing rules in full',
    'help.readHeading': '📊 How to read the grid',
    'help.readIntro': 'Read it like this.',
    'help.readRowLabel': 'Rows, labelled at the right edge',
    'help.readRowValue':
      ': the hen, the left part — 木 wood, 火 fire, 土 earth, 金 metal, 水 water, 人 person, 身 body',
    'help.readColLabel': 'Columns, labelled at the top',
    'help.readColValue':
      ': the tsukuri, the right part — 紫 purple, 黒 black, 白 white, 赤 red, 黄 yellow, '
      + '青 blue, 色 colour',
    'help.readCrossLabel': 'Where they cross',
    'help.readCrossValue': ': the kana that pair stands for',
    'help.exampleLine1': 'encrypting て',
    'help.exampleLine2': '→ find て in the grid',
    'help.exampleLine3': '→ it sits in the 身 row and the 白 column',
    'help.exampleLine4': '→ so the ciphertext is 身白',
    'help.featuresHeading': '💡 What the tool does',
    'help.featureRealtimeLabel': '⚡ Live conversion',
    'help.featureRealtimeValue': ': the result updates as you type',
    'help.featureCopyLabel': '📋 Copy button',
    'help.featureCopyValue': ': puts the result on the clipboard in one press',
    'help.featureThemeLabel': '🌙/☀️ Theme',
    'help.featureThemeValue': ': switch between light and dark',
    'help.featureLangLabel': '🌐 Japanese and English',
    'help.featureLangValue': ': switch the wording of the page; your choice is remembered',
    'help.featureResponsiveLabel': '📱 Works on a phone',
    'help.featureResponsiveValue': ': the layout follows the width of the screen',
    'help.bansenHeading': '📖 About the Bansenshūkai',
    'help.bansenBody':
      'The Bansenshūkai — the title reads roughly as "ten thousand rivers gathering into one '
      + 'sea" — was compiled in 1676 by Fujibayashi Yasutake as a manual of the Iga school of '
      + 'ninjutsu. It gathers the craft of the shinobi into one work: discipline, tools, weapons '
      + 'and secret writing among them. It survives as one of the most important ninja texts we '
      + 'have. The cipher appears in its fifth volume, introduced as a house secret handed on by '
      + 'word of mouth.'
  };

  let language = 'ja';
  const STORAGE_KEY = 'shinobi-iroha-cipher-language';

  function t(key, values = {}) {
    const dictionary = language === 'en' ? en : ja;
    const message = dictionary[key];
    if (typeof message !== 'string') throw new Error('Unknown message: ' + key);
    return message.replace(/\{(\w+)\}/g, (match, name) =>
      (Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : match));
  }

  function apply(root = document) {
    document.documentElement.lang = language;
    document.title = t('app.title');
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', t('app.description'));
    root.querySelectorAll('[data-i18n]').forEach(element => {
      element.textContent = t(element.dataset.i18n);
    });
    for (const attribute of ['aria-label', 'title', 'placeholder', 'alt']) {
      root.querySelectorAll(`[data-i18n-${attribute}]`).forEach(element => {
        element.setAttribute(attribute, t(element.getAttribute(`data-i18n-${attribute}`)));
      });
    }
  }

  function setLanguage(value) {
    if (!['ja', 'en'].includes(value)) return;
    language = value;
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (error) {
      // 保存領域が使えない環境では、このページを開いている間だけ適用する
    }
    apply();
    document.dispatchEvent(new Event('languagechange'));
  }

  function toggle() {
    setLanguage(language === 'ja' ? 'en' : 'ja');
  }

  function init() {
    let saved = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      // 保存領域が使えない環境では既定に従う
    }
    const query = new URLSearchParams(location.search).get('lang');
    language = [query, saved].find(value => value === 'ja' || value === 'en')
      || (/^ja\b/i.test(navigator.language || '') ? 'ja' : 'en');
    apply();
  }

  return { ja, en, t, apply, init, setLanguage, toggle, get language() { return language; } };
})();

if (typeof window !== 'undefined') window.I18n = I18n;
if (typeof module === 'object' && module.exports) module.exports = I18n;
