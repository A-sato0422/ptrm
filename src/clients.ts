// このファイルをモジュールとして扱う
export { };

// 顧客データの型定義
interface Client {
  id: number;
  name: string;
  avatarUrl: string;
  lastUpdate: string;
  lastMemo: string;
  levels: {
    blue: number;
    red: number;
    green: number;
    yellow: number;
  };
  nextGoal: string;
  previousNote: string;
  currentTasks: Task[];
  preferences: {
    likes: string;
    dislikes: string;
  };
}

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

// サンプル顧客データ
const clientsData: Client[] = [
  {
    id: 10294,
    name: "山田 花子",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOTmHNB0ZGcIs7hqgp3jVkx0h_A8bS9jIPtjq4JilvCwWCfrthpclirCPZIrj4PfMO3A2rNy-M1KCda_jq7iLPtk-xNVFKZqippajxl7L2xfxi8doWUcU-zk4aX93tYV02_QfZC2HwXPKswxrZ56baNNmN5NL-TZPATuQQbZb2gF4A5g8_V9T3K4MRarGpZjflvueHtTm9OMlGyV2Z1fOTeBP-g4SoHTzZhRhacx91Q-QBGpm1HJJapLAJvlTqaonOuMLfXzkByEI",
    lastUpdate: "2026/01/08",
    lastMemo: "スクワット+5kg",
    levels: { blue: 7, red: 7, green: 6, yellow: 7 },
    nextGoal: "2合目ゲート開放（あとGreen Sportsのみ）",
    previousNote: "スクワット+5kg達成。膝の調子良好。次回はデッドリフトのフォーム確認。",
    currentTasks: [
      { id: 1, title: "骨盤ニュートラル維持", completed: true },
      { id: 2, title: "15分ジョグ", completed: false },
      { id: 3, title: "肩甲骨ストレッチ", completed: false }
    ],
    preferences: {
      likes: "ストレッチ、ダンス",
      dislikes: "高負荷ジャンプ、長距離走"
    }
  },
  {
    id: 10452,
    name: "田中 健太",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCQf2u7bWWNdS4xlN4kt82KQWQJ5HWwNsRdHMqv2QgiQTTOzR3Fr7IzR3bMrjBji7F1AO_PHeDvg4mA9vp5Rro9AjNisa2_7W7IJG_cUlEL8IE_si1Lja1Klqc3HvTuK6SGeIEfnSGqClWMZuxfy_-Zx5xV3iAlQDY9rZatwxccBRWKZe9AzCq1vMlRD2a5Tg-7TvT1mSMO3BUtwE14iD68Z65tOkO3xI0llhCMcR_mTqJS9Ds9juQP5fFNnzIzY2sUlPz-AmNCI9E",
    lastUpdate: "2026/01/08",
    lastMemo: "バルクアップ順調",
    levels: { blue: 4, red: 8, green: 3, yellow: 5 },
    nextGoal: "重量アップ目標達成まであと少し",
    previousNote: "ベンチプレス80kg更新。食事管理も徹底されており、体脂肪率も安定。",
    currentTasks: [
      { id: 1, title: "プロテイン摂取タイミング", completed: false },
      { id: 2, title: "ストレッチ10分", completed: true }
    ],
    preferences: {
      likes: "重量挙げ、HIIT",
      dislikes: "ヨガ、ピラティス"
    }
  },
  {
    id: 10588,
    name: "佐藤 美咲",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBdzUzh6YDvL-cSZWWaZQjUUF2Z4sHgv7dtZpas0u1Le5uWk53U90PKLtlumKqCmAfer6ykpgO-qsS9N3x7UGpmgk7iefAW53UjBn9hwVhgzd2GfETZKt9Q_mdaq6jpxYjeRNJyOrFvDDuHd9WwOmOmnpN_W9Hsr3B8HDN3fTiiEZmiU8wXRKBZYfFTBanCDbDpb_uqElJElVkvtG4MBMrzoRy8fSNjStH2YtD1SW_mlmn2hARqiuSa6Z_JCVq0aoYuhl8_NOB-l54",
    lastUpdate: "2026/01/08",
    lastMemo: "姿勢改善が見られる",
    levels: { blue: 9, red: 3, green: 7, yellow: 8 },
    nextGoal: "ピラティスマスターコース挑戦",
    previousNote: "インナーマッスルの使い方が非常に上手くなっています。呼吸法も完璧。",
    currentTasks: [
      { id: 1, title: "片足バランス強化", completed: false },
      { id: 2, title: "腹横筋の意識", completed: false }
    ],
    preferences: {
      likes: "マットピラティス",
      dislikes: "重い負荷のスクワット"
    }
  }
];

