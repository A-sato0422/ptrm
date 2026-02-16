// このファイルをモジュールとして扱う
export { };

// 顧客データの型定義
interface Client {
    id: number;
    name: string;
    avatarUrl: string;
    lastUpdate: string;
    lastMemo: string;
    email?: string;
    course?: string;
    status?: string;
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
    history?: MemoHistory[];
}

interface Task {
    id: number;
    title: string;
    reason?: string;
    youtubeUrl?: string;
    completed: boolean;
}

interface MemoHistory {
    id: number;
    date: string;
    trainer: string;
    content: string;
}

// サンプル顧客データ（clients.tsと同じデータを使用）
const clientsData: Client[] = [
    {
        id: 10294,
        name: "山田 花子",
        avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOTmHNB0ZGcIs7hqgp3jVkx0h_A8bS9jIPtjq4JilvCwWCfrthpclirCPZIrj4PfMO3A2rNy-M1KCda_jq7iLPtk-xNVFKZqippajxl7L2xfxi8doWUcU-zk4aX93tYV02_QfZC2HwXPKswxrZ56baNNmN5NL-TZPATuQQbZb2gF4A5g8_V9T3K4MRarGpZjflvueHtTm9OMlGyV2Z1fOTeBP-g4SoHTzZhRhacx91Q-QBGpm1HJJapLAJvlTqaonOuMLfXzkByEI",
        email: "yamada.hanako@example.com",
        course: "スタンダード月4回コース",
        status: "Active",
        lastUpdate: "2026/01/08",
        lastMemo: "スクワット+5kg",
        levels: { blue: 7, red: 7, green: 6, yellow: 7 },
        nextGoal: "全項目1合目クリアで2合目ゲート開放（あとGreen Sportsのみ）",
        previousNote: "スクワット+5kg達成。膝の調子良好。次回はデッドリフトのフォーム確認。",
        currentTasks: [
            { id: 1, title: "骨盤ニュートラル維持", reason: "腰痛予防と体幹の安定性向上のため", youtubeUrl: "https://youtube.com/watch?v=...", completed: false },
            { id: 2, title: "15分ジョグ", reason: "心肺機能の向上と脂肪燃焼の促進", youtubeUrl: "", completed: false },
            { id: 3, title: "肩甲骨ストレッチ", reason: "巻き肩の改善と呼吸の質を高める", youtubeUrl: "https://youtube.com/watch?v=...", completed: true }
        ],
        preferences: {
            likes: "ストレッチ、ダンス、リズムトレーニング",
            dislikes: "高負荷ジャンプ、長距離走、バーベル種目"
        },
        history: [
            { id: 1, date: "2026/01/08", trainer: "佐藤", content: "スクワット+5kg達成。膝の調子良好。次回はデッドリフトのフォーム確認。" },
            { id: 2, date: "2025/12/25", trainer: "鈴木", content: "年末年始の自宅トレについて相談。モチベーションは安定している。" }
        ]
    },
    {
        id: 10452,
        name: "田中 健太",
        avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCQf2u7bWWNdS4xlN4kt82KQWQJ5HWwNsRdHMqv2QgiQTTOzR3Fr7IzR3bMrjBji7F1AO_PHeDvg4mA9vp5Rro9AjNisa2_7W7IJG_cUlEL8IE_si1Lja1Klqc3HvTuK6SGeIEfnSGqClWMZuxfy_-Zx5xV3iAlQDY9rZatwxccBRWKZe9AzCq1vMlRD2a5Tg-7TvT1mSMO3BUtwE14iD68Z65tOkO3xI0llhCMcR_mTqJS9Ds9juQP5fFNnzIzY2sUlPz-AmNCI9E",
        email: "tanaka.kenta@example.com",
        course: "プレミアム月8回コース",
        status: "Active",
        lastUpdate: "2026/01/08",
        lastMemo: "バルクアップ順調",
        levels: { blue: 4, red: 8, green: 3, yellow: 5 },
        nextGoal: "重量アップ目標達成まであと少し",
        previousNote: "ベンチプレス80kg更新。食事管理も徹底されており、体脂肪率も安定。",
        currentTasks: [
            { id: 1, title: "プロテイン摂取タイミング", reason: "筋肉合成の最適化", youtubeUrl: "", completed: false },
            { id: 2, title: "ストレッチ10分", reason: "柔軟性向上とケガ予防", youtubeUrl: "", completed: true }
        ],
        preferences: {
            likes: "重量挙げ、HIIT",
            dislikes: "ヨガ、ピラティス"
        },
        history: [
            { id: 1, date: "2026/01/08", trainer: "山本", content: "ベンチプレス80kg更新。食事管理も徹底されており、体脂肪率も安定。" }
        ]
    },
    {
        id: 10588,
        name: "佐藤 美咲",
        avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBdzUzh6YDvL-cSZWWaZQjUUF2Z4sHgv7dtZpas0u1Le5uWk53U90PKLtlumKqCmAfer6ykpgO-qsS9N3x7UGpmgk7iefAW53UjBn9hwVhgzd2GfETZKt9Q_mdaq6jpxYjeRNJyOrFvDDuHd9WwOmOmnpN_W9Hsr3B8HDN3fTiiEZmiU8wXRKBZYfFTBanCDbDpb_uqElJElVkvtG4MBMrzoRy8fSNjStH2YtD1SW_mlmn2hARqiuSa6Z_JCVq0aoYuhl8_NOB-l54",
        email: "sato.misaki@example.com",
        course: "ライト月2回コース",
        status: "Active",
        lastUpdate: "2026/01/08",
        lastMemo: "姿勢改善が見られる",
        levels: { blue: 9, red: 3, green: 7, yellow: 8 },
        nextGoal: "ピラティスマスターコース挑戦",
        previousNote: "インナーマッスルの使い方が非常に上手くなっています。呼吸法も完璧。",
        currentTasks: [
            { id: 1, title: "片足バランス強化", reason: "体幹安定性の向上", youtubeUrl: "", completed: false },
            { id: 2, title: "腹横筋の意識", reason: "コアの強化", youtubeUrl: "", completed: false }
        ],
        preferences: {
            likes: "マットピラティス",
            dislikes: "重い負荷のスクワット"
        },
        history: [
            { id: 1, date: "2026/01/08", trainer: "高橋", content: "インナーマッスルの使い方が非常に上手くなっています。呼吸法も完璧。" }
        ]
    }
];

