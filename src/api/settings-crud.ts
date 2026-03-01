/**
 * src/api/settings-crud.ts
 * 設定画面の CRUD API 関数（Supabase 呼び出しを集約）
 */

import { supabase } from "../supabase";

// ============================================================
// ステージ
// ============================================================

export interface DbStage {
  id: string;
  stage_no: number;
  name: string;
  description: string | null;
  level_to: number;
}

export async function fetchStages(): Promise<DbStage[]> {
  const { data, error } = await supabase
    .from("stages")
    .select("id, stage_no, name, description, level_to")
    .order("stage_no", { ascending: true });

  if (error || !data) {
    console.error("ステージ取得エラー:", error?.message);
    return [];
  }
  return data as DbStage[];
}

export async function updateStage(
  id: string,
  patch: { name: string; description: string; level_to: number },
): Promise<boolean> {
  const { error } = await supabase.from("stages").update(patch).eq("id", id);
  if (error) {
    console.error("ステージ更新エラー:", error.message);
    return false;
  }
  return true;
}

// ============================================================
// タスクマスター
// ============================================================

export interface DbTask {
  id: string;
  category_id: string;
  title: string;
  why_text: string | null;
  youtube_url: string | null;
}

export async function fetchTasksMaster(categoryId: string): Promise<DbTask[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("id, category_id, title, why_text, youtube_url")
    .eq("category_id", categoryId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("タスク取得エラー:", error?.message);
    return [];
  }
  return data as DbTask[];
}

export async function createTaskMaster(
  categoryId: string,
  title: string,
  whyText: string,
  youtubeUrl: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      category_id: categoryId,
      title,
      why_text: whyText || null,
      youtube_url: youtubeUrl || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("タスク作成エラー:", error?.message);
    return null;
  }
  return data.id;
}

export async function updateTaskMaster(
  id: string,
  title: string,
  whyText: string,
  youtubeUrl: string,
): Promise<boolean> {
  const { error } = await supabase
    .from("tasks")
    .update({
      title,
      why_text: whyText || null,
      youtube_url: youtubeUrl || null,
    })
    .eq("id", id);

  if (error) {
    console.error("タスク更新エラー:", error.message);
    return false;
  }
  return true;
}

export async function deleteTaskMaster(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("tasks")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("タスク削除エラー:", error.message);
    return false;
  }
  return true;
}

// ============================================================
// トレーナー
// ============================================================

export interface DbTrainer {
  id: string;
  display_name: string | null;
  line_user_id: string;
  delete_flg: boolean;
  profile_image_url: string | null;
}

export async function fetchTrainersMaster(): Promise<DbTrainer[]> {
  const { data, error } = await supabase
    .from("trainers")
    .select("id, display_name, line_user_id, delete_flg, profile_image_url")
    .or("delete_flg.eq.false,delete_flg.is.null")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("トレーナー取得エラー:", error?.message);
    return [];
  }
  return data as DbTrainer[];
}

export async function createTrainerMaster(
  displayName: string,
  lineUserId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("trainers")
    .insert({
      display_name: displayName,
      line_user_id: lineUserId,
      delete_flg: false,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("トレーナー作成エラー:", error?.message);
    return null;
  }
  return data.id;
}

export async function updateTrainerMaster(
  id: string,
  displayName: string,
  lineUserId: string,
  profileImageUrl?: string,
): Promise<boolean> {
  const patch: Record<string, unknown> = {
    display_name: displayName,
    line_user_id: lineUserId,
  };
  if (profileImageUrl !== undefined) {
    patch.profile_image_url = profileImageUrl;
  }
  const { error } = await supabase.from("trainers").update(patch).eq("id", id);

  if (error) {
    console.error("トレーナー更新エラー:", error.message);
    return false;
  }
  return true;
}

/**
 * トレーナーのアバター画像を Supabase Storage にアップロードし、公開URLを返す。
 * バケット名: trainer-avatars（Public バケットとして事前に作成しておくこと）
 */
export async function uploadTrainerAvatar(
  trainerId: string,
  file: File,
): Promise<string | null> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${trainerId}.${ext}`;

  const { error } = await supabase.storage
    .from("trainer-avatars")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) {
    console.error("アバター画像アップロードエラー:", error.message);
    return null;
  }

  const { data } = supabase.storage.from("trainer-avatars").getPublicUrl(path);
  return data.publicUrl;
}

export async function deactivateTrainer(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("trainers")
    .update({ delete_flg: true })
    .eq("id", id);

  if (error) {
    console.error("トレーナー無効化エラー:", error.message);
    return false;
  }
  return true;
}
