// メインTypeScriptファイル
// ナビゲーション、画面遷移、イベントハンドリングを管理

console.log('PTRM System Initialized');

// DOM要素の取得
const navButtons = document.querySelectorAll('.nav-btn');
const menuBtn = document.querySelector('.menu-btn');
const helpBtn = document.querySelector('.help-btn');

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

// メニューボタンイベント
menuBtn?.addEventListener('click', () => {
  console.log('Menu button clicked');
  // TODO: サイドメニューの実装
  alert('メニュー機能は今後実装予定です');
});

// ヘルプボタンイベント
helpBtn?.addEventListener('click', () => {
  console.log('Help button clicked');
  // TODO: ヘルプモーダルの実装
  alert('ヘルプ機能は今後実装予定です');
});

// チェックボックスのイベントリスナー（アクションリスト）
const checkboxes = document.querySelectorAll('.task-checkbox, .action-item input[type="checkbox"]');
checkboxes.forEach((checkbox) => {
  checkbox.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement;
    const taskItem = target.closest('.task-item, .action-item');

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
