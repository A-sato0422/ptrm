/**
 * src/api/client-crud.ts
 * 顧客詳細画面の CRUD API 関数（Supabase 呼び出しを集約）
 * エクスポートすることでユニットテストが可能
 */

import { supabase } from "../supabase";

// ============================================================
// カテゴリキャッシュ
// ============================================================

let _categoriesCache: { id: string; name: string }[] = [];

export async function fetchCategories(): Promise<
  { id: string; name: string }[]
> {
  if (_categoriesCache.length > 0) return _categoriesCache;
  const { data, error } = await supabase.from("categories").select("id, name");
  if (error || !data) {
    console.error("カテゴリ取得エラー:", error?.message);
    return [];
  }
  _categoriesCache = data;
  return data;
}

/** テスト用: キャッシュをリセットする */
export function _resetCategoriesCache(): void {
  _categoriesCache = [];
}

// ============================================================
// トレーナー取得
// ============================================================

/**
 * trainers テーブルから有効なトレーナー一覧を取得する。
 */
export async function fetchTrainers(): Promise<{ id: string; name: string }[]> {
  const { data, error } = await supabase
    .from("trainers")
    .select("id, display_name")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error || !data) {
    console.error("トレーナー取得エラー:", error?.message);
    return [];
  }
  return data.map((t) => ({ id: t.id, name: t.display_name ?? "" }));
}

// ============================================================
// タスクマスター取得
// ============================================================

/**
 * tasks テーブルから全件取得（論理削除済みを除く）。
 */
export async function fetchAllTasks(): Promise<
  {
    id: string;
    title: string;
    whyText: string | null;
    youtubeUrl: string | null;
    categoryId: string;
    categoryName: string;
  }[]
