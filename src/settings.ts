import {
  fetchStages,
  fetchTasksMaster,
  fetchTrainersMaster,
  createTaskMaster,
  updateTaskMaster,
  deleteTaskMaster,
  createTrainerMaster,
  updateTrainerMaster,
  deactivateTrainer,
  updateStage,
  uploadTrainerAvatar,
} from "./api/settings-crud";
import { fetchCategories } from "./api/client-crud";

// ============================================================
// 型定義
// ============================================================

interface Stage {
  dbId: string;
  stageNo: number;
  level: string; // "1合目" etc. (stageNo から生成)
  name: string;
  description: string;
  levelThreshold: number; // DB: level_to
  isDirty: boolean;
}

interface Task {
  dbId: string | null; // null = 新規（未保存）
  tempId: number; // UI キー
  category: "blue" | "red" | "green" | "yellow";
  name: string;
  youtubeUrl: string;
  reason: string;
  isNew: boolean;
  isDeleted: boolean;
  isDirty: boolean;
}

interface Trainer {
  dbId: string | null; // null = 新規（未保存）
  tempId: number;
  name: string;
  lineUserId: string;
  avatarUrl: string;
  role: "Head" | "Staff";
  isOnline: boolean;
}

// ============================================================
// モジュール変数
// ============================================================

let stagesData: Stage[] = [];
let tasksData: Task[] = [];
let trainersData: Trainer[] = [];

// カテゴリー色キー → categories.id (UUID) のマッピング
const categoryColorMap: Record<"blue" | "red" | "green" | "yellow", string> = {
  blue: "",
  red: "",
  green: "",
  yellow: "",
};

// 現在選択中のカテゴリー
let currentCategory: "blue" | "red" | "green" | "yellow" = "blue";

// トレーナーモーダルのモード管理
let trainerModalMode: "add" | "edit" = "add";
let trainerEditTargetId: number | null = null;

// モーダルで選択された画像ファイル
let selectedAvatarFile: File | null = null;

// ============================================================
// DB → UI 変換関数
// ============================================================

const STAGE_LEVEL_LABEL: Record<number, string> = {
  1: "1合目",
  2: "2合目",
  3: "3合目",
  4: "4合目",
  5: "5合目",
  6: "6合目",
};

const CATEGORY_NAME_TO_COLOR: Record<
  string,
  "blue" | "red" | "green" | "yellow"
> = {
  マットピラティス: "blue",
  ウェイトトレーニング: "red",
  スポーツトレーニング: "green",
  ムーブメントトレーニング: "yellow",
};

function dbStageToStage(db: {
  id: string;
  stage_no: number;
  name: string;
  description: string | null;
  level_to: number;
}): Stage {
  return {
    dbId: db.id,
    stageNo: db.stage_no,
    level: STAGE_LEVEL_LABEL[db.stage_no] ?? `${db.stage_no}合目`,
    name: db.name,
    description: db.description ?? "",
    levelThreshold: db.level_to,
    isDirty: false,
  };
}

function dbTaskToTask(
  db: {
    id: string;
    category_id: string;
    title: string;
    why_text: string | null;
    youtube_url: string | null;
  },
  category: "blue" | "red" | "green" | "yellow",
): Task {
  return {
    dbId: db.id,
    tempId: Date.now() + Math.random(),
    category,
    name: db.title,
    youtubeUrl: db.youtube_url ?? "",
    reason: db.why_text ?? "",
    isNew: false,
    isDeleted: false,
    isDirty: false,
  };
}

function dbTrainerToTrainer(db: {
  id: string;
  display_name: string | null;
  line_user_id: string;
  profile_image_url?: string | null;
}): Trainer {
  return {
    dbId: db.id,
    tempId: Date.now() + Math.random(),
    name: db.display_name ?? "",
    lineUserId: db.line_user_id,
    avatarUrl: db.profile_image_url || "/assets/initial-avater.png",
    role: "Staff",
    isOnline: false,
  };
}

// カテゴリーの情報
const categoryInfo = {
  blue: {
    name: "Mat Pilates",
    color: "bg-blue-600",
    textColor: "text-blue-600",
    borderColor: "border-blue-600",
  },
  red: {
    name: "Weight Training",
    color: "bg-red-600",
    textColor: "text-red-600",
    borderColor: "border-red-600",
  },
  green: {
    name: "Sports Training",
    color: "bg-emerald-600",
    textColor: "text-emerald-600",
    borderColor: "border-emerald-600",
  },
  yellow: {
    name: "Movement Training",
    color: "bg-amber-500",
    textColor: "text-amber-500",
    borderColor: "border-amber-500",
  },
};

