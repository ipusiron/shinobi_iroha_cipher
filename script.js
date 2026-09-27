'use strict';

let copyFeedbackTimer;
let themeAnimationTimer;
let helpReturnFocus;

// 画面に出ている通知は {key, values} で覚える。文字列で持つと言語を変えたときに戻せない
let resultNotices = [];
let copyNotice = null;

// コピーボタンの状態。文言は毎回 t() から組み立て、定数で書き戻さない
const COPY_STATES = {
  idle: { icon: '📋', key: 'copy.label' },
  copied: { icon: '✅', key: 'copy.done' },
  failed: { icon: '❌', key: 'copy.failed' },
  empty: { icon: '❌', key: 'copy.empty' }
};

// ヘルプモーダル関連
function openHelpModal() {
  const modal = document.getElementById('helpModal');
  helpReturnFocus = document.activeElement;
  modal.hidden = false;
  modal.classList.add('show');
  document.body.classList.add('modal-open');
  document.querySelector('.container').inert = true;
  document.querySelector('.app-footer').inert = true;
  modal.querySelector('.modal-close').focus();
}

function closeHelpModal(event) {
  // イベントが渡された場合（背景クリック）は、モーダル自体がクリックされた場合のみ閉じる
  if (event && event.target !== event.currentTarget) {
    return;
  }

  const modal = document.getElementById('helpModal');
  if (modal.hidden) return;
  modal.classList.remove('show');
  modal.hidden = true;
  document.body.classList.remove('modal-open');
  document.querySelector('.container').inert = false;
  document.querySelector('.app-footer').inert = false;
  (helpReturnFocus || document.getElementById('helpButton')).focus();
}

// 開いているモーダルの中でフォーカスを循環させる
function handleModalKeydown(event) {
  const modal = document.getElementById('helpModal');
  if (modal.hidden) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    closeHelpModal();
  } else if (event.key === 'Tab') {
    const items = [...modal.querySelectorAll('button, a[href], input, select, textarea, [tabindex="0"]')];
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}

// テーマ管理
function initTheme() {
  let savedTheme = 'light';
  try {
    const value = localStorage.getItem('theme');
    if (value === 'light' || value === 'dark') savedTheme = value;
  } catch {
    // 保存領域が使えなくても変換は続ける
  }
  document.body.setAttribute('data-theme', savedTheme);
  renderThemeToggle();
  spinThemeIcon();
}

function toggleTheme() {
  const body = document.body;
  const currentTheme = body.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';

  body.setAttribute('data-theme', newTheme);
  try {
    localStorage.setItem('theme', newTheme);
  } catch {
    // テーマはこのページを開いている間だけ適用する
  }
  renderThemeToggle();
  spinThemeIcon();
}

// 読み上げの文言は状態から組み立てる。data-i18n-aria-label だと切り替えで巻き戻る
function renderThemeToggle() {
  const theme = document.body.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  const toggle = document.getElementById('themeToggle');
  toggle.setAttribute('aria-pressed', String(theme === 'dark'));
  toggle.setAttribute('aria-label', I18n.t(theme === 'dark' ? 'theme.toLight' : 'theme.toDark'));
  const iconElement = document.querySelector('.theme-icon');
  if (iconElement) iconElement.textContent = theme === 'light' ? '🌙' : '☀️';
}

function spinThemeIcon() {
  const iconElement = document.querySelector('.theme-icon');
  if (!iconElement) return;
  clearTimeout(themeAnimationTimer);
  iconElement.classList.add('spin');
  themeAnimationTimer = setTimeout(() => iconElement.classList.remove('spin'), 300);
}

// クリップボードコピー機能
async function copyToClipboard() {
  const outputText = document.getElementById('outputText').textContent;

  if (!outputText.trim()) {
    // 結果が空の場合
    setCopyState('empty', 'msg.copyFailed');
    return;
  }

  try {
    // 現代のブラウザーでのコピー
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(outputText);
      setCopyState('copied', 'msg.copied');
    } else {
      // フォールバック: 古いブラウザー対応
      fallbackCopyTextToClipboard(outputText);
    }
  } catch (err) {
    // 失敗の詳細や入力内容はコンソールへ出さない
    setCopyState('failed', 'msg.copyFailed');
  }
}

