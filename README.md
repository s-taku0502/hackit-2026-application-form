# Hackit 2026 — 申請フォームアプリ

このリポジトリは Hackit 2026 のイベント申請フォーム用のフロントエンド・バックエンド統合アプリです。
フロントエンドは Next.js（App Router）、バックエンドに Convex を使用しています。

## 概要
- フレームワーク: Next.js
- バックエンド: Convex
- 言語: TypeScript / React

主要なフォルダ:
- `app/` — Next.js のルーティングと UI コンポーネント
- `convex/` — Convex 関連の関数・スキーマ・自動生成ファイル

## 必要環境
- Node.js（推奨: 18+）
- npm

## ローカル開発
1. 依存関係をインストールします:

```bash
npm install
```

2. Convex の開発サーバーを別ターミナルで起動します（Convex を使う機能があるため）:

```bash
npx convex dev
```

3. Next.js 開発サーバーを起動します:

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開くとアプリが見られます。

※環境により Convex のデプロイ先 URL や認証設定が必要な場合があります。詳細は `convex/README.md` と `convex/_generated/ai/guidelines.md` を参照してください。

## 使える npm スクリプト
- `npm run dev` — 開発モード（Next）
- `npm run build` — 本番ビルド（Next）
- `npm run start` — 本番サーバ起動（Next）
- `npm run lint` — ESLint を実行

## 開発メモ / 注意点
- Convex を使う箇所は `convex/` 以下に実装されています。Convex のルールやコード生成に関するガイドラインは `convex/_generated/ai/guidelines.md` を必ず確認してください。
- API ルートや検証ロジックは `app/api/` 以下に分かれています。

## 貢献・テスト
- 変更を行ったら `npm run lint` を実行して静的チェックを行ってください。

## 参照
- Convex 関連: [convex/README.md](convex/README.md)
- プロジェクトのエージェントや作業指示: [AGENTS.md](AGENTS.md)

- 詳細ドキュメント: [docs/APP_DETAILS.md](docs/APP_DETAILS.md)

---

質問や追加の要望があれば知らせてください。README の内容をさらに詳しく（デプロイ手順、環境変数一覧、アーキテクチャ図など）できます。