// ステージカードの生成
function createStageCard(stage: Stage): string {
  return `
        <div class="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div class="flex items-center justify-between mb-4">
                <span class="text-xs font-bold text-primary uppercase tracking-wider bg-primary/10 px-2 py-1 rounded">${stage.level}</span>
            </div>
            <div class="space-y-4">
                <div>
                    <label class="block text-xs font-medium text-slate-500 mb-1">ステージ名</label>
                    <input 
                        class="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-sm stage-name" 
                        type="text" 
                        value="${stage.name}"
                        data-stage-id="${stage.dbId}"
                    />
                </div>
                <div>
                    <label class="block text-xs font-medium text-slate-500 mb-1">レベル上限（クリア条件）</label>
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-slate-400 whitespace-nowrap">全カテゴリーが</span>
                        <div class="relative flex-1">
                            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-primary">Lv.</span>
                            <input 
                                class="w-full pl-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-sm font-bold stage-level-threshold" 
                                type="number" 
                                min="1"
                                max="99"
                                value="${stage.levelThreshold}"
                                data-stage-id="${stage.dbId}"
                            />
                        </div>
                        <span class="text-xs text-slate-400 whitespace-nowrap">を超えたら次へ</span>
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-medium text-slate-500 mb-1">説明</label>
                    <textarea 
                        class="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-xs stage-description" 
                        rows="2"
                        data-stage-id="${stage.dbId}"
                    >${stage.description}</textarea>
                </div>
            </div>
        </div>
    `;
}

// タスクカードの生成
function createTaskCard(task: Task): string {
  const youtubeIconColor = task.youtubeUrl ? "text-youtube" : "text-slate-300";
  return `
        <div class="task-row group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm relative hover:border-primary/50 transition-colors">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">タスク名</label>
                    <input 
                        class="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium focus:bg-white dark:focus:bg-slate-900 transition-colors task-name" 
                        type="text" 
                        value="${task.name}"
                        data-task-id="${task.tempId}"
                    />
                </div>
                <div class="relative">
                    <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">YouTube URL</label>
                    <div class="relative">
                        <span class="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 ${youtubeIconColor} text-lg">play_circle</span>
                        <input 
                            class="w-full pl-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm ${task.youtubeUrl ? "text-blue-600 dark:text-blue-400 underline" : ""} focus:bg-white dark:focus:bg-slate-900 transition-colors task-url" 
                            type="url" 
                            value="${task.youtubeUrl}"
                            placeholder="URLを入力"
                            data-task-id="${task.tempId}"
                        />
                    </div>
                </div>
            </div>
            <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">意義 / なぜ行うのか (Why)</label>
                <textarea 
                    class="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:bg-white dark:focus:bg-slate-900 transition-colors task-reason" 
                    rows="2"
                    data-task-id="${task.tempId}"
                >${task.reason}</textarea>
            </div>
            <div class="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button class="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 cursor-move">
                    <span class="material-icons-outlined text-lg">drag_handle</span>
                </button>
                <button class="p-1.5 text-slate-400 hover:text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 task-delete" data-task-id="${task.tempId}">
                    <span class="material-icons-outlined text-lg">delete_outline</span>
                </button>
            </div>
        </div>
    `;
}

// カテゴリータブの生成
function createCategoryTabs(): string {
  return Object.entries(categoryInfo)
    .map(([key, info]) => {
      const isActive = key === currentCategory;
      const activeClasses = isActive
        ? `border-b-2 ${info.borderColor} ${info.textColor} font-bold`
        : "text-slate-500 dark:text-slate-400 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800";

      return `
            <button 
                class="category-tab px-6 py-4 flex items-center gap-2 ${activeClasses} transition-colors whitespace-nowrap"
                data-category="${key}"
            >
                <span class="w-3 h-3 rounded-full ${info.color}"></span>
                ${info.name}
            </button>
        `;
    })
    .join("");
}

