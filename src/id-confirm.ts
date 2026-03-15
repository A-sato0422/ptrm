/**
 * src/id-confirm.ts
 * 登録確認画面（id-confirm.html）専用スクリプト
 *
 * ケース①③: clients 未登録ユーザーが「PTRMへ」ボタン経由でアクセスした場合に表示。
 * LIFF はすでに初期化済み（liff-auth.ts が initClientAuth() 内で init 済み）のため、
 * IDトークンを直接デコードして LINE ユーザー ID を取得する。
 */

import liff from '@line/liff'

const LIFF_ID = import.meta.env.VITE_LIFF_ID as string

async function init(): Promise<void> {
  const displayEl = document.getElementById('line-id-display')
  const copyBtn = document.getElementById('copy-btn') as HTMLButtonElement | null
  const statusEl = document.getElementById('copy-status')

  let lineUserId: string | null = null

  if (import.meta.env.DEV) {
    lineUserId = 'U_client_test_001'
  } else {
    try {
      await liff.init({ liffId: LIFF_ID })
      lineUserId = liff.getDecodedIDToken()?.sub ?? null
    } catch (e) {
      console.error('LIFF init error:', e)
    }
  }

  if (displayEl) {
    displayEl.textContent = lineUserId ?? '取得できませんでした'
  }

  copyBtn?.addEventListener('click', async () => {
    if (!lineUserId) return
    try {
      await navigator.clipboard.writeText(lineUserId)
      copyBtn.textContent = 'コピーしました！'
      copyBtn.classList.add('copied')
      if (statusEl) statusEl.textContent = 'クリップボードにコピーされました。トレーナーにお伝えください。'
      setTimeout(() => {
        copyBtn.textContent = 'LINE ID をコピー'
        copyBtn.classList.remove('copied')
        if (statusEl) statusEl.textContent = ''
      }, 3000)
    } catch {
      // clipboard API 非対応時はフォールバック
      if (statusEl) statusEl.textContent = '上記の LINE ID を手動でコピーしてトレーナーにお伝えください。'
    }
  })
}

init()
