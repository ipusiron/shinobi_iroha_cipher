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

// 暗号化処理
function processText() {
  const input = document.getElementById('inputText').value.trim();
  const mode = document.getElementById('mode').value;
  const outputDiv = document.getElementById('outputText');

  if (mode === 'encrypt') {
    const result = [...input].map(ch => {
      const pair = IROHA_TO_PAIR[ch];
      return pair ? pair.hen + pair.tsukuri : ch;
    }).join(' ');
    outputDiv.textContent = result;
  } else {
    const tokens = input.replace(/\s+/g, ' ').split(' ');
    const result = tokens.map(tok => PAIR_TO_IROHA[tok] || '?').join('');
    outputDiv.textContent = result;
  }
}

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
  initTheme();
});