# システム構成・技術スタック

`system-architecture.drawio` をdraw.ioで開くと編集できます。現行ソースに基づき、利用者・ブラウザ内処理・外部サービス・開発ツールを配置しています。

- React 19 / React DOM / TypeScriptで画面を構成し、AppのReact Hooksで在庫と画面状態を管理します。アイコンはlucide-reactです。
- 車両データはlocalStorageの`yard_manager_vehicles`にJSONで保存します。
- Excel / CSVはブラウザ内のSheetJS（xlsx）で読み込み、車両データに変換します。
- 写真はファイル入力から受け取り、ブラウザから`api/analyze.ts`（Vercel Function）へ送信します。Function側が@google/genai経由でGemini APIを呼び出し、結果のみをブラウザへ返します。入力補助とQR/VINの認識に使用します。モデル名はソース上の`gemini-3-flash-preview`を記載しています。
- QR画像はapi.qrserver.comに車両ID・VIN・メーカー・モデルを送り生成します。印刷にはwindow.print()を使用します。
- Tailwind CSSはPostCSS経由でビルドに組み込みます（`tailwind.config.js`）。フォントはGoogle Fontsから読み込みます。
- Node.js / npm / Vite 6 / @vitejs/plugin-reactが開発・ビルドを担います。TypeScript 5.8、ESLint、Vitestを品質確認に利用します。
- Viteの開発サーバーは3000番ポート、ビルド出力はdist/です。本番はVercel（`vercel.json`）でホスティングされています。

サーバーDB、認証、複数端末同期は現行実装にありません。Geminiキー（`GEMINI_API_KEY`）はVercel Functionの環境変数としてサーバー側のみで保持され、ブラウザには一切渡りません。

根拠: package.json、vite.config.ts、tailwind.config.js、index.html、vercel.json、src/main.tsx、src/App.tsx、src/services/imageAnalysis.ts、api/analyze.ts、src/pages/Dashboard.tsx、src/components/VehicleForm.tsx、src/pages/MobileScanner.tsx、src/pages/VehicleDetail.tsx、src/pages/StockView.tsx、src/pages/YardMapPage.tsx。
