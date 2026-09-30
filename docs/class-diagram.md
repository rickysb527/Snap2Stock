# Snap2Stock クラス図

`class-diagram.drawio` はREADMEと現行ソースコードに基づくクラス図です。draw.ioで開いて編集できます。

Reactの関数コンポーネントとTypeScriptのinterfaceをUMLのクラス形式で表現しています。属性・操作は主要なものを抜粋しています。破線は利用・描画の依存で、画面操作はpropsのcallbackを通してAppに通知されます。AppとVehicleの実線は車両配列の保持を表します。

## 根拠

- `src/types.ts`: Vehicleの全14属性。すべてstring。
- `src/App.tsx`: 在庫状態・画面遷移・追加更新・Excel取込データ追加・ゾーン更新・削除・localStorage保存。
- `src/pages/Dashboard.tsx`: xlsxによるExcel/CSV取込と出庫予定集計。
- `src/pages/StockView.tsx`, `src/components/YardMap.tsx`: 在庫検索・地図表示・QR画像取得。
- `src/pages/InboundMapFlow.tsx`, `src/components/VehicleForm.tsx`: 空き区画選択・新規登録・未配置車両への配置・Geminiの写真入力補助。
- `src/pages/MobileScanner.tsx`: Geminiによる画像認識・ID/VIN照合・ゾーン更新。
- `src/pages/VehicleDetail.tsx`, `src/pages/TodayOutboundList.tsx`: 詳細・QR印刷・本日出庫予定・出庫処理。
- `src/utils.ts`, `src/constants.ts`: upsert、ゾーン判定、100区画の定義。

## 要件検討の際に区別する点

- ZoneはVehicle内の文字列であり、独立したデータモデルではありません。区画の最大1台制約はデータモデルで保証されず、入庫画面で使用中の区画を選べない実装です。スキャナーの位置更新には同じ検証がありません。
- 出庫は車両を配列から削除します。出庫履歴モデルはありません。
- Excel取込はランダムIDを付与して既存配列に追加します。VINに基づく重複排除はありません。
- スキャナーのプロンプトはQR/VIN/ナンバープレートを要求しますが、在庫照合コードはID/VINのみです。
- VehicleStatusとMasterDataStateは定義されていますが利用されていません。
- DB、バックエンド、認証、複数端末同期は現行実装にありません。

この図は現行実装の整理であり、将来要件に対する新しいクラス設計を提案するものではありません。シーケンス図は作成していません。
