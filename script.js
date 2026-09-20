'use strict';

let copyFeedbackTimer;
let themeAnimationTimer;
let helpReturnFocus;

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
  const body = document.body;
  const themeIcon = document.querySelector('.theme-icon');
  
  body.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme, themeIcon);
}

function toggleTheme() {
  const body = document.body;
  const currentTheme = body.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  const themeIcon = document.querySelector('.theme-icon');
  
  body.setAttribute('data-theme', newTheme);
  try {
    localStorage.setItem('theme', newTheme);
  } catch {
    // テーマはこのページを開いている間だけ適用する
  }
  updateThemeIcon(newTheme, themeIcon);
}

function updateThemeIcon(theme, iconElement) {
  const toggle = document.getElementById('themeToggle');
  toggle.setAttribute('aria-pressed', String(theme === 'dark'));
  toggle.setAttribute('aria-label', theme === 'dark' ? 'ライトモードに切り替える' : 'ダークモードに切り替える');
  if (iconElement) {
    iconElement.textContent = theme === 'light' ? '🌙' : '☀️';
    clearTimeout(themeAnimationTimer);
    iconElement.classList.add('spin');
    themeAnimationTimer = setTimeout(() => iconElement.classList.remove('spin'), 300);
  }
}

// クリップボードコピー機能
async function copyToClipboard() {
  const outputText = document.getElementById('outputText').textContent;
  const copyButton = document.getElementById('copyButton');
  const copyIcon = copyButton.querySelector('.copy-icon');
  const copyText = copyButton.querySelector('.copy-text');
  
  if (!outputText.trim()) {
    // 結果が空の場合
    showCopyFeedback(copyButton, copyIcon, copyText, '空です', '❌', false);
    return;
  }

  try {
    // 現代のブラウザーでのコピー
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(outputText);
      showCopyFeedback(copyButton, copyIcon, copyText, 'コピー完了', '✅', true);
    } else {
      // フォールバック: 古いブラウザー対応
      fallbackCopyTextToClipboard(outputText, copyButton, copyIcon, copyText);
    }
  } catch (err) {
    // 失敗の詳細や入力内容はコンソールへ出さない
    showCopyFeedback(copyButton, copyIcon, copyText, 'コピー失敗', '❌', false);
  }
}

// 古いブラウザー用のフォールバック
function fallbackCopyTextToClipboard(text, button, icon, textElement) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.classList.add('clipboard-fallback');
  const previousFocus = document.activeElement;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    const successful = document.execCommand('copy');
    if (successful) {
      showCopyFeedback(button, icon, textElement, 'コピー完了', '✅', true);
    } else {
      showCopyFeedback(button, icon, textElement, 'コピー失敗', '❌', false);
    }
  } catch (err) {
    // 古いブラウザーでの失敗も画面で知らせる
    showCopyFeedback(button, icon, textElement, 'コピー失敗', '❌', false);
  }
  
  document.body.removeChild(textArea);
  previousFocus?.focus();
}

// コピー成功/失敗の視覚的フィードバック
function showCopyFeedback(button, icon, textElement, message, emoji, success) {
  clearTimeout(copyFeedbackTimer);
  document.getElementById('resultMessage').textContent = success
    ? 'コピーしました'
    : 'コピーできませんでした。結果を選択してコピーしてください';
  
  // アイコンとテキストを変更
  icon.textContent = emoji;
  textElement.textContent = message;
  
  // 成功時はボタンの色を変更
  button.classList.toggle('copied', success);
  
  // 1.5秒後に元に戻す
  copyFeedbackTimer = setTimeout(() => {
    icon.textContent = '📋';
    textElement.textContent = 'コピー';
    button.classList.remove('copied');
  }, 1500);
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
  const messages = [];
  if (chars.length > 10000) messages.push('入力は10,000文字までです。先頭10,000文字だけ変換しました。');

  if (mode === 'encrypt') {
    const result = ShinobiLogic.encrypt(input);
    outputDiv.textContent = result.cipher;
    if (result.seion !== input.normalize('NFKC')) {
      const short = value => [...value].slice(0, 80).join('').replace(/\s+/gu, ' ') + ([...value].length > 80 ? '…' : '');
      messages.push('清音に直してから変換しました：' + short(input) + ' → ' + short(result.seion));
    }
    if (result.skipped.length) {
      const shown = result.skipped.slice(0, 10).join(' ');
      const more = result.skipped.length > 10 ? ' ほか' : '';
      messages.push('変換できない文字を除きました：' + shown + more + '（' + result.skipped.length + '文字）');
    }
  } else {
    const result = ShinobiLogic.decrypt(input);
    outputDiv.textContent = result.plain;
    if (result.unknown.length) {
      const shown = result.unknown.slice(0, 10).map(token => [...token].slice(0, 80).join('')).join(' ');
      const more = result.unknown.length > 10 ? ' ほか' : '';
      messages.push('復号できないかたまりがあります：' + shown + more + '（' + result.unknown.length + '個）');
    }
  }
  document.getElementById('resultMessage').textContent = messages.join('／');
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

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
  initTheme();
  setupRealTimeConversion();

  // インラインハンドラーを使わず操作を登録する
  document.getElementById('mode').addEventListener('change', handleModeChange);
  document.getElementById('convertButton').addEventListener('click', processText);
  document.getElementById('copyButton').addEventListener('click', copyToClipboard);
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  document.getElementById('helpButton').addEventListener('click', openHelpModal);
  document.getElementById('helpModal').addEventListener('click', closeHelpModal);
  document.querySelector('.modal-close').addEventListener('click', () => closeHelpModal());
  document.addEventListener('keydown', handleModalKeydown);
  document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => switchTab(button.dataset.tab));
    button.addEventListener('keydown', handleTabKeydown);
  });
});
