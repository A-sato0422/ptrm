import { supabase } from "../supabase";

// １回当たりの獲得ポイント数
const AWARD_POINTS = 100;

export interface PointHistoryRow {
  id: string;
  point: number;
  created_at: string;
}

export async function fetchPointHistory(
  clientId: string,
): Promise<PointHistoryRow[]> {
  const { data, error } = await supabase
    .from("point_history")
    .select("id, point, created_at")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("ポイント履歴取得エラー:", error.message);
    return [];
  }
  return (data ?? []) as PointHistoryRow[];
}

export async function usePoints(
  clientId: string,
  amount: number,
  currentPoints: number,
): Promise<{ success: boolean; error?: string }> {
  if (amount <= 0 || amount % 100 !== 0) {
    return { success: false, error: "100ポイント単位で入力してください。" };
  }
  if (amount > currentPoints) {
    return {
      success: false,
      error: `ポイントが不足しています（現在: ${currentPoints}pt）。`,
    };
  }

  const { error: insertError } = await supabase
    .from("point_history")
    .insert({ client_id: clientId, point: -amount });

  if (insertError) {
    return { success: false, error: "ポイント使用に失敗しました。" };
  }

  const { error: updateError } = await supabase
    .from("clients")
    .update({ points: currentPoints - amount })
    .eq("id", clientId);

  if (updateError) {
    return { success: false, error: "ポイント残高の更新に失敗しました。" };
  }

  return { success: true };
}

export async function addPoints(
  clientId: string,
  currentPoints: number,
): Promise<{ success: boolean; alreadyAwarded?: boolean; error?: string }> {
  // 本日（ローカル時刻の 00:00:00 以降）の付与レコードをチェック
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data: existing } = await supabase
    .from("point_history")
    .select("id")
    .eq("client_id", clientId)
    .gt("point", 0)
    .gte("created_at", todayStart.toISOString())
    .limit(1);

  if (existing && existing.length > 0) {
    return { success: false, alreadyAwarded: true };
  }

  const { error: insertError } = await supabase
    .from("point_history")
    .insert({ client_id: clientId, point: AWARD_POINTS });

  if (insertError) {
    return { success: false, error: "ポイント付与に失敗しました。" };
  }

  const { error: updateError } = await supabase
    .from("clients")
    .update({ points: currentPoints + AWARD_POINTS })
    .eq("id", clientId);

  if (updateError) {
    return { success: false, error: "ポイント残高の更新に失敗しました。" };
  }

  return { success: true };
}
