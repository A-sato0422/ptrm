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
    .eq("delete_flg", false)
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
  trainerId?: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("trainer_memos")
    .insert({ client_id: clientId, content, ...(trainerId ? { trainer_id: trainerId } : {}) })
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
// ============================================================
// タスク重複チェック
// ============================================================

/**
 * 同カテゴリ・同タイトルのタスクが tasks テーブルに既に存在するか確認する。
 * @returns 重複あり true / なし false
 */
export async function checkTaskDuplicate(
  categoryId: string,
  title: string,
): Promise<boolean> {
  const { count, error } = await supabase
    .from("tasks")
    .select("id", { count: "exact", head: true })
    .eq("category_id", categoryId)
    .eq("title", title.trim())
    .is("deleted_at", null);

  if (error) {
    console.error("タスク重複チェックエラー:", error.message);
    return false;
  }
  return (count ?? 0) > 0;
}

// ============================================================
// タスク作成
// ============================================================

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
/**
 * client_tasks に既存レコード（完了済み含む）があるかを確認する。
 * 再割り当て前に完了済みチェックとして使用する。
 * @returns 完了済みレコードが存在する場合 true
 */
export async function checkCompletedClientTask(
  clientId: string,
  taskId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("client_tasks")
    .select("is_completed")
    .eq("client_id", clientId)
    .eq("task_id", taskId)
    .maybeSingle();
  return !!data && (data as { is_completed: boolean }).is_completed === true;
}

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
 * 完了時は completed_at と level_at_completion もセットする。
 * level_at_completion はタスクのカテゴリに対応する client_levels.current_level を取得して保存する。
 * @returns 成功時 true / 失敗時 false
 */
export async function toggleTask(
  clientTaskId: string,
  isCompleted: boolean,
  clientId?: string,
): Promise<boolean> {
  const update: Record<string, unknown> = { is_completed: isCompleted };
  if (isCompleted) {
    update.completed_at = new Date().toISOString();

    // 完了時: タスクのカテゴリに対応する現在レベルを取得して保存
    if (clientId) {
      // client_tasks → tasks → category_id を取得
      const { data: ctData } = await supabase
        .from("client_tasks")
        .select("tasks ( category_id )")
        .eq("id", clientTaskId)
        .single();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const categoryId = (ctData as any)?.tasks?.category_id ?? null;

      if (categoryId) {
        const { data: levelData } = await supabase
          .from("client_levels")
          .select("current_level")
          .eq("client_id", clientId)
          .eq("category_id", categoryId)
          .single();

        if (levelData) {
          update.level_at_completion = levelData.current_level;
        }
      }
    }
  } else {
    // 未完了に戻す場合はクリア
    update.completed_at = null;
    update.level_at_completion = null;
  }

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
 * カテゴリ別に完了済み宿題一覧をレベルごとにまとめて取得する（山モーダル表示用）。
 * @returns レベル番号をキーに、{taskTitle, completedAt}[] をグループ化した Map
 */
export async function fetchCompletedTasksByCategory(
  clientId: string,
  categoryId: string,
): Promise<Map<number, { taskTitle: string; completedAt: string }[]>> {
  const { data, error } = await supabase
    .from("client_tasks")
    .select("level_at_completion, completed_at, tasks ( title, category_id )")
    .eq("client_id", clientId)
    .eq("is_completed", true)
    .not("level_at_completion", "is", null)
    .order("level_at_completion", { ascending: true })
    .order("completed_at", { ascending: true });

  if (error || !data) {
    console.error("完了タスク取得エラー:", error?.message);
    return new Map();
  }

  const result = new Map<number, { taskTitle: string; completedAt: string }[]>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const row of data as any[]) {
    if (row.tasks?.category_id !== categoryId) continue;
    const level: number = row.level_at_completion;
    const entry = {
      taskTitle: row.tasks?.title ?? "不明なタスク",
      completedAt: row.completed_at
        ? new Date(row.completed_at).toLocaleDateString("ja-JP")
        : "",
    };
    if (!result.has(level)) result.set(level, []);
    result.get(level)!.push(entry);
  }

  return result;
}

/**
 * stagesテーブルから最大レベル（stage_noが最大のレコードのlevel_to）を取得する（山モーダル表示用）。
 * @returns 最大レベル番号。取得失敗時は 0
 */
export async function fetchMaxLevel(): Promise<number> {
  const { data, error } = await supabase
    .from("stages")
    .select("level_to")
    .order("stage_no", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    console.error("最大レベル取得エラー:", error?.message);
    return 0;
  }
  return data.level_to as number;
}

