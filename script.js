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