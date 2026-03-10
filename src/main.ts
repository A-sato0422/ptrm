// メインTypeScriptファイル
// ナビゲーション、画面遷移、イベントハンドリングを管理

import { supabase } from "./supabase";
import { fetchCompletedTasksByCategory, fetchMaxLevel } from "./api/client-crud";
import { initLayout, checkClientAuth } from "./page-init";

// 共通ヘッダー・ナビゲーションバーを注入
initLayout();

console.log("PTRM System Initialized");

/** ダッシュボードで取得したクライアントID（モーダルのDB取得に使用） */
let _dashboardClientId: string | null = null;

// ============================================================
// ダッシュボードデータ取得・表示
// ============================================================

/** DBカテゴリ名（日本語）から mountain の color キーへ変換 */
function categoryNameToColor(name: string): string {
  if (name.includes("ピラティス")) return "blue";
  if (name.includes("ウェイト") || name.includes("ウエイト")) return "red";
  if (name.includes("スポーツ")) return "green";
  if (name.includes("ムーブメント")) return "yellow";
  return "";
}

/** ① 4カテゴリのレベルをDBから取得して山のバッジに反映 */
function updateLevelDisplay(
  levels: Array<{ current_level: number; category_id: string; categories: { name: string } | null }>,
): void {
  const mountains = document.querySelectorAll<HTMLElement>(".mountain");
  mountains.forEach((mountain) => {
    // data-mountain の値（"blue" / "red" / "green" / "yellow"）で照合
    const colorKey = mountain.getAttribute("data-mountain") || "";
    const levelData = levels.find((l) => {
      if (!l.categories?.name) return false;
      return categoryNameToColor(l.categories.name) === colorKey;
    });
    if (!levelData) return;

    const level = levelData.current_level;
    mountain.setAttribute("data-level", String(level));
    // data-category をDBの日本語カテゴリ名で上書き（モーダルタイトルに使用）
    if (levelData.categories?.name) {
      mountain.setAttribute("data-category", levelData.categories.name);
    }
    // data-category-id をセット（モーダルのDB取得に使用）
    mountain.setAttribute("data-category-id", levelData.category_id);
    const badge = mountain.querySelector(".level-badge");
    if (badge) badge.textContent = `Lv.${level}`;
  });
}

/** ② 平均レベルと stages.level_to を比較してロックメッセージを更新 */
function updateLockMessage(
  levels: Array<{ current_level: number; categories: { name: string } | null }>,
  stages: Array<{ stage_no: number; level_to: number }>,
): void {
  const lockMsgEl = document.querySelector<HTMLElement>(".lock-message");
  if (!lockMsgEl) return;

  if (levels.length === 0) return;
  const avgLevel = levels.reduce((sum, l) => sum + l.current_level, 0) / levels.length;

  // 昇順に並び替えて、平均レベルが level_to を超えていない最初のステージを探す
  const sorted = [...stages].sort((a, b) => a.stage_no - b.stage_no);
  const nextStage = sorted.find((s) => avgLevel < s.level_to);

  if (nextStage) {
    lockMsgEl.textContent = `${nextStage.stage_no + 1}合目まであと少し`;
  } else {
    lockMsgEl.textContent = "全ステージ制覇！";
  }
}

/** ③ clients.next_goal を「次のチャレンジ項目」に反映 */
function updateNextChallenge(nextGoal: string | null): void {
  const challengeTextEl = document.querySelector<HTMLElement>(".challenge-text");
  if (!challengeTextEl) return;
  challengeTextEl.textContent = nextGoal || "トレーナーから目標が設定されると表示されます";
}

