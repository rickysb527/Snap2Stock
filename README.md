# Snap2Stock

車両ヤードの在庫管理システム。中古車ヤードの入庫・在庫・出庫管理と、Gemini API を使った QR / 車両情報のスキャン読み取りに対応します。

## 技術スタック

- [Vite](https://vitejs.dev/) + [React 19](https://react.dev/)（TypeScript）
- [Tailwind CSS](https://tailwindcss.com/)（CDN 経由）
- [Google Gemini API](https://ai.google.dev/)（`@google/genai`）— 画像からの車両情報抽出・QR スキャン
- [lucide-react](https://lucide.dev/)（アイコン） / [xlsx](https://sheetjs.com/)（Excel 入出力）

データはブラウザの `localStorage` に保存されます（サーバー不要）。

## セットアップ

**前提:** Node.js

1. 依存関係をインストール:
   ```bash
   npm install
   ```
2. `.env.local` に Gemini API キーを設定:
   ```
   GEMINI_API_KEY=あなたのAPIキー
   ```
   > `.env.local` は `.gitignore` 済みです。API キーを git にコミットしないでください。
3. 開発サーバーを起動:
   ```bash
   npm run dev
   ```

## スクリプト

| コマンド | 内容 |
|---|---|
| `npm run dev` | 開発サーバーを起動（ポート 3000） |
| `npm run build` | 本番ビルドを `dist/` に出力 |
| `npm run preview` | ビルド成果物をプレビュー |

## 主な機能

- **Dashboard** — 在庫サマリ、本日出庫予定の確認、Excel インポート
- **Stock List / Yard Map** — 在庫一覧とヤードマップ表示
- **Vehicle Registration** — ヤードマップから入庫位置を選んで車両登録
- **QR Scanner** — カメラ / 画像から車両を特定し、ゾーンを更新（Gemini API）
