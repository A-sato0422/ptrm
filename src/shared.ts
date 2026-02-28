// ============================================================
// 共有型定義・定数
// clients.ts / client-detail.ts で共通利用
// ============================================================

// レベル構造の型
export interface ClientLevels {
  blue: number;
  red: number;
  green: number;
  yellow: number;
}

// タスクの型（一覧画面は id/title/completed のみ使用、詳細画面は全フィールド使用）
export interface Task {
  id: number;
  title: string;
  reason?: string;
  youtubeUrl?: string;
  completed: boolean;
}

// メモ履歴の型（詳細画面で使用）
export interface MemoHistory {
  id: number;
  date: string;
  trainer: string;
  content: string;
}

// 顧客データの型（一覧・詳細画面の上位互換）
export interface Client {
  id: string; // UUID
  name: string;
  avatarUrl: string;
  lastUpdate: string;
  lastMemo: string;
  trainerName?: string; // 最新メモを書いたトレーナー名（一覧画面で使用）
  courseName?: string; // 契約コース名（一覧画面フィルター用）
  email?: string;
  course?: string; // 契約コース名（詳細画面表示用）
  status?: string;
  levels: ClientLevels;
  nextGoal: string;
  previousNote: string;
  currentTasks: Task[];
  preferences: {
    likes: string;
    dislikes: string;
  };
  history?: MemoHistory[];
}

// カテゴリ名 → 表示色キー のマッピング
export const CATEGORY_COLOR_MAP: Record<string, keyof ClientLevels> = {
  マットピラティス: "blue",
  ウェイトトレーニング: "red",
  スポーツトレーニング: "green",
  ムーブメントトレーニング: "yellow",
};

// プロフィール画像未設定時のデフォルトアバター（グレー人物シルエット）
export const DEFAULT_AVATAR_URL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="20" fill="#e2e8f0"/><circle cx="20" cy="15" r="7" fill="#94a3b8"/><path d="M6 38c0-7.732 6.268-14 14-14s14 6.268 14 14" fill="#94a3b8"/></svg>')}`;

// onerror属性（HTMLテンプレート文字列内）からも参照できるようwindowに登録
(window as any).DEFAULT_AVATAR_URL = DEFAULT_AVATAR_URL;
