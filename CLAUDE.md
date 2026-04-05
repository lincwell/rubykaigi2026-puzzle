# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

**Ruby 処方箋クイズ** — Ruby のメソッドチェーンを題材にしたブラウザ完結型クイズアプリ。`@ruby/wasm-wasi` を使い、Ruby コードをブラウザ上の WebAssembly で実行する。バニラ TypeScript + Vite + Tailwind CSS v4 で構成し、UI フレームワークは使用しない。

デプロイ先: `https://lincwell.github.io/rubykaigi2026-puzzle/`

詳細ドキュメント: [`docs/requirements.md`](docs/requirements.md) / [`docs/game-flow.md`](docs/game-flow.md) / [`docs/ui-design.md`](docs/ui-design.md) / [`docs/data-structure.md`](docs/data-structure.md)

---

## ゲームルール（パズル仕様）

**題材**: 文字列 `"Lincwell"` を起点に、以下 10 個のメソッドを **各 1 回まで** 使ってメソッドチェーンを作り、最終的に得られる **Integer の最大値** を競う。

```
chars, bytes, methods, class, to_s, inspect, join, size, length, sum
```

- 全メソッドを使う必要はない（0〜10 個）
- 呼び出し不可・例外発生のチェーンは無効
- 最終結果が `Integer` のチェーンのみが得点対象
- 実行環境: Ruby 4.0 系（`--disable-gems`）、`@ruby/wasm-wasi` で動かす

**型遷移早見表**

| メソッド | 主な返り値 |
|----------|-----------|
| `chars` | `Array<String>` |
| `bytes` | `Array<Integer>` |
| `methods` | `Array<Symbol>` |
| `class` | `Class` |
| `to_s` / `inspect` | `String` |
| `join` | `String` |
| `size` / `length` | `Integer` |
| `sum` | `Integer`（`Array#sum` と `String#sum` は別物） |

**判定アルゴリズム（参照実装）**

```ruby
METHODS = %i[chars bytes methods class to_s inspect join size length sum]
best_value = -Float::INFINITY
best_chain = nil

dfs = lambda do |obj, rest, chain|
  if obj.is_a?(Integer) && obj > best_value
    best_value = obj
    best_chain = chain.dup
  end
  rest.each do |m|
    next unless obj.respond_to?(m)
    begin
      nxt = obj.public_send(m)
    rescue StandardError
      next
    end
    dfs.call(nxt, rest - [m], chain + [m])
  end
end

dfs.call("Lincwell", METHODS, [])
```

---

## 画面構成・フロー

```
S01 タイトル・クイズ画面
  └─（回答終了）→ S02 結果画面
                  └─[もう一度]→ S01
```

### S01 タイトル・クイズ画面

- **タイトルブロック**
  - 見出し1: おくすり
  - 見出し2: あなたの「Ruby力」を診断します
  - 説明文: "Lincwell" を起点に、最大の整数を返すメソッドチェーンを処方してください。
- **クイズブロック（処方箋 UI）**
  - 患者: `"Lincwell"`
  - 処方: `chars, bytes, methods, class, to_s, inspect, join, size, length, sum`（最大 4 列）
  - 用法: 上記メソッドをチェーンにて投与すること
  - 用量: 各 1 回まで
  - 投与ボタン → Ruby WASM で実行・判定 → S02

### S02 結果画面

- **回答表示**（メソッドごとに出力）
  - エラー時: 残念メッセージ＋ヒント＋リトライボタン
- **結果表示**
  - スコア（得られた Integer 値）
  - レベル診断（4 段階）
  - SNS（X/Twitter）シェアボタン
  - オンライン診療クーポンコード＋URL
  - もう一度ボタン

### 共通（ヘッダー・フッター）

- ヘッダー: Ruby WASM で実行する Ruby の version 表示
- フッター: ロゴ SVG

---

## UI 設計

**デザインコンセプト**: 処方箋・薬局モチーフ

**カラーパレット**

| 役割 | カラー |
|------|--------|
| プライマリ | `#00b9f0`（シアンブルー） |
| セカンダリ | `#6b7280` |
| 正解 | `#22c55e` |
| 不正解 | `#ef4444` |
| 背景 | `#ffffff` |

**フォント**（`index.html` で読み込み済み）

| 用途 | フォント |
|------|----------|
| 見出し・本文（日本語） | Noto Serif JP / Noto Sans JP |
| コード表示 | JetBrains Mono |

**コンポーネント**

| コンポーネント | 概要 |
|--------------|------|
| `TitleScreen` | タイトル画面全体 |
| `QuizScreen` | クイズ出題画面 |
| `FeedbackScreen` | 回答フィードバック画面 |
| `ResultScreen` | 結果画面 |
| `CodeBlock` | Ruby コード表示ブロック |

- モバイルファースト、Tailwind CSS v4 デフォルトブレークポイント準拠

---

## 機能要件（Must）

- 処方箋風メソッドチェーンクイズを出題し、ユーザーが回答できる
- Ruby コードを `@ruby/wasm-wasi` でブラウザ上実行し、正誤判定する
- スコア・結果画面を表示（レベル 4 段階）
- 結果画面に X/Twitter シェアボタン
- 結果画面にオンライン診療クーポンコード＆URL を提示
- 日本語・英語 UI（切り替え可能）
- ブラウザのみで動作（サーバー不要）、GitHub Pages でホスティング

---

## コマンド

```sh
npm run dev          # 開発サーバー起動
npm run build        # プロダクションビルド（dist/ に出力）
npm run build:pages  # GitHub Pages 向けビルド（base パスを /rubykaigi2026-puzzle/ に固定）
npm run preview      # プロダクションビルドのプレビュー
npm run lint         # ESLint
npm run format       # Prettier で src/**/*.ts をフォーマット
```

Node.js >= 24.14.0 が必要（`.node-version` 参照）。

## アーキテクチャ

**エントリーポイント**: `index.html` → `src/main.ts` が `<div id="app">` にマウント。

**モジュールエイリアス**: `#/*` → `src/*` のエイリアスが `package.json` の `imports`、`tsconfig.json` の `paths`、`vite.config.ts` の `resolve.alias` の 3 箇所で設定されている。

**Ruby WASM**: コア依存ライブラリは `@ruby/wasm-wasi`。`SharedArrayBuffer` が必要なため、開発・プレビューサーバーは `Cross-Origin-Embedder-Policy: require-corp` と `Cross-Origin-Opener-Policy: same-origin` ヘッダーを付与している（`vite.config.ts` で設定済み）。

**デプロイ**: `main` ブランチへの push をトリガーに GitHub Actions (`.github/workflows/deploy.yml`) がビルドし、`dist/` を GitHub Pages へデプロイする。`VITE_BASE` 環境変数で Vite の `base` パスを制御し、ローカル開発時は `/` にフォールバックする。

## TypeScript・Lint

TypeScript は `noUncheckedIndexedAccess` と `exactOptionalPropertyTypes` を含む厳格設定。ESLint のルール:
- `any` 禁止（`@typescript-eslint/no-explicit-any: error`）
- 関数の戻り値型を明示（warning）
- 未使用変数はエラー（`_` プレフィックスの引数は除外）

Prettier 設定: セミコロンなし、シングルクォート、末尾カンマあり、行幅 160 文字、インデント 2 スペース。
