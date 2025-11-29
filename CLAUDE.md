# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

忍びいろは暗号（Shinobi Iroha Cipher）は、江戸時代の忍術書『万川集海』に記載されている古典暗号を再現したWebツールです。ひらがなを漢字の「偏」と「旁」の組み合わせで暗号化・復号します。

## Development

### Running the Application
```bash
# ブラウザで直接開く（Windows）
start index.html
```

ビルドツールやパッケージマネージャーは不要です。プレーンなHTML/CSS/JavaScriptで構成されています。

### Deployment
GitHub Pages: https://ipusiron.github.io/shinobi_iroha_cipher/

## Architecture

### File Structure
- `index.html` - メインページ（暗号表、ヘルプモーダル含む）
- `style.css` - CSS変数によるテーマ管理、レスポンシブデザイン
- `script.js` - 暗号化/復号ロジック、UI制御

### Core Logic (script.js)

**暗号化の流れ:**
1. 入力テキストを`convertToSeion()`で清音に変換（濁点・半濁点・促音→清音）
2. `IROHA_TO_PAIR`マッピングで各文字を「偏+旁」ペアに変換
3. スペース区切りで出力（例：「てき」→「身白 土黒」）

**復号の流れ:**
1. スペースで分割
2. `PAIR_TO_IROHA`マッピングで元のひらがなに変換

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

- モバイルファーストのCSS設計（ベースがスマホ幅、`@media (min-width: 600px)`で拡張）
- CSS変数（`--bg-primary`等）でテーマカラー管理
- Vanilla JavaScript、フレームワーク不使用
