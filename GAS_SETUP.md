# Google Apps Script (GAS) セットアップガイド

このドキュメントでは、Google Apps Script を使用してスプレッドシートにデータを保存するための設定手順を説明します。

## 概要

Google Sheets API の複雑な認証設定の代わりに、Google Apps Script (GAS) を中継することで、よりシンプルかつ確実にスプレッドシートへデータを保存できます。

## セットアップ手順

### 1. Google Sheets の準備

#### 1.1 新しいスプレッドシートを作成
1. [Google Sheets](https://sheets.google.com/) にアクセス
2. 「新しいスプレッドシート」をクリック
3. 適切な名前を付ける（例：「HacKit 2026 - 申し込みデータ」）

#### 1.2 シートを作成
スプレッドシート内に以下の3つのシートを作成してください：

**Events シート** - チーム申し込みデータ用

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T | U | V | W | X | Y | Z | AA | AB | AC | AD | AE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| submittedAt | projectName | teamSize | leaderName | leaderEmail | hasFirstYear | teamDescription | agreements | allergy | member01_class | member01_number | member01_name | member01_furigana | member01_githubUrl | member01_gender | member02_class | member02_number | member02_name | member02_furigana | member02_githubUrl | member02_gender | member03_class | member03_number | member03_name | member03_furigana | member03_githubUrl | member03_gender | member04_class | member04_number | member04_name | member04_furigana |

| AF | AG | AH | AI | AJ | AK | AL | AM | AN | AO | AP | AQ |
|----|----|----|----|----|----|----|----|----|----|----|---|
| member04_githubUrl | member04_gender | member05_class | member05_number | member05_name | member05_furigana | member05_githubUrl | member05_gender | productName | teamPassphrase | githubUrl | githubUrlBackup |

| AR | AS |
|----|---|
| publicSite | publicSiteBackup |

**Personal シート** - 個人申し込みデータ用

| A | B | C | D | E | F | G | H | I | J | K | L | M | N |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| submittedAt | projectName | gradeClass | studentId | name | furigana | gender | leaderName | leaderEmail | hasHackathonExperience | experienceDetail | technologies | agreements | allergy |

**Settings シート** - 設定情報用

| A | B |
|---|---|
| eventApplicationStart | 2026-01-01T00:00:00.000Z |
| eventApplicationEnd | 2026-12-31T23:59:59.000Z |
| teamRegistrationEnd | 2026-12-31T23:59:59.000Z |
| submissionDeadline | 2026-12-31T23:59:59.000Z |

### 2. Google Apps Script を設定

#### 2.1 スプレッドシートを開く
作成したスプレッドシートを開きます。

#### 2.2 Apps Script エディタを開く
1. メニューから **拡張機能** → **Apps Script** をクリック
2. 新しいタブで Apps Script エディタが開きます

#### 2.3 既存コードを削除
デフォルトの `myFunction()` コードを削除します。

#### 2.4 GAS コードを貼り付け
このリポジトリの `gas/Code.gs` の内容をコピーして、Apps Script エディタに貼り付けます。

#### 2.5 スプレッドシート ID を設定
1. 現在のスプレッドシートの URL を確認
   ```
   https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
   ```
2. `Code.gs` の先頭にある `SPREADSHEET_ID` を設定
   ```javascript
   const SPREADSHEET_ID = 'your_spreadsheet_id_here';
   ```

#### 2.6 コードを保存
**Ctrl+S** または **Cmd+S** でコードを保存します。

### 3. Web アプリとしてデプロイ

#### 3.1 デプロイボタンをクリック
Apps Script エディタの右上にある **デプロイ** ボタンをクリック

#### 3.2 「新しいデプロイ」を選択
1. **新しいデプロイ** をクリック
2. 左上の歯車アイコン（設定）をクリック
3. **種類を選択** から **ウェブアプリ** を選択

#### 3.3 デプロイ設定
以下の設定を行います：

| 項目 | 値 |
|------|-----|
| 実行者 | 自分 |
| アクセスできるユーザー | 全員 |

#### 3.4 デプロイ
**デプロイ** ボタンをクリック

#### 3.5 Web アプリ URL を取得
デプロイ完了後、以下のような URL が表示されます：
```
https://script.google.com/macros/d/{DEPLOYMENT_ID}/usercontent
```

この URL をコピーしておいてください。

### 4. Next.js アプリケーション側の設定

#### 4.1 環境変数を設定
`.env.local` に以下を追加：
```env
GAS_WEBAPP_URL=https://script.google.com/macros/d/{DEPLOYMENT_ID}/usercontent
```

#### 4.2 コードの確認
Next.js アプリケーションのコードは既に GAS Web アプリに対応するように修正されています。

### 5. 動作確認

#### 5.1 開発サーバーを起動
```bash
npm run dev
```

#### 5.2 フォームにアクセス
ブラウザで `http://localhost:3000` にアクセス

#### 5.3 テストデータを送信
フォームに適切なテストデータを入力して送信

#### 5.4 スプレッドシートで確認
Google Sheets でスプレッドシートを開き、データが保存されているか確認

## トラブルシューティング

### エラー: "Apps Script Web App URL is not configured"
**原因**: `.env.local` に `GAS_WEBAPP_URL` が設定されていません。

**解決方法**:
```bash
echo "GAS_WEBAPP_URL=https://script.google.com/macros/d/{DEPLOYMENT_ID}/usercontent" >> .env.local
```

### エラー: "Events sheet not found"
**原因**: スプレッドシート内に `Events` という名前のシートが存在しません。

**解決方法**:
1. Google Sheets でスプレッドシートを開く
2. 左下の **+** ボタンをクリック
3. シート名を `Events` に設定
4. 他のシート（`Personal`, `Settings`）も同様に作成

### エラー: "Failed to submit personal"
**原因**: GAS Web アプリ URL が正しく設定されていないか、GAS コードにエラーがあります。

**解決方法**:
1. `.env.local` の `GAS_WEBAPP_URL` が正しいか確認
2. Google Apps Script エディタで **実行** ボタンをクリックしてエラーがないか確認
3. ブラウザコンソール（F12）でネットワークタブを確認し、GAS Web アプリへのリクエストが成功しているか確認

### エラー: "CORS エラー"
**原因**: GAS Web アプリが異なるオリジンからのリクエストを受け付けていません。

**解決方法**:
1. `Code.gs` の `ALLOWED_ORIGINS` 配列にアプリケーションのオリジンを追加
   ```javascript
   const ALLOWED_ORIGINS = [
     'http://localhost:3000',
     'https://your-domain.com'
   ];
   ```
2. コードを保存して再度デプロイ

## 本番環境への展開

### 1. 本番環境の URL を ALLOWED_ORIGINS に追加
```javascript
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://your-production-domain.com'
];
```

### 2. GAS Web アプリを再度デプロイ
1. Apps Script エディタで **デプロイ** をクリック
2. 既存のデプロイを選択して **編集** をクリック
3. コードを更新して **デプロイ** をクリック

### 3. 環境変数を本番環境に設定
ホスティングプロバイダー（Vercel など）で `GAS_WEBAPP_URL` を設定

## セキュリティに関する注意

- GAS Web アプリは「全員」がアクセスできるように設定されています。これは意図的なものです。
- ただし、スプレッドシートへのアクセスはサービスアカウント（GAS 実行ユーザー）のみに限定されます。
- 本番環境では、`ALLOWED_ORIGINS` を明確に指定してください。

## 参考資料

- [Google Apps Script 公式ドキュメント](https://developers.google.com/apps-script)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [Apps Script Web Apps](https://developers.google.com/apps-script/guides/web)
