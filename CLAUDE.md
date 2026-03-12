# PTRM (Personal Training Roadmap Management System) - Claude Code Guide

## プロジェクト概要

パーソナルジム向けのモチベーション管理システム。40代後半〜50代の女性クライアントが、4カテゴリ×30階級のトレーニング進捗を可視化する。

## ユーザー種別

- **クライアント（ジム会員）**: LINEアプリ経由でLIFF起動 → 自分の進捗確認
- **トレーナー（管理者）**: 直接URL経由でアクセス → クライアント管理

## 技術スタック

- **フロントエンド**: TypeScript + Vite（Reactなし、バニラTS）
- **バックエンド/DB**: Supabase（PostgreSQL + Auth + Edge Functions + RLS）
- **認証**: LINE LIFF
- **ホスティング**: Vercel
- **CI/CD**: GitHub Actions

## ディレクトリ構成

```
src/
  api/          # Supabase CRUD操作
  lib/          # ユーティリティ（mapper等）
  partials/     # 共通HTML部品（header, nav）
  styles/       # 画面別CSS
  *.ts          # 各ページのエントリーポイント
supabase/
  migrations/   # DBマイグレーション（CLIで管理）
docs/           # 設計ドキュメント・フローチャート
tests/          # Vitestテスト
```

## 主要ファイル

- `src/supabase.ts` - Supabaseクライアント初期化
- `src/shared.ts` - 共通ロジック
- `src/page-init.ts` - ページ共通初期化処理
- `vite.config.ts` - ビルド設定（マルチページ構成）

## 環境変数（.env.local）

```
VITE_LIFF_ID=          # LINE LIFFアプリID
VITE_SUPABASE_URL=     # SupabaseプロジェクトURL
VITE_SUPABASE_ANON_KEY= # Supabase anonキー
```

※ `VITE_` プレフィックスが必須（Viteのフロントエンド公開ルール）
※ 本番/ステージング環境の切り替えはVercelのEnvironment Variable Scopingで管理（変数名は同じ）

## よく使うコマンド

```bash
npm run dev           # 開発サーバー起動
npm run build         # ビルド
npm run test          # テスト実行
npm run db:push:production  # 本番DBへのマイグレーション適用
```

## アーキテクチャの重要な決定事項

### LIFF認証フロー（全6ケース）

LIFFアプリは1つだけ（クライアント・トレーナー共用）。
LINE IDをフロントエンドからSupabaseに直接渡すのはセキュリティ上NG → 必ずEdge Function経由。

**FLOW A: リッチメニュー「PTRMへ」ボタン経由（ケース①②③④）**

```
LINEリッチメニュータップ
→ liff.init() でLIFFアプリ初期化
→ liff.getIDToken() で署名付きIDトークン（JWT）取得
→ Edge FunctionにIDトークン送信・LINEサーバーで検証（なりすまし防止）
→ clientsテーブルにLINE IDが存在するか？
  YES → クライアント画面（ケース②登録済みクライアント、④登録済みトレーナー）
  NO  → ID確認画面（ケース①未登録クライアント、③clients未登録トレーナー）
        「まだ登録が完了していません」+ LINE IDコピー/送信ボタン表示
```

**FLOW B: 管理画面URL直打ち（ケース⑤⑥）**

```
ブラウザでURL直接入力（PC/スマホ共通）
→ liff.init() → liff.isLoggedIn() = false（LINEアプリ外のため）
→ liff.login() → LINEログイン画面へリダイレクト
→ IDトークン送信・Edge Functionで検証（FLOW Aと同じ）
→ trainersテーブルにLINE IDが存在するか？
  YES → 管理画面（ケース⑥登録済みトレーナー）
  NO  → アクセス拒否画面（ケース⑤未登録・不正アクセス）
```

**ケース一覧**

- ケース①: 未登録クライアントが「PTRMへ」→ ID確認画面
- ケース②: 登録済みクライアントが「PTRMへ」→ クライアント画面
- ケース③: clients未登録トレーナーが「PTRMへ」→ ID確認画面
- ケース④: clients登録済みトレーナーが「PTRMへ」→ クライアント画面
- ケース⑤: trainers未登録ユーザーがURL直打ち → アクセス拒否画面
- ケース⑥: trainers登録済みトレーナーがURL直打ち → 管理画面

**開発環境でのスキップ**
開発環境は、LIFFをスキップし、固定のダミーユーザー(U_client_test_001)でログインする処理としてください。

### Supabase Auth

- LIFF認証と**併用必須**（RLSポリシーを有効にするため）
- Edge FunctionがLINEトークン検証後、Supabase Authのセッションを発行する

### その他

- LocalStorage は使用しない（LIFFがセッション管理を担う）
- トレーナー管理画面は直接URL アクセス

## やってはいけないこと

- LocalStorageへの永続化
- LINE IDをフロントエンドから直接Supabaseに渡す
- `supabase/migrations/` を直接編集（必ずCLI経由で新規マイグレーションを作成）
- 本番DBへの直接データ変更（マイグレーションファイルで管理）
- Vercel環境変数に環境名サフィックスを付ける（例: `VITE_SUPABASE_URL_PROD` はNG）

## DBスキーマ（11テーブル）

`categories`, `stages`, `tasks`, `clients`, `trainers`, `client_levels`, `client_tasks`, `will_matrix`, `level_history`, `trainer_memos`, `point_history`

ステージはレベルから動的に計算（5レベルごと、閾値はコードで定義、DBには保存しない）

## リリース目標

MVP: 2025年3月
