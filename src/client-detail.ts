import { supabase } from "./supabase";
import { Client, Task, MemoHistory } from "./shared";
import { mapDbClientToDisplay } from "./lib/mapper";
import {
  fetchCategories,
  fetchTrainers,
  fetchAllTasks,
  updateLevel,
  updateNextGoal,
  updateClientProfile,
  createMemo,
  updateMemo,
  deleteMemo,
  createTask,
  assignExistingTask,
  updateTask,
  toggleTask,
  deleteClientTask,
} from "./api/client-crud";
// URLパラメータから顧客UUIDを取得
function getClientIdFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// Supabaseから顧客データを取得
async function getClientFromSupabase(id: string): Promise<Client | null> {
  const { data, error } = await supabase
    .from("clients")
    .select(
      `
            id,
            display_name,
            profile_image_url,
            course_name,
            line_user_id,
            next_goal,
            updated_at,
            client_levels (
                id,
                category_id,
                current_level,
                categories ( name )
            ),
            trainer_memos (
                id,
                content,
                created_at,
                trainers ( display_name )
            ),
            client_tasks (
                id,
                is_completed,
                tasks (
                    id,
                    title,
                    why_text,
                    youtube_url
                )
            ),
            will_matrix (
                like_status,
                tasks ( title )
            )
        `,
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("顧客データ取得エラー:", error?.message);
    return null;
  }
  return mapDbClientToDisplay(data);
}

/** DBロード時のレベルスナップショット（level_history の before 値に使用） */
let _dbLevels: Record<string, number> = {};

/** トレーナー一覧キャッシュ */
let _trainers: { id: string; name: string }[] = [];

// ============================================================
// トースト通知
// ============================================================

function showToast(
  message: string,
  type: "success" | "error" = "success",
): void {
  const existing = document.getElementById("toastNotification");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "toastNotification";
  const colorClass =
    type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white";
  toast.className = `fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg ${colorClass} transition-all duration-300 opacity-0 translate-y-2`;
  const icon = type === "success" ? "check_circle" : "error";
  toast.innerHTML = `<span class="material-icons-outlined">${icon}</span><span class="font-medium">${message}</span>`;
  document.body.appendChild(toast);

  // フェードイン
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.classList.remove("opacity-0", "translate-y-2");
    });
  });

  // 3秒後にフェードアウト → 削除
  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-y-2");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// レベルセレクトボックスの生成
function createLevelSelect(
  color: string,
  name: string,
  level: number,
  key: string,
): string {
  const colorMap: { [key: string]: string } = {
    blue: "bg-blue-600",
    red: "bg-red-600",
    green: "bg-emerald-600",
    yellow: "bg-amber-500",
  };

  const options = Array.from({ length: 11 }, (_, i) => {
    const selected = i === level ? "selected" : "";
    return `<option value="${i}" ${selected}>Lv.${i}</option>`;
  }).join("");

  return `
    <div class="flex items-center justify-center gap-2 ${colorMap[color]} text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm">
      <span class="mr-2">${name}:</span>
      <select 
        class="level-select bg-white/90 border-slate-300 text-slate-900 font-bold rounded-lg pl-3 pr-8 py-1 focus:ring-2 focus:ring-white cursor-pointer hover:bg-white transition-colors"
        data-level-key="${key}"
      >
        ${options}
      </select>
    </div>
  `;
}

