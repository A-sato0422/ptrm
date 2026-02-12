// メインTypeScriptファイル
// ナビゲーション、画面遷移、イベントハンドリングを管理

console.log('PTRM System Initialized');

// DOM要素の取得
const navButtons = document.querySelectorAll('.nav-btn');

// ナビゲーションイベントリスナー
navButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    handleNavigation(index);
  });
});

// ナビゲーションハンドラー
function handleNavigation(index: number) {
  const pages = ['index.html', 'action.html', 'stage.html', 'profile.html'];

  // 予約ボタン（index 4）の場合は外部サイトへ遷移
  if (index === 4) {
    window.open('https://azzist.jp/schedule/60', '_blank');
    return;
  }

  // ページ遷移
  if (index >= 0 && index < pages.length) {
    window.location.href = pages[index];
  }
}





// アクションアイテムのクリックイベントリスナー（action.htmlへ遷移）
const actionItems = document.querySelectorAll('.action-item');
actionItems.forEach((item) => {
  item.addEventListener('click', () => {
    const actionId = item.getAttribute('data-action-id');
    console.log('Action item clicked:', actionId);
    // action.htmlへ遷移
    window.location.href = 'action.html';
  });
});

// 山のクリックイベントリスナー（詳細モーダルを表示）
const mountains = document.querySelectorAll('.mountain');
mountains.forEach((mountain) => {
  mountain.addEventListener('click', () => {
    const mountainType = mountain.getAttribute('data-mountain');
    const currentLevel = parseInt(mountain.getAttribute('data-level') || '0');
    const category = mountain.getAttribute('data-category');

    openMountainDetailModal(mountainType!, currentLevel, category!);
  });
});

// 山の詳細モーダルを開く関数
function openMountainDetailModal(mountainType: string, currentLevel: number, category: string) {
  const modal = document.getElementById('mountain-detail-modal');
  const modalTitle = document.getElementById('modal-category-title');
  const modalTasksList = document.getElementById('modal-tasks-list');
  const modalContent = document.querySelector('.mountain-modal-content') as HTMLElement;

  if (!modal || !modalTitle || !modalTasksList || !modalContent) return;

  // 山の種類に応じた背景画像を設定
  const mountainImages: { [key: string]: string } = {
    blue: './assets/yama01.png',
    red: './assets/yama02.png',
    green: './assets/yama03.png',
    yellow: './assets/yama04.png'
  };

  const backgroundImage = mountainImages[mountainType];
  if (backgroundImage) {
    modalContent.style.backgroundImage = `url('${backgroundImage}')`;
  }

  // タイトルを設定
  modalTitle.textContent = category;

  // ダミーデータを生成
  const tasksData = generateDummyTasks(mountainType, currentLevel);

  // タスクリストをクリア
  modalTasksList.innerHTML = '';

  // タスクリストを生成
  tasksData.forEach((levelData) => {
    const levelSection = document.createElement('div');

    if (levelData.isLocked) {
      levelSection.className = 'modal-level-section locked';
      levelSection.innerHTML = `
        <div class="modal-level-header">
          <div class="modal-level-title">
            🔒 Lv.${levelData.level}
          </div>
          <span class="modal-level-status locked">未開放</span>
        </div>
        <p class="modal-locked-message">このレベルはまだ秘密です</p>
      `;
    } else {
      levelSection.className = 'modal-level-section completed';
      levelSection.innerHTML = `
        <div class="modal-level-header">
          <div class="modal-level-title">
            ✓ Lv.${levelData.level}
          </div>
          <span class="modal-level-status completed">達成</span>
        </div>
        <div class="modal-task-info">
          <div class="modal-task-name">${levelData.taskName}</div>
          <div class="modal-task-date">達成日: ${levelData.completedDate}</div>
        </div>
      `;
    }

    modalTasksList.appendChild(levelSection);
  });

  // モーダルを表示
  modal.style.display = 'flex';

  // closing クラスを削除（前回の閉じるアニメーションをリセット）
  modal.classList.remove('closing');
}

// 山の詳細モーダルを閉じる関数
function closeMountainDetailModal() {
  const modal = document.getElementById('mountain-detail-modal');
  if (!modal) return;

  // closing クラスを追加してアニメーション開始
  modal.classList.add('closing');

  // アニメーション完了後にモーダルを非表示
  setTimeout(() => {
    modal.style.display = 'none';
    modal.classList.remove('closing');
  }, 300);
}

