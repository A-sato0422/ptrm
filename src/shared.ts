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
  id: number; // UI 表示用連番
  dbTaskId?: string; // tasks.id (UUID) ← DB操作に使用
  clientTaskId?: string; // client_tasks.id (UUID) ← DB操作に使用
  title: string;
  reason?: string;
  youtubeUrl?: string;
  completed: boolean;
  isNew?: boolean; // 新規追加フラグ（まだDBに未保存）
  isDeleted?: boolean; // 削除フラグ（登録時にDELETE）
}

// メモ履歴の型（詳細画面で使用）
export interface MemoHistory {
  id: number; // UI 表示用連番
  dbId?: string; // trainer_memos.id (UUID) ← DB操作に使用
  date: string;
  trainer: string;
  content: string;
  isNew?: boolean; // 新規追加フラグ
  isDeleted?: boolean; // 削除フラグ
}

// 顧客データの型（一覧・詳細画面の上位互換）
export interface Client {
  id: string; // UUID
  name: string;
  lineUserId?: string; // LINEユーザーID
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
  /** 色キー → categories.id のマッピング（レベル更新に使用） */
  categoryIdMap?: Record<string, string>;
  /** 色キー → client_levels.id のマッピング（レベル更新に使用） */
  levelIdMap?: Record<string, string>;
}

// カテゴリ名 → 表示色キー のマッピング
export const CATEGORY_COLOR_MAP: Record<string, keyof ClientLevels> = {
  マットピラティス: "blue",
  ウェイトトレーニング: "red",
  スポーツトレーニング: "green",
  ムーブメントトレーニング: "yellow",
};

// プロフィール画像未設定時のデフォルトアバター
export const DEFAULT_AVATAR_URL = "/assets/initial-avater.png";

// onerror属性（HTMLテンプレート文字列内）からも参照できるようwindowに登録
if (typeof window !== "undefined") {
  (window as any).DEFAULT_AVATAR_URL = DEFAULT_AVATAR_URL;
}
