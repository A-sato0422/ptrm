/**
 * src/action.ts
 * アクション画面（action.html）専用スクリプト
 * - 宿題一覧をDBから取得して表示
 * - 完了ボタン押下で toggleTask（level_at_completion 付き）+ upsertWillMatrix を呼び出す
 */

import { supabase } from "./supabase";
import { fetchClientTasks, fetchCategories, fetchWillMatrix, toggleTask, upsertWillMatrix } from "./api/client-crud";
import { initLayout, checkClientAuth } from "./page-init";

// 共通ヘッダー・ナビゲーションバーを注入
initLayout();

// 開発用：後でLIFF認証の line_user_id に差し替える
const DEV_CLIENT_LINE_ID = "U_client_test_001";

// ============================================================
// 初期化
// ============================================================

let _clientId: string | null = null;
let _willMatrix = new Map<string, number>();

async function resolveClientId(): Promise<string | null> {
  if (_clientId) return _clientId;
  const { data, error } = await supabase
    .from("clients")
    .select("id")
    .eq("line_user_id", DEV_CLIENT_LINE_ID)
    .single();
  if (error || !data) {
    console.error("クライアントID取得エラー:", error?.message);
    return null;
  }
  _clientId = data.id;
  return _clientId;
}

// ============================================================
// カテゴリ色キー（main.ts と同じロジックをここでも使う）
// ============================================================
function catToColor(name: string): string {
  if (name.includes("ピラティス")) return "blue";
  if (name.includes("ウェイト") || name.includes("ウエイト")) return "red";
  if (name.includes("スポーツ")) return "green";
  if (name.includes("ムーブメント")) return "yellow";
  return "";
}

// ============================================================
// タスク一覧の描画
// ============================================================

interface TaskRow {
  clientTaskId: string;
  taskId: string;
  title: string;
  youtubeUrl: string | null;
  categoryId: string;
  categoryName: string;
  isCompleted: boolean;
  completedAt: string | null;
  levelAtCompletion: number | null;
}

/** カテゴリ別に仕分けして各 .task-list に li を追加する */
function renderTasks(tasks: TaskRow[]): void {
  // カテゴリ別マップ
  const grouped = new Map<string, TaskRow[]>();
  for (const t of tasks) {
    const color = catToColor(t.categoryName);
    if (!grouped.has(color)) grouped.set(color, []);
    grouped.get(color)!.push(t);
  }

  const allColors = ["blue", "red", "green", "yellow"];

  for (const color of allColors) {
    const card = document.querySelector<HTMLElement>(`.category-card.${color}`);
    if (!card) continue;

    const taskList = card.querySelector<HTMLElement>(".task-list");
    if (!taskList) continue;

    taskList.innerHTML = "";
    const rows = grouped.get(color) ?? [];

    if (rows.length === 0) {
      const empty = document.createElement("li");
      empty.className = "task-empty-msg";
      empty.textContent = "現レベルでの宿題はありません";
      taskList.appendChild(empty);
      continue;
    }

    for (const row of rows) {
      const li = document.createElement("li");
      li.className = `task-item${row.isCompleted ? " completed" : ""}`;
      li.setAttribute("data-client-task-id", row.clientTaskId);
      li.setAttribute("data-task-id", row.taskId);
      li.setAttribute("data-completed", String(row.isCompleted));

      li.innerHTML = `
        <div class="task-content">
          <span class="task-label">${row.title}</span>
        </div>
        <div class="task-actions">
          ${row.youtubeUrl ? `<button class="video-btn" type="button">動画</button>` : ""}
          <button class="complete-btn" type="button">${row.isCompleted ? "編集" : "完了"}</button>
        </div>
      `;

      if (row.youtubeUrl) {
        li.querySelector<HTMLButtonElement>(".video-btn")?.addEventListener("click", () => {
          window.open(row.youtubeUrl!, "_blank", "noopener,noreferrer");
        });
      }

      li.querySelector(".complete-btn")?.addEventListener("click", () => {
        openPreferenceModal(row.clientTaskId, row.taskId);
      });

      taskList.appendChild(li);
    }
  }
}

async function loadActionTasks(): Promise<void> {
  const clientId = await resolveClientId();
  if (!clientId) return;

  const [tasks, willMatrix] = await Promise.all([
    fetchClientTasks(clientId),
    fetchWillMatrix(clientId),
  ]);
  _willMatrix = willMatrix;
  renderTasks(tasks);
}

// ============================================================
// 好み評価モーダル
// ============================================================