// ダミーデータを生成する関数
function generateDummyTasks(mountainType: string, currentLevel: number) {
  const taskNames: { [key: string]: string[] } = {
    blue: [
      '基本姿勢の習得',
      '骨盤ニュートラル維持',
      '呼吸法のマスター',
      'コアの安定性向上',
      '体幹バランス強化',
      '柔軟性の向上',
      '動作の正確性',
      '応用動作の習得',
      '高度な動作連携',
      '完全習熟',
      'プランク30秒キープ',
      'サイドプランク左右各20秒',
      'バードドッグ左右各10回',
      'デッドバグ10回',
      'ブリッジキープ30秒',
      'シングルレッグブリッジ左右各8回',
      'プランクローテーション左右各5回',
      'マウンテンクライマー20回',
      'プランク45秒キープ',
      'ABロールアウト10回',
      'ハンギングニーレイズ8回',
      'L字キープ20秒',
      'ドラゴンフラッグ5回',
      'フロントレバー進行形',
      'プランク60秒キープ',
      'RKCプランク30秒',
      'ホロウボディホールド30秒',
      'アーチボディホールド30秒',
      'バックレバー進行形',
      'ヒューマンフラッグ進行形',
      'プランシェ進行形',
      'アドバンスコアワーク',
      'マッスルアップ5回',
      'フロントレバープルアップ3回',
      'L字腕立て伏せ10回',
      'プランシェプッシュアップ5回',
      'ドラゴンフラッグ＋ツイスト5回',
      'インバーテッドハング30秒',
      'アドバンスプランシェ',
      'エキスパートレベル完全習得'
    ],
    red: [
      'フォームの基礎',
      'スクワット基礎',
      'ベンチプレス導入',
      'デッドリフト基礎',
      '負荷の段階的増加',
      '筋力向上プログラム',
      '複合トレーニング',
      '高負荷トレーニング',
      'パワー開発',
      '最大筋力到達',
      'スクワット60kg 5回',
      'ベンチプレス50kg 5回',
      'デッドリフト70kg 5回',
      'オーバーヘッドプレス30kg 5回',
      'バーベルロウ50kg 5回',
      'スクワット80kg 5回',
      'ベンチプレス60kg 5回',
      'デッドリフト90kg 5回',
      'フロントスクワット60kg 5回',
      'インクラインベンチ50kg 5回',
      'スクワット100kg 5回',
      'ベンチプレス70kg 5回',
      'デッドリフト110kg 5回',
      'オーバーヘッドプレス40kg 5回',
      'ペンドレイロウ60kg 5回',
      'スクワット120kg 3回',
      'ベンチプレス80kg 3回',
      'デッドリフト130kg 3回',
      'パワークリーン70kg 3回',
      'プッシュプレス60kg 5回',
      'スクワット140kg 1回',
      'ベンチプレス90kg 1回',
      'デッドリフト150kg 1回',
      'フルスナッチ60kg 3回',
      'クリーン＆ジャーク80kg 1回',
      'スクワット体重×2倍',
      'ベンチプレス体重×1.5倍',
      'デッドリフト体重×2.5倍',
      'パワーリフティング大会出場',
      'エリートレベル到達'
    ],
    green: [
      '基礎体力づくり',
      '有酸素運動の基本',
      '持久力向上',
      'スポーツ動作導入',
      'アジリティ強化',
      'スピード向上',
      '実践的スポーツ動作',
      '競技レベル向上',
      '高度なスポーツ技術',
      'アスリートレベル',
      'ランニング3km完走',
      '5km 30分以内',
      'インターバル走導入',
      'テンポラン20分',
      'ヒルスプリント10本',
      '10km 60分以内',
      'ファルトレク30分',
      'プライオメトリクス基礎',
      'アジリティドリル',
      'スピードラダー',
      'ハーフマラソン完走',
      '10km 50分以内',
      'スプリントトレーニング',
      'コーンドリル',
      '400m×5本 インターバル',
      'フルマラソン完走',
      '5km 22分以内',
      'VO2maxトレーニング',
      '長距離持久力',
      'トライアスロン挑戦',
      'フルマラソン4時間切り',
      '10km 45分以内',
      'ウルトラマラソン準備',
      'クロストレーニング',
      'スポーツ特化トレーニング',
      'フルマラソン3時間30分',
      'ハーフマラソン1時間30分',
      '競技レベルスピード',
      'アスリート持久力',
      'エリートアスリートレベル'
    ],
    yellow: [
      '基本的な動作パターン',
      '日常動作の改善',
      '可動域の拡大',
      '動作の効率化',
      '姿勢改善',
      '機能的動作の習得',
      '複雑な動作連鎖',
      '動作の最適化',
      '高度な身体操作',
      '動作マスター',
      'ヒップヒンジパターン',
      'スクワットパターン',
      'ランジパターン',
      'プッシュパターン',
      'プルパターン',
      'ローテーションパターン',
      'キャリーパターン',
      '歩行動作改善',
      '階段昇降の最適化',
      '立ち座り動作',
      'ジャンプ着地動作',
      '方向転換動作',
      '投球動作基礎',
      'スイング動作基礎',
      '片足立ちバランス60秒',
      'ターキッシュゲットアップ',
      'ケトルベルスイング20回',
      'ハローホールド',
      'ウィンドミル左右',
      'ボトムアップキープ',
      'アームバーストレッチ',
      'スナッチグリップデッドリフト',
      'オーバーヘッドスクワット',
      'ピストルスクワット左右各5回',
      'シングルアームプレス',
      'ダブルケトルベルフロントスクワット',
      'ジャーク動作',
      'ウォーキングランジ20歩',
      'コンプレックス動作',
      '機能的動作スペシャリスト'
    ]
  };

  const tasks = [];
  const maxLevel = 40;

  for (let level = 1; level <= maxLevel; level++) {
    if (level <= currentLevel) {
      // 達成済みのレベル
      const daysAgo = (currentLevel - level) * 7 + Math.floor(Math.random() * 5);
      const completedDate = new Date();
      completedDate.setDate(completedDate.getDate() - daysAgo);

      tasks.push({
        level,
        taskName: taskNames[mountainType]?.[level - 1] || `タスク ${level}`,
        completedDate: completedDate.toLocaleDateString('ja-JP'),
        isLocked: false
      });
    } else {
      // 未開放のレベル
      tasks.push({
        level,
        taskName: '???',
        completedDate: '',
        isLocked: true
      });
    }
  }

  return tasks;
}

