/**
 * src/partials/admin-sidebar.ts
 *
 * 管理画面サイドバーの共通モジュール。
 * - initAdminSidebar(): サイドバーHTMLを#mobileSidebarに注入する
 * - populateTrainerProfile(): 認証済みトレーナー情報をサイドバーに表示する
 */

import { supabase } from "../supabase";
import { DEFAULT_AVATAR_URL } from "../shared";

export type AdminNavPage = "clients" | "settings";

function navItem(
  page: AdminNavPage,
  activePage: AdminNavPage,
  label: string,
  icon: string,
  href: string,
): string {
  const isActive = activePage === page;
  const cls = isActive
    ? "text-primary bg-blue-50 dark:bg-blue-900/20"
    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800";
  return `
    <a class="flex items-center gap-3 px-3 py-2 ${cls} rounded-md transition-colors" href="${href}">
      <span class="material-icons-outlined text-xl">${icon}</span>
      <span class="font-medium">${label}</span>
    </a>`;
}

/**
 * #mobileSidebar にサイドバーHTMLを注入する。
 * setupMobileSidebar() より前に呼び出すこと。
 */
export function initAdminSidebar(activePage: AdminNavPage): void {
  const sidebar = document.getElementById("mobileSidebar");
  if (!sidebar) return;

  sidebar.innerHTML = `
    <div class="p-4 flex justify-end lg:hidden">
      <button id="mobileSidebarClose"
        class="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        aria-label="サイドバーを閉じる">
        <span class="material-icons-outlined">close</span>
      </button>
    </div>
    <div class="p-6 flex items-center gap-3">
      <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">S</div>
      <span class="font-bold text-lg tracking-tight">PTRM 管理画面</span>
    </div>
    <nav class="flex-1 px-4 space-y-1">
      ${navItem("clients", activePage, "顧客一覧", "people_alt", "clients.html")}
      ${navItem("settings", activePage, "設定", "settings", "settings.html")}
    </nav>
    <div class="p-4 mt-auto border-t border-slate-200 dark:border-slate-800">
      <div id="trainerProfile" class="flex items-center gap-3 p-2">
        <div class="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse shrink-0"></div>
        <div class="overflow-hidden space-y-1.5">
          <div class="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          <div class="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Supabase から trainerId に対応するトレーナー情報を取得し、
 * #trainerProfile の内容を実データで置き換える。
 */
export async function populateTrainerProfile(trainerId: string): Promise<void> {
  const profileEl = document.getElementById("trainerProfile");
  if (!profileEl) return;

  const { data, error } = await supabase
    .from("trainers")
    .select("display_name, profile_image_url")
    .eq("id", trainerId)
    .single();

  if (error || !data) {
    console.error("トレーナー情報取得エラー:", error?.message);
    return;
  }

  const avatarUrl = data.profile_image_url || DEFAULT_AVATAR_URL;
  const name = data.display_name || "名前未設定";

  profileEl.innerHTML = `
    <img
      alt="${name}"
      class="w-10 h-10 rounded-full object-cover shrink-0"
      src="${avatarUrl}"
      onerror="this.onerror=null; this.src='${DEFAULT_AVATAR_URL}'"
    />
    <div class="overflow-hidden">
      <p class="text-sm font-semibold truncate">${name}</p>
    </div>
  `;
}