// 古いブラウザー用のフォールバック
function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.classList.add('clipboard-fallback');
  const previousFocus = document.activeElement;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    setCopyState(successful ? 'copied' : 'failed', successful ? 'msg.copied' : 'msg.copyFailed');
  } catch (err) {
    // 古いブラウザーでの失敗も画面で知らせる
    setCopyState('failed', 'msg.copyFailed');
  }

  document.body.removeChild(textArea);
  previousFocus?.focus();
}

// コピー成功/失敗の視覚的フィードバック。状態だけを持ち、文言はその都度訳す
function setCopyState(state, noticeKey) {
  clearTimeout(copyFeedbackTimer);
  const button = document.getElementById('copyButton');
  button.dataset.state = Object.hasOwn(COPY_STATES, state) ? state : 'idle';
  copyNotice = noticeKey ? { key: noticeKey, values: {} } : null;
  renderCopyButton();
  renderNotices();

  // 1.5秒後に元に戻す
  if (button.dataset.state !== 'idle') {
    copyFeedbackTimer = setTimeout(() => {
      button.dataset.state = 'idle';
      renderCopyButton();
    }, 1500);
  }
}

function renderCopyButton() {
  const button = document.getElementById('copyButton');
  const state = Object.hasOwn(COPY_STATES, button.dataset.state) ? button.dataset.state : 'idle';
  button.querySelector('.copy-icon').textContent = COPY_STATES[state].icon;
  button.querySelector('.copy-text').textContent = I18n.t(COPY_STATES[state].key);
  button.classList.toggle('copied', state === 'copied');
}

// 通知は覚えたキーから毎回組み立てる。切り替えても消えず、訳し直される
function renderNotices() {
  const notices = copyNotice ? [copyNotice] : resultNotices;
  document.getElementById('resultMessage').textContent =
    notices.map(notice => I18n.t(notice.key, notice.values)).join(I18n.t('msg.separator'));
}

// リアルタイム変換とハイライト機能
function setupRealTimeConversion() {
  const inputTextArea = document.getElementById('inputText');

  // inputイベントでリアルタイム変換
  inputTextArea.addEventListener('input', function() {
    processText();
    highlightCurrentCharacter();
  });

  // カーソル移動時のハイライト更新
  inputTextArea.addEventListener('keyup', highlightCurrentCharacter);
  inputTextArea.addEventListener('click', highlightCurrentCharacter);
}

// 現在のカーソル位置の文字をハイライト
function highlightCurrentCharacter() {
  const inputTextArea = document.getElementById('inputText');
  const cursorPosition = inputTextArea.selectionStart;
  const mode = document.getElementById('mode').value;

  // 前のハイライトを削除
  clearHighlights();

  const input = [...inputTextArea.value].slice(0, 10000).join('');
  if (cursorPosition > input.length) return;
  const kana = mode === 'encrypt'
    ? ShinobiLogic.kanaAtCursor(input, cursorPosition)
    : ShinobiLogic.PAIR_TO_IROHA[ShinobiLogic.tokenAtCursor(input, cursorPosition)];
  highlightCharacterInTable(kana);
}

// テーブル内の指定文字をハイライト（入力をセレクターに埋め込まない）
function highlightCharacterInTable(kana) {
  if (!kana || typeof kana !== 'string') return;
  const cell = [...document.querySelectorAll('#cipherTable td[data-kana]')].find(td => td.dataset.kana === kana);
  if (cell) cell.classList.add('highlighted');
}

// すべてのハイライトを削除（暗号化・復号タブの置換表のみ）
function clearHighlights() {
  const highlightedCells = document.querySelectorAll('#cipherTable td.highlighted');
  highlightedCells.forEach(cell => {
    cell.classList.remove('highlighted');
  });
}