/**
 * clients テーブルのレコードを物理削除する。
 * ON DELETE CASCADE により紐づく子テーブル（client_levels, client_tasks,
 * will_matrix, level_history, trainer_memos, point_history）も自動削除される。
 * また、client-avatars バケット内の該当クライアントの画像ファイルも削除する（失敗はソフトエラー扱い）。
 * @returns 成功時 true / 失敗時 false
 */
export async function deleteClient(clientId: string): Promise<boolean> {
  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", clientId);

  if (error) {
    console.error("顧客削除エラー:", error.message);
    return false;
  }

  // Storage のアバター画像を削除（失敗はメイン処理のエラーとしない）
  const { data: files, error: listError } = await supabase.storage
    .from("client-avatars")
    .list("", { search: clientId });

  if (listError) {
    console.error("アバター画像一覧取得エラー:", listError.message);
  } else if (files && files.length > 0) {
    const paths = files
      .map((f) => f.name)
      .filter((name) => name.startsWith(clientId));
    if (paths.length > 0) {
      const { error: removeError } = await supabase.storage
        .from("client-avatars")
        .remove(paths);
      if (removeError) {
        console.error("アバター画像削除エラー:", removeError.message);
      }
    }
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
 * client_tasks を論理削除する（deleted_at をセット）。tasks マスターは変更しない。
 * 完了済みレコードは is_completed = true のまま保持され、山モーダルの履歴参照に引き続き使用できる。
 * @returns 成功時 true / 失敗時 false
 */
export async function deleteClientTask(clientTaskId: string): Promise<boolean> {
  const { error } = await supabase
    .from("client_tasks")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", clientTaskId);

  if (error) {
    console.error("タスク削除エラー:", error.message);
    return false;
  }
  return true;
}

// ============================================================
// 好み評価（will_matrix）
// ============================================================

/**
 * will_matrix に UPSERT する（好き: 1 / どちでもない: 0 / 嫌い: -1）。
 * @returns 成功時 true / 失敗時 false
 */
export async function upsertWillMatrix(
  clientId: string,
  taskId: string,
  likeStatus: 1 | 0 | -1,
): Promise<boolean> {
  const { error } = await supabase
    .from("will_matrix")
    .upsert(
      { client_id: clientId, task_id: taskId, like_status: likeStatus },
      { onConflict: "client_id,task_id" },
    );

  if (error) {
    console.error("好み評価更新エラー:", error.message);
    return false;
  }
  return true;
}

// ============================================================
// アクション画面用：未完了タスク一覧取得
// ============================================================

/**
 * クライアントの未完了タスクをカテゴリ情報付きで取得する。
 */
export async function fetchClientTasks(clientId: string): Promise<
  Array<{
    clientTaskId: string;
    taskId: string;
    title: string;
    youtubeUrl: string | null;
    categoryId: string;
    categoryName: string;
    isCompleted: boolean;
    completedAt: string | null;
    levelAtCompletion: number | null;
  }>
> {
  const { data, error } = await supabase
    .from("client_tasks")
    .select("id, is_completed, completed_at, level_at_completion, tasks ( id, title, youtube_url, category_id, categories ( name ) )")
    .eq("client_id", clientId)
    .is("deleted_at", null)
    .order("assigned_at", { ascending: true });

  if (error || !data) {
    console.error("タスク一覧取得エラー:", error?.message);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map((row) => ({
    clientTaskId: row.id,
    taskId: row.tasks?.id ?? "",
    title: row.tasks?.title ?? "不明なタスク",
    youtubeUrl: row.tasks?.youtube_url ?? null,
    categoryId: row.tasks?.category_id ?? "",
    categoryName: row.tasks?.categories?.name ?? "",
    isCompleted: row.is_completed,
    completedAt: row.completed_at ?? null,
    levelAtCompletion: row.level_at_completion ?? null,
  }));
}

// ============================================================
// 好み評価一覧取得
// ============================================================

/**
 * クライアントの全好み評価を taskId → like_status のマップで返す。
 */
export async function fetchWillMatrix(clientId: string): Promise<Map<string, number>> {
  const { data, error } = await supabase
    .from("will_matrix")
    .select("task_id, like_status")
    .eq("client_id", clientId);

  const result = new Map<string, number>();
  if (error || !data) {
    console.error("好み評価一覧取得エラー:", error?.message);
    return result;
  }
  for (const row of data) {
    result.set(row.task_id, row.like_status);
  }
  return result;
}
