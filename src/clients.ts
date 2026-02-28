import { supabase } from "./supabase";
import { CATEGORY_COLOR_MAP, DEFAULT_AVATAR_URL, Client } from "./shared";

// Supabaseから取得したデータを表示用Clientに変換する
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbClientToDisplay(dbClient: any): Client {
  // レベルマッピング
  const levels = { blue: 0, red: 0, green: 0, yellow: 0 };
  for (const cl of dbClient.client_levels || []) {
    const colorKey = CATEGORY_COLOR_MAP[cl.categories?.name];
    if (colorKey) levels[colorKey] = cl.current_level;
  }

  // 最新メモ（updated_at降順でソート）
  const sortedMemos = [...(dbClient.trainer_memos || [])].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
  const lastMemo = sortedMemos[0]?.content?.slice(0, 20) || "";

  // タスクマッピング
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentTasks = (dbClient.client_tasks || [])
    .filter((ct: any) => ct.tasks)
    .map((ct: any, idx: number) => ({
      id: idx + 1,
      title: ct.tasks.title,
      completed: ct.is_completed,
    }));

  // やりたい/やりたくないマッピング（will_matrix）
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const likes = (dbClient.will_matrix || [])
    .filter((w: any) => w.like_status === 1)
    .map((w: any) => w.tasks?.title)
    .filter(Boolean)
    .join("、");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dislikes = (dbClient.will_matrix || [])
    .filter((w: any) => w.like_status === -1)
    .map((w: any) => w.tasks?.title)
    .filter(Boolean)
    .join("、");

  return {
    id: dbClient.id,
    name: dbClient.display_name || "名前未設定",
    avatarUrl: dbClient.profile_image_url || DEFAULT_AVATAR_URL,
    lastUpdate: new Date(dbClient.updated_at).toLocaleDateString("ja-JP"),
    lastMemo,
    trainerName: (sortedMemos[0] as any)?.trainers?.display_name || "",
    courseName: dbClient.course_name || "",
    levels,
    nextGoal: "",
    previousNote: sortedMemos[0]?.content || "",
    currentTasks,
    preferences: { likes, dislikes },
  };
}

// ロード済みの顧客データ（検索フィルタ用）
let allClients: Client[] = [];

// ページネーション状態
const PAGE_SIZE = 10;
let currentPage = 1;
let currentFiltered: Client[] = [];

// Supabaseから顧客一覧を取得する
async function loadClients(): Promise<void> {
  const container = document.getElementById("clientsContainer");
  if (container) {
    container.innerHTML =
      '<p class="text-center py-12 text-slate-400">読み込み中...</p>';
  }

  const { data, error } = await supabase
    .from("clients")
    .select(
      `
      id,
      display_name,
      profile_image_url,
      course_name,
      updated_at,
      client_levels (
        current_level,
        categories ( name )
      ),
      trainer_memos (
        content,
        created_at,
        trainers ( display_name )
      ),
      client_tasks (
        is_completed,
        tasks (
          id,
          title
        )
      ),
      will_matrix (
        like_status,
        tasks ( title )
      )
    `,
    )
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("顧客一覧取得エラー:", error.message);
    if (container) {
      container.innerHTML = `<p class="text-center py-12 text-red-400">データの取得に失敗しました: ${error.message}</p>`;
    }
    return;
  }

  allClients = (data || []).map(mapDbClientToDisplay);
  populateCourseFilter(allClients);
  currentFiltered = allClients;
  currentPage = 1;
  renderClients(currentFiltered);
}