// URLパラメータから顧客IDを取得
function getClientIdFromUrl(): number | null {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    return id ? parseInt(id, 10) : null;
}

// 顧客データを取得
function getClientById(id: number): Client | undefined {
    return clientsData.find(client => client.id === id);
}

// レベルセレクトボックスの生成
function createLevelSelect(color: string, name: string, level: number, key: string): string {
    const colorMap: { [key: string]: string } = {
        blue: 'bg-blue-600',
        red: 'bg-red-600',
        green: 'bg-emerald-600',
        yellow: 'bg-amber-500'
    };

    const options = Array.from({ length: 11 }, (_, i) => {
        const selected = i === level ? 'selected' : '';
        return `<option value="${i}" ${selected}>Lv.${i}</option>`;
    }).join('');

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
    const completedClass = task.completed ? 'bg-slate-50/50 dark:bg-slate-800/20 opacity-70' : 'bg-white dark:bg-slate-900/40';
    const lineThrough = task.completed ? 'line-through' : '';
    const youtubeIcon = task.youtubeUrl ? `
    <span class="material-icons-outlined text-red-500 text-lg">play_circle</span>
  ` : `
    <span class="material-icons-outlined text-red-400 text-lg opacity-50">play_circle</span>
  `;

    return `
    <div class="flex gap-4 p-5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900 ${completedClass} transition-all group items-start shadow-sm">
      <div class="pt-2">
        <input 
          ${task.completed ? 'checked' : ''} 
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
            value="${task.reason || ''}"
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
              value="${task.youtubeUrl || ''}"
              data-task-id="${task.id}"
            />
          </div>
        </div>
      </div>
      <div class="pt-2">
        <button 
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
    const dotColor = isLatest ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700';
    const opacityClass = isLatest ? '' : 'opacity-70';
    const isNewMemo = !memo.date || !memo.content;

    return `
    <div class="relative pl-8 border-l-2 border-slate-100 dark:border-slate-800 ml-2" data-memo-id="${memo.id}">
      <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full ${dotColor} border-4 border-white dark:border-slate-900 shadow-sm"></div>
      <div class="bg-slate-50 dark:bg-slate-800/30 p-5 rounded-xl ${opacityClass} border ${isNewMemo ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-slate-200 dark:hover:border-slate-700'} transition-all group">
        <div class="flex justify-between items-start gap-4 mb-3">
          <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">日付</label>
              <input 
                class="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-300 focus:ring-2 focus:ring-primary focus:border-primary memo-date" 
                placeholder="2026/01/08" 
                type="text" 
                value="${memo.date || ''}"
                data-memo-id="${memo.id}"
              />
            </div>
            <div class="space-y-1">
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">担当者</label>
              <input 
                class="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 placeholder-slate-300 focus:ring-2 focus:ring-primary focus:border-primary memo-trainer" 
                placeholder="担当者名" 
                type="text" 
                value="${memo.trainer || ''}"
                data-memo-id="${memo.id}"
              />
            </div>
          </div>
          <button 
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
          >${memo.content || ''}</textarea>
        </div>
      </div>
    </div>
  `;
}

// 詳細画面のコンテンツを生成
function renderClientDetail(client: Client): void {
    const container = document.getElementById('clientDetailContainer');
    if (!container) return;

    // ページタイトルを更新
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        pageTitle.textContent = `顧客詳細: ${client.name}`;
    }

    const tasksHTML = client.currentTasks.map(task => createTaskCard(task)).join('');
    const historyHTML = client.history?.map((memo, index) => createMemoHistoryItem(memo, index === 0)).join('') || '';

    container.innerHTML = `
    <form id="clientDetailForm">
    <!-- Client Profile Section -->
    <section class="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="flex items-center gap-6">
        <img alt="${client.name}" class="w-24 h-24 rounded-2xl object-cover ring-4 ring-blue-50 dark:ring-blue-900/20" src="${client.avatarUrl}" />
        <div>
          <div class="flex items-center gap-3">
            <h2 class="text-2xl font-bold">${client.name}</h2>
            <span class="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full uppercase tracking-wider">${client.status || 'Active'}</span>
          </div>
          <div class="mt-3 space-y-1">
            <div class="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
              <span class="material-icons-outlined text-base">fitness_center</span>
              <span>コース: ${client.course || '未設定'}</span>
            </div>
            <div class="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
              <span class="material-icons-outlined text-base">mail</span>
              <span>${client.email || '未設定'}</span>
            </div>
          </div>
        </div>
      </div>
      <button class="flex items-center gap-2 px-5 py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors font-medium text-sm">
        <span class="material-icons-outlined text-lg">edit</span>
        編集
      </button>
    </section>

    <!-- Progress Section -->
    <section class="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-sm border-2 border-primary ring-4 ring-primary/10">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-2">
          <span class="material-icons-outlined text-primary">trending_up</span>
          <h3 class="text-lg font-bold">進捗状況管理</h3>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        ${createLevelSelect('blue', 'Mat Pilates:', client.levels.blue, 'blue')}
        ${createLevelSelect('red', 'Weight Training', client.levels.red, 'red')}
        ${createLevelSelect('green', 'Sports Training', client.levels.green, 'green')}
        ${createLevelSelect('yellow', 'Movement Training', client.levels.yellow, 'yellow')}
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
        <button class="flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 hover:text-primary hover:border-primary dark:hover:border-primary/50 transition-all rounded-xl font-bold bg-white dark:bg-transparent">
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
        <button class="px-5 py-2 text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-200 transition-colors">内容を編集</button>
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
    document.querySelectorAll('.task-checkbox').forEach((checkbox) => {
        checkbox.addEventListener('change', (event) => {
            const target = event.target as HTMLInputElement;
            const taskId = parseInt(target.getAttribute('data-task-id') || '0');
            const task = client.currentTasks.find(t => t.id === taskId);
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
    document.querySelectorAll('.task-delete').forEach((button) => {
        button.addEventListener('click', (event) => {
            const target = event.target as HTMLElement;
            const taskId = parseInt(target.closest('button')?.getAttribute('data-task-id') || '0');
            if (confirm('この課題を削除しますか?')) {
                const index = client.currentTasks.findIndex(t => t.id === taskId);
                if (index !== -1) {
                    client.currentTasks.splice(index, 1);
                    console.log(`Task ${taskId} deleted`);
                    // ここでAPIへの保存処理を追加可能
                    renderClientDetail(client);
                }
            }
        });
    });

    // 新規課題追加
    const addNewTaskBtn = document.getElementById('addNewTaskBtn');
    if (addNewTaskBtn) {
        addNewTaskBtn.addEventListener('click', () => {
            const newTask: Task = {
                id: Date.now(), // 仮のID
                title: '',
                reason: '',
                youtubeUrl: '',
                completed: false
            };
            client.currentTasks.push(newTask);
            console.log('New task added');
            renderClientDetail(client);
        });
    }

    // タスクの入力フィールド変更（リアルタイム保存）
    document.querySelectorAll('.task-title, .task-reason, .task-url').forEach((input) => {
        input.addEventListener('change', (event) => {
            const target = event.target as HTMLInputElement;
            const taskId = parseInt(target.getAttribute('data-task-id') || '0');
            const task = client.currentTasks.find(t => t.id === taskId);
            if (task) {
                if (target.classList.contains('task-title')) {
                    task.title = target.value;
                } else if (target.classList.contains('task-reason')) {
                    task.reason = target.value;
                } else if (target.classList.contains('task-url')) {
                    task.youtubeUrl = target.value;
                }
                console.log(`Task ${taskId} updated:`, task);
                // ここでAPIへの保存処理を追加可能
            }
        });
    });

    // Next Goal の変更
    const nextGoalInput = document.getElementById('nextGoalInput') as HTMLInputElement;
    if (nextGoalInput) {
        nextGoalInput.addEventListener('change', (event) => {
            const target = event.target as HTMLInputElement;
            client.nextGoal = target.value;
            console.log('Next Goal updated:', client.nextGoal);
            // ここでAPIへの保存処理を追加可能
        });
    }
}

// レベルセレクトボックスのイベントリスナーを設定
function setupLevelSelects(client: Client): void {
    document.querySelectorAll('.level-select').forEach((select) => {
        select.addEventListener('change', (event) => {
            const target = event.target as HTMLSelectElement;
            const levelKey = target.getAttribute('data-level-key') as 'blue' | 'red' | 'green' | 'yellow';
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
    const addMemoBtn = document.getElementById('addMemoBtn');
    if (!addMemoBtn) return;

    addMemoBtn.addEventListener('click', () => {
        // 新しい空のメモを作成
        const newMemo: MemoHistory = {
            id: Date.now(),
            date: new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/'),
            trainer: '',
            content: ''
        };

        // メモ履歴の先頭に追加
        if (!client.history) {
            client.history = [];
        }
        client.history.unshift(newMemo);

        console.log('New memo added:', newMemo);
        // UI を更新
        renderClientDetail(client);
    });
}

// メモ関連のイベントリスナーを設定
function setupMemoEventListeners(client: Client): void {
    // メモの削除
    document.querySelectorAll('.memo-delete').forEach((button) => {
        button.addEventListener('click', (event) => {
            const target = event.target as HTMLElement;
            const memoId = parseInt(target.closest('button')?.getAttribute('data-memo-id') || '0');
            if (confirm('このメモを削除しますか?')) {
                const index = client.history?.findIndex(m => m.id === memoId) ?? -1;
                if (index !== -1 && client.history) {
                    client.history.splice(index, 1);
                    console.log(`Memo ${memoId} deleted`);
                    // ここでAPIへの保存処理を追加可能
                    renderClientDetail(client);
                }
            }
        });
    });

    // メモの日付変更
    document.querySelectorAll('.memo-date').forEach((input) => {
        input.addEventListener('change', (event) => {
            const target = event.target as HTMLInputElement;
            const memoId = parseInt(target.getAttribute('data-memo-id') || '0');
            const memo = client.history?.find(m => m.id === memoId);
            if (memo) {
                memo.date = target.value;
                console.log(`Memo ${memoId} date updated:`, memo.date);
                // ここでAPIへの保存処理を追加可能
            }
        });
    });

    // メモの担当者変更
    document.querySelectorAll('.memo-trainer').forEach((input) => {
        input.addEventListener('change', (event) => {
            const target = event.target as HTMLInputElement;
            const memoId = parseInt(target.getAttribute('data-memo-id') || '0');
            const memo = client.history?.find(m => m.id === memoId);
            if (memo) {
                memo.trainer = target.value;
                console.log(`Memo ${memoId} trainer updated:`, memo.trainer);
                // ここでAPIへの保存処理を追加可能
            }
        });
    });

    // メモの内容変更
    document.querySelectorAll('.memo-content').forEach((textarea) => {
        textarea.addEventListener('change', (event) => {
            const target = event.target as HTMLTextAreaElement;
            const memoId = parseInt(target.getAttribute('data-memo-id') || '0');
            const memo = client.history?.find(m => m.id === memoId);
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
    const form = document.getElementById('clientDetailForm') as HTMLFormElement;
    if (!form) return;

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        // フォームデータを収集
        const formData = {
            clientId: client.id,
            name: client.name,
            email: client.email,
            course: client.course,
            status: client.status,
            levels: client.levels,
            nextGoal: client.nextGoal,
            currentTasks: client.currentTasks,
            preferences: client.preferences,
            history: client.history
        };

        console.log('Form submitted with data:', formData);

        // ここでAPIへのPOST/PUT処理を追加
        // 例: fetch('/api/clients/' + client.id, { method: 'PUT', body: JSON.stringify(formData) })

        // 成功メッセージを表示
        alert('顧客情報を登録しました！\n\n※現在はローカルデータのみ更新されています。\nDB連携は今後実装予定です。');
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

    // ナビゲーションリンクをクリックしたら閉じる
    const navLinks = sidebar.querySelectorAll('a[href]');
    navLinks.forEach((link) => {
        link.addEventListener('click', closeSidebar);
    });

    // 画面サイズが変わったら調整
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 1024) {
            overlay.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        }
    });
}

// 初期化処理
function init(): void {
    console.log('Initializing client detail page...');

    const clientId = getClientIdFromUrl();
    if (!clientId) {
        const container = document.getElementById('clientDetailContainer');
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

    const client = getClientById(clientId);
    if (!client) {
        const container = document.getElementById('clientDetailContainer');
        if (container) {
            container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-64">
          <span class="material-icons-outlined text-6xl text-slate-300 dark:text-slate-700 mb-4">person_off</span>
          <p class="text-lg text-slate-500">顧客が見つかりませんでした (ID: ${clientId})</p>
          <a href="clients.html" class="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors">
            顧客一覧に戻る
          </a>
        </div>
      `;
        }
        return;
    }

    renderClientDetail(client);
    setupDarkMode();
    setupMobileSidebar();
}

// DOMContentLoaded時に初期化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