// トレーナーカードの生成
function createTrainerCard(trainer: Trainer): string {
  const roleBadgeClass =
    trainer.role === "Head"
      ? "text-primary bg-primary/10"
      : "text-slate-500 bg-slate-100 dark:bg-slate-800";

  return `
        <div class="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center gap-4">
            <div class="relative">
                <img alt="${trainer.name}" class="w-12 h-12 rounded-full object-cover border border-slate-100 dark:border-slate-700" src="${trainer.avatarUrl}" onerror="this.onerror=null; this.src='/assets/initial-avater.png'" />
            </div>
            <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                    <h4 class="font-bold truncate text-sm">${trainer.name}</h4>
                    <span class="text-[10px] font-bold ${roleBadgeClass} px-1.5 py-0.5 rounded uppercase">${trainer.role}</span>
                </div>
                <p class="text-xs text-slate-500 truncate">LINE: ${trainer.lineUserId}</p>
            </div>
            <button class="text-slate-400 hover:text-slate-600 p-1 trainer-menu" data-trainer-id="${trainer.tempId}">
                <span class="material-icons-outlined text-lg">more_vert</span>
            </button>
        </div>
    `;
}

// 設定画面のコンテンツを生成
function renderSettings(): void {
  const container = document.getElementById("settingsContainer");
  if (!container) return;

  const stagesHTML = stagesData.map((stage) => createStageCard(stage)).join("");
  const currentTasks = tasksData.filter(
    (task) => task.category === currentCategory,
  );
  const tasksHTML = currentTasks.map((task) => createTaskCard(task)).join("");
  const trainersHTML = trainersData
    .map((trainer) => createTrainerCard(trainer))
    .join("");

  container.innerHTML = `
        <div class="flex flex-col lg:flex-row gap-8">
            <!-- Main Content -->
            <div class="flex-1 space-y-12">
                <!-- Stage Management Section -->
                <section>
                    <div class="mb-6">
                        <h2 class="text-2xl font-bold flex items-center gap-2">
                            <span class="material-icons-outlined text-primary">terrain</span>
                            ステージ管理
                        </h2>
                        <p class="text-slate-500 text-sm mt-1">顧客の進捗状況を定義する「1合目〜6合目」の各ステップを編集します。</p>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        ${stagesHTML}
                    </div>
                </section>

                <!-- Task Management Section -->
                <section class="border-t border-slate-200 dark:border-slate-800 pt-10">
                    <div class="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                        <div>
                            <h2 class="text-2xl font-bold flex items-center gap-2">
                                <span class="material-icons-outlined text-primary">assignment_turned_in</span>
                                タスク管理
                            </h2>
                            <p class="text-slate-500 text-sm mt-1">4つのカテゴリーごとにスキル習得基準とYouTube動画を設定できます。</p>
                        </div>
                    </div>

                    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                        <!-- Category Tabs -->
                        <div class="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50" id="categoryTabs">
                            ${createCategoryTabs()}
                        </div>

                        <!-- Task List -->
                        <div class="p-6">
                            <div class="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <button id="addTaskBtn" class="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-sm flex items-center justify-center gap-2">
                                    <span class="material-icons-outlined text-lg">add_circle</span>
                                    タスクを新規追加
                                </button>
                                <div class="relative w-full sm:w-72">
                                    <span class="material-icons-outlined absolute left-3 top-2.5 text-slate-400 text-sm">search</span>
                                    <input 
                                        id="taskSearchInput"
                                        class="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm" 
                                        placeholder="タスク名を検索..." 
                                        type="text"
                                    />
                                </div>
                            </div>
                            <div class="h-[600px] overflow-y-auto pr-2 custom-scrollbar space-y-4" id="tasksList">
                                ${tasksHTML}
                            </div>
                        </div>
                    </div>
                </section>
                <!-- Unified Save Button -->
                <div class="flex justify-center pt-6 border-t border-slate-200 dark:border-slate-800">
                    <button id="saveAllBtn" class="flex items-center gap-2 px-10 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl">
                        <span class="material-icons-outlined">save</span>
                        変更を保存
                    </button>
                </div>
            </div>

            <!-- Trainer Management Sidebar -->
            <aside class="w-full lg:w-96 space-y-6">
                <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-fit">
                    <div class="p-6 border-b border-slate-200 dark:border-slate-800">
                        <div class="flex items-center justify-between mb-4">
                            <h2 class="text-xl font-bold flex items-center gap-2">
                                <span class="material-icons-outlined text-primary">groups</span>
                                トレーナー管理
                            </h2>
                            <span class="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold px-2 py-1 rounded">全 ${trainersData.length} 名</span>
                        </div>
                        <button id="addTrainerBtn" class="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-sm">
                            <span class="material-icons-outlined">person_add</span>
                            トレーナーを追加
                        </button>
                    </div>
                    <div class="divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto max-h-[500px]">
                        ${trainersHTML}
                    </div>
                    
                </div>
            </aside>
        </div>

        <!-- Trainer Add/Edit Modal -->
        <div id="trainerModal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" id="trainerModalOverlay"></div>
            <div class="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-8">
                <h3 class="text-xl font-bold mb-6 flex items-center gap-2">
                    <span class="material-icons-outlined text-primary">person_add</span>
                    <span id="trainerModalTitleText">トレーナーを追加</span>
                </h3>
                <!-- アバター画像アップロード -->
                <div class="flex flex-col items-center gap-1 mb-4">
                    <div class="relative cursor-pointer group" id="avatarUploadArea">
                        <img
                            id="avatarPreview"
                            src="/assets/initial-avater.png"
                            class="w-20 h-20 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700"
                            onerror="this.onerror=null; this.src='/assets/initial-avater.png'"
                        />
                        <div class="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span class="material-icons-outlined text-white text-2xl">photo_camera</span>
                        </div>
                        <input type="file" id="trainerAvatarInput" accept="image/jpeg,image/png" class="hidden" />
                    </div>
                    <p class="text-xs text-slate-400">クリックして画像を選択（JPG・PNG）</p>
                </div>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">名前 <span class="text-red-500">*</span></label>
                        <input id="trainerNameInput" type="text" class="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm" placeholder="例：田中 美咲" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">LINE ID <span class="text-red-500">*</span></label>
                        <input id="trainerLineIdInput" type="text" class="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm" placeholder="例：U1234567890abcdef" />
                    </div>
                </div>
                <p id="trainerModalError" class="hidden text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg mt-4"></p>
                <div class="flex gap-3 mt-4">
                    <button id="trainerModalCancel" class="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">キャンセル</button>
                    <button id="trainerModalSubmit" class="flex-1 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all shadow-sm">追加する</button>
                </div>
            </div>
        </div>

        <!-- Trainer Context Menu Dropdown -->
        <div id="trainerDropdown" class="hidden fixed z-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 w-36">
            <button id="trainerDropdownEdit" class="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2.5 transition-colors">
                <span class="material-icons-outlined text-slate-400 text-base">edit</span>
                編集
            </button>
            <div class="border-t border-slate-100 dark:border-slate-700 my-1"></div>
            <button id="trainerDropdownDelete" class="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2.5 transition-colors">
                <span class="material-icons-outlined text-base">delete_outline</span>
                削除
            </button>
        </div>
    `;

  // イベントリスナーを設定
  setupStageEventListeners();
  setupTaskEventListeners();
  setupCategoryTabs();
  setupTrainerEventListeners();
  setupSaveButton();
}

