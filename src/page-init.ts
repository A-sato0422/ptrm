/**
 * src/page-init.ts
 * クライアント向け全ページ共通の初期化処理。
 * ヘッダー・nav の HTML 構造はビルド時に Vite プラグイン（htmlPartialsPlugin）で
 * 各 HTML ファイルへ静的展開されるため、このモジュールは
 * ナビゲーションのクリックイベント設定とポイント表示の取得のみを担当する。
 */

import { supabase } from "./supabase";
import { initClientAuth } from "./liff-auth";

const BOOKING_URL = "https://azzist.jp/schedule/60";

/**
 * ナビゲーションボタンのクリックイベントを設定する
 */
export function initLayout(): void {
  _setupNavEvents();
}

/**
 * 認証チェック：LIFF 認証 → Edge Function 検証 → Supabase セッション確立。
 * - 未登録の場合は id-confirm.html へリダイレクト（initClientAuth 内で処理）
 * - 認証 OK の場合はポイント取得 → ローディングオーバーレイを非表示にして clientId を返す
 * @returns clientId（string）または null（リダイレクト済み）
 */
export async function checkClientAuth(): Promise<string | null> {
  const clientId = await initClientAuth();
  if (!clientId) return null;

  await _loadPoints(clientId);

  const overlay = document.getElementById("loading-overlay");
  const mainContent = document.getElementById("main-content");
  if (overlay) overlay.style.display = "none";
  if (mainContent) mainContent.style.visibility = "visible";

  return clientId;
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

async function _loadPoints(clientId: string): Promise<void> {
  const { data, error } = await supabase
    .from("clients")
    .select("points")
    .eq("id", clientId)
    .single();
  if (error || !data) return;
  const el = document.getElementById("userPoints");
  if (el) el.textContent = (data.points as number).toLocaleString();
}
