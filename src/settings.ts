// このファイルをモジュールとして扱う
export {};

// ステージの型定義
interface Stage {
  id: number;
  level: string;
  name: string;
  description: string;
  levelThreshold: number; // このステージをクリアするための最低レベル（全カテゴリーがこの値を超えたら次ステージへ）
}

// タスクの型定義
interface Task {
  id: number;
  category: "blue" | "red" | "green" | "yellow";
  name: string;
  youtubeUrl: string;
  reason: string;
}

// トレーナーの型定義
interface Trainer {
  id: number;
  name: string;
  email: string;
  avatarUrl: string;
  role: "Head" | "Staff";
  isOnline: boolean;
}

// サンプルステージデータ
const stagesData: Stage[] = [
  {
    id: 1,
    level: "1合目",
    name: "カウンセリング前",
    description: "お問い合わせ後、体験予約の調整を行っている段階",
    levelThreshold: 5,
  },
  {
    id: 2,
    level: "2合目",
    name: "体験・体験待ち",
    description: "体験レッスンを予約済み、または体験が完了し検討中の段階",
    levelThreshold: 10,
  },
  {
    id: 3,
    level: "3合目",
    name: "初期・導入期",
    description: "入会後1〜2ヶ月。基本動作の習得と習慣化を目指す段階",
    levelThreshold: 15,
  },
  {
    id: 4,
    level: "4合目",
    name: "成長期",
    description: "3〜6ヶ月。動作の質が向上し、目標達成に向けて安定した進捗",
    levelThreshold: 20,
  },
  {
    id: 5,
    level: "5合目",
    name: "習熟期",
    description: "6〜12ヶ月。自立したトレーニングが可能になる段階",
    levelThreshold: 25,
  },
  {
    id: 6,
    level: "6合目",
    name: "マスター期",
    description: "1年以上。高度な技術習得と長期的な習慣の確立",
    levelThreshold: 30,
  },
];

// サンプルタスクデータ
const tasksData: Task[] = [
  {
    id: 1,
    category: "blue",
    name: "ペルビックティルト",
    youtubeUrl: "https://www.youtube.com/watch?v=example1",
    reason: "骨盤の分節的な動きと、ニュートラルポジションの認識を促すため。",
  },
  {
    id: 2,
    category: "blue",
    name: "3D呼吸",
    youtubeUrl: "",
    reason: "肋骨の広がりを意識し、深い呼吸を通じてコアの安定化を図るため。",
  },
  {
    id: 3,
    category: "blue",
    name: "チェストリフト",
    youtubeUrl: "",
    reason: "腹部の安定性を保ちながら、胸椎の屈曲可動域を確保するため。",
  },
  {
    id: 4,
    category: "blue",
    name: "シングルレッグストレッチ",
    youtubeUrl: "https://www.youtube.com/watch?v=leg_stretch",
    reason: "骨盤の安定性を維持しながら股関節を動かす能力を養うため。",
  },
  {
    id: 5,
    category: "red",
    name: "スクワット",
    youtubeUrl: "",
    reason: "下半身の基礎筋力を構築し、日常動作の質を向上させるため。",
  },
  {
    id: 6,
    category: "red",
    name: "デッドリフト",
    youtubeUrl: "",
    reason: "後面連鎖の強化と正しいヒンジ動作の習得のため。",
  },
  {
    id: 7,
    category: "green",
    name: "ラダートレーニング",
    youtubeUrl: "",
    reason: "俊敏性と協調性を向上させ、スポーツパフォーマンスを高めるため。",
  },
  {
    id: 8,
    category: "yellow",
    name: "バランスボードトレーニング",
    youtubeUrl: "",
    reason: "体幹の安定性と固有受容感覚を向上させるため。",
  },
];