// 顧客カードを生成する関数
function createClientCard(client: Client): string {
  const tasksHTML = client.currentTasks
    .map(
      (task) => `
        <li class="flex items-center gap-2 text-sm">
          <span class="material-icons-outlined text-base ${task.completed ? "text-green-500" : "text-slate-400"}">
            ${task.completed ? "check_circle" : "radio_button_unchecked"}
          </span>
          <span class="text-slate-600 dark:text-slate-400 ${task.completed ? "line-through" : ""}">
            ${task.title}
          </span>
        </li>
      `,
    )
    .join("");

  return `
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div class="p-6">
        <div class="grid grid-cols-12 gap-6">
          <!-- Client Info -->
          <div class="col-span-12 md:col-span-3 border-r border-slate-100 dark:border-slate-800 pr-6">
            <div class="flex items-center gap-4 mb-4">
              <img 
                alt="${client.name}" 
                class="w-16 h-16 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800" 
                src="${client.avatarUrl}"
                onerror="this.onerror=null; this.src=window.DEFAULT_AVATAR_URL"
              />
              <div>
                <h3 class="font-bold text-lg">${client.name}</h3>
                <p class="text-xs text-slate-500">顧客 ID: ${client.id}</p>
              </div>
            </div>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-500">進捗状況更新:</span>
                <span class="font-medium">${client.lastUpdate}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">前回メモ:</span>
                <span class="font-medium truncate max-w-[100px]">${client.lastMemo}</span>
              </div>
            </div>
            <button 
              class="w-full mt-4 py-2 text-sm font-medium text-primary bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 transition-colors"
              data-client-id="${client.id}"
              onclick="navigateToClientDetail('${client.id}')"
            >
              詳細を見る
            </button>
          </div>

          <!-- Progress and Tasks -->
          <div class="col-span-12 md:col-span-6 space-y-4">
            <div>
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">進捗状況</h4>
              <div class="flex flex-wrap gap-2">
                <span class="px-2 py-1 bg-blue-600 text-white text-[10px] font-bold rounded">
                  Mat Pilates: LV.${client.levels.blue}
                </span>
                <span class="px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded">
                  Weight Training: LV.${client.levels.red}
                </span>
                <span class="px-2 py-1 bg-green-600 text-white text-[10px] font-bold rounded">
                  Sports Training: LV.${client.levels.green}
                </span>
                <span class="px-2 py-1 bg-yellow-500 text-white text-[10px] font-bold rounded">
                  Movement Training: LV.${client.levels.yellow}
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-2">Next: ${client.nextGoal}</p>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">前回のメモ</h4>
                <p class="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  ${client.previousNote}
                </p>
              </div>
              <div>
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">現在の課題</h4>
                <ul class="space-y-1">
                  ${tasksHTML}
                </ul>
              </div>
            </div>
          </div>

          <!-- Preferences -->
          <div class="col-span-12 md:col-span-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">嗜好確認</h4>
            <div class="space-y-3">
              <div class="flex items-start gap-3">
                <span class="material-icons-outlined text-green-500 text-lg">thumb_up</span>
                <div>
                  <p class="text-xs font-bold text-slate-500">やりたい</p>
                  <p class="text-xs font-medium">${client.preferences.likes}</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <span class="material-icons-outlined text-red-400 text-lg">thumb_down</span>
                <div>
                  <p class="text-xs font-bold text-slate-500">やりたくない</p>
                  <p class="text-xs font-medium">${client.preferences.dislikes}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// 顧客一覧をレンダリングする関数
function renderClients(clients: Client[]): void {
  const container = document.getElementById("clientsContainer");
  if (!container) return;

  if (clients.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12">
        <span class="material-icons-outlined text-6xl text-slate-300 dark:text-slate-700">people_outline</span>
        <p class="mt-4 text-slate-500">該当する顧客が見つかりませんでした</p>
      </div>
    `;
    updatePaginationUI(0, 0);
    return;
  }

  const totalCount = clients.length;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, totalCount);
  const pageClients = clients.slice(start, end);

  container.innerHTML = pageClients
    .map((client) => createClientCard(client))
    .join("");

  updatePaginationUI(totalCount, totalPages);
}

