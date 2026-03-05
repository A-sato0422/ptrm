/**
 * src/page-init.ts
 * クライアント向け全ページ共通の初期化処理。
 * ヘッダー・nav の HTML 構造はビルド時に Vite プラグイン（htmlPartialsPlugin）で
 * 各 HTML ファイルへ静的展開されるため、このモジュールは
 * ナビゲーションのクリックイベント設定とポイント表示の取得のみを担当する。
 */

import { supabase } from "./supabase";

// 開発用：後でLIFF認証の line_user_id に差し替える
const DEV_CLIENT_LINE_ID = "U_client_test_001";

const BOOKING_URL = "https://azzist.jp/schedule/60";

/**
 * ナビゲーションボタンのクリックイベントを設定し、ポイントを取得する
 */
export function initLayout(): void {
  _setupNavEvents();
  _loadPoints();
}

function _setupNavEvents(): void {
  document.querySelectorAll<HTMLButtonElement>(".nav-btn").forEach((btn) => {
    const label = btn.querySelector(".nav-label")?.textContent?.trim();
    btn.addEventListener("click", () => {
      if (label === "予約") {
        window.open(BOOKING_URL, "_blank");
      } else if (label === "ホーム") {
        window.location.href = "index.html";
      } else if (label === "アクション") {
        window.location.href = "action.html";
      } else if (label === "ステージ") {
        window.location.href = "stage.html";
      } else if (label === "プロフィール") {
        window.location.href = "profile.html";
      }
    });
  });
}

async function _loadPoints(): Promise<void> {
  const { data, error } = await supabase
    .from("clients")
    .select("points")
    .eq("line_user_id", DEV_CLIENT_LINE_ID)
    .single();
  if (error || !data) return;
  const el = document.getElementById("userPoints");
  if (el) el.textContent = (data.points as number).toLocaleString();
}