// サンプルトレーナーデータ
const trainersData: Trainer[] = [
  {
    id: 1,
    name: "田中 美咲",
    email: "m.tanaka@gympro.jp",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA2gTAkNMGayh0iynd3OWRaCdhILQkmby4SAH3bPE8hRjqPflU0bR8nxFVmir1TzGWzFUE1FZ6sOX_izYs-EwbRPpL_f63ttrM0He29yqiZ1paaq9ESwxyVvytRl0z2JI5mFsGWAtE7WPYqbMN8HDmv2a0L7FWOJ47TSGQ2Xy75qfiXQLApROvZXxCBcW_J69NezHEi12vrfI93mkVmYY5aEFqWnz6M1vvccDjAI22gkbg8pwk68rj7oXs2agflbd_UstlIQWtkNxk",
    role: "Head",
    isOnline: true,
  },
  {
    id: 2,
    name: "佐藤 健太",
    email: "k.sato@gympro.jp",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAoBZf-C9avRaokbjftgmHxHPKrS7ZBSbJpeNLPBfZon1mDSmIgzj8qVCPrGY-9Rwx1LFgITBVnJVQ9_p56j3IXkN_Ud2gD2Vj_5r01PyrThZtlqQZeg1_-wWNEljSYTYGh66CC9QJ4Z6IXFMsFqZvhBjswa3FnWF5Atob7O_Mupq2lmEOb20-2y6uwYbwS9mCXlOPLbirM3eHLyOH0-fMXOrfq9hg847gjaZHRm_7V4cfVg5pk5lJ3VdcGQ4qz1zcfaeN0ux3jEHk",
    role: "Staff",
    isOnline: false,
  },
  {
    id: 3,
    name: "高橋 愛理",
    email: "a.takahashi@gympro.jp",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBZ2q0OJ2u0fG8VfrrC8bRxqq6vcABvxtoO4ogAfDpIZ0O2hsx-8EUutJzXzCK9YhSO4dMz3TJQq59jyPAXbxyhU0CmIOR7BU0FVblJK9GhIR1qyBkcyaHehsSWM6PG1JjQ4DwWG6k1DYWPQLltYlgnfrMjui4vF1PGpy41u-x158OeAXd_78w69RnPEB_m8hvzcGz-RKHyAjsAsDQb7AN3uQRKzV8j77MQJXEHl99w1AuzKpNafYDM6gvRp2ObFn1WleEUqd7R_0M",
    role: "Staff",
    isOnline: true,
  },
  {
    id: 4,
    name: "山本 太郎",
    email: "t.yamamoto@gympro.jp",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAXEOg_iYS6LRYZdmYsddpvMq1b1NLpiwiBqsWwnq6fjeMuXE3I65zj6J8vL1QveMdUvcox_fMUJpAK45iRJoWmlGEt4EMAy98rqLJNY6jcytcf9FnzNVMgrVbPYcEW4PRYa31ShXRUcNw8U9OUSK9z243YfaZeoLn3NmDBWU25J9LM5H659zpPHMF0gnRgvcoo1RiOpqh7VmorM2A-kuO_Zek0Sd4zJpqZ4wMmH949oAiukXk-07aAf1tv20p4iY0D8gpkh6cI8Hk",
    role: "Staff",
    isOnline: true,
  },
  {
    id: 5,
    name: "鈴木 花子",
    email: "h.suzuki@gympro.jp",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCOTmHNB0ZGcIs7hqgp3jVkx0h_A8bS9jIPtjq4JilvCwWCfrthpclirCPZIrj4PfMO3A2rNy-M1KCda_jq7iLPtk-xNVFKZqippajxl7L2xfxi8doWUcU-zk4aX93tYV02_QfZC2HwXPKswxrZ56baNNmN5NL-TZPATuQQbZb2gF4A5g8_V9T3K4MRarGpZjflvueHtTm9OMlGyV2Z1fOTeBP-g4SoHTzZhRhacx91Q-QBGpm1HJJapLAJvlTqaonOuMLfXzkByEI",
    role: "Staff",
    isOnline: false,
  },
];