/** ④ client_tasks から宿題一覧を生成して反映 */
function updateTasksList(
  tasks: Array<{
    id: string;
    is_completed: boolean;
    tasks: { title: string; categories: { name: string } | null } | null;
  }>,
): void {
  const listEl = document.querySelector<HTMLElement>(".action-list-preview");
  if (!listEl) return;

  listEl.innerHTML = "";

  if (tasks.length === 0) {
    listEl.innerHTML = '<li class="action-item"><span class="action-text">宿題はまだ割り当てられていません</span></li>';
    return;
  }

  tasks.forEach((ct) => {
    const title = ct.tasks?.title ?? "不明なタスク";
    const categoryName = ct.tasks?.categories?.name ?? "";
    const color = categoryNameToColor(categoryName);
    const completedClass = ct.is_completed ? " completed" : "";
    const tagHtml = categoryName
      ? `<span class="action-category-tag">${categoryName}</span>`
      : "";

    const li = document.createElement("li");
    li.className = `action-item ${color}${completedClass}`;
    li.innerHTML = `${tagHtml}<span class="action-text">${title}</span>`;
    li.addEventListener("click", () => {
      window.location.href = ct.id ? `action.html#task-${ct.id}` : "action.html";
    });
    listEl.appendChild(li);
  });
}

/** ダッシュボード全データを取得して表示 */
async function loadDashboardData(): Promise<void> {
  // 認証チェック（未登録なら error.html へリダイレクト）
  const clientId = await checkClientAuth();
  if (!clientId) return;

  _dashboardClientId = clientId;

  // ① レベル・② ステージ・④ 宿題・next_goal を並列取得
  const [levelsResult, stagesResult, tasksResult, nextGoalResult] = await Promise.all([
    supabase
      .from("client_levels")
      .select("current_level, category_id, categories(name)")
      .eq("client_id", clientId),
    supabase
      .from("stages")
      .select("stage_no, level_to")
      .order("stage_no", { ascending: true }),
    supabase
      .from("client_tasks")
      .select("id, is_completed, tasks(title, categories(name))")
      .eq("client_id", clientId)
      .is("deleted_at", null)
      .order("assigned_at", { ascending: true }),
    supabase
      .from("clients")
      .select("next_goal")
      .eq("id", clientId)
      .single(),
  ]);

  // ① カテゴリレベルを山のバッジに反映
  if (levelsResult.error) {
    console.error("レベル取得エラー:", levelsResult.error.message);
  } else if (levelsResult.data) {
    // Supabaseのリレーション結果はネスト配列で返るため unknown 経由でキャスト後に正規化
    type RawLevel = { current_level: number; category_id: string; categories: { name: string }[] };
    const rawLevels = levelsResult.data as unknown as RawLevel[];
    const levels = rawLevels.map((l) => ({
      current_level: l.current_level,
      category_id: l.category_id,
      categories: Array.isArray(l.categories) ? (l.categories[0] ?? null) : l.categories,
    })) as Array<{ current_level: number; category_id: string; categories: { name: string } | null }>;

    updateLevelDisplay(levels);
    console.log("レベル取得成功:", levels);

    // ② ロックメッセージ
    if (stagesResult.error) {
      console.error("ステージ取得エラー:", stagesResult.error.message);
    } else if (stagesResult.data) {
      updateLockMessage(levels, stagesResult.data as Array<{ stage_no: number; level_to: number }>);
    }
  }

  // ③ 次のチャレンジ項目
  const nextGoal = nextGoalResult.data?.next_goal ?? null;
  updateNextChallenge(nextGoal);
  console.log("次のチャレンジ項目:", nextGoal);

  // ④ 宿題一覧
  if (tasksResult.error) {
    console.error("宿題取得エラー:", tasksResult.error.message);
  } else if (tasksResult.data) {
    type RawTask = {
      id: string;
      is_completed: boolean;
      tasks: { title: string; categories: { name: string }[] }[];
    };
    const rawTasks = tasksResult.data as unknown as RawTask[];
    const tasks = rawTasks.map((ct) => {
      const taskObj = Array.isArray(ct.tasks) ? (ct.tasks[0] ?? null) : ct.tasks;
      return {
        id: ct.id,
        is_completed: ct.is_completed,
        tasks: taskObj
          ? {
              title: taskObj.title,
              categories: Array.isArray(taskObj.categories)
                ? (taskObj.categories[0] ?? null)
                : taskObj.categories,
            }
          : null,
      };
    }) as Array<{
      id: string;
      is_completed: boolean;
      tasks: { title: string; categories: { name: string } | null } | null;
    }>;
    updateTasksList(tasks);
    console.log("宿題取得成功:", tasks);
  }
}

