# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

忍びいろは暗号（Shinobi Iroha Cipher）は、江戸時代の忍術書『万川集海』に記載されている古典暗号を再現したWebツールです。ひらがなを漢字の「偏」と「旁」の組み合わせで暗号化・復号します。

## Development

### Running the Application
```bash
# ブラウザーで直接開く（Windows）
start index.html
# HTTP配信
python -m http.server 8000
# Node 22以上。依存インストール不要
npm test
```

ビルドツールやパッケージマネージャーは不要です。プレーンなHTML/CSS/JavaScriptで構成されています。

### Deployment
GitHub Pages: https://ipusiron.github.io/shinobi_iroha_cipher/

## Architecture

### File Structure
- `index.html` - メインページ（暗号表、ヘルプモーダル含む）
- `style.css` - CSS変数によるテーマ管理、レスポンシブデザイン
- `script.js` - DOM操作、コピー、テーマ、タブ、モーダル
- `shinobi-logic.js` - DOM非依存の変換とカーソル位置の計算
- `test/` - 固定期待値とREADME・HTML・配色の検証
- `.github/workflows/test.yml` - push・pull_requestのNode 22テスト

### Core Logic (shinobi-logic.js)

**暗号化の流れ:**
1. 入力テキストを`normalizeToSeion()`でNFKC正規化、カタカナ→平仮名、濁点・半濁点・小書き→清音、長音の削除
2. `IROHA_TO_PAIR`マッピングで各文字を「偏+旁」ペアに変換
3. 表にない文字を除き、半角スペース区切りで出力（例：「てき」→「身白 土黒」）

**復号の流れ:**
1. 半角・全角スペース・改行・タブで分割（空入力は空文字）
2. `PAIR_TO_IROHA`マッピングで清音に変換。未知のかたまりは?と通知

**主要データ構造:**
- `DAKUTEN_TO_SEION`: 濁点・半濁点→清音の変換マップ
- `IROHA_TO_PAIR`: いろは仮名→{hen, tsukuri}のマップ（48文字）
- `PAIR_TO_IROHA`: 逆引きマップ（自動生成）

### UI Features
- リアルタイム変換（inputイベント）
- カーソル位置の文字をテーブル上でハイライト
- ダーク/ライトテーマ切り替え（LocalStorage保存）
- クリップボードコピー機能

## Coding Conventions

- デスクトップ基準のCSS設計（ベースが広い画面、`@media (max-width: 600px)`で狭い画面に合わせる）
- CSS変数（`--bg-primary`等）でテーマカラー管理
- Vanilla JavaScript、フレームワーク不使用

## 公開関数と戻り値

- `normalizeToSeion(text)`：清音化した文字列
- `encrypt(text)`：`{ cipher, seion, skipped }`
- `decrypt(text)`：`{ plain, unknown }`
- `kanaAtCursor(text, pos)`：表にあるかな、なければ空文字
- `tokenAtCursor(text, pos)`：カーソルのかたまり、空白上では直前、先頭空白なら空文字

カーソル位置はtextareaのselectionStartと同じUTF-16単位です。
画面だけがコードポイントで10,000文字に制限します。純粋ロジックには上限を設けません。

## 守ること

- 48件の座標・かな・偏旁を変更しない。行は偏、列は旁、身×紫だけ空き
- 通常スクリプトのままglobalThisとCommonJSで共有し、ES moduleにしない
- 読み込み順はshinobi-logic.js→script.js、両方defer
- 入力はtextContentで表示し、HTML挿入・インラインハンドラー・直接のstyle代入を使わない
- 外部リクエストを追加しない。CSPのself制限とconnect-src none、referrerのno-referrerを保つ
- 保存はテーマだけ。light・dark以外はlight。入力は保存しない
- READMEの表と例もテストで検証する。期待値を変えてテストを通さない
- 既存画像は保持し、スクリーンショットは追加する