// 件数表示・ページボタンを更新する
function updatePaginationUI(totalCount: number, totalPages: number): void {
  const paginationContainer = document.getElementById("paginationContainer");
  const countEl = document.getElementById("clientCount");
  const buttonsEl = document.getElementById("paginationButtons");
  if (!paginationContainer || !countEl || !buttonsEl) return;

  if (totalCount === 0) {
    paginationContainer.classList.add("hidden");
    return;
  }

  paginationContainer.classList.remove("hidden");

  const start = (currentPage - 1) * PAGE_SIZE + 1;
  const end = Math.min(currentPage * PAGE_SIZE, totalCount);
  countEl.textContent = `全 ${totalCount} 件中 ${start}–${end} 件を表示`;

  // ページボタン生成
  const btnBase =
    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors";
  const btnActive = "bg-primary text-white";
  const btnInactive =
    "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800";
  const btnDisabled =
    "bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 border border-slate-200 dark:border-slate-700 cursor-not-allowed";

  let html = `
    <button id="pgPrev" class="${btnBase} ${currentPage === 1 ? btnDisabled : btnInactive}" ${currentPage === 1 ? "disabled" : ""}>
      <span class="material-icons-outlined text-base leading-none">chevron_left</span>
    </button>`;

  for (let p = 1; p <= totalPages; p++) {
    // 中数大の場合は處省表示
    if (
      totalPages > 7 &&
      p > 2 &&
      p < totalPages - 1 &&
      Math.abs(p - currentPage) > 1
    ) {
      if (p === 3 || p === totalPages - 2) {
        html += `<span class="px-2 text-slate-400">…</span>`;
      }
      continue;
    }
    html += `<button data-page="${p}" class="${btnBase} ${p === currentPage ? btnActive : btnInactive}">${p}</button>`;
  }

  html += `
    <button id="pgNext" class="${btnBase} ${currentPage === totalPages ? btnDisabled : btnInactive}" ${currentPage === totalPages ? "disabled" : ""}>
      <span class="material-icons-outlined text-base leading-none">chevron_right</span>
    </button>`;

  buttonsEl.innerHTML = html;

  // ページボタンのイベント
  buttonsEl
    .querySelectorAll<HTMLButtonElement>("[data-page]")
    .forEach((btn) => {
      btn.addEventListener("click", () => {
        currentPage = parseInt(btn.dataset.page!);
        renderClients(currentFiltered);
        scrollToTop();
      });
    });
  document.getElementById("pgPrev")?.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderClients(currentFiltered);
      scrollToTop();
    }
  });
  document.getElementById("pgNext")?.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderClients(currentFiltered);
      scrollToTop();
    }
  });
}

// コンテンツエリアの先頭にスクロール
function scrollToTop(): void {
  document
    .getElementById("contentArea")
    ?.scrollTo({ top: 0, behavior: "smooth" });
}

// 顧客詳細画面への遷移
function navigateToClientDetail(clientId: string): void {
  console.log(`Navigating to client detail: ${clientId}`);
  window.location.href = `client-detail.html?id=${clientId}`;
}

// グローバルスコープに関数を追加
(window as any).navigateToClientDetail = navigateToClientDetail;

// 担当者・コースのフィルター選択肢を動的生成
// コースフィルターの選択肢をクライアントデータから生成
function populateCourseFilter(clients: Client[]): void {
  const courseFilter = document.getElementById(
    "courseFilter",
  ) as HTMLSelectElement;
  if (!courseFilter) return;

  const currentCourse = courseFilter.value;
  const courses = [
    ...new Set(clients.map((c) => c.courseName).filter(Boolean)),
  ].sort();
  courseFilter.innerHTML =
    `<option value="">コース: 全て</option>` +
    courses.map((c) => `<option value="${c}">${c}</option>`).join("");
  courseFilter.value = currentCourse;
}

// trainersテーブルから担当者フィルターの選択肢を生成
async function populateTrainerFilter(): Promise<void> {
  const trainerFilter = document.getElementById(
    "trainerFilter",
  ) as HTMLSelectElement;
  if (!trainerFilter) return;

  const { data, error } = await supabase
    .from("trainers")
    .select("display_name")
    .eq("is_active", true)
    .order("display_name");

  if (error) {
    console.error("トレーナー一覧取得エラー:", error.message);
    return;
  }

  const current = trainerFilter.value;
  trainerFilter.innerHTML =
    `<option value="">担当者: 全員</option>` +
    (data || [])
      .map((t) => t.display_name)
      .filter(Boolean)
      .map((name) => `<option value="${name}">${name}</option>`)
      .join("");
  trainerFilter.value = current;
}

// 検索・担当者・コースの複合フィルタ適用
function applyFilters(): void {
  const searchQuery = (
    (document.getElementById("searchInput") as HTMLInputElement)?.value ?? ""
  ).toLowerCase();
  const selectedTrainer =
    (document.getElementById("trainerFilter") as HTMLSelectElement)?.value ??
    "";
  const selectedCourse =
    (document.getElementById("courseFilter") as HTMLSelectElement)?.value ?? "";

  currentFiltered = allClients.filter((client) => {
    const matchesSearch =
      !searchQuery ||
      client.name.toLowerCase().includes(searchQuery) ||
      client.id.toLowerCase().includes(searchQuery);
    const matchesTrainer =
      !selectedTrainer || client.trainerName === selectedTrainer;
    const matchesCourse =
      !selectedCourse || client.courseName === selectedCourse;
    return matchesSearch && matchesTrainer && matchesCourse;
  });

  currentPage = 1; // フィルタ変更時は常に1ページ目に戻す
  renderClients(currentFiltered);
}