// 課題カードの生成
function createTaskCard(task: Task): string {
  const completedClass = task.completed
    ? "bg-slate-50/50 dark:bg-slate-800/20 opacity-70"
    : "bg-white dark:bg-slate-900/40";
  const lineThrough = task.completed ? "line-through" : "";
  const youtubeIcon = task.youtubeUrl
    ? `
    <span class="material-icons-outlined text-red-500 text-lg">play_circle</span>
  `
    : `
    <span class="material-icons-outlined text-red-400 text-lg opacity-50">play_circle</span>
  `;

  return `
    <div class="flex gap-4 p-5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900 ${completedClass} transition-all group items-start shadow-sm">
      <div class="pt-2">
        <input 
          ${task.completed ? "checked" : ""} 
          class="w-5 h-5 rounded text-primary border-slate-300 dark:border-slate-700 focus:ring-primary cursor-pointer task-checkbox" 
          type="checkbox"
          data-task-id="${task.id}"
        />
      </div>
      <div class="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="space-y-1">
          <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">課題名</label>
          <input 
            class="w-full bg-transparent border-none p-0 focus:ring-0 font-bold text-slate-800 dark:text-slate-100 placeholder-slate-300 ${lineThrough} task-title" 
            placeholder="課題名を入力" 
            type="text" 
            value="${task.title}"
            data-task-id="${task.id}"
          />
        </div>
        <div class="space-y-1">
          <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">意義・理由</label>
          <input 
            class="w-full bg-transparent border-none p-0 focus:ring-0 text-sm text-slate-600 dark:text-slate-400 placeholder-slate-300 ${lineThrough} task-reason" 
            placeholder="なぜこの課題が必要か" 
            type="text" 
            value="${task.reason || ""}"
            data-task-id="${task.id}"
          />
        </div>
        <div class="space-y-1">
          <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">YouTube URL</label>
          <div class="flex items-center gap-2">
            ${youtubeIcon}
            <input 
              class="w-full bg-transparent border-none p-0 focus:ring-0 text-sm text-blue-500 dark:text-blue-400 underline placeholder-slate-300 task-url" 
              placeholder="動画のリンク" 
              type="text" 
              value="${task.youtubeUrl || ""}"
              data-task-id="${task.id}"
            />
          </div>
        </div>
      </div>
      <div class="pt-2">
        <button 
          type="button"
          class="p-2 text-slate-300 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all task-delete" 
          title="削除"
          data-task-id="${task.id}"
        >
          <span class="material-icons-outlined">delete</span>
        </button>
      </div>
    </div>
  `;
}

// メモ履歴の生成
function createMemoHistoryItem(memo: MemoHistory, isLatest: boolean): string {
  const dotColor = isLatest ? "bg-primary" : "bg-slate-300 dark:bg-slate-700";
  const opacityClass = isLatest ? "" : "opacity-70";
  const isNewMemo = !memo.date || !memo.content;

  const trainerInList = _trainers.some((t) => t.name === memo.trainer);
  const extraOption =
    memo.trainer && !trainerInList
      ? `<option value="${memo.trainer}" selected>${memo.trainer}</option>`
      : "";

  const trainerSelectOptions = [
    `<option value="">—未選択—</option>`,
    extraOption,
    ..._trainers.map((t) => {
      const selected = memo.trainer === t.name ? "selected" : "";
      return `<option value="${t.name}" ${selected}>${t.name}</option>`;
    }),
  ]
    .filter(Boolean)
    .join("");

  return `
    <div class="relative pl-8 border-l-2 border-slate-100 dark:border-slate-800 ml-2" data-memo-id="${memo.id}">
      <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full ${dotColor} border-4 border-white dark:border-slate-900 shadow-sm"></div>
      <div class="bg-slate-50 dark:bg-slate-800/30 p-5 rounded-xl ${opacityClass} border ${isNewMemo ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-slate-200 dark:hover:border-slate-700"} transition-all group">
        <div class="flex justify-between items-start gap-4 mb-3">
          <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">日付</label>
              <input 
                class="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-300 focus:ring-2 focus:ring-primary focus:border-primary memo-date" 
                placeholder="2026/01/08" 
                type="text" 
                value="${memo.date || ""}"
                data-memo-id="${memo.id}"
              />
            </div>
            <div class="space-y-1">
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">担当者</label>
              <select
                class="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 focus:ring-2 focus:ring-primary focus:border-primary memo-trainer"
                data-memo-id="${memo.id}"
              >
                ${trainerSelectOptions}
              </select>
            </div>
          </div>
          <button 
            type="button"
            class="p-2 text-slate-300 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all memo-delete" 
            title="削除"
            data-memo-id="${memo.id}"
          >
            <span class="material-icons-outlined text-lg">delete</span>
          </button>
        </div>
        <div class="space-y-1">
          <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">メモ内容</label>
          <textarea 
            class="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-600 dark:text-slate-400 placeholder-slate-300 focus:ring-2 focus:ring-primary focus:border-primary resize-none memo-content" 
            placeholder="メモ内容を入力してください..." 
            rows="3"
            data-memo-id="${memo.id}"
          >${memo.content || ""}</textarea>
        </div>
      </div>
    </div>
  `;
}

