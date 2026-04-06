# トラブルシューティング

## エラー: "Module not found: Can't resolve 'googleapis'"

### 原因
`googleapis` ライブラリが `node_modules` にインストールされていません。

### 解決方法

#### 方法1: 依存関係を再インストール（推奨）
```bash
# node_modules と package-lock.json をクリア
rm -rf node_modules package-lock.json

# 最新の依存関係を再インストール
npm install

# ビルド実行
npm run build
```

#### 方法2: npm ci を使用（より安全）
```bash
# package-lock.json に基づいて正確にインストール
npm ci

# ビルド実行
npm run build
```

#### 方法3: 単に npm install を実行
```bash
npm install
npm run build
```

### 確認方法
```bash
# googleapis がインストールされているか確認
npm list googleapis

# 出力例:
# events_form@0.1.0
# └── googleapis@171.4.0
```

---

## エラー: "Error: Invalid Credentials"

### 原因
Google Sheets API の認証情報が正しく設定されていません。

### 解決方法

1. **環境変数を確認**
   ```bash
   cat .env.local
   ```
   以下の3つの環境変数が設定されているか確認：
   - `GOOGLE_SHEET_ID`
   - `GOOGLE_CLIENT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`

2. **GOOGLE_PRIVATE_KEY の改行を確認**
   `GOOGLE_PRIVATE_KEY` に含まれる改行が `\n` として正しく保存されているか確認してください。
   
   ❌ 間違い:
   ```
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
   MIIEvQIBADANBgkqhkiG9w0BAQE...
   -----END PRIVATE KEY-----"
   ```
   
   ✅ 正しい:
   ```
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQE...\n-----END PRIVATE KEY-----\n"
   ```

3. **サービスアカウントキーを再確認**
   - [Google Cloud Console](https://console.cloud.google.com/) にアクセス
   - 該当プロジェクトを選択
   - **サービスアカウント** → 対象のサービスアカウント → **キー** タブ
   - JSON形式のキーをダウンロードし直す

---

## エラー: "Error: Missing required parameters: spreadsheetId"

### 原因
`GOOGLE_SHEET_ID` が設定されていません。

### 解決方法

1. **.env.local に GOOGLE_SHEET_ID を追加**
   ```bash
   GOOGLE_SHEET_ID=your_spreadsheet_id_here
   ```

2. **スプレッドシート ID の取得方法**
   - Google Sheets でスプレッドシートを開く
   - URL から ID を抽出：
     ```
     https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit
                                            ^^^^^^^^^
     ```

3. **開発環境での動作**
   開発環境（`NODE_ENV !== 'production'`）では、`GOOGLE_SHEET_ID` が未設定でもアプリケーションはエラーで止まりません。
   コンソールにログが出力され、データはモックモードで処理されます。

---

## エラー: "スプレッドシートにデータが保存されない"

### 原因
複数の可能性があります。以下を順番に確認してください。

### 解決方法

1. **サービスアカウントがスプレッドシートと共有されているか確認**
   - Google Sheets でスプレッドシートを開く
   - 右上の **共有** ボタンをクリック
   - サービスアカウントのメールアドレス（`GOOGLE_CLIENT_EMAIL`）が共有されているか確認
   - 共有されていない場合は、編集権限で共有

2. **スプレッドシートのシート名を確認**
   - 以下の3つのシートが存在するか確認：
     - `Events`
     - `Personal`
     - `Settings`
   - シート名が正確に一致しているか確認（大文字小文字を区別）

3. **ブラウザコンソールでエラーを確認**
   - ブラウザの開発者ツール（F12）を開く
   - **コンソール** タブを確認
   - エラーメッセージが表示されていないか確認

4. **サーバーログを確認**
   - ローカル開発環境：`npm run dev` を実行しているターミナルを確認
   - 本番環境：ホスティングプロバイダーのログを確認

5. **API呼び出しが成功しているか確認**
   - ブラウザの開発者ツール → **ネットワーク** タブ
   - `/api/submit` への POST リクエストを確認
   - ステータスが `200` か確認
   - レスポンスボディに `{ ok: true }` が含まれているか確認

---

## エラー: "Permission denied"

### 原因
サービスアカウントにスプレッドシートへのアクセス権限がありません。

### 解決方法

1. **スプレッドシートの共有設定を確認**
   - Google Sheets でスプレッドシートを開く
   - 右上の **共有** ボタンをクリック
   - サービスアカウントのメールアドレスが **編集者** として共有されているか確認

2. **共有を設定する**
   - 共有されていない場合は、以下の手順で共有：
     1. **共有** ボタンをクリック
     2. サービスアカウントのメールアドレスを入力
     3. 権限を **編集者** に設定
     4. **共有** をクリック

---

## 開発環境での動作確認

開発環境（`NODE_ENV !== 'production'`）では、Google Sheets 認証情報がなくても以下のように動作します：

### 動作内容
- **API呼び出し**: コンソールにログが出力されます
- **データ保存**: 実際には保存されません（モックモード）
- **設定取得**: デフォルト値が返されます
- **エラー**: 致命的なエラーにはなりません

### ログ出力例
```
Mock mode: appendToSheet called with { range: 'Events!A:J', values: [...] }
Mock mode: getSheetValues called with { range: 'Events!A:Z' }
```

これにより、Google Sheets の設定なしでローカル開発が可能です。

---

## よくある質問

### Q: `npm install` 後も `googleapis` が見つからないと言われます
A: 以下を試してください：
```bash
# キャッシュをクリア
npm cache clean --force

# 再度インストール
npm install

# ビルド
npm run build
```

### Q: 本番環境でも開発環境のモックモードで動作します
A: 本番環境では `NODE_ENV=production` を設定し、Google Sheets 認証情報を環境変数に設定してください。

### Q: スプレッドシートの列構成を変更したいです
A: `app/api/submit/route.ts` の `appendToSheet` 呼び出し時の `range` パラメータと `values` 配列を修正してください。

---

## さらにサポートが必要な場合

以下の情報を確認して、ログを確認してください：

1. **ブラウザコンソール**: F12 → コンソール タブ
2. **サーバーログ**: ローカル開発環境のターミナル出力
3. **Google Cloud ログ**: [Google Cloud Console](https://console.cloud.google.com/) → ログ

それでも解決しない場合は、上記のログ情報とともに、GitHub Issues で報告してください。