// 検索機能
function setupSearch(): void {
  const searchInput = document.getElementById(
    "searchInput",
  ) as HTMLInputElement;
  if (!searchInput) return;
  searchInput.addEventListener("input", applyFilters);
}

// フィルタードロップダウンのイベント設定
function setupFilters(): void {
  document
    .getElementById("trainerFilter")
    ?.addEventListener("change", applyFilters);
  document
    .getElementById("courseFilter")
    ?.addEventListener("change", applyFilters);
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

  const navLinks = sidebar.querySelectorAll("a[href]");
  navLinks.forEach((link) => {
    link.addEventListener("click", closeSidebar);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1024) {
      overlay.classList.add("hidden");
      document.body.classList.remove("overflow-hidden");
    }
  });
}

// 新規クライアント登録モーダルの制御
function setupAddClientModal(): void {
  const modal = document.getElementById("addClientModal")!;
  const form = document.getElementById("addClientForm") as HTMLFormElement;
  const errorEl = document.getElementById("addClientError")!;

  const openModal = (): void => {
    form.reset();
    errorEl.classList.add("hidden");
    errorEl.textContent = "";
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    document.getElementById("fieldDisplayName")?.focus();
  };

  const closeModal = (): void => {
    modal.classList.remove("flex");
    modal.classList.add("hidden");
  };

  document
    .getElementById("openAddClientModal")
    ?.addEventListener("click", openModal);
  document
    .getElementById("closeAddClientModal")
    ?.addEventListener("click", closeModal);
  document
    .getElementById("cancelAddClient")
    ?.addEventListener("click", closeModal);
  document
    .getElementById("modalOverlay")
    ?.addEventListener("click", closeModal);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const displayName = (
      document.getElementById("fieldDisplayName") as HTMLInputElement
    ).value.trim();
    const lineUserId = (
      document.getElementById("fieldLineUserId") as HTMLInputElement
    ).value.trim();
    const courseName = (
      document.getElementById("fieldCourseName") as HTMLInputElement
    ).value.trim();

    // バリデーション
    if (!displayName || !lineUserId) {
      errorEl.textContent = "表示名とLINEユーザーIDは必須です。";
      errorEl.classList.remove("hidden");
      return;
    }

    // ローディング状態
    const btnText = document.getElementById("addClientBtnText")!;
    const btnSpinner = document.getElementById("addClientBtnSpinner")!;
    const submitBtn = form.querySelector(
      '[type="submit"]',
    ) as HTMLButtonElement;
    btnText.textContent = "登録中...";
    btnSpinner.classList.remove("hidden");
    submitBtn.disabled = true;
    errorEl.classList.add("hidden");

    try {
      // ① clients テーブルにINSERT
      const { data: newClient, error: insertError } = await supabase
        .from("clients")
        .insert({
          display_name: displayName,
          line_user_id: lineUserId,
          course_name: courseName || null,
        })
        .select("id")
        .single();

      if (insertError) {
        // LINE ID重複チェック
        const msg =
          insertError.code === "23505"
            ? "このLINEユーザーIDはすでに登録されています。"
            : `登録に失敗しました: ${insertError.message}`;
        errorEl.textContent = msg;
        errorEl.classList.remove("hidden");
        return;
      }

      // ② categories を全件取得して client_levels に4件INSERT
      const { data: categories, error: catError } = await supabase
        .from("categories")
        .select("id");

      if (catError || !categories) {
        errorEl.textContent = "カテゴリ取得に失敗しました。";
        errorEl.classList.remove("hidden");
        return;
      }

      const levelRows = categories.map((cat) => ({
        client_id: newClient.id,
        category_id: cat.id,
        current_level: 1,
      }));

      const { error: levelError } = await supabase
        .from("client_levels")
        .insert(levelRows);

      if (levelError) {
        errorEl.textContent = `レベル初期化に失敗しました: ${levelError.message}`;
        errorEl.classList.remove("hidden");
        return;
      }

      // 成功 → モーダルを閉じて一覧を再取得
      closeModal();
      await loadClients();
    } finally {
      btnText.textContent = "登録する";
      btnSpinner.classList.add("hidden");
      submitBtn.disabled = false;
    }
  });
}

// 初期化処理
async function init(): Promise<void> {
  console.log("Initializing clients page...");
  setupSearch();
  setupFilters();
  setupDarkMode();
  setupMobileSidebar();
  setupAddClientModal();
  // 担当者フィルターとクライアント一覧を並列取得
  await Promise.all([populateTrainerFilter(), loadClients()]);
}

// DOMContentLoaded時に初期化
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
