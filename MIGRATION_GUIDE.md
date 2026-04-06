# Convex から Google Sheets への移行ガイド

## 概要
このプロジェクトのデータ保存先を **Convex** から **Google Sheets** に移行しました。これにより、スプレッドシート上で直接データを管理・編集できるようになります。

## 主な変更点

### 1. 新規ファイル
- **`app/api/google-sheets.ts`**: Google Sheets API操作ユーティリティ
  - `appendToSheet()`: スプレッドシートにデータを追加
  - `getSheetValues()`: スプレッドシートからデータを取得
  - `updateSheetRow()`: スプレッドシートの行を更新

- **`app/api/submit/route.ts`**: データ保存・取得用のAPIエンドポイント
  - `POST`: イベント申し込み、個人申し込み、チーム情報更新を処理
  - `GET`: 登録済みチーム一覧を取得

### 2. 修正ファイル
- **`app/layout.tsx`**: `ConvexClientProvider` を削除
- **`app/components/EventForm.tsx`**: Convex `useMutation` を `fetch` に置き換え
- **`app/submissions/page.tsx`**: Convex `useQuery` と `useMutation` を `fetch` に置き換え
- **`app/teams/page.tsx`**: Convex `useQuery` と `useMutation` を `fetch` に置き換え
- **`app/hooks/useSettings.tsx`**: Convex `useQuery` を削除し、APIルートから設定を取得
- **`app/api/settings/route.ts`**: Google Sheets から設定情報を取得するように修正

### 3. 環境変数設定
`.env.local` に以下の環境変数を設定してください：

```env
# Google Sheets API設定
GOOGLE_SHEET_ID=your_spreadsheet_id_here
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nPrivate\nKey\nHere\n-----END PRIVATE KEY-----\n"

# ページアクセス用キーワード
PAGE_KEYWORD=your_keyword_here
```

## Google Sheets のセットアップ

### 1. スプレッドシートの作成
Google Sheets で新しいスプレッドシートを作成し、以下のシートを追加してください：

#### **Events シート**
イベント（チーム）申し込みデータを保存します。
| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| submittedAt | projectName | teamSize | leaderName | leaderEmail | hasFirstYear | teamDescription | members | agreements | allergy |

#### **Personal シート**
個人申し込みデータを保存します。
| A | B | C | D | E | F | G | H | I | J | K |
|---|---|---|---|---|---|---|---|---|---|---|
| submittedAt | projectName | name | studentId | gradeClass | leaderEmail | hasHackathonExperience | experienceDetail | technologies | agreements | allergy |

#### **Settings シート**
アプリケーション設定を保存します。
| A | B |
|---|---|
| eventApplicationStart | 2026-01-01T00:00:00.000Z |
| eventApplicationEnd | 2026-12-31T23:59:59.000Z |
| teamRegistrationEnd | 2026-12-31T23:59:59.000Z |
| submissionDeadline | 2026-12-31T23:59:59.000Z |

### 2. Google Cloud プロジェクトの設定
1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成
3. Google Sheets API を有効化
4. サービスアカウントを作成
5. サービスアカウントキー（JSON形式）をダウンロード
6. スプレッドシートをサービスアカウントのメールアドレスと共有（編集権限）

### 3. 環境変数の設定
ダウンロードしたサービスアカウントキー（JSON）から以下の値を取得し、環境変数に設定：
- `GOOGLE_CLIENT_EMAIL`: `client_email` フィールド
- `GOOGLE_PRIVATE_KEY`: `private_key` フィールド（改行は `\n` として保存）
- `GOOGLE_SHEET_ID`: スプレッドシートのURL内のID（例：`https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`）

## 開発環境での動作

開発環境（`NODE_ENV !== 'production'`）で Google Sheets 認証情報が未設定の場合、アプリケーションは以下のように動作します：

- **API呼び出し**: ログに記録されますが、実際のデータ保存は行われません（モックモード）
- **設定取得**: デフォルト値が返されます
- **エラー**: 致命的なエラーにはなりません

これにより、Google Sheets の設定なしでローカル開発が可能です。

## 本番環境への展開

### Vercel での設定例
1. Vercel ダッシュボードでプロジェクトを開く
2. **Settings** → **Environment Variables** に移動
3. 以下の環境変数を追加：
   - `GOOGLE_SHEET_ID`
   - `GOOGLE_CLIENT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`

### その他のホスティング環境
各ホスティング環境のドキュメントに従い、上記3つの環境変数を設定してください。

## トラブルシューティング

### エラー: "Missing required parameters: spreadsheetId"
- `GOOGLE_SHEET_ID` が設定されていません
- 環境変数を確認してください

### エラー: "Error: Invalid Credentials"
- `GOOGLE_CLIENT_EMAIL` または `GOOGLE_PRIVATE_KEY` が正しくありません
- サービスアカウントキーを再度確認してください
- `GOOGLE_PRIVATE_KEY` の改行が `\n` として正しく保存されているか確認してください

### スプレッドシートにデータが保存されない
- サービスアカウントのメールアドレスがスプレッドシートと共有されているか確認
- スプレッドシートのシート名が正しいか確認（`Events`, `Personal`, `Settings`）
- ブラウザコンソールとサーバーログでエラーメッセージを確認

## 今後の改善予定
- [ ] スプレッドシート列の自動作成
- [ ] バッチ処理による大量データの効率的な保存
- [ ] スプレッドシート更新の非同期処理化
- [ ] キャッシング機能の追加
