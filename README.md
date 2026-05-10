# 今日何食べる？ - Meal Proposal AI

気分・時間・スタイルを選ぶだけで、AIが食事を3つ提案するWebアプリです。

## セットアップ

### 1. 環境変数の設定

```bash
cp .env.example .env.local
```

`.env.local` を編集して以下の値を設定：

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase プロジェクト URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `ANTHROPIC_API_KEY` - Anthropic API key

### 2. Supabase のセットアップ

`supabase/migrations/001_initial.sql` を Supabase の SQL エディタで実行してください。

### 3. 依存関係のインストールと起動

```bash
pnpm install
pnpm dev
```

## 技術スタック

- **Next.js 15** (App Router)
- **TypeScript** (strict mode)
- **Tailwind CSS v4**
- **Supabase** (DB + Auth)
- **Anthropic Claude** (claude-haiku-4-5-20251001)
- **PWA** 対応
