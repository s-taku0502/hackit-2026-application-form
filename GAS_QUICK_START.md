# Google Apps Script (GAS) クイックスタート

## 5分でセットアップできる手順

### ステップ 1: Google Sheets を作成（1分）

1. [Google Sheets](https://sheets.google.com/) にアクセス
2. 「新しいスプレッドシート」をクリック
3. スプレッドシート ID をコピー（URL の `/d/` と `/edit` の間の文字列）

### ステップ 2: シートを作成（1分）

スプレッドシート内に以下の3つのシートを作成：
- `Events` （チーム申し込み用）
- `Personal` （個人申し込み用）
- `Settings` （設定情報用）

各シートの最初の行にヘッダーを入力：

**Events シート:**
```
submittedAt | projectName | teamSize | leaderName | leaderEmail | hasFirstYear | teamDescription | members | agreements | allergy | productName | teamPassphrase | githubUrl | githubUrlBackup | publicSite | publicSiteBackup
```

**Personal シート:**
```
submittedAt | projectName | name | studentId | gradeClass | leaderEmail | hasHackathonExperience | experienceDetail | technologies | agreements | allergy
```

**Settings シート:**
```
eventApplicationStart | 2026-01-01T00:00:00.000Z
eventApplicationEnd | 2026-12-31T23:59:59.000Z
teamRegistrationEnd | 2026-12-31T23:59:59.000Z
submissionDeadline | 2026-12-31T23:59:59.000Z
```

### ステップ 3: Google Apps Script を設定（2分）

1. スプレッドシートを開く
2. **拡張機能** → **Apps Script** をクリック
3. デフォルトコードを削除
4. このリポジトリの `gas/Code.gs` の内容をコピー＆ペースト
5. `Code.gs` の先頭の `SPREADSHEET_ID` を設定：
   ```javascript
   const SPREADSHEET_ID = 'your_spreadsheet_id_here';
   ```
6. **Ctrl+S** で保存

### ステップ 4: Web アプリとしてデプロイ（1分）

1. **デプロイ** ボタンをクリック
2. **新しいデプロイ** をクリック
3. 左上の歯車アイコン → **ウェブアプリ** を選択
4. 実行者: **自分**、アクセスできるユーザー: **全員** に設定
5. **デプロイ** をクリック
6. 表示される URL をコピー（`https://script.google.com/macros/d/...` で始まる）

### ステップ 5: Next.js アプリを設定（1分）

1. `.env.local` ファイルを作成（または編集）
2. 以下を追加：
   ```env
   GAS_WEBAPP_URL=https://script.google.com/macros/d/{DEPLOYMENT_ID}/usercontent
   PAGE_KEYWORD=your_keyword_here
   ```
3. `npm install` を実行
4. `npm run dev` で開発サーバーを起動

### ステップ 6: テスト（1分）

1. ブラウザで `http://localhost:3000` にアクセス
2. フォームにテストデータを入力
3. 送信ボタンをクリック
4. Google Sheets でスプレッドシートを開いて、データが保存されているか確認

## よくあるエラーと解決方法

### エラー: "Failed to submit personal"

**原因**: `GAS_WEBAPP_URL` が設定されていないか、URL が間違っています。

**解決方法**:
```bash
# .env.local を確認
cat .env.local

# GAS_WEBAPP_URL が正しく設定されているか確認
# https://script.google.com/macros/d/{DEPLOYMENT_ID}/usercontent の形式であることを確認
```

### エラー: "Events sheet not found"

**原因**: スプレッドシート内に `Events` シートが存在しません。

**解決方法**:
1. Google Sheets でスプレッドシートを開く
2. 左下の **+** ボタンをクリック
3. シート名を `Events` に設定

### エラー: "CORS エラー" または "403 Forbidden"

**原因**: GAS Web アプリのアクセス権限設定が正しくありません。

**解決方法**:
1. Google Apps Script エディタで **デプロイ** をクリック
2. 既存のデプロイを選択
3. **アクセスできるユーザー** が **全員** に設定されているか確認
4. 設定されていない場合は、新しいデプロイを作成

## 本番環境への展開

### Vercel の場合

1. Vercel ダッシュボードで該当プロジェクトを開く
2. **Settings** → **Environment Variables** をクリック
3. 以下を追加：
   - **Name**: `GAS_WEBAPP_URL`
   - **Value**: `https://script.google.com/macros/d/{DEPLOYMENT_ID}/usercontent`
4. **Save** をクリック

### その他のホスティング環境

各ホスティング環境のドキュメントに従い、`GAS_WEBAPP_URL` 環境変数を設定してください。

## セキュリティに関する注意

- GAS Web アプリは「全員」がアクセスできるように設定されています。これは意図的なものです。
- ただし、スプレッドシートへのアクセスはサービスアカウント（GAS 実行ユーザー）のみに限定されます。
- 本番環境では、`Code.gs` の `ALLOWED_ORIGINS` にアプリケーションのドメインを追加してください。

## 詳細なセットアップ手順

より詳しい説明が必要な場合は、`GAS_SETUP.md` を参照してください。
