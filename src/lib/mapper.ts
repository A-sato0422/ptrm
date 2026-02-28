/**
 * src/lib/mapper.ts
 * DB から取得した生データを表示用 Client 型に変換する純粋関数
 * （副作用なし・DOM 不使用 → ユニットテスト可能）
 */

import {
  CATEGORY_COLOR_MAP,
  DEFAULT_AVATAR_URL,
  Client,
  Task,
  MemoHistory,
} from "../shared";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapDbClientToDisplay(dbClient: any): Client {
  // レベルマッピング（categoryIdMap / levelIdMap も構築）
  const levels = { blue: 0, red: 0, green: 0, yellow: 0 };
  const categoryIdMap: Record<string, string> = {};
  const levelIdMap: Record<string, string> = {};
  for (const cl of dbClient.client_levels || []) {
    const colorKey = CATEGORY_COLOR_MAP[cl.categories?.name];
    if (colorKey) {
      levels[colorKey] = cl.current_level;
      categoryIdMap[colorKey] = cl.category_id;
      levelIdMap[colorKey] = cl.id;
    }
  }

  // メモ履歴（created_at 降順）
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const history: MemoHistory[] = [...(dbClient.trainer_memos || [])]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((memo: any, idx: number) => ({
      id: idx + 1,
      dbId: memo.id,
      date: new Date(memo.created_at).toLocaleDateString("ja-JP"),
      trainer: memo.trainers?.display_name || "トレーナー",
      content: memo.content,
    }));

  const lastMemo = history[0]?.content?.slice(0, 20) || "";

  // タスクマッピング
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentTasks: Task[] = (dbClient.client_tasks || [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((ct: any) => ct.tasks)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((ct: any, idx: number) => ({
      id: idx + 1,
      dbTaskId: ct.tasks.id,
      clientTaskId: ct.id,
      title: ct.tasks.title,
      reason: ct.tasks.why_text || "",
      youtubeUrl: ct.tasks.youtube_url || "",
      completed: ct.is_completed,
    }));

  // will_matrix
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const likes = (dbClient.will_matrix || [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((w: any) => w.like_status === 1)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((w: any) => w.tasks?.title)
    .filter(Boolean)
    .join("、");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dislikes = (dbClient.will_matrix || [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((w: any) => w.like_status === -1)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((w: any) => w.tasks?.title)
    .filter(Boolean)
    .join("、");

  return {
    id: dbClient.id,
    name: dbClient.display_name || "名前未設定",
    avatarUrl: dbClient.profile_image_url || DEFAULT_AVATAR_URL,
    lineUserId: dbClient.line_user_id || "",
    course: dbClient.course_name || "",
    status: "Active",
    lastUpdate: new Date(dbClient.updated_at).toLocaleDateString("ja-JP"),
    lastMemo,
    levels,
    nextGoal: dbClient.next_goal || "",
    previousNote: history[0]?.content || "",
    currentTasks,
    preferences: { likes, dislikes },
    history,
    categoryIdMap,
    levelIdMap,
  };
}
