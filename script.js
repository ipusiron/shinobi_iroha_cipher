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
  'ぁ': 'あ', 'ぃ': 'い', 'ぅ': 'う', 'ぇ': 'え', 'ぉ': 'お'
};

// 文字を清音に変換する関数
function convertToSeion(text) {
  return [...text].map(char => DAKUTEN_TO_SEION[char] || char).join('');
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

// ヘルプモーダル関連
function openHelpModal() {
  const modal = document.getElementById('helpModal');
  modal.classList.add('show');
  document.body.style.overflow = 'hidden'; // スクロールを無効化
}

function closeHelpModal(event) {
  // イベントが渡された場合（背景クリック）は、モーダル自体がクリックされた場合のみ閉じる
  if (event && event.target !== event.currentTarget) {
    return;
  }
  
  const modal = document.getElementById('helpModal');
  modal.classList.remove('show');
  document.body.style.overflow = ''; // スクロールを再有効化
}

// ESCキーでモーダルを閉じる
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closeHelpModal();
  }
});

// テーマ管理
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
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
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme, themeIcon);
}

function updateThemeIcon(theme, iconElement) {
  if (iconElement) {
    iconElement.textContent = theme === 'light' ? '🌙' : '☀️';
    iconElement.style.transform = 'rotate(360deg)';
    setTimeout(() => {
      iconElement.style.transform = 'rotate(0deg)';
    }, 300);
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
    // 現代のブラウザでのコピー
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(outputText);
      showCopyFeedback(copyButton, copyIcon, copyText, 'コピー完了', '✅', true);
    } else {
      // フォールバック: 古いブラウザ対応
      fallbackCopyTextToClipboard(outputText, copyButton, copyIcon, copyText);
    }
  } catch (err) {
    console.error('コピーに失敗しました:', err);
    showCopyFeedback(copyButton, copyIcon, copyText, 'コピー失敗', '❌', false);
  }
}

// 古いブラウザ用のフォールバック
function fallbackCopyTextToClipboard(text, button, icon, textElement) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
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
    console.error('フォールバックコピーに失敗しました:', err);
    showCopyFeedback(button, icon, textElement, 'コピー失敗', '❌', false);
  }
  
  document.body.removeChild(textArea);
}

// コピー成功/失敗の視覚的フィードバック
function showCopyFeedback(button, icon, textElement, message, emoji, success) {
  const originalIcon = icon.textContent;
  const originalText = textElement.textContent;
  
  // アイコンとテキストを変更
  icon.textContent = emoji;
  textElement.textContent = message;
  
  // 成功時はボタンの色を変更
  if (success) {
    button.classList.add('copied');
  }
  
  // 1.5秒後に元に戻す
  setTimeout(() => {
    icon.textContent = originalIcon;
    textElement.textContent = originalText;
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
  
  // 暗号化モードの場合のみハイライト
  if (mode === 'encrypt' && inputTextArea.value.length > 0) {
    // カーソル位置の文字を取得（カーソルが末尾の場合は最後の文字）
    const charIndex = Math.max(0, Math.min(cursorPosition - 1, inputTextArea.value.length - 1));
    const currentChar = inputTextArea.value[charIndex];
    
    if (currentChar) {
      // 清音に変換してからハイライト
      const seionChar = convertToSeion(currentChar);
      highlightCharacterInTable(seionChar, currentChar);
    }
  }
}

// テーブル内の指定文字をハイライト（暗号化・復号タブの置換表のみ）
function highlightCharacterInTable(seionChar, originalChar) {
  const tableCell = document.querySelector(`#cipherTable td[data-kana="${seionChar}"]`);

  if (tableCell) {
    tableCell.classList.add('highlighted');

    // 元の文字と清音が異なる場合は情報を表示
    if (originalChar !== seionChar) {
      console.log(`ハイライト: ${originalChar} → ${seionChar}`);
    }
  }
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
  const mode = document.getElementById('mode').value;
  
  if (mode === 'decrypt') {
    clearHighlights();
  } else {
    highlightCurrentCharacter();
  }
}

// 暗号化処理（リアルタイム対応版）
function processText() {
  const input = document.getElementById('inputText').value.trim();
  const mode = document.getElementById('mode').value;
  const outputDiv = document.getElementById('outputText');

  if (mode === 'encrypt') {
    // 暗号化前に濁点・半濁点・促音を清音に変換
    const seionText = convertToSeion(input);
    
    const result = [...seionText].map(ch => {
      const pair = IROHA_TO_PAIR[ch];
      return pair ? pair.hen + pair.tsukuri : ch;
    }).join(' ');
    
    // 変換過程を表示する場合のデバッグ情報（開発用）
    if (seionText !== input && input.length > 0) {
      console.log(`原文: ${input} → 清音変換後: ${seionText} → 暗号化: ${result}`);
    }
    
    outputDiv.textContent = result;
  } else {
    const tokens = input.replace(/\s+/g, ' ').split(' ');
    const result = tokens.map(tok => PAIR_TO_IROHA[tok] || '?').join('');
    outputDiv.textContent = result;
  }
}

// タブ切り替え機能
function switchTab(tabName) {
  // すべてのタブボタンからactiveを削除
  const tabButtons = document.querySelectorAll('.tab-button');
  tabButtons.forEach(button => {
    button.classList.remove('active');
  });

  // クリックされたタブボタンにactiveを追加
  const activeButton = document.querySelector(`.tab-button[data-tab="${tabName}"]`);
  if (activeButton) {
    activeButton.classList.add('active');
  }

  // すべてのタブコンテンツを非表示
  const tabContents = document.querySelectorAll('.tab-content');
  tabContents.forEach(content => {
    content.classList.remove('active');
  });

  // 選択されたタブコンテンツを表示
  const activeContent = document.getElementById(`${tabName}-tab`);
  if (activeContent) {
    activeContent.classList.add('active');
  }
}

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
  initTheme();
  setupRealTimeConversion();

  // モード選択の変更時にハイライトを制御
  const modeSelect = document.getElementById('mode');
  modeSelect.addEventListener('change', function() {
    handleModeChange();
    processText(); // モード変更時も変換を実行
  });
});