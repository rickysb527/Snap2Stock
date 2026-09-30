# システム構成・技術スタック

`system-architecture.drawio` をdraw.ioで開くと編集できます。現行ソースに基づき、利用者・ブラウザ内処理・外部サービス・開発ツールを配置しています。

- React 19 / React DOM / TypeScriptで画面を構成し、AppのReact Hooksで在庫と画面状態を管理します。アイコンはlucide-reactです。
- 車両データはlocalStorageの`yard_manager_vehicles`にJSONで保存します。
- Excel / CSVはブラウザ内のSheetJS（xlsx）で読み込み、車両データに変換します。
- 写真はファイル入力から受け取り、@google/genai経由でGemini APIへ送ります。入力補助とQR/VINの認識に使用します。モデル名はソース上の`gemini-3-flash-preview`を記載しています。
- QR画像はapi.qrserver.comに車両ID・VIN・メーカー・モデルを送り生成します。印刷にはwindow.print()を使用します。
- Tailwind CSSはCDN、フォントはGoogle Fontsから読み込みます。
- Node.js / npm / Vite 6 / @vitejs/plugin-reactが開発・ビルドを担います。TypeScript 5.8、ESLint、Vitestを品質確認に利用します。
- Viteの開発サーバーは3000番ポート、ビルド出力はdist/です。本番ホスティング先の指定はありません。

バックエンド、サーバーDB、認証、複数端末同期は現行実装にありません。GeminiキーはViteのdefineでアプリに組み込まれ、ブラウザから直接APIを呼び出す構成です。

根拠: package.json、vite.config.ts、index.html、index.tsx、App.tsx、components/Dashboard.tsx、components/VehicleForm.tsx、components/MobileScanner.tsx、components/VehicleDetail.tsx、components/StockView.tsx。