// ダッシュボードデータ読み込み
loadDashboardData();

// アクションアイテムのクリックイベントリスナー（action.htmlへ遷移）
const actionItems = document.querySelectorAll(".action-item");
actionItems.forEach((item) => {
  item.addEventListener("click", () => {
    const actionId = item.getAttribute("data-action-id");
    console.log("Action item clicked:", actionId);
    // action.htmlへ遷移
    window.location.href = "action.html";
  });
});

// 山のクリックイベントリスナー（詳細モーダルを表示）
const mountains = document.querySelectorAll(".mountain");
mountains.forEach((mountain) => {
  mountain.addEventListener("click", () => {
    const mountainType = mountain.getAttribute("data-mountain");
    const currentLevel = parseInt(mountain.getAttribute("data-level") || "0");
    const category = mountain.getAttribute("data-category");
    const categoryId = mountain.getAttribute("data-category-id") ?? "";

    openMountainDetailModal(mountainType!, currentLevel, category!, categoryId);
  });
});

// 山の詳細モーダルを開く関数
async function openMountainDetailModal(
  mountainType: string,
  currentLevel: number,
  category: string,
  categoryId: string,
) {
  const modal = document.getElementById("mountain-detail-modal");
  const modalTitle = document.getElementById("modal-category-title");
  const modalTasksList = document.getElementById("modal-tasks-list");
  const modalContent = document.querySelector(
    ".mountain-modal-content",
  ) as HTMLElement;

  if (!modal || !modalTitle || !modalTasksList || !modalContent) return;

  // 山の種類に応じた背景画像を設定
  const mountainImages: { [key: string]: string } = {
    blue: "./assets/yama01.png",
    red: "./assets/yama02.png",
    green: "./assets/yama03.png",
    yellow: "./assets/yama04.png",
  };
  const backgroundImage = mountainImages[mountainType];
  if (backgroundImage) {
    modalContent.style.backgroundImage = `url('${backgroundImage}')`;
  }

  // タイトルを設定
  modalTitle.textContent = category;

  // DBから完了済みタスクと最大レベルを並列取得（モーダル表示前に確定させる）
  let completedByLevel = new Map<number, { taskTitle: string; completedAt: string }[]>();
  let maxLevel = currentLevel;

  if (_dashboardClientId && categoryId) {
    [completedByLevel, maxLevel] = await Promise.all([
      fetchCompletedTasksByCategory(_dashboardClientId, categoryId),
      fetchMaxLevel(),
    ]);
  } else {
    maxLevel = await fetchMaxLevel();
  }

  // コンテンツを事前に構築（高さが確定してからモーダルを開く）
  modalTasksList.innerHTML = "";

  for (let level = 1; level <= currentLevel; level++) {
    const tasks = completedByLevel.get(level) ?? [];
    const levelSection = document.createElement("div");

    if (tasks.length === 0) {
      // 完了記録がないレベルは未開放として表示
      levelSection.className = "modal-level-section locked";
      levelSection.innerHTML = `
        <div class="modal-level-header">
          <div class="modal-level-title">🔒 Lv.${level}</div>
          <span class="modal-level-status locked">未開放</span>
        </div>
        <p class="modal-locked-message">このレベルはまだ秘密です</p>
      `;
    } else {
      levelSection.className = "modal-level-section completed";
      const taskRows = tasks
        .map(
          (t) => `
          <div class="modal-task-info">
            <div class="modal-task-name">${t.taskTitle}</div>
            <div class="modal-task-date">達成日: ${t.completedAt}</div>
          </div>`,
        )
        .join("");
      levelSection.innerHTML = `
        <div class="modal-level-header">
          <div class="modal-level-title">✓ Lv.${level}</div>
          <span class="modal-level-status completed">達成</span>
        </div>
        ${taskRows}
      `;
    }
    modalTasksList.appendChild(levelSection);
  }

  // 現在レベルより上は未開放（最大レベルまで全て表示）
  const upperBound = maxLevel > currentLevel ? maxLevel : currentLevel + 1;
  for (let level = currentLevel + 1; level <= upperBound; level++) {
    const lockedSection = document.createElement("div");
    lockedSection.className = "modal-level-section locked";
    lockedSection.innerHTML = `
      <div class="modal-level-header">
        <div class="modal-level-title">🔒 Lv.${level}</div>
        <span class="modal-level-status locked">未開放</span>
      </div>
      <p class="modal-locked-message">このレベルはまだ秘密です</p>
    `;
    modalTasksList.appendChild(lockedSection);
  }

  // コンテンツが確定してからモーダルを表示（アニメーションは1回だけ）
  modal.style.display = "flex";
  modal.classList.remove("closing");
}

