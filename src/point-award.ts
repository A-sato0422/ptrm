/**
 * src/point-award.ts
 * ポイント付与完了画面（point-award.html）専用スクリプト
 * - QRコードでこの画面に遷移したタイミングで 100pt を付与する
 * - 1日1回制限：当日すでに付与済みの場合は付与しない
 */

import { supabase } from "./supabase";
import { addPoints } from "./api/point-crud";
import { initClientAuth } from "./liff-auth";

function showCard(id: "award-success" | "award-already" | "award-error"): void {
  document.getElementById("award-loading")?.classList.add("hidden");
  document.getElementById(id)?.classList.remove("hidden");
}

async function run(): Promise<void> {
  const clientId = await initClientAuth();
  if (!clientId) return; // リダイレクト済み（未登録 or LIFF ログイン中）

  const { data: clientData, error } = await supabase
    .from("clients")
    .select("points")
    .eq("id", clientId)
    .single();

  if (error || !clientData) {
    window.location.replace("error.html");
    return;
  }

  const result = await addPoints(clientId, clientData.points ?? 0);

  if (result.alreadyAwarded) {
    showCard("award-already");
  } else if (result.success) {
    showCard("award-success");
  } else {
    showCard("award-error");
  }
}

run();