function openPreferenceModal(clientTaskId: string, taskId: string): void {
  const modal = document.getElementById("preference-modal");
  const formClientTaskId = document.getElementById("form-task-id") as HTMLInputElement | null;

  if (!modal || !formClientTaskId) return;

  formClientTaskId.value = clientTaskId;
  // taskId も hidden フィールドで持つ（will_matrix 保存用）
  let taskIdInput = modal.querySelector<HTMLInputElement>("#form-db-task-id");
  if (!taskIdInput) {
    taskIdInput = document.createElement("input");
    taskIdInput.type = "hidden";
    taskIdInput.id = "form-db-task-id";
    taskIdInput.name = "dbTaskId";
    modal.querySelector("form")?.appendChild(taskIdInput);
  }
  taskIdInput.value = taskId;

  modal.querySelectorAll<HTMLElement>(".preference-btn").forEach((btn) =>
    btn.classList.remove("active"),
  );

  // 前回の好み評価があれば対応ボタンをアクティブ表示
  const existingStatus = _willMatrix.get(taskId);
  if (existingStatus !== undefined) {
    const statusToValue = new Map<number, string>([[1, "like"], [0, "neutral"], [-1, "dislike"]]);
    const value = statusToValue.get(existingStatus);
    if (value) {
      modal.querySelector<HTMLElement>(`.preference-btn[data-value="${value}"]`)
        ?.classList.add("active");
    }
  }

  modal.style.display = "flex";
}

function closePreferenceModal(): void {
  const modal = document.getElementById("preference-modal");
  if (modal) modal.style.display = "none";
}

// ============================================================
// フォーム送信
// ============================================================

const preferenceForm = document.getElementById("preference-form");
preferenceForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const clientTaskId = (document.getElementById("form-task-id") as HTMLInputElement)?.value;
  const taskId = (document.getElementById("form-db-task-id") as HTMLInputElement)?.value;
  const activeBtn = document.querySelector("#preference-modal .preference-btn.active");
  const preferenceValue = activeBtn?.getAttribute("data-value");

  if (!preferenceValue) {
    alert("好み評価を選択してください");
    return;
  }

  const clientId = await resolveClientId();
  if (!clientId || !clientTaskId) return;

  // 好み評価を数値に変換
  const likeStatusMap: Record<string, 1 | 0 | -1> = {
    like: 1,
    neutral: 0,
    dislike: -1,
  };
  const likeStatus = likeStatusMap[preferenceValue] ?? 0;

  // 並列で完了更新と好み評価を保存
  const [taskOk, willOk] = await Promise.all([
    toggleTask(clientTaskId, true, clientId),
    taskId ? upsertWillMatrix(clientId, taskId, likeStatus) : Promise.resolve(true),
  ]);

  if (!taskOk) {
    closePreferenceModal();
    showErrorMessage("保存に失敗しました。しばらくたってから再度お試しください。");
    return;
  }
  if (!willOk) {
    console.warn("好み評価の保存に失敗しましたが、完了は保存されました");
  }

  // UI を完了状態に更新
  const taskItem = document.querySelector<HTMLElement>(
    `[data-client-task-id="${clientTaskId}"]`,
  );
  if (taskItem) {
    taskItem.setAttribute("data-completed", "true");
    taskItem.classList.add("completed");
    const btn = taskItem.querySelector<HTMLElement>(".complete-btn");
    if (btn) btn.textContent = "編集";
  }

  // willMatrixを更新して次回のモーダル表示に反映
  if (taskId) _willMatrix.set(taskId, likeStatus);

  closePreferenceModal();
  showSuccessMessage();

  console.log("タスク完了:", { clientTaskId, taskId, preferenceValue });
});

// ============================================================
// イベント登録
// ============================================================

// 好み評価ボタン
document.querySelectorAll(".preference-btn").forEach((button) => {
  button.addEventListener("click", (e) => {
    const target = e.currentTarget as HTMLElement;
    const parentSection = target.closest(".preference-section");
    if (parentSection) {
      parentSection.querySelectorAll(".preference-btn").forEach((btn) =>
        btn.classList.remove("active"),
      );
      target.classList.add("active");
    }
  });
});

// モーダルを閉じる
document.querySelector(".modal-close")?.addEventListener("click", closePreferenceModal);
document.getElementById("preference-modal")?.addEventListener("click", (e) => {
  if (e.target === document.getElementById("preference-modal")) closePreferenceModal();
});

// 予約ボタン
document.querySelectorAll(".reservation-btn, .view-detail-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    window.open("https://azzist.jp/schedule/60", "_blank");
  });
});

// ============================================================
// 成功メッセージ
// ============================================================

function showSuccessMessage(): void {
  const el = document.getElementById("success-message");
  if (!el) return;
  el.style.display = "block";
  setTimeout(() => { el.style.display = "none"; }, 3000);
}

function showErrorMessage(msg: string): void {
  const el = document.getElementById("error-message");
  if (!el) return;
  el.textContent = msg;
  el.style.display = "block";
  setTimeout(() => { el.style.display = "none"; }, 4000);
}

// ============================================================
// カテゴり名のDB反映
// ============================================================

async function loadCategoryNames(): Promise<void> {
  const categories = await fetchCategories();
  for (const cat of categories) {
    const color = catToColor(cat.name);
    if (!color) continue;
    const titleEl = document.querySelector<HTMLElement>(`.category-card.${color} .category-title`);
    if (titleEl) titleEl.textContent = cat.name;
  }
}

// ============================================================
// 起動
// ============================================================

loadCategoryNames();
(async () => {
  const clientId = await checkClientAuth();
  if (!clientId) return;
  _clientId = clientId; // resolveClientId() のキャッシュに事先設定
  loadActionTasks();
})();