// 山の詳細モーダルを閉じる関数
function closeMountainDetailModal() {
  const modal = document.getElementById("mountain-detail-modal");
  if (!modal) return;

  // closing クラスを追加してアニメーション開始
  modal.classList.add("closing");

  // アニメーション完了後にモーダルを非表示
  setTimeout(() => {
    modal.style.display = "none";
    modal.classList.remove("closing");
  }, 300);
}

// モーダルの閉じるボタン
const mountainModalCloseBtn = document.querySelector(".mountain-modal-close");
mountainModalCloseBtn?.addEventListener("click", closeMountainDetailModal);

// モーダル背景クリックで閉じる
const mountainModalOverlay = document.querySelector(".mountain-modal-overlay");
mountainModalOverlay?.addEventListener("click", closeMountainDetailModal);

// チェックボックスのイベントリスナー（その他のチェックボックス用）
const checkboxes = document.querySelectorAll(".task-checkbox");
checkboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", (e) => {
    const target = e.target as HTMLInputElement;
    const taskItem = target.closest(".task-item");

    if (taskItem) {
      if (target.checked) {
        taskItem.classList.add("completed");
      } else {
        taskItem.classList.remove("completed");
      }
    }

    // TODO: Supabaseにデータを保存
    console.log("Task status changed:", {
      checked: target.checked,
      taskId: target.id,
    });
  });
});

// 好み評価ボタンのイベントリスナー
const preferenceButtons = document.querySelectorAll(".preference-btn");
preferenceButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    const target = e.currentTarget as HTMLElement;
    const parentSection = target.closest(".preference-section");

    if (parentSection) {
      // 同じグループ内の他のボタンの active クラスを削除
      const siblingButtons = parentSection.querySelectorAll(".preference-btn");
      siblingButtons.forEach((btn) => btn.classList.remove("active"));

      // クリックされたボタンに active クラスを追加
      target.classList.add("active");
    }

    // TODO: Supabaseにデータを保存
    console.log("Preference changed:", {
      preference: target.textContent?.trim(),
    });
  });
});

// 完了ボタンのイベントリスナー
const completeButtons = document.querySelectorAll(".complete-btn");
completeButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    const target = e.currentTarget as HTMLElement;
    const taskItem = target.closest(".task-item") as HTMLElement;
    const taskId = taskItem?.getAttribute("data-task-id");
    const isCompleted = taskItem?.getAttribute("data-completed") === "true";

    if (isCompleted) {
      // 編集ボタンの場合、モーダルを開く
      openPreferenceModal(taskId!);
    } else {
      // 完了ボタンの場合、モーダルを開く
      openPreferenceModal(taskId!);
    }
  });
});

// モーダルを開く関数
function openPreferenceModal(taskId: string) {
  const modal = document.getElementById("preference-modal");
  const formTaskIdInput = document.getElementById(
    "form-task-id",
  ) as HTMLInputElement;

  if (modal && formTaskIdInput) {
    formTaskIdInput.value = taskId;
    modal.style.display = "flex";

    // モーダル内の好み評価ボタンをリセット
    const modalPreferenceButtons = modal.querySelectorAll(".preference-btn");
    modalPreferenceButtons.forEach((btn) => btn.classList.remove("active"));
  }
}