// 顧客カードを生成する関数
function createClientCard(client: Client): string {
  const tasksHTML = client.currentTasks
    .map(
      (task) => `
        <li class="flex items-center gap-2 text-sm">
          <span class="material-icons-outlined text-base ${task.completed ? 'text-green-500' : 'text-slate-400'}">
            ${task.completed ? 'check_circle' : 'radio_button_unchecked'}
          </span>
          <span class="text-slate-600 dark:text-slate-400 ${task.completed ? 'line-through' : ''}">
            ${task.title}
          </span>
        </li>
      `
    )
    .join('');

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
              onclick="navigateToClientDetail(${client.id})"
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
                  BLUE PILATES: LV.${client.levels.blue}
                </span>
                <span class="px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded">
                  RED WEIGHT: LV.${client.levels.red}
                </span>
                <span class="px-2 py-1 bg-green-600 text-white text-[10px] font-bold rounded">
                  GREEN SPORTS: LV.${client.levels.green}
                </span>
                <span class="px-2 py-1 bg-yellow-500 text-white text-[10px] font-bold rounded">
                  YELLOW MOVEMENT: LV.${client.levels.yellow}
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
  const container = document.getElementById('clientsContainer');
  if (!container) return;

  if (clients.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12">
        <span class="material-icons-outlined text-6xl text-slate-300 dark:text-slate-700">people_outline</span>
        <p class="mt-4 text-slate-500">該当する顧客が見つかりませんでした</p>
      </div>
    `;
    return;
  }

  container.innerHTML = clients.map((client) => createClientCard(client)).join('');
}

// 顧客詳細画面への遷移
function navigateToClientDetail(clientId: number): void {
  console.log(`Navigating to client detail: ${clientId}`);
  window.location.href = `client-detail.html?id=${clientId}`;
}

// グローバルスコープに関数を追加
(window as any).navigateToClientDetail = navigateToClientDetail;

// 検索機能
function setupSearch(): void {
  const searchInput = document.getElementById('searchInput') as HTMLInputElement;
  if (!searchInput) return;

  searchInput.addEventListener('input', (event) => {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    const filteredClients = clientsData.filter(
      (client) =>
        client.name.toLowerCase().includes(query) ||
        client.id.toString().includes(query)
    );
    renderClients(filteredClients);
  });
}

// ダークモードの切り替え
function setupDarkMode(): void {
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (!darkModeToggle) return;

  // ローカルストレージから設定を読み込む
  const isDarkMode = localStorage.getItem('darkMode') === 'true';
  if (isDarkMode) {
    document.documentElement.classList.add('dark');
  }

  darkModeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', isDark.toString());
  });
}

// モバイルサイドバーの開閉
function setupMobileSidebar(): void {
  const menuButton = document.getElementById('mobileMenuButton');
  const sidebar = document.getElementById('mobileSidebar');
  const closeButton = document.getElementById('mobileSidebarClose');
  const overlay = document.getElementById('mobileSidebarOverlay');

  if (!menuButton || !sidebar || !closeButton || !overlay) return;

  const openSidebar = (): void => {
    sidebar.classList.remove('-translate-x-full');
    overlay.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
  };

  const closeSidebar = (): void => {
    sidebar.classList.add('-translate-x-full');
    overlay.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  };

  menuButton.addEventListener('click', openSidebar);
  closeButton.addEventListener('click', closeSidebar);
  overlay.addEventListener('click', closeSidebar);

  const navLinks = sidebar.querySelectorAll('a[href]');
  navLinks.forEach((link) => {
    link.addEventListener('click', closeSidebar);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) {
      overlay.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    }
  });
}

// 初期化処理
function init(): void {
  console.log('Initializing clients page...');
  renderClients(clientsData);
  setupSearch();
  setupDarkMode();
  setupMobileSidebar();
}

// DOMContentLoaded時に初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