> {
  const { data, error } = await supabase
    .from("tasks")
    .select(
      "id, title, why_text, youtube_url, category_id, categories ( name )",
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (error || !data) {
    console.error("タスク取得エラー:", error?.message);
    return [];
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map((t) => ({
    id: t.id,
    title: t.title,
    whyText: t.why_text ?? null,
    youtubeUrl: t.youtube_url ?? null,
    categoryId: t.category_id,
    categoryName: t.categories?.name ?? "",
  }));
}

// ============================================================
// レベル更新
// ============================================================

/**
 * client_levels を UPDATE し、変更があれば level_history に INSERT する。
 * @returns 成功時 true / 失敗時 false
 */
export async function updateLevel(
  clientId: string,
  levelId: string,
  categoryId: string,
  newLevel: number,
  prevLevel: number,
): Promise<boolean> {
  const { error: updateError } = await supabase
    .from("client_levels")
    .update({ current_level: newLevel })
    .eq("id", levelId);

  if (updateError) {
    console.error("レベル更新エラー:", updateError.message);
    return false;
  }

  if (prevLevel !== newLevel) {
    const { error: historyError } = await supabase
      .from("level_history")
      .insert({
        client_id: clientId,
        category_id: categoryId,
        level_before: prevLevel,
        level_after: newLevel,
      });
    if (historyError) {
      console.error("履歴記録エラー:", historyError.message);
      // 履歴記録失敗はメイン処理のエラーとしない
    }
  }
  return true;
}

// ============================================================
// メモ CRUD
// ============================================================

/**
 * trainer_memos に INSERT する。
 * @returns 生成された UUID / 失敗時 null
 */
export async function createMemo(
  clientId: string,
  content: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("trainer_memos")
    .insert({ client_id: clientId, content })
    .select("id")
    .single();

  if (error || !data) {
    console.error("メモ作成エラー:", error?.message);
    return null;
  }
  return data.id;
}

/**
 * trainer_memos の content を UPDATE する。
 * @returns 成功時 true / 失敗時 false
 */
export async function updateMemo(
  dbId: string,
  content: string,
): Promise<boolean> {
  const { error } = await supabase
    .from("trainer_memos")
    .update({ content })
    .eq("id", dbId);

  if (error) {
    console.error("メモ更新エラー:", error.message);
    return false;
  }
  return true;
}

/**
 * trainer_memos を DELETE する。
 * @returns 成功時 true / 失敗時 false
 */
export async function deleteMemo(dbId: string): Promise<boolean> {
  const { error } = await supabase
    .from("trainer_memos")
    .delete()
    .eq("id", dbId);

  if (error) {
    console.error("メモ削除エラー:", error.message);
    return false;
  }
  return true;
}

// ============================================================
// タスク CRUD
// ============================================================

/**
 * tasks テーブルに INSERT → client_tasks に割り当て INSERT。
 * @returns { dbTaskId, clientTaskId } / 失敗時 null
 */
export async function createTask(
  clientId: string,
  categoryId: string,
  title: string,
  reason: string,
  youtubeUrl: string,
): Promise<{ dbTaskId: string; clientTaskId: string } | null> {
  const { data: taskData, error: taskError } = await supabase
    .from("tasks")
    .insert({
      category_id: categoryId,
      title,
      why_text: reason,
      youtube_url: youtubeUrl || null,
    })
    .select("id")
    .single();

  if (taskError || !taskData) {
    console.error("タスク作成エラー:", taskError?.message);
    return null;
  }

  const { data: ctData, error: ctError } = await supabase
    .from("client_tasks")
    .insert({ client_id: clientId, task_id: taskData.id })
    .select("id")
    .single();

  if (ctError || !ctData) {
    console.error("クライアントタスク割り当てエラー:", ctError?.message);
    return null;
  }

  return { dbTaskId: taskData.id, clientTaskId: ctData.id };
}

/**
 * 既存の tasks マスターを client_tasks に割り当てる（タスクは新規作成しない）。
 * @returns 生成された client_tasks.id / 失敗時 null
 */
export async function assignExistingTask(
  clientId: string,
  taskId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("client_tasks")
    .insert({ client_id: clientId, task_id: taskId })
    .select("id")
    .single();

  if (error || !data) {
    console.error("タスク割り当てエラー:", error?.message);
    return null;
  }
  return data.id;
}

/**
 * tasks テーブルのタイトル・理由・URL を UPDATE する。
 * @returns 成功時 true / 失敗時 false
 */
export async function updateTask(
  dbTaskId: string,
  title: string,
  reason: string,
  youtubeUrl: string,
): Promise<boolean> {
  const { error } = await supabase
    .from("tasks")
    .update({ title, why_text: reason, youtube_url: youtubeUrl || null })
    .eq("id", dbTaskId);

  if (error) {
    console.error("タスク更新エラー:", error.message);
    return false;
  }
  return true;
}

/**
 * client_tasks の is_completed を UPDATE する。
 * 完了時は completed_at もセットする。
 * @returns 成功時 true / 失敗時 false
 */
export async function toggleTask(
  clientTaskId: string,
  isCompleted: boolean,
): Promise<boolean> {
  const update: Record<string, unknown> = { is_completed: isCompleted };
  if (isCompleted) update.completed_at = new Date().toISOString();

  const { error } = await supabase
    .from("client_tasks")
    .update(update)
    .eq("id", clientTaskId);

  if (error) {
    console.error("タスク完了状態更新エラー:", error.message);
    return false;
  }
  return true;
}

/**
 * clients の display_name / course_name / line_user_id を UPDATE する。
 * @returns 成功時 true / 失敗時 false
 */
export async function updateClientProfile(
  clientId: string,
  displayName: string,
  courseName: string,
  lineUserId: string,
): Promise<boolean> {
  const { error } = await supabase
    .from("clients")
    .update({
      display_name: displayName,
      course_name: courseName,
      line_user_id: lineUserId,
    })
    .eq("id", clientId);

  if (error) {
    console.error("プロフィール更新エラー:", error.message);
    return false;
  }
  return true;
}

/**
 * clients.next_goal を UPDATE する。
 * @returns 成功時 true / 失敗時 false
 */
export async function updateNextGoal(
  clientId: string,
  nextGoal: string,
): Promise<boolean> {
  const { error } = await supabase
    .from("clients")
    .update({ next_goal: nextGoal })
    .eq("id", clientId);

  if (error) {
    console.error("Next Goal 更新エラー:", error.message);
    return false;
  }
  return true;
}

/**
 * client_tasks から DELETE する（tasks マスターは削除しない）。
 * @returns 成功時 true / 失敗時 false
 */
export async function deleteClientTask(clientTaskId: string): Promise<boolean> {
  const { error } = await supabase
    .from("client_tasks")
    .delete()
    .eq("id", clientTaskId);

  if (error) {
    console.error("タスク削除エラー:", error.message);
    return false;
  }
  return true;
}