// 現在選択中のカテゴリー
let currentCategory: "blue" | "red" | "green" | "yellow" = "blue";

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
                <span class="material-icons-outlined text-slate-300 cursor-move">drag_indicator</span>
            </div>
            <div class="space-y-4">
                <div>
                    <label class="block text-xs font-medium text-slate-500 mb-1">ステージ名</label>
                    <input 
                        class="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-sm stage-name" 
                        type="text" 
                        value="${stage.name}"
                        data-stage-id="${stage.id}"
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
                                data-stage-id="${stage.id}"
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
                        data-stage-id="${stage.id}"
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
                        data-task-id="${task.id}"
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
                            data-task-id="${task.id}"
                        />
                    </div>
                </div>
            </div>
            <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">意義 / なぜ行うのか (Why)</label>
                <textarea 
                    class="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:bg-white dark:focus:bg-slate-900 transition-colors task-reason" 
                    rows="2"
                    data-task-id="${task.id}"
                >${task.reason}</textarea>
            </div>
            <div class="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button class="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 cursor-move">
                    <span class="material-icons-outlined text-lg">drag_handle</span>
                </button>
                <button class="p-1.5 text-slate-400 hover:text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 task-delete" data-task-id="${task.id}">
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
  const onlineStatusColor = trainer.isOnline ? "bg-green-500" : "bg-slate-300";
  const roleBadgeClass =
    trainer.role === "Head"
      ? "text-primary bg-primary/10"
      : "text-slate-500 bg-slate-100 dark:bg-slate-800";

  return `
        <div class="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center gap-4">
            <div class="relative">
                <img alt="${trainer.name}" class="w-12 h-12 rounded-full object-cover border border-slate-100 dark:border-slate-700" src="${trainer.avatarUrl}" />
                <div class="absolute bottom-0 right-0 w-3 h-3 ${onlineStatusColor} border-2 border-white dark:border-slate-900 rounded-full"></div>
            </div>
            <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                    <h4 class="font-bold truncate text-sm">${trainer.name}</h4>
                    <span class="text-[10px] font-bold ${roleBadgeClass} px-1.5 py-0.5 rounded uppercase">${trainer.role}</span>
                </div>
                <p class="text-xs text-slate-500 truncate">${trainer.email}</p>
            </div>
            <button class="text-slate-400 hover:text-slate-600 p-1 trainer-menu" data-trainer-id="${trainer.id}">
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
                    <div class="flex items-center justify-between mb-6">
                        <div>
                            <h2 class="text-2xl font-bold flex items-center gap-2">
                                <span class="material-icons-outlined text-primary">terrain</span>
                                ステージ管理
                            </h2>
                            <p class="text-slate-500 text-sm mt-1">顧客の進捗状況を定義する「1合目〜6合目」の各ステップを編集します。</p>
                        </div>
                        <button id="saveStagesBtn" class="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-sm flex items-center gap-2">
                            <span class="material-icons-outlined text-sm">save</span>
                            変更を保存
                        </button>
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
                        <div class="flex gap-2">
                            <button class="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg font-semibold hover:bg-slate-200 transition-colors flex items-center gap-2 text-sm">
                                <span class="material-icons-outlined text-sm">file_download</span>
                                エクスポート
                            </button>
                            <button id="saveTasksBtn" class="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-sm flex items-center gap-2 text-sm">
                                <span class="material-icons-outlined text-sm">save</span>
                                設定を保存
                            </button>
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
    `;

  // イベントリスナーを設定
  setupStageEventListeners();
  setupTaskEventListeners();
  setupCategoryTabs();
  setupTrainerEventListeners();
}

// ステージ関連のイベントリスナーを設定
function setupStageEventListeners(): void {
  // ステージ名の変更
  document.querySelectorAll(".stage-name").forEach((input) => {
    input.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement;
      const stageId = parseInt(target.getAttribute("data-stage-id") || "0");
      const stage = stagesData.find((s) => s.id === stageId);
      if (stage) {
        stage.name = target.value;
        console.log(`Stage ${stageId} name updated:`, stage.name);
      }
    });
  });

  // ステージ説明の変更
  document.querySelectorAll(".stage-description").forEach((textarea) => {
    textarea.addEventListener("change", (event) => {
      const target = event.target as HTMLTextAreaElement;
      const stageId = parseInt(target.getAttribute("data-stage-id") || "0");
      const stage = stagesData.find((s) => s.id === stageId);
      if (stage) {
        stage.description = target.value;
        console.log(`Stage ${stageId} description updated:`, stage.description);
      }
    });
  });

  // レベル上限の変更
  document.querySelectorAll(".stage-level-threshold").forEach((input) => {
    input.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement;
      const stageId = parseInt(target.getAttribute("data-stage-id") || "0");
      const stage = stagesData.find((s) => s.id === stageId);
      const newValue = parseInt(target.value);
      if (stage && !isNaN(newValue) && newValue >= 1) {
        stage.levelThreshold = newValue;
        console.log(
          `Stage ${stageId} levelThreshold updated:`,
          stage.levelThreshold,
        );
      } else {
        // 無効な値はリセット
        target.value = String(stage?.levelThreshold ?? 1);
      }
    });
  });

  // ステージ保存ボタン
  const saveStagesBtn = document.getElementById("saveStagesBtn");
  if (saveStagesBtn) {
    saveStagesBtn.addEventListener("click", () => {
      console.log("Saving stages:", stagesData);
      alert(
        "ステージ設定を保存しました！\n\n※現在はローカルデータのみ更新されています。",
      );
    });
  }
}