// モード切り替え時のハイライト制御
function handleModeChange() {
  processText();
  highlightCurrentCharacter();
}

// 暗号化処理（リアルタイム対応版）
function processText() {
  const original = document.getElementById('inputText').value;
  const chars = [...original];
  const input = chars.slice(0, 10000).join('');
  const mode = document.getElementById('mode').value;
  const outputDiv = document.getElementById('outputText');
  const notices = [];
  if (chars.length > 10000) notices.push({ key: 'msg.tooLong', values: {} });

  if (mode === 'encrypt') {
    const result = ShinobiLogic.encrypt(input);
    outputDiv.textContent = result.cipher;
    if (result.seion !== input.normalize('NFKC')) {
      const short = value => [...value].slice(0, 80).join('').replace(/\s+/gu, ' ') + ([...value].length > 80 ? '…' : '');
      notices.push({ key: 'msg.seion', values: { from: short(input), to: short(result.seion) } });
    }
    if (result.skipped.length) {
      const shown = result.skipped.slice(0, 10).join(' ');
      // 「ほか」は言語で形が変わるので、連結せずキーを分ける
      notices.push({ key: result.skipped.length > 10 ? 'msg.skippedMore' : 'msg.skipped',
        values: { chars: shown, count: result.skipped.length } });
    }
  } else {
    const result = ShinobiLogic.decrypt(input);
    outputDiv.textContent = result.plain;
    if (result.unknown.length) {
      const shown = result.unknown.slice(0, 10).map(token => [...token].slice(0, 80).join('')).join(' ');
      notices.push({ key: result.unknown.length > 10 ? 'msg.unknownMore' : 'msg.unknown',
        values: { tokens: shown, count: result.unknown.length } });
    }
  }
  resultNotices = notices;
  copyNotice = null;
  renderNotices();
  highlightCurrentCharacter();
}

// タブ切り替え機能
function switchTab(tabName) {
  const tabButtons = [...document.querySelectorAll('.tab-button')];
  if (!tabButtons.some(button => button.dataset.tab === tabName)) return;
  tabButtons.forEach(button => {
    const active = button.dataset.tab === tabName;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', String(active));
    button.tabIndex = active ? 0 : -1;
    const content = document.getElementById(button.getAttribute('aria-controls'));
    content.classList.toggle('active', active);
    content.hidden = !active;
  });
}

function handleTabKeydown(event) {
  const tabs = [...document.querySelectorAll('.tab-button')];
  const index = tabs.indexOf(event.currentTarget);
  const targets = { ArrowLeft: (index + tabs.length - 1) % tabs.length, ArrowRight: (index + 1) % tabs.length,
    Home: 0, End: tabs.length - 1 };
  if (!Object.prototype.hasOwnProperty.call(targets, event.key)) return;
  event.preventDefault();
  const next = tabs[targets[event.key]];
  switchTab(next.dataset.tab);
  next.focus();
}

// 言語を変えたら、状態から作っている表示をすべて組み直す
function retranslate() {
  renderThemeToggle();
  renderCopyButton();
  renderNotices();
}

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
  I18n.init();
  initTheme();
  renderCopyButton();
  setupRealTimeConversion();

  // インラインハンドラーを使わず操作を登録する
  document.getElementById('mode').addEventListener('change', handleModeChange);
  document.getElementById('convertButton').addEventListener('click', processText);
  document.getElementById('copyButton').addEventListener('click', copyToClipboard);
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  document.getElementById('langToggle').addEventListener('click', () => I18n.toggle());
  document.getElementById('helpButton').addEventListener('click', openHelpModal);
  document.getElementById('helpModal').addEventListener('click', closeHelpModal);
  document.querySelector('.modal-close').addEventListener('click', () => closeHelpModal());
  document.addEventListener('keydown', handleModalKeydown);
  document.addEventListener('languagechange', retranslate);
  document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => switchTab(button.dataset.tab));
    button.addEventListener('keydown', handleTabKeydown);
  });
});