// モーダルの閉じるボタン
const mountainModalCloseBtn = document.querySelector('.mountain-modal-close');
mountainModalCloseBtn?.addEventListener('click', closeMountainDetailModal);

// モーダル背景クリックで閉じる
const mountainModalOverlay = document.querySelector('.mountain-modal-overlay');
mountainModalOverlay?.addEventListener('click', closeMountainDetailModal);

// チェックボックスのイベントリスナー（その他のチェックボックス用）
const checkboxes = document.querySelectorAll('.task-checkbox');
checkboxes.forEach((checkbox) => {
  checkbox.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement;
    const taskItem = target.closest('.task-item');

    if (taskItem) {
      if (target.checked) {
        taskItem.classList.add('completed');
      } else {
        taskItem.classList.remove('completed');
      }
    }

    // TODO: Supabaseにデータを保存
    console.log('Task status changed:', {
      checked: target.checked,
      taskId: target.id,
    });
  });
});

// 好み評価ボタンのイベントリスナー
const preferenceButtons = document.querySelectorAll('.preference-btn');
preferenceButtons.forEach((button) => {
  button.addEventListener('click', (e) => {
    const target = e.currentTarget as HTMLElement;
    const parentSection = target.closest('.preference-section');

    if (parentSection) {
      // 同じグループ内の他のボタンの active クラスを削除
      const siblingButtons = parentSection.querySelectorAll('.preference-btn');
      siblingButtons.forEach((btn) => btn.classList.remove('active'));

      // クリックされたボタンに active クラスを追加
      target.classList.add('active');
    }

    // TODO: Supabaseにデータを保存
    console.log('Preference changed:', {
      preference: target.textContent?.trim(),
    });
  });
});