// タスク関連のイベントリスナーを設定
function setupTaskEventListeners(): void {
  // タスク名の変更
  document.querySelectorAll(".task-name").forEach((input) => {
    input.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement;
      const taskId = parseInt(target.getAttribute("data-task-id") || "0");
      const task = tasksData.find((t) => t.id === taskId);
      if (task) {
        task.name = target.value;
        console.log(`Task ${taskId} name updated:`, task.name);
      }
    });
  });

  // タスクURLの変更
  document.querySelectorAll(".task-url").forEach((input) => {
    input.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement;
      const taskId = parseInt(target.getAttribute("data-task-id") || "0");
      const task = tasksData.find((t) => t.id === taskId);
      if (task) {
        task.youtubeUrl = target.value;
        console.log(`Task ${taskId} URL updated:`, task.youtubeUrl);
      }
    });
  });

  // タスク理由の変更
  document.querySelectorAll(".task-reason").forEach((textarea) => {
    textarea.addEventListener("change", (event) => {
      const target = event.target as HTMLTextAreaElement;
      const taskId = parseInt(target.getAttribute("data-task-id") || "0");
      const task = tasksData.find((t) => t.id === taskId);
      if (task) {
        task.reason = target.value;
        console.log(`Task ${taskId} reason updated:`, task.reason);
      }
    });
  });

  // タスク削除
  document.querySelectorAll(".task-delete").forEach((button) => {
    button.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      const taskId = parseInt(
        target.closest("button")?.getAttribute("data-task-id") || "0",
      );
      if (confirm("このタスクを削除しますか?")) {
        const index = tasksData.findIndex((t) => t.id === taskId);
        if (index !== -1) {
          tasksData.splice(index, 1);
          console.log(`Task ${taskId} deleted`);
          renderSettings();
        }
      }
    });
  });

  // タスク追加
  const addTaskBtn = document.getElementById("addTaskBtn");
  if (addTaskBtn) {
    addTaskBtn.addEventListener("click", () => {
      const newTask: Task = {
        id: Date.now(),
        category: currentCategory,
        name: "",
        youtubeUrl: "",
        reason: "",
      };
      tasksData.push(newTask);
      console.log("New task added");
      renderSettings();
    });
  }

  // タスク保存ボタン
  const saveTasksBtn = document.getElementById("saveTasksBtn");
  if (saveTasksBtn) {
    saveTasksBtn.addEventListener("click", () => {
      console.log("Saving tasks:", tasksData);
      alert(
        "タスク設定を保存しました！\n\n※現在はローカルデータのみ更新されています。",
      );
    });
  }

  // タスク検索
  const searchInput = document.getElementById(
    "taskSearchInput",
  ) as HTMLInputElement;
  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      const target = event.target as HTMLInputElement;
      const searchTerm = target.value.toLowerCase();
      const taskCards = document.querySelectorAll(".task-row");

      taskCards.forEach((card) => {
        const taskName = card.querySelector(".task-name") as HTMLInputElement;
        if (taskName && taskName.value.toLowerCase().includes(searchTerm)) {
          (card as HTMLElement).style.display = "";
        } else {
          (card as HTMLElement).style.display = "none";
        }
      });
    });
  }
}

// カテゴリータブの設定
function setupCategoryTabs(): void {
  document.querySelectorAll(".category-tab").forEach((tab) => {
    tab.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      const category = target
        .closest("button")
        ?.getAttribute("data-category") as "blue" | "red" | "green" | "yellow";
      if (category) {
        currentCategory = category;
        console.log("Category changed to:", category);
        renderSettings();
      }
    });
  });
}

// トレーナー関連のイベントリスナーを設定
function setupTrainerEventListeners(): void {
  // トレーナー追加ボタン
  const addTrainerBtn = document.getElementById("addTrainerBtn");
  if (addTrainerBtn) {
    addTrainerBtn.addEventListener("click", () => {
      const name = prompt("トレーナー名を入力してください:");
      if (!name) return;

      const email = prompt("メールアドレスを入力してください:");
      if (!email) return;

      const newTrainer: Trainer = {
        id: Date.now(),
        name: name,
        email: email,
        avatarUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAXEOg_iYS6LRYZdmYsddpvMq1b1NLpiwiBqsWwnq6fjeMuXE3I65zj6J8vL1QveMdUvcox_fMUJpAK45iRJoWmlGEt4EMAy98rqLJNY6jcytcf9FnzNVMgrVbPYcEW4PRYa31ShXRUcNw8U9OUSK9z243YfaZeoLn3NmDBWU25J9LM5H659zpPHMF0gnRgvcoo1RiOpqh7VmorM2A-kuO_Zek0Sd4zJpqZ4wMmH949oAiukXk-07aAf1tv20p4iY0D8gpkh6cI8Hk",
        role: "Staff",
        isOnline: false,
      };

      trainersData.push(newTrainer);
      console.log("New trainer added:", newTrainer);
      renderSettings();
    });
  }

  // トレーナーメニュー
  document.querySelectorAll(".trainer-menu").forEach((button) => {
    button.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      const trainerId = parseInt(
        target.closest("button")?.getAttribute("data-trainer-id") || "0",
      );
      console.log("Trainer menu clicked:", trainerId);
      // ここでメニュー表示や編集・削除機能を追加可能
      alert("トレーナー管理メニュー（編集・削除など）は今後実装予定です。");
    });
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
function init(): void {
  console.log("Initializing settings page...");
  renderSettings();
  setupDarkMode();
  setupMobileSidebar();
}

// DOMContentLoaded時に初期化
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
