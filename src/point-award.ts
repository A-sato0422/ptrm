/**
 * src/point-award.ts
 * ポイント付与完了画面（point-award.html）専用スクリプト
 * - QRコードでこの画面に遷移したタイミングで 100pt を付与する
 * - 1日1回制限：当日すでに付与済みの場合は付与しない
 */

import { supabase } from "./supabase";
import { addPoints } from "./api/point-crud";

// 開発用：後でLIFF認証の line_user_id に差し替える
const DEV_CLIENT_LINE_ID = "U_client_test_001";

function showCard(id: "award-success" | "award-already" | "award-error"): void {
  document.getElementById("award-loading")?.classList.add("hidden");
  document.getElementById(id)?.classList.remove("hidden");
}

async function run(): Promise<void> {
  const { data: clientData, error } = await supabase
    .from("clients")
    .select("id, points")
    .eq("line_user_id", DEV_CLIENT_LINE_ID)
    .single();

  if (error || !clientData) {
    showCard("award-error");
    return;
  }

  const result = await addPoints(clientData.id, clientData.points ?? 0);

  if (result.alreadyAwarded) {
    showCard("award-already");
  } else if (result.success) {
    showCard("award-success");
  } else {
    showCard("award-error");
  }
}

run();