// 完了ボタンのイベントリスナー
const completeButtons = document.querySelectorAll('.complete-btn');
completeButtons.forEach((button) => {
  button.addEventListener('click', (e) => {
    const target = e.currentTarget as HTMLElement;
    const taskItem = target.closest('.task-item') as HTMLElement;
    const taskId = taskItem?.getAttribute('data-task-id');
    const isCompleted = taskItem?.getAttribute('data-completed') === 'true';

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
  const modal = document.getElementById('preference-modal');
  const formTaskIdInput = document.getElementById('form-task-id') as HTMLInputElement;

  if (modal && formTaskIdInput) {
    formTaskIdInput.value = taskId;
    modal.style.display = 'flex';

    // モーダル内の好み評価ボタンをリセット
    const modalPreferenceButtons = modal.querySelectorAll('.preference-btn');
    modalPreferenceButtons.forEach((btn) => btn.classList.remove('active'));
  }
}

// モーダルを閉じる関数
function closePreferenceModal() {
  const modal = document.getElementById('preference-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// モーダルの閉じるボタン
const modalCloseBtn = document.querySelector('.modal-close');
modalCloseBtn?.addEventListener('click', closePreferenceModal);

// モーダル背景クリックで閉じる
const modal = document.getElementById('preference-modal');
modal?.addEventListener('click', (e) => {
  if (e.target === modal) {
    closePreferenceModal();
  }
});

// 好み評価フォームの送信
const preferenceForm = document.getElementById('preference-form');
preferenceForm?.addEventListener('submit', (e) => {
  e.preventDefault();

  const formData = new FormData(e.target as HTMLFormElement);
  const taskId = formData.get('taskId') as string;
  const activeBtn = document.querySelector('.modal .preference-btn.active');
  const preference = activeBtn?.getAttribute('data-value');

  if (!preference) {
    alert('好み評価を選択してください');
    return;
  }

  // タスクを完了状態に更新
  const taskItem = document.querySelector(`[data-task-id="${taskId}"]`) as HTMLElement;
  if (taskItem) {
    taskItem.setAttribute('data-completed', 'true');
    taskItem.classList.add('completed');

    const completeBtn = taskItem.querySelector('.complete-btn') as HTMLElement;
    if (completeBtn) {
      completeBtn.textContent = '編集';
    }
  }

  // モーダルを閉じる
  closePreferenceModal();

  // 成功メッセージを表示
  showSuccessMessage();

  // TODO: Supabaseにデータを保存
  console.log('Task completed:', {
    taskId,
    preference,
  });
});

// 成功メッセージを表示する関数
function showSuccessMessage() {
  const successMessage = document.getElementById('success-message');
  if (successMessage) {
    successMessage.style.display = 'block';

    // 3秒後に自動で非表示
    setTimeout(() => {
      successMessage.style.display = 'none';
    }, 3000);
  }
}

// 予約ボタンのイベントリスナー
const reservationButtons = document.querySelectorAll('.reservation-btn, .view-detail-btn');
reservationButtons.forEach((button) => {
  button.addEventListener('click', () => {
    // 外部予約システム（Azzist）へ遷移
    window.open('https://azzist.jp/schedule/60', '_blank');
  });
});

// 動画リンクのイベントリスナー
const videoLinks = document.querySelectorAll('.video-link');
videoLinks.forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    // TODO: 動画ページの実装
    alert('動画ページは今後実装予定です');
  });
});

// プロフィールアクションボタン
const profileActionButtons = document.querySelectorAll('.profile-action-btn');
profileActionButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const buttonText = button.textContent?.trim();
    console.log('Profile action clicked:', buttonText);
    // TODO: 各機能の実装
    alert(`${buttonText}は今後実装予定です`);
  });
});

// PWA対応の準備
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // TODO: Service Workerの登録
    console.log('Service Worker support detected');
  });
}

// LIFF初期化の準備
declare const liff: any;

async function initializeLIFF() {
  try {
    // TODO: LIFF IDを環境変数から取得
    const liffId = import.meta.env.VITE_LIFF_ID;

    if (typeof liff !== 'undefined' && liffId) {
      await liff.init({ liffId });

      if (!liff.isLoggedIn()) {
        liff.login();
      } else {
        // ユーザー情報の取得
        const profile = await liff.getProfile();
        console.log('User profile:', profile);
        // TODO: Supabaseにユーザー情報を保存
      }
    }
  } catch (error) {
    console.error('LIFF initialization failed:', error);
  }
}

// LIFF初期化（本番環境のみ）
if (import.meta.env.PROD) {
  initializeLIFF();
}

// エクスポート
export { handleNavigation, initializeLIFF };