// 過去の課題選択モーダルを表示
async function showPastTaskModal(client: Client): Promise<void> {
  // 既に割り当て済みのタスクID（削除フラグが立っているものは再追加可能）
  const assignedTaskIds = new Set(
    client.currentTasks
      .filter((t) => !t.isDeleted && t.dbTaskId)
      .map((t) => t.dbTaskId as string),
  );

  const allTasks = await fetchAllTasks();
  const availableTasks = allTasks.filter((t) => !assignedTaskIds.has(t.id));

  // カテゴリ別にグループ化
  const grouped = availableTasks.reduce(
    (acc, task) => {
      const key = task.categoryName || "その他";
      if (!acc[key]) acc[key] = [];
      acc[key].push(task);
      return acc;
    },
    {} as Record<string, typeof availableTasks>,
  );

  const categoryColorClass: Record<string, string> = {
    マットピラティス:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    ウェイトトレーニング:
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    スポーツトレーニング:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    ムーブメントトレーニング:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  };

  const tasksHTML =
    availableTasks.length === 0
      ? `<p class="text-center text-slate-400 py-8">追加できる課題がありません</p>`
      : Object.entries(grouped)
          .map(
            ([categoryName, tasks]) => `
          <div class="mb-4">
            <span class="inline-block px-2 py-0.5 text-xs font-bold rounded-full mb-2 ${categoryColorClass[categoryName] || "bg-slate-100 text-slate-600"}">${categoryName}</span>
            <div class="space-y-1">
              ${tasks
                .map(
                  (task) => `
                <label class="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                  <input type="checkbox" class="past-task-checkbox mt-0.5 w-4 h-4 rounded text-primary border-slate-300 focus:ring-primary cursor-pointer" data-task-id="${task.id}" data-title="${task.title.replace(/"/g, "&quot;")}" data-why="${(task.whyText ?? "").replace(/"/g, "&quot;")}" data-url="${(task.youtubeUrl ?? "").replace(/"/g, "&quot;")}" data-category-id="${task.categoryId}" />
                  <div>
                    <p class="text-sm font-medium text-slate-800 dark:text-slate-100">${task.title}</p>
                    ${task.whyText ? `<p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">${task.whyText}</p>` : ""}
                  </div>
                </label>
              `,
                )
                .join("")}
            </div>
          </div>
        `,
          )
          .join("");

  // モーダルを挿入
  const existing = document.getElementById("pastTaskModal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "pastTaskModal";
  modal.className =
    "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm";
  modal.innerHTML = `
    <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
      <div class="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
        <h3 class="text-lg font-bold flex items-center gap-2">
          <span class="material-icons-outlined text-primary">history</span>
          過去の課題を追加
        </h3>
        <button id="pastTaskModalClose" class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <span class="material-icons-outlined">close</span>
        </button>
      </div>
      <div class="overflow-y-auto flex-1 p-6">
        ${tasksHTML}
      </div>
      <div class="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
        <button id="pastTaskModalCancel" type="button" class="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium">
          キャンセル
        </button>
        <button id="pastTaskModalConfirm" type="button" disabled class="px-5 py-2.5 rounded-xl bg-primary text-white hover:bg-blue-700 transition-colors font-bold disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-primary">
          追加する
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const closeModal = (): void => modal.remove();

  document
    .getElementById("pastTaskModalClose")
    ?.addEventListener("click", closeModal);
  document
    .getElementById("pastTaskModalCancel")
    ?.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // チェックボックスの変更に応じてボタンの活性/非活性を切り替え
  const confirmBtn = document.getElementById(
    "pastTaskModalConfirm",
  ) as HTMLButtonElement | null;
  modal.addEventListener("change", () => {
    const anyChecked =
      modal.querySelectorAll<HTMLInputElement>(".past-task-checkbox:checked")
        .length > 0;
    if (confirmBtn) confirmBtn.disabled = !anyChecked;
  });

  document
    .getElementById("pastTaskModalConfirm")
    ?.addEventListener("click", () => {
      const checked = modal.querySelectorAll<HTMLInputElement>(
        ".past-task-checkbox:checked",
      );
      checked.forEach((checkbox) => {
        const newTask: import("./shared").Task = {
          id: Date.now() + Math.random(),
          dbTaskId: checkbox.dataset.taskId,
          title: checkbox.dataset.title ?? "",
          reason: checkbox.dataset.why ?? "",
          youtubeUrl: checkbox.dataset.url ?? "",
          completed: false,
          isNew: true,
        };
        client.currentTasks.push(newTask);
      });

      closeModal();
      if (checked.length > 0) {
        renderClientDetail(client);
      }
    });
}

// 詳細画面のコンテンツを生成
function renderClientDetail(client: Client): void {
  const container = document.getElementById("clientDetailContainer");
  if (!container) return;

  // ページタイトルを更新
  const pageTitle = document.getElementById("pageTitle");
  if (pageTitle) {
    pageTitle.textContent = `顧客詳細: ${client.name}`;
  }

  const tasksHTML = client.currentTasks
    .filter((task) => !task.isDeleted)
    .map((task) => createTaskCard(task))
    .join("");
  const historyHTML =
    client.history
      ?.filter((memo) => !memo.isDeleted)
      .map((memo, index) => createMemoHistoryItem(memo, index === 0))
      .join("") || "";

  container.innerHTML = `
    <form id="clientDetailForm">
    <!-- Client Profile Section -->
    <section class="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="flex items-center gap-6">
        <img alt="${client.name}" class="w-24 h-24 rounded-2xl object-cover ring-4 ring-blue-50 dark:ring-blue-900/20" src="${client.avatarUrl}" onerror="this.onerror=null; this.src=window.DEFAULT_AVATAR_URL" />
        <div>
          <div class="flex items-center gap-3">
            <input
              id="profileNameInput"
              class="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1 text-2xl font-bold text-slate-800 dark:text-slate-100 placeholder-slate-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              placeholder="名前を入力"
              type="text"
              value="${client.name}"
            />
            <span class="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full uppercase tracking-wider shrink-0">${client.status || "Active"}</span>
          </div>
          <div class="mt-3 space-y-1">
            <div class="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
              <span class="material-icons-outlined text-base shrink-0">fitness_center</span>
              <span class="text-slate-400 shrink-0">コース:</span>
              <input
                id="profileCourseInput"
                class="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 text-sm text-slate-600 dark:text-slate-300 placeholder-slate-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors flex-1"
                placeholder="未設定"
                type="text"
                value="${client.course || ""}"
              />
            </div>
            <div class="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
              <span class="material-icons-outlined text-base shrink-0">chat</span>
              <span class="text-slate-400 shrink-0">LINE ID:</span>

              <input
                id="profileLineIdInput"
                class="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 text-sm text-slate-600 dark:text-slate-300 placeholder-slate-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors flex-1"
                placeholder="LINEユーザーID"
                type="text"
                value="${client.lineUserId || ""}"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Progress Section -->
    <section class="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-2">
          <span class="material-icons-outlined text-primary">trending_up</span>
          <h3 class="text-lg font-bold">進捗状況管理</h3>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        ${createLevelSelect("blue", "Mat Pilates:", client.levels.blue, "blue")}
        ${createLevelSelect("red", "Weight Training", client.levels.red, "red")}
        ${createLevelSelect("green", "Sports Training", client.levels.green, "green")}
        ${createLevelSelect("yellow", "Movement Training", client.levels.yellow, "yellow")}
      </div>
      <div class="space-y-3">
        <div class="flex items-center gap-2">
          <span class="text-sm font-bold text-slate-600 dark:text-slate-400">Next Goal</span>
        </div>
        <div class="relative group">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span class="material-icons-outlined text-blue-600 dark:text-blue-400">flag</span>
          </div>
          <input 
            id="nextGoalInput"
            class="block w-full pl-12 pr-4 py-4 bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30 rounded-xl text-blue-900 dark:text-blue-100 font-medium focus:ring-2 focus:ring-primary focus:border-primary border transition-all" 
            placeholder="次の目標を入力してください..." 
            type="text" 
            value="${client.nextGoal}"
          />
          <div class="absolute inset-y-0 right-0 pr-4 flex items-center">
            <span class="material-icons-outlined text-slate-400 group-hover:text-primary transition-colors cursor-pointer">edit</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Current Tasks Section -->
    <section class="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-2">
          <span class="material-icons-outlined text-primary">assignment</span>
          <h3 class="text-lg font-bold">現在の課題管理 </h3>
        </div>
      </div>
      <div class="space-y-4 mb-8" id="tasksContainer">
        ${tasksHTML}
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button id="addNewTaskBtn" class="flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 hover:text-primary hover:border-primary dark:hover:border-primary/50 transition-all rounded-xl font-bold bg-white dark:bg-transparent">
          <span class="material-icons-outlined">add_circle</span>
          + 新規課題を追加
        </button>
        <button id="addPastTaskBtn" type="button" class="flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 hover:text-primary hover:border-primary dark:hover:border-primary/50 transition-all rounded-xl font-bold bg-white dark:bg-transparent">
          <span class="material-icons-outlined">history</span>
          + 過去の課題を追加
        </button>
      </div>
    </section>

    <!-- Memo History Section -->
    <section class="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-2">
          <span class="material-icons-outlined text-primary">history_edu</span>
          <h3 class="text-lg font-bold">前回のメモ管理</h3>
        </div>
      </div>
      <div class="space-y-6" id="memoHistoryContainer">
        ${historyHTML}
      </div>
      <button type="button" id="addMemoBtn" class="mt-8 w-full flex items-center justify-center gap-2 py-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-primary dark:hover:bg-blue-600 dark:hover:text-white transition-all rounded-xl font-bold">
        <span class="material-icons-outlined">add_box</span>
        新しいメモを作成
      </button>
    </section>

    <!-- Preferences Section -->
    <section class="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
      <div class="flex items-center justify-between mb-8">
        <h3 class="text-lg font-bold">やりたい・やりたくない確認</h3>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div class="flex items-start gap-5">
          <div class="w-14 h-14 flex items-center justify-center bg-green-100 dark:bg-green-900/30 rounded-2xl text-green-600 shrink-0 shadow-sm">
            <span class="material-icons-outlined text-3xl">thumb_up</span>
          </div>
          <div>
            <h4 class="font-bold text-xs text-green-700 dark:text-green-400 uppercase tracking-widest mb-2 flex items-center gap-1">
              <span class="w-1.5 h-1.5 bg-green-500 rounded-full"></span> やりたい
            </h4>
            <p class="text-slate-700 dark:text-slate-200 text-lg font-medium leading-relaxed">${client.preferences.likes}</p>
          </div>
        </div>
        <div class="flex items-start gap-5">
          <div class="w-14 h-14 flex items-center justify-center bg-red-100 dark:bg-red-900/30 rounded-2xl text-red-600 shrink-0 shadow-sm">
            <span class="material-icons-outlined text-3xl">thumb_down</span>
          </div>
          <div>
            <h4 class="font-bold text-xs text-red-700 dark:text-red-400 uppercase tracking-widest mb-2 flex items-center gap-1">
              <span class="w-1.5 h-1.5 bg-red-500 rounded-full"></span> やりたくない
            </h4>
            <p class="text-slate-700 dark:text-slate-200 text-lg font-medium leading-relaxed">${client.preferences.dislikes}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Submit Button Section -->
    <div class="flex justify-center">
        <button type="submit" class="flex items-center gap-2 mt-10 px-8 py-3 bg-primary text-white rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg hover:shadow-xl">
            <span class="material-icons-outlined">save</span>
            登録する
        </button>
    </div>
    </form>
  `;

  // イベントリスナーを設定
  setupTaskEventListeners(client);
  setupLevelSelects(client);
  setupMemoCreation(client);
  setupMemoEventListeners(client);
  setupFormSubmit(client);
}

// タスク関連のイベントリスナーを設定
function setupTaskEventListeners(client: Client): void {
  // チェックボックスの変更
  document.querySelectorAll(".task-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement;
      const taskId = parseInt(target.getAttribute("data-task-id") || "0");
      const task = client.currentTasks.find((t) => t.id === taskId);
      if (task) {
        task.completed = target.checked;
        console.log(`Task ${taskId} completed:`, task.completed);
        // ここでAPIへの保存処理を追加可能
        // 見た目を更新
        renderClientDetail(client);
      }
    });
  });

  // 削除ボタン
  document.querySelectorAll(".task-delete").forEach((button) => {
    button.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      const taskId = parseInt(
        target.closest("button")?.getAttribute("data-task-id") || "0",
      );
      if (confirm("この課題を削除しますか?")) {
        const task = client.currentTasks.find((t) => t.id === taskId);
        if (task) {
          if (task.isNew) {
            // まだDB未登録の新規タスクは即座に配列から削除
            const index = client.currentTasks.indexOf(task);
            client.currentTasks.splice(index, 1);
          } else {
            // 既存タスクはフラグを立てて登録時にDELETE
            task.isDeleted = true;
          }
          renderClientDetail(client);
          // 削除確定後にフォームを自動送信して登録を完了
          const form = document.getElementById(
            "clientDetailForm",
          ) as HTMLFormElement;
          form?.requestSubmit();
        }
      }
    });
  });

  // 新規課題追加
  const addNewTaskBtn = document.getElementById("addNewTaskBtn");
  if (addNewTaskBtn) {
    addNewTaskBtn.addEventListener("click", () => {
      const newTask: Task = {
        id: Date.now(),
        title: "",
        reason: "",
        youtubeUrl: "",
        completed: false,
        isNew: true, // DB未登録フラグ
      };
      client.currentTasks.push(newTask);
      renderClientDetail(client);
    });
  }

  // 過去の課題追加
  const addPastTaskBtn = document.getElementById("addPastTaskBtn");
  if (addPastTaskBtn) {
    addPastTaskBtn.addEventListener("click", () => {
      showPastTaskModal(client);
    });
  }

  // タスクの入力フィールド変更（リアルタイム保存）
  document
    .querySelectorAll(".task-title, .task-reason, .task-url")
    .forEach((input) => {
      input.addEventListener("change", (event) => {
        const target = event.target as HTMLInputElement;
        const taskId = parseInt(target.getAttribute("data-task-id") || "0");
        const task = client.currentTasks.find((t) => t.id === taskId);
        if (task) {
          if (target.classList.contains("task-title")) {
            task.title = target.value;
          } else if (target.classList.contains("task-reason")) {
            task.reason = target.value;
          } else if (target.classList.contains("task-url")) {
            task.youtubeUrl = target.value;
          }
          console.log(`Task ${taskId} updated:`, task);
          // ここでAPIへの保存処理を追加可能
        }
      });
    });

  // 名前・コース名・LINE IDの変更
  const profileNameInput = document.getElementById(
    "profileNameInput",
  ) as HTMLInputElement;
  if (profileNameInput) {
    profileNameInput.addEventListener("change", (event) => {
      client.name = (event.target as HTMLInputElement).value;
    });
  }
  const profileCourseInput = document.getElementById(
    "profileCourseInput",
  ) as HTMLInputElement;
  if (profileCourseInput) {
    profileCourseInput.addEventListener("change", (event) => {
      client.course = (event.target as HTMLInputElement).value;
    });
  }
  const profileLineIdInput = document.getElementById(
    "profileLineIdInput",
  ) as HTMLInputElement;
  if (profileLineIdInput) {
    profileLineIdInput.addEventListener("change", (event) => {
      client.lineUserId = (event.target as HTMLInputElement).value;
    });
  }

  // Next Goal の変更
  const nextGoalInput = document.getElementById(
    "nextGoalInput",
  ) as HTMLInputElement;
  if (nextGoalInput) {
    nextGoalInput.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement;
      client.nextGoal = target.value;
      console.log("Next Goal updated:", client.nextGoal);
      // ここでAPIへの保存処理を追加可能
    });
  }
}

// レベルセレクトボックスのイベントリスナーを設定
function setupLevelSelects(client: Client): void {
  document.querySelectorAll(".level-select").forEach((select) => {
    select.addEventListener("change", (event) => {
      const target = event.target as HTMLSelectElement;
      const levelKey = target.getAttribute("data-level-key") as
        | "blue"
        | "red"
        | "green"
        | "yellow";
      const newLevel = parseInt(target.value, 10);

      if (levelKey && client.levels[levelKey] !== undefined) {
        client.levels[levelKey] = newLevel;
        console.log(`Level ${levelKey} updated to:`, newLevel);
        // ここでAPIへの保存処理を追加可能
        // UI を更新（クリアバッジを反映）
        renderClientDetail(client);
      }
    });
  });
}

// メモ作成機能のイベントリスナーを設定
function setupMemoCreation(client: Client): void {
  const addMemoBtn = document.getElementById("addMemoBtn");
  if (!addMemoBtn) return;

  addMemoBtn.addEventListener("click", () => {
    // 新しい空のメモを作成
    const newMemo: MemoHistory = {
      id: Date.now(),
      date: new Date()
        .toLocaleDateString("ja-JP", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/\//g, "/"),
      trainer: "",
      content: "",
      isNew: true, // DB未登録フラグ
    };

    // メモ履歴の先頭に追加
    if (!client.history) {
      client.history = [];
    }
    client.history.unshift(newMemo);

    // UI を更新
    renderClientDetail(client);
  });
}

// メモ関連のイベントリスナーを設定
function setupMemoEventListeners(client: Client): void {
  // メモの削除
  document.querySelectorAll(".memo-delete").forEach((button) => {
    button.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      const memoId = parseInt(
        target.closest("button")?.getAttribute("data-memo-id") || "0",
      );
      if (confirm("このメモを削除しますか?")) {
        const memo = client.history?.find((m) => m.id === memoId);
        if (memo && client.history) {
          if (memo.isNew) {
            // まだDB未登録の新規メモは即座に配列から削除
            const index = client.history.indexOf(memo);
            client.history.splice(index, 1);
          } else {
            // 既存メモはフラグを立てて登録時にDELETE
            memo.isDeleted = true;
          }
          renderClientDetail(client);
          // 削除確定後にフォームを自動送信して登録を完了
          const form = document.getElementById(
            "clientDetailForm",
          ) as HTMLFormElement;
          form?.requestSubmit();
        }
      }
    });
  });

  // メモの日付変更
  document.querySelectorAll(".memo-date").forEach((input) => {
    input.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement;
      const memoId = parseInt(target.getAttribute("data-memo-id") || "0");
      const memo = client.history?.find((m) => m.id === memoId);
      if (memo) {
        memo.date = target.value;
        console.log(`Memo ${memoId} date updated:`, memo.date);
        // ここでAPIへの保存処理を追加可能
      }
    });
  });

  // メモの担当者変更
  document.querySelectorAll(".memo-trainer").forEach((input) => {
    input.addEventListener("change", (event) => {
      const target = event.target as HTMLSelectElement;
      const memoId = parseInt(target.getAttribute("data-memo-id") || "0");
      const memo = client.history?.find((m) => m.id === memoId);
      if (memo) {
        memo.trainer = target.value;
        console.log(`Memo ${memoId} trainer updated:`, memo.trainer);
        // ここでAPIへの保存処理を追加可能
      }
    });
  });

  // メモの内容変更
  document.querySelectorAll(".memo-content").forEach((textarea) => {
    textarea.addEventListener("change", (event) => {
      const target = event.target as HTMLTextAreaElement;
      const memoId = parseInt(target.getAttribute("data-memo-id") || "0");
      const memo = client.history?.find((m) => m.id === memoId);
      if (memo) {
        memo.content = target.value;
        console.log(`Memo ${memoId} content updated:`, memo.content);
        // ここでAPIへの保存処理を追加可能
      }
    });
  });
}

// フォーム送信のイベントリスナーを設定
function setupFormSubmit(client: Client): void {
  const form = document.getElementById("clientDetailForm") as HTMLFormElement;
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // 登録ボタンをローディング状態に
    const submitBtn = form.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML =
        '<span class="material-icons-outlined animate-spin">sync</span> 登録中...';
    }

    const errors: string[] = [];

    // ============================================================
    // 1. プロフィール更新（名前・コース名・LINE ID）
    // ============================================================
    const profileOk = await updateClientProfile(
      client.id,
      client.name,
      client.course ?? "",
      client.lineUserId ?? "",
    );
    if (!profileOk) errors.push("プロフィール更新エラー");

    // ============================================================
    // 2. レベル更新
    // ============================================================
    const colorKeys = ["blue", "red", "green", "yellow"] as const;
    for (const colorKey of colorKeys) {
      const levelId = client.levelIdMap?.[colorKey];
      const categoryId = client.categoryIdMap?.[colorKey];
      if (!levelId || !categoryId) continue;

      const newLevel = client.levels[colorKey];
      const prevLevel = _dbLevels[colorKey] ?? 0;
      const ok = await updateLevel(
        client.id,
        levelId,
        categoryId,
        newLevel,
        prevLevel,
      );
      if (!ok) errors.push(`レベル更新エラー (${colorKey})`);
    }

    // ============================================================
    // 3. タスク CRUD
    // ============================================================
    const defaultCategoryId = (await fetchCategories())[0]?.id ?? "";

    for (const task of client.currentTasks) {
      if (task.isNew && !task.isDeleted) {
        // 新規追加
        if (!task.title.trim()) continue; // 空のタスクはスキップ
        if (task.dbTaskId) {
          // 過去の課題から選択：tasksマスターは既存 → client_tasksにのみ INSERT
          const clientTaskId = await assignExistingTask(
            client.id,
            task.dbTaskId,
          );
          if (clientTaskId) {
            task.clientTaskId = clientTaskId;
            task.isNew = false;
          } else {
            errors.push(`タスク割り当てエラー: ${task.title}`);
          }
        } else {
          // 新規作成：tasks + client_tasks の両方 INSERT
          const result = await createTask(
            client.id,
            defaultCategoryId,
            task.title,
            task.reason ?? "",
            task.youtubeUrl ?? "",
          );
          if (result) {
            task.dbTaskId = result.dbTaskId;
            task.clientTaskId = result.clientTaskId;
            task.isNew = false;
          } else {
            errors.push(`タスク作成エラー: ${task.title}`);
          }
        }
      } else if (task.isDeleted && task.clientTaskId) {
        // 削除
        const ok = await deleteClientTask(task.clientTaskId);
        if (!ok) errors.push(`タスク削除エラー: ${task.title}`);
      } else if (
        !task.isNew &&
        !task.isDeleted &&
        task.dbTaskId &&
        task.clientTaskId
      ) {
        // 既存タスクの更新
        const [taskOk, toggleOk] = await Promise.all([
          updateTask(
            task.dbTaskId,
            task.title,
            task.reason ?? "",
            task.youtubeUrl ?? "",
          ),
          toggleTask(task.clientTaskId, task.completed),
        ]);
        if (!taskOk || !toggleOk)
          errors.push(`タスク更新エラー: ${task.title}`);
      }
    }

    // ============================================================
    // 4. メモ CRUD
    // ============================================================
    for (const memo of client.history ?? []) {
      if (memo.isNew && !memo.isDeleted) {
        // 新規作成
        if (!memo.content.trim()) continue; // 空メモはスキップ
        const dbId = await createMemo(client.id, memo.content);
        if (dbId) {
          memo.dbId = dbId;
          memo.isNew = false;
        } else {
          errors.push("メモ作成エラー");
        }
      } else if (memo.isDeleted && memo.dbId) {
        // 削除
        const ok = await deleteMemo(memo.dbId);
        if (!ok) errors.push("メモ削除エラー");
      } else if (!memo.isNew && !memo.isDeleted && memo.dbId) {
        // 既存メモの更新
        const ok = await updateMemo(memo.dbId, memo.content);
        if (!ok) errors.push("メモ更新エラー");
      }
    }

    // ============================================================
    // 5. Next Goal 更新
    // ============================================================
    const goalOk = await updateNextGoal(client.id, client.nextGoal);
    if (!goalOk) errors.push("Next Goal 更新エラー");

    // ============================================================
    // 6. 登録結果をトーストで通知
    // ============================================================
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML =
        '<span class="material-icons-outlined">save</span> 登録する';
    }

    if (errors.length === 0) {
      showToast("顧客情報を登録しました");
      // DB値スナップショットを更新
      _dbLevels = { ...client.levels };
    } else {
      showToast(`一部の登録に失敗しました: ${errors.join(", ")}`, "error");
    }
  });
}

// ダークモードの切り替え
function setupDarkMode(): void {
  const darkModeToggle = document.getElementById("darkModeToggle");
  if (!darkModeToggle) return;

  // ローカルストレージから設定を読み込む
  const isDarkMode = localStorage.getItem("darkMode") === "true";
  if (isDarkMode) {
    document.documentElement.classList.add("dark");
  }

  darkModeToggle.addEventListener("click", () => {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("darkMode", isDark.toString());
  });
}

// モバイルサイドバーの開閉
function setupMobileSidebar(): void {
  const menuButton = document.getElementById("mobileMenuButton");
  const sidebar = document.getElementById("mobileSidebar");
  const closeButton = document.getElementById("mobileSidebarClose");
  const overlay = document.getElementById("mobileSidebarOverlay");

  if (!menuButton || !sidebar || !closeButton || !overlay) return;

  const openSidebar = (): void => {
    sidebar.classList.remove("-translate-x-full");
    overlay.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
  };

  const closeSidebar = (): void => {
    sidebar.classList.add("-translate-x-full");
    overlay.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
  };

  menuButton.addEventListener("click", openSidebar);
  closeButton.addEventListener("click", closeSidebar);
  overlay.addEventListener("click", closeSidebar);

  // ナビゲーションリンクをクリックしたら閉じる
  const navLinks = sidebar.querySelectorAll("a[href]");
  navLinks.forEach((link) => {
    link.addEventListener("click", closeSidebar);
  });

  // 画面サイズが変わったら調整
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1024) {
      overlay.classList.add("hidden");
      document.body.classList.remove("overflow-hidden");
    }
  });
}

// 初期化処理
async function init(): Promise<void> {
  console.log("Initializing client detail page...");
  setupDarkMode();
  setupMobileSidebar();

  const clientId = getClientIdFromUrl();
  if (!clientId) {
    const container = document.getElementById("clientDetailContainer");
    if (container) {
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-64">
          <span class="material-icons-outlined text-6xl text-slate-300 dark:text-slate-700 mb-4">error</span>
          <p class="text-lg text-slate-500">顧客IDが指定されていません</p>
          <a href="clients.html" class="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors">
            顧客一覧に戻る
          </a>
        </div>
      `;
    }
    return;
  }

  const container = document.getElementById("clientDetailContainer");
  if (container) {
    container.innerHTML =
      '<p class="text-center py-12 text-slate-400">読み込み中...</p>';
  }

  const client = await getClientFromSupabase(clientId);
  if (!client) {
    if (container) {
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-64">
          <span class="material-icons-outlined text-6xl text-slate-300 dark:text-slate-700 mb-4">person_off</span>
          <p class="text-lg text-slate-500">顧客が見つかりませんでした</p>
          <a href="clients.html" class="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors">
            顧客一覧に戻る
          </a>
        </div>
      `;
    }
    return;
  }

  // DBロード時のレベルをスナップショット（level_history 用）
  _dbLevels = { ...client.levels };

  // カテゴリをプリフェッチ（新規タスク作成時に必要）
  await fetchCategories();
  _trainers = await fetchTrainers();

  renderClientDetail(client);
}

// DOMContentLoaded時に初期化
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