// モーダルを閉じる関数
function closePreferenceModal() {
  const modal = document.getElementById("preference-modal");
  if (modal) {
    modal.style.display = "none";
  }
}

// モーダルの閉じるボタン
const modalCloseBtn = document.querySelector(".modal-close");
modalCloseBtn?.addEventListener("click", closePreferenceModal);

// モーダル背景クリックで閉じる
const modal = document.getElementById("preference-modal");
modal?.addEventListener("click", (e) => {
  if (e.target === modal) {
    closePreferenceModal();
  }
});

// 好み評価フォームの送信
const preferenceForm = document.getElementById("preference-form");
preferenceForm?.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = new FormData(e.target as HTMLFormElement);
  const taskId = formData.get("taskId") as string;
  const activeBtn = document.querySelector(".modal .preference-btn.active");
  const preference = activeBtn?.getAttribute("data-value");

  if (!preference) {
    alert("好み評価を選択してください");
    return;
  }

  // タスクを完了状態に更新
  const taskItem = document.querySelector(
    `[data-task-id="${taskId}"]`,
  ) as HTMLElement;
  if (taskItem) {
    taskItem.setAttribute("data-completed", "true");
    taskItem.classList.add("completed");

    const completeBtn = taskItem.querySelector(".complete-btn") as HTMLElement;
    if (completeBtn) {
      completeBtn.textContent = "編集";
    }
  }

  // モーダルを閉じる
  closePreferenceModal();

  // 成功メッセージを表示
  showSuccessMessage();

  // TODO: Supabaseにデータを保存
  console.log("Task completed:", {
    taskId,
    preference,
  });
});

// 成功メッセージを表示する関数
function showSuccessMessage() {
  const successMessage = document.getElementById("success-message");
  if (successMessage) {
    successMessage.style.display = "block";

    // 3秒後に自動で非表示
    setTimeout(() => {
      successMessage.style.display = "none";
    }, 3000);
  }
}

// 予約ボタンのイベントリスナー
const reservationButtons = document.querySelectorAll(
  ".reservation-btn, .view-detail-btn",
);
reservationButtons.forEach((button) => {
  button.addEventListener("click", () => {
    // 外部予約システム（Azzist）へ遷移
    window.open("https://azzist.jp/schedule/60", "_blank");
  });
});

// 動画リンクのイベントリスナー
const videoLinks = document.querySelectorAll(".video-link");
videoLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    // TODO: 動画ページの実装
    alert("動画ページは今後実装予定です");
  });
});

// プロフィールアクションボタン
const profileActionButtons = document.querySelectorAll(".profile-action-btn");
profileActionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const buttonText = button.textContent?.trim();
    console.log("Profile action clicked:", buttonText);
    // TODO: 各機能の実装
    alert(`${buttonText}は今後実装予定です`);
  });
});

// PWA対応の準備
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    // TODO: Service Workerの登録
    console.log("Service Worker support detected");
  });
}

// LIFF初期化の準備
declare const liff: any;

async function initializeLIFF() {
  try {
    // TODO: LIFF IDを環境変数から取得
    const liffId = import.meta.env.VITE_LIFF_ID;

    if (typeof liff !== "undefined" && liffId) {
      await liff.init({ liffId });

      if (!liff.isLoggedIn()) {
        liff.login();
      } else {
        // ユーザー情報の取得
        const profile = await liff.getProfile();
        console.log("User profile:", profile);
        // TODO: Supabaseにユーザー情報を保存
      }
    }
  } catch (error) {
    console.error("LIFF initialization failed:", error);
  }
}

// LIFF初期化（本番環境のみ）
if (import.meta.env.PROD) {
  initializeLIFF();
}

// エクスポート
export { initializeLIFF };
