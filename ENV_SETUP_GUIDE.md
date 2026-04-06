# 環境変数設定ガイド

このドキュメントでは、HacKit 2026 申し込みフォームの環境変数設定について説明します。

## 概要

`.env.local` ファイルに環境変数を設定することで、開発環境と本番環境での動作を制御できます。

## 環境変数一覧

### 1. `DEV_MODE` - 開発モード設定（重要）

| 設定値 | 説明 |
|--------|------|
| `1` | **開発モード**: 申し込み期間の制限が無視され、常にフォームが表示されます。デバッグやテストに使用します。 |
| `0` | **本番モード**: スプレッドシートの `Settings` シートに設定された申し込み期間に基づいて、フォームの表示/非表示が制御されます。 |

**デフォルト値**: `1`（開発モード）

**例：**
```env
# 開発環境
DEV_MODE=1

# 本番環境
DEV_MODE=0
```

### 2. `GAS_WEBAPP_URL` - Google Apps Script Web アプリ URL

Google Apps Script で作成した Web アプリのデプロイ URL を設定します。

**形式:**
```
https://script.google.com/macros/d/{DEPLOYMENT_ID}/usercontent
```

**例：**
```env
GAS_WEBAPP_URL=https://script.google.com/macros/d/1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p/usercontent
```

**取得方法:**
1. Google Apps Script エディタを開く
2. 「デプロイ」→「新しいデプロイ」をクリック
3. 種類を「ウェブアプリ」に設定
4. 実行ユーザーを「自分」に設定
5. アクセスを「全員」に設定
6. 「デプロイ」をクリック
7. 表示された URL をコピー

### 3. `PAGE_KEYWORD` - ページアクセス用キーワード

ページへのアクセスを制限するためのキーワード（オプション）

**例：**
```env
PAGE_KEYWORD=hackit2026secret
```

## 環境別設定例

### 開発環境（ローカル開発）

```env
# 開発モード：申し込み期間の制限が無視される
DEV_MODE=1

# GAS Web アプリ URL（設定しなくてもモックデータが使用される）
GAS_WEBAPP_URL=https://script.google.com/macros/d/{DEPLOYMENT_ID}/usercontent

# ページキーワード（オプション）
PAGE_KEYWORD=dev_keyword
```

**動作:**
- ✅ 常にフォームが表示される
- ✅ 申し込み期間の制限が無視される
- ✅ GAS_WEBAPP_URL が設定されていなくても動作する（モックデータを使用）

### 本番環境（Vercel など）

```env
# 本番モード：スプレッドシートの設定に基づいて動作
DEV_MODE=0

# GAS Web アプリ URL（必須）
GAS_WEBAPP_URL=https://script.google.com/macros/d/{DEPLOYMENT_ID}/usercontent

# ページキーワード
PAGE_KEYWORD=production_keyword
```

**動作:**
- ✅ スプレッドシートの `Settings` シートの設定に基づいて、申し込み期間を制御
- ✅ 申し込み期間外の場合、フォームが表示されない
- ✅ GAS Web アプリからデータを取得・保存

## DEV_MODE の詳細な動作

### DEV_MODE=1（開発モード）

```
┌─────────────────────────────────────┐
│ /api/settings からのレスポンス       │
├─────────────────────────────────────┤
│ {                                   │
│   enabled: true,                    │
│   isDevelopment: true,              │
│   eventApplicationStart: "2000-..." │
│   eventApplicationEnd: "2099-..."   │
│ }                                   │
└─────────────────────────────────────┘
       ↓
┌─────────────────────────────────────┐
│ EventForm.tsx での判定              │
├─────────────────────────────────────┤
│ isDevelopment = true                │
│ ↓                                   │
│ beforeStart = false (無視)          │
│ afterEnd = false (無視)             │
│ ↓                                   │
│ フォームを常に表示                  │
│ ヘッダーに「🔧 開発モード」表示     │
└─────────────────────────────────────┘
```

### DEV_MODE=0（本番モード）

```
┌─────────────────────────────────────┐
│ GAS Web アプリから設定を取得        │
│ Settings シート: A2=2026-04-01...   │
│                 B2=2026-05-31...    │
└─────────────────────────────────────┘
       ↓
┌─────────────────────────────────────┐
│ /api/settings からのレスポンス       │
├─────────────────────────────────────┤
│ {                                   │
│   enabled: true,                    │
│   isDevelopment: false,             │
│   eventApplicationStart: "2026-..." │
│   eventApplicationEnd: "2026-..."   │
│ }                                   │
└─────────────────────────────────────┘
       ↓
┌─────────────────────────────────────┐
│ EventForm.tsx での判定              │
├─────────────────────────────────────┤
│ isDevelopment = false               │
│ ↓                                   │
│ 現在時刻が期間内か確認              │
│ ↓                                   │
│ 期間内: フォーム表示                │
│ 期間外: メッセージ表示              │
└─────────────────────────────────────┘
```

## Vercel での環境変数設定

Vercel にデプロイする場合、以下の手順で環境変数を設定してください：

1. Vercel ダッシュボードにログイン
2. プロジェクトを選択
3. 「Settings」→「Environment Variables」をクリック
4. 以下の環境変数を追加：

| キー | 値 | 説明 |
|------|-----|------|
| `DEV_MODE` | `0` | 本番モード |
| `GAS_WEBAPP_URL` | `https://script.google.com/macros/d/...` | GAS Web アプリ URL |
| `PAGE_KEYWORD` | `your_keyword` | ページキーワード |

5. 「Save」をクリック
6. デプロイを再実行

## トラブルシューティング

### Q: 開発モードなのに申し込み期間外のメッセージが表示される
**A**: `.env.local` ファイルで `DEV_MODE=1` が設定されているか確認してください。設定後、開発サーバーを再起動してください。

```bash
# 開発サーバーを再起動
npm run dev
```

### Q: 本番環境で常にフォームが表示される
**A**: Vercel の環境変数で `DEV_MODE=0` が設定されているか確認してください。設定後、デプロイを再実行してください。

### Q: 「🔧 開発モード」のメッセージが表示されない
**A**: 以下を確認してください：
1. `.env.local` に `DEV_MODE=1` が設定されているか
2. 開発サーバーが再起動されているか
3. ブラウザのキャッシュをクリアしているか（Ctrl+Shift+Delete）

### Q: GAS Web アプリ URL が設定されているのにデータが保存されない
**A**: 以下を確認してください：
1. GAS Web アプリが正しくデプロイされているか
2. スプレッドシートが GAS Web アプリと同じアカウントで共有されているか
3. スプレッドシートに `Events` と `Personal` シートが存在するか

## 参考資料

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Google Apps Script Web アプリのデプロイ](https://developers.google.com/apps-script/guides/web)
