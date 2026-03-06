/**
 * src/api/storage.ts
 * Supabase Storage 操作の共通関数
 */

import { supabase } from "../supabase";

/**
 * 指定バケットにアバター画像をアップロードし、公開URLを返す。
 * バケットは事前に Public バケットとして Supabase Storage に作成しておくこと。
 */
export async function uploadAvatarToStorage(
  bucket: string,
  id: string,
  file: File,
): Promise<string | null> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${id}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) {
    console.error("アバター画像アップロードエラー:", error.message);
    return null;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