// ============================================================
// Toast 通知
// ============================================================
function showToast(
  message: string,
  type: "success" | "error" = "success",
): void {
  const existing = document.getElementById("toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "toast";
  const colorClass =
    type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white";
  toast.className = `fixed bottom-6 right-6 z-[9999] flex items-center gap-2 px-5 py-3 rounded-xl shadow-2xl font-semibold text-sm ${colorClass} transition-all`;
  toast.innerHTML = `<span class="material-icons-outlined text-base">${type === "success" ? "check_circle" : "error_outline"}</span>${message}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ============================================================
// 統合保存ボタン（Step 4 + 5 : ステージ・タスク一括保存）
// ============================================================
function setupSaveButton(): void {
  const saveAllBtn = document.getElementById("saveAllBtn");
  if (!saveAllBtn) return;

  saveAllBtn.addEventListener("click", async () => {
    // ボタンをローディング状態にする
    saveAllBtn.setAttribute("disabled", "true");
    const originalHTML = saveAllBtn.innerHTML;
    saveAllBtn.innerHTML = `
      <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
      </svg>
      保存中...`;

    try {
      // --- ステージ保存（isDirty のもの） ---
      const stagePromises = stagesData
        .filter((s) => s.isDirty)
        .map((s) =>
          updateStage(s.dbId, {
            name: s.name,
            description: s.description,
            level_to: s.levelThreshold,
          }).then(() => {
            s.isDirty = false;
          }),
        );

      // --- タスク保存（カテゴリーIDを取得） ---
      const catColorToId: Record<"blue" | "red" | "green" | "yellow", string> =
        {
          blue: categoryColorMap.blue,
          red: categoryColorMap.red,
          green: categoryColorMap.green,
          yellow: categoryColorMap.yellow,
        };

      // 新規作成
      const createPromises = tasksData
        .filter((t) => t.isNew && !t.isDeleted)
        .map((t) => {
          const catId = catColorToId[t.category];
          return createTaskMaster(catId, t.name, t.reason, t.youtubeUrl).then(
            (newId) => {
              t.dbId = newId;
              t.isNew = false;
              t.isDirty = false;
            },
          );
        });

      // 既存タスク更新（isDirty & !isNew & !isDeleted）
      const updateTaskPromises = tasksData
        .filter((t) => t.isDirty && !t.isNew && !t.isDeleted && t.dbId)
        .map((t) =>
          updateTaskMaster(t.dbId!, t.name, t.reason, t.youtubeUrl).then(() => {
            t.isDirty = false;
          }),
        );

      await Promise.all([
        ...stagePromises,
        ...createPromises,
        ...updateTaskPromises,
      ]);

      showToast("設定を保存しました");
    } catch (err) {
      console.error("Save failed:", err);
      showToast("保存に失敗しました。もう一度お試しください。", "error");
    } finally {
      saveAllBtn.removeAttribute("disabled");
      saveAllBtn.innerHTML = originalHTML;
    }
  });
}

// ============================================================
// ステージイベントリスナー（Step 3 : isDirty フラグ管理）
// ============================================================
function setupStageEventListeners(): void {
  // ステージ名の変更
  document.querySelectorAll(".stage-name").forEach((input) => {
    input.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement;
      const dbId = target.getAttribute("data-stage-id") ?? "";
      const stage = stagesData.find((s) => s.dbId === dbId);
      if (stage) {
        stage.name = target.value;
        stage.isDirty = true;
      }
    });
  });

  // ステージ説明の変更
  document.querySelectorAll(".stage-description").forEach((textarea) => {
    textarea.addEventListener("change", (event) => {
      const target = event.target as HTMLTextAreaElement;
      const dbId = target.getAttribute("data-stage-id") ?? "";
      const stage = stagesData.find((s) => s.dbId === dbId);
      if (stage) {
        stage.description = target.value;
        stage.isDirty = true;
      }
    });
  });

  // レベル上限の変更
  document.querySelectorAll(".stage-level-threshold").forEach((input) => {
    input.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement;
      const dbId = target.getAttribute("data-stage-id") ?? "";
      const stage = stagesData.find((s) => s.dbId === dbId);
      const newValue = parseInt(target.value);
      if (stage && !isNaN(newValue) && newValue >= 1) {
        stage.levelThreshold = newValue;
        stage.isDirty = true;
      } else {
        target.value = String(stage?.levelThreshold ?? 1);
      }
    });
  });
}

// ============================================================
// タスクイベントリスナー（Step 5 : isDirty / isDeleted / isNew フラグ）
// ============================================================
function setupTaskEventListeners(): void {
  // タスク名の変更
  document.querySelectorAll(".task-name").forEach((input) => {
    input.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement;
      const tempId = parseFloat(target.getAttribute("data-task-id") || "0");
      const task = tasksData.find((t) => t.tempId === tempId);
      if (task) {
        task.name = target.value;
        task.isDirty = true;
      }
    });
  });

  // タスクURLの変更
  document.querySelectorAll(".task-url").forEach((input) => {
    input.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement;
      const tempId = parseFloat(target.getAttribute("data-task-id") || "0");
      const task = tasksData.find((t) => t.tempId === tempId);
      if (task) {
        task.youtubeUrl = target.value;
        task.isDirty = true;
      }
    });
  });

  // タスク理由の変更
  document.querySelectorAll(".task-reason").forEach((textarea) => {
    textarea.addEventListener("change", (event) => {
      const target = event.target as HTMLTextAreaElement;
      const tempId = parseFloat(target.getAttribute("data-task-id") || "0");
      const task = tasksData.find((t) => t.tempId === tempId);
      if (task) {
        task.reason = target.value;
        task.isDirty = true;
      }
    });
  });

  // タスク削除（確認後 即DB反映）
  document.querySelectorAll(".task-delete").forEach((button) => {
    button.addEventListener("click", async (event) => {
      const btn = (event.target as HTMLElement).closest("button");
      const tempId = parseFloat(btn?.getAttribute("data-task-id") || "0");
      const idx = tasksData.findIndex((t) => t.tempId === tempId);
      if (idx === -1) return;
      const task = tasksData[idx];

      const taskName = task.name || "（名称未設定）";
      if (!confirm(`「${taskName}」を削除しますか？`)) return;

      // カードを即 DOM から除去（楽観的UI）
      const card = btn?.closest(".task-row") as HTMLElement | null;
      if (card) card.remove();

      if (task.isNew) {
        // 未保存タスクはメモリから即削除（DBには存在しない）
        tasksData.splice(idx, 1);
        showToast(`「${taskName}」を削除しました`);
      } else {
        // 保存済みタスクは DB に即論理削除
        tasksData.splice(idx, 1);
        try {
          await deleteTaskMaster(task.dbId!);
          showToast(`「${taskName}」を削除しました`);
        } catch (err) {
          console.error("タスク削除失敗:", err);
          showToast(
            "削除に失敗しました。ページを再読み込みしてください。",
            "error",
          );
        }
      }
    });
  });

  // タスク追加
  const addTaskBtn = document.getElementById("addTaskBtn");
  if (addTaskBtn) {
    addTaskBtn.addEventListener("click", () => {
      const newTask: Task = {
        dbId: null,
        tempId: Date.now() + Math.random(),
        category: currentCategory,
        name: "",
        youtubeUrl: "",
        reason: "",
        isNew: true,
        isDeleted: false,
        isDirty: false,
      };
      tasksData.unshift(newTask);
      renderSettings();
    });
  }

  // タスク検索
  const searchInput = document.getElementById(
    "taskSearchInput",
  ) as HTMLInputElement;
  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
      document.querySelectorAll<HTMLElement>(".task-row").forEach((card) => {
        const name = card.querySelector<HTMLInputElement>(".task-name");
        card.style.display =
          !name || name.value.toLowerCase().includes(searchTerm) ? "" : "none";
      });
    });
  }
}

// ============================================================
// カテゴリータブ（Step 3 : 切り替え時に DB からタスク再取得）
// ============================================================
function setupCategoryTabs(): void {
  document.querySelectorAll(".category-tab").forEach((tab) => {
    tab.addEventListener("click", async (event) => {
      const target = event.target as HTMLElement;
      const category = target
        .closest("button")
        ?.getAttribute("data-category") as
        | "blue"
        | "red"
        | "green"
        | "yellow"
        | null;
      if (!category || category === currentCategory) return;

      currentCategory = category;
      // 現在のカテゴリーの categoryId を取得
      const catId = categoryColorMap[category];
      if (catId) {
        try {
          const dbTasks = await fetchTasksMaster(catId);
          // 既存の同カテゴリーデータを差し替え（未保存の新規は保持）
          tasksData = [
            ...tasksData.filter((t) => t.category !== category || t.isNew),
            ...dbTasks.map((db) => dbTaskToTask(db, category)),
          ];
        } catch (err) {
          console.error("タスク取得失敗:", err);
        }
      }
      renderSettings();
    });
  });
}

// ============================================================
// トレーナーイベントリスナー（Step 6 : DB CRUD）
// ============================================================
function setupTrainerEventListeners(): void {
  const modal = document.getElementById("trainerModal");
  const overlay = document.getElementById("trainerModalOverlay");
  const cancelBtn = document.getElementById("trainerModalCancel");
  const submitBtn = document.getElementById(
    "trainerModalSubmit",
  ) as HTMLButtonElement | null;
  const titleText = document.getElementById("trainerModalTitleText");
  const nameInput = document.getElementById(
    "trainerNameInput",
  ) as HTMLInputElement | null;
  const lineIdInput = document.getElementById(
    "trainerLineIdInput",
  ) as HTMLInputElement | null;
  const dropdown = document.getElementById("trainerDropdown");
  const dropdownEdit = document.getElementById("trainerDropdownEdit");
  const dropdownDelete = document.getElementById("trainerDropdownDelete");
  let dropdownTargetTempId: number | null = null;

  // --- ドロップダウンの開閉 ---
  const closeDropdown = (): void => {
    dropdown?.classList.add("hidden");
    dropdownTargetTempId = null;
  };

  document.querySelectorAll(".trainer-menu").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const btn = event.currentTarget as HTMLElement;
      const tempId = parseFloat(btn.getAttribute("data-trainer-id") || "0");

      if (
        !dropdown?.classList.contains("hidden") &&
        dropdownTargetTempId === tempId
      ) {
        closeDropdown();
        return;
      }

      dropdownTargetTempId = tempId;
      const rect = btn.getBoundingClientRect();
      if (dropdown) {
        dropdown.classList.remove("hidden");
        const dropW = 144;
        const left = Math.min(
          rect.right - dropW,
          window.innerWidth - dropW - 8,
        );
        dropdown.style.top = `${rect.bottom + 4}px`;
        dropdown.style.left = `${left}px`;
      }
    });
  });

  document.addEventListener("click", closeDropdown);

  // --- ドロップダウン「編集」 ---
  dropdownEdit?.addEventListener("click", () => {
    if (dropdownTargetTempId === null) return;
    const trainer = trainersData.find((t) => t.tempId === dropdownTargetTempId);
    if (!trainer) return;

    trainerModalMode = "edit";
    trainerEditTargetId = trainer.tempId;
    if (nameInput) nameInput.value = trainer.name;
    if (lineIdInput) lineIdInput.value = trainer.lineUserId;
    if (titleText) titleText.textContent = "トレーナーを編集";
    if (submitBtn) submitBtn.textContent = "保存する";
    // プレビュー画像をトレーナーの現在のアバターに設存
    selectedAvatarFile = null;
    const preview = document.getElementById(
      "avatarPreview",
    ) as HTMLImageElement | null;
    if (preview)
      preview.src = trainer.avatarUrl || "/assets/initial-avater.png";
    clearModalError();
    modal?.classList.remove("hidden");
    closeDropdown();
  });

  // --- ドロップダウン「削除」 ---
  dropdownDelete?.addEventListener("click", async () => {
    if (dropdownTargetTempId === null) return;
    const trainer = trainersData.find((t) => t.tempId === dropdownTargetTempId);
    if (!trainer) return;

    closeDropdown();

    if (
      !confirm(
        `「${trainer.name}」を削除しますか？\n\nこの操作は元に戻せません。`,
      )
    )
      return;

    if (trainer.dbId) {
      try {
        await deactivateTrainer(trainer.dbId);
        trainersData = trainersData.filter((t) => t.tempId !== trainer.tempId);
        renderSettings();
        showToast(`${trainer.name} を削除しました`);
      } catch (err) {
        console.error("トレーナー削除失敗:", err);
        showToast("削除に失敗しました", "error");
      }
    } else {
      // 未保存（新規）のトレーナーはメモリから除去
      trainersData = trainersData.filter((t) => t.tempId !== trainer.tempId);
      renderSettings();
      showToast(`${trainer.name} を削除しました`);
    }
  });

  // --- モーダルの開閉 ---
  const showModalError = (msg: string): void => {
    const el = document.getElementById("trainerModalError");
    if (!el) return;
    el.textContent = msg;
    el.classList.remove("hidden");
  };

  const clearModalError = (): void => {
    const el = document.getElementById("trainerModalError");
    if (!el) return;
    el.textContent = "";
    el.classList.add("hidden");
  };

  const openModal = (): void => {
    if (!modal) return;
    if (nameInput) nameInput.value = "";
    if (lineIdInput) lineIdInput.value = "";
    if (titleText) titleText.textContent = "トレーナーを追加";
    if (submitBtn) submitBtn.textContent = "追加する";
    trainerModalMode = "add";
    trainerEditTargetId = null;
    // アバターをデフォルトにリセット
    selectedAvatarFile = null;
    const preview = document.getElementById(
      "avatarPreview",
    ) as HTMLImageElement | null;
    if (preview) preview.src = "/assets/initial-avater.png";
    clearModalError();
    modal.classList.remove("hidden");
  };

  const closeModal = (): void => {
    selectedAvatarFile = null;
    const preview = document.getElementById(
      "avatarPreview",
    ) as HTMLImageElement | null;
    if (preview) preview.src = "/assets/initial-avater.png";
    clearModalError();
    modal?.classList.add("hidden");
  };

  document
    .getElementById("addTrainerBtn")
    ?.addEventListener("click", openModal);
  cancelBtn?.addEventListener("click", closeModal);
  overlay?.addEventListener("click", closeModal);

  // --- アバター画像選択 ---
  const avatarArea = document.getElementById("avatarUploadArea");
  const avatarInput = document.getElementById(
    "trainerAvatarInput",
  ) as HTMLInputElement | null;
  avatarArea?.addEventListener("click", () => avatarInput?.click());
  avatarInput?.addEventListener("change", () => {
    const file = avatarInput.files?.[0];
    if (!file) return;
    // ファイルサイズチェック（5MB上限）
    if (file.size > 5 * 1024 * 1024) {
      showModalError("画像は 5MB 以下にしてくださя。");
      avatarInput.value = "";
      return;
    }
    selectedAvatarFile = file;
    const reader = new FileReader();
    reader.onload = (e): void => {
      const preview = document.getElementById(
        "avatarPreview",
      ) as HTMLImageElement | null;
      if (preview && e.target?.result) {
        preview.src = e.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  });

  // --- モーダル 登録 / 保存 ---
  submitBtn?.addEventListener("click", async () => {
    const name = nameInput?.value.trim();
    const lineUserId = lineIdInput?.value.trim();

    // 必須入力チェック
    if (!name || !lineUserId) {
      showModalError("名前とLINE IDは必須です。");
      return;
    }

    // LINE ID 重複チェック（編集時は自分自身を除外）
    const isDuplicate = trainersData.some((t) => {
      if (trainerModalMode === "edit" && t.tempId === trainerEditTargetId)
        return false;
      return t.lineUserId === lineUserId;
    });
    if (isDuplicate) {
      showModalError("その LINE ID は既に登録されています。");
      return;
    }

    clearModalError();

    const originalText = submitBtn.textContent ?? "";
    submitBtn.disabled = true;
    submitBtn.textContent = "保存中...";

    try {
      if (trainerModalMode === "edit" && trainerEditTargetId !== null) {
        const trainer = trainersData.find(
          (t) => t.tempId === trainerEditTargetId,
        );
        if (trainer) {
          let newAvatarUrl = trainer.avatarUrl;
          // 画像が選択されている場合はアップロード
          if (selectedAvatarFile && trainer.dbId) {
            const uploadedUrl = await uploadTrainerAvatar(
              trainer.dbId,
              selectedAvatarFile,
            );
            if (uploadedUrl) newAvatarUrl = uploadedUrl;
          }
          if (trainer.dbId) {
            await updateTrainerMaster(
              trainer.dbId,
              name,
              lineUserId,
              selectedAvatarFile ? newAvatarUrl : undefined,
            );
          }
          trainer.name = name;
          trainer.lineUserId = lineUserId;
          trainer.avatarUrl = newAvatarUrl;
        }
        showToast("トレーナー情報を更新しました");
      } else {
        const newDbId = await createTrainerMaster(name, lineUserId);
        let avatarUrl = "/assets/initial-avater.png";
        // 画像が選択されている場合はアップロード（ID取得後）
        if (selectedAvatarFile && newDbId) {
          const uploadedUrl = await uploadTrainerAvatar(
            newDbId,
            selectedAvatarFile,
          );
          if (uploadedUrl) {
            await updateTrainerMaster(newDbId, name, lineUserId, uploadedUrl);
            avatarUrl = uploadedUrl;
          }
        }
        const newTrainer: Trainer = {
          dbId: newDbId,
          tempId: Date.now() + Math.random(),
          name,
          lineUserId,
          avatarUrl,
          role: "Staff",
          isOnline: false,
        };
        trainersData.unshift(newTrainer);
        showToast("トレーナーを追加しました");
      }
    } catch (err) {
      console.error("トレーナー保存失敗:", err);
      showToast("保存に失敗しました", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      closeModal();
      renderSettings();
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

// ============================================================
// 初期化（Step 3 : DB から全データを一括取得）
// ============================================================
async function init(): Promise<void> {
  setupDarkMode();
  setupMobileSidebar();

  // ローディング表示
  const container = document.getElementById("settingsContainer");
  if (container) {
    container.innerHTML = `
      <div class="flex items-center justify-center h-64 gap-3 text-slate-400">
        <svg class="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
        <span class="text-lg font-medium">読み込み中...</span>
      </div>`;
  }

  try {
    // categories テーブルからカテゴリー一覧を取得してカラーマップを構築
    const categories = await fetchCategories();
    for (const cat of categories) {
      const colorKey = CATEGORY_NAME_TO_COLOR[cat.name];
      if (colorKey) {
        categoryColorMap[colorKey] = cat.id;
      }
    }

    // 初期カテゴリー（blue = マットピラティス）のタスクと、ステージ・トレーナーを並行取得
    const initialCatId = categoryColorMap[currentCategory];
    const [dbStages, dbTasks, dbTrainers] = await Promise.all([
      fetchStages(),
      initialCatId ? fetchTasksMaster(initialCatId) : Promise.resolve([]),
      fetchTrainersMaster(),
    ]);

    stagesData = dbStages.map(dbStageToStage);
    tasksData = dbTasks.map((db) => dbTaskToTask(db, currentCategory));
    trainersData = dbTrainers.map(dbTrainerToTrainer);
  } catch (err) {
    console.error("初期データ取得失敗:", err);
    if (container) {
      container.innerHTML = `
        <div class="flex items-center justify-center h-64 text-red-500 gap-2">
          <span class="material-icons-outlined">error_outline</span>
          <span>データの読み込みに失敗しました。ページを再読み込みしてください。</span>
        </div>`;
    }
    return;
  }

  renderSettings();
}

// DOMContentLoaded時に初期化
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
