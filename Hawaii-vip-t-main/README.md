# Hawaii VIP Concierge (Japanese-only) + Contact → Google Sheets

## 変更点
- 日英切り替えを削除し、日本語のみ表示にしました。
- お問い合わせフォームを「Google Apps Script WebApp」にPOSTして、スプレッドシート保存＋自動返信する方式に変更しました。

---

## 1) フロント側の設定（Vite）
### 環境変数
`.env` を作成し、下記を設定してください（`.env.example` 参照）

```
VITE_GAS_ENDPOINT=https://script.google.com/macros/s/XXXXXXXXXXXX/exec
```

Cloudflare Pages を使う場合は、Project Settings → Environment Variables に
`VITE_GAS_ENDPOINT` を追加してください。

---

## 2) Google Apps Script 側の設定
`gas/Code.gs` を Google Apps Script に貼り付けて WebApp としてデプロイしてください。

### スクリプトプロパティ（必須）
Apps Script 画面：
「プロジェクトの設定」→「スクリプト プロパティ」

- `SPREADSHEET_ID` : 保存先スプレッドシートID
- `ADMIN_EMAIL`    : 通知先メール（あなたのメール）
- `FROM_NAME`      : 自動返信の差出人名（例: Hawaii VIP Concierge）
- `REPLY_SUBJECT`  : 自動返信の件名（任意）

### デプロイ
「デプロイ」→「新しいデプロイ」→「ウェブアプリ」

- 実行するユーザー：自分
- アクセスできるユーザー：全員

発行されたURLを `VITE_GAS_ENDPOINT` に設定します。

---

## 3) ビルド
```
npm i
npm run build
```

---

## 注意（CORS）
GAS WebApp は CORS ヘッダーを自由に付けられないため、フロントは `fetch(..., { mode: "no-cors" })` で送信しています。
そのためレスポンス本文は読めませんが、送信自体は正常に動作します。
