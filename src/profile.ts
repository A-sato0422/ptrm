/**
 * src/profile.ts
 * プロフィール画面（profile.html）専用スクリプト
 * - DBからクライアント情報・レベル・宿題完了数・ステージを取得して描画
 * - プロフィール設定モーダル（名前・アバター画像の編集）
 */

import { supabase } from "./supabase";
import { uploadAvatarToStorage } from "./api/storage";
import { fetchPointHistory, usePoints, type PointHistoryRow } from "./api/point-crud";
import { initLayout, checkClientAuth } from "./page-init";
import { Html5Qrcode } from "html5-qrcode";

initLayout();

interface LevelRow {
  current_level: number;
}

let _clientId: string | null = null;
let _currentAvatarUrl = "/assets/initial-avater.png";
let _selectedAvatarFile: File | null = null;
let _currentPoints = 0;

// ============================================================
// データ取得・描画
// ============================================================

async function loadProfile(): Promise<void> {
  if (!_clientId) return;
  const { data: clientData, error: clientError } = await supabase
    .from("clients")
    .select("id, display_name, profile_image_url, course_name, created_at, points")
    .eq("id", _clientId)
    .single();

  if (clientError || !clientData) {
    console.error("クライアント取得エラー:", clientError?.message);
    return;
  }

  _currentAvatarUrl =
    clientData.profile_image_url ?? "/assets/initial-avater.png";
  _currentPoints = clientData.points ?? 0;

  const [levelsResult, tasksResult, stagesResult] = await Promise.all([
    supabase
      .from("client_levels")
      .select("current_level")
      .eq("client_id", _clientId),
    supabase
      .from("client_tasks")
      .select("id", { count: "exact", head: true })
      .eq("client_id", _clientId)
      .eq("is_completed", true),
    supabase
      .from("stages")
      .select("stage_no, name, level_to")
      .order("stage_no", { ascending: true }),
  ]);

  const levels = (levelsResult.data ?? []) as unknown as LevelRow[];
  const completedCount = tasksResult.count ?? 0;
  const stages = stagesResult.data ?? [];

  // 計算
  const createdAt = new Date(clientData.created_at);
  const daysElapsed = Math.floor(
    (Date.now() - createdAt.getTime()) / 86400000,
  );

  const minLevel =
    levels.length > 0
      ? Math.min(...levels.map((l) => l.current_level))
      : 1;
  const currentStage =
    stages.find((s: { level_to: number }) => minLevel < s.level_to) ??
    stages[stages.length - 1];

  // ヘッダー描画
  const avatarEl = document.getElementById(
    "profile-avatar",
  ) as HTMLImageElement | null;
  const nameEl = document.getElementById("profile-name");
  const memberSinceEl = document.getElementById("profile-member-since");

  if (avatarEl) avatarEl.src = _currentAvatarUrl;
  if (nameEl) nameEl.textContent = clientData.display_name ?? "–";
  if (memberSinceEl) {
    const dateStr = createdAt.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    memberSinceEl.textContent = `会員登録日: ${dateStr}`;
  }

  // ポイント履歴描画（非同期）
  loadPointHistory();

  // 基本情報描画
  const infoDaysEl = document.getElementById("info-days");
  const infoCourseEl = document.getElementById("info-course");
  const infoStageEl = document.getElementById("info-stage");
  const infoTasksEl = document.getElementById("info-tasks");
  if (infoDaysEl) infoDaysEl.textContent = `${daysElapsed}日`;
  if (infoCourseEl) infoCourseEl.textContent = clientData.course_name ?? "–";
  if (infoStageEl && currentStage) {
    infoStageEl.textContent = `${currentStage.stage_no}合目（${currentStage.name}）`;
  }
  if (infoTasksEl) infoTasksEl.textContent = String(`${completedCount}個`);
}

// ============================================================
// ポイント履歴
// ============================================================

function renderPointHistory(rows: PointHistoryRow[]): void {
  const container = document.getElementById("point-history-list");
  if (!container) return;

  if (rows.length === 0) {
    container.innerHTML = `<p class="point-history-empty">履歴はありません</p>`;
    return;
  }

  container.innerHTML = rows
    .map((row) => {
      const date = new Date(row.created_at).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      const isPositive = row.point > 0;
      const sign = isPositive ? "+" : "";
      const cls = isPositive ? "positive" : "negative";
      return (
        `<div class="point-history-item">` +
        `<span class="point-history-date">${date}</span>` +
        `<span class="point-history-point ${cls}">${sign}${row.point}pt</span>` +
        `</div>`
      );
    })
    .join("");
}

async function loadPointHistory(): Promise<void> {
  if (!_clientId) return;
  const history = await fetchPointHistory(_clientId);
  renderPointHistory(history);
}

function setupPointUse(): void {
  const modal = () => document.getElementById("point-use-modal");
  const input = () => document.getElementById("point-use-input") as HTMLInputElement | null;
  const errorEl = () => document.getElementById("point-use-error");

  function openPointUseModal(): void {
    const inp = input();
    if (inp) inp.value = "";
    const err = errorEl();
    if (err) err.style.display = "none";
    modal()?.classList.remove("hidden");
  }

  function closePointUseModal(): void {
    const m = modal();
    if (!m) return;
    m.classList.add("closing");
    setTimeout(() => {
      m.classList.remove("closing");
      m.classList.add("hidden");
    }, 280);
  }

  document.getElementById("point-use-open-btn")?.addEventListener("click", openPointUseModal);
  document.getElementById("point-use-cancel-btn")?.addEventListener("click", closePointUseModal);
  document.getElementById("point-use-close-btn")?.addEventListener("click", closePointUseModal);
  modal()?.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closePointUseModal();
  });

  document.getElementById("point-use-btn")?.addEventListener("click", async () => {
    const inp = input();
    const err = errorEl();
    if (!inp || !_clientId) return;

    const amount = parseInt(inp.value, 10);
    if (isNaN(amount) || amount <= 0) {
      if (err) { err.textContent = "1以上のポイント数を入力してください。"; err.style.display = "block"; }
      return;
    }

    const btn = document.getElementById("point-use-btn") as HTMLButtonElement | null;
    if (btn) { btn.disabled = true; btn.textContent = "処理中..."; }

    const result = await usePoints(_clientId, amount, _currentPoints);

    if (btn) { btn.disabled = false; btn.textContent = "使用する"; }

    if (!result.success) {
      if (err) { err.textContent = result.error ?? "エラーが発生しました。"; err.style.display = "block"; }
      return;
    }

    closePointUseModal();
    _currentPoints -= amount;
    const headerPointsEl = document.getElementById("userPoints");
    if (headerPointsEl) headerPointsEl.textContent = _currentPoints.toLocaleString();
    const history = await fetchPointHistory(_clientId);
    renderPointHistory(history);
    showSuccessMessage();
  });
}

// ============================================================
// 成功メッセージ
// ============================================================

function showSuccessMessage(): void {
  const el = document.getElementById("success-message");
  if (!el) return;
  el.style.display = "block";
  setTimeout(() => { el.style.display = "none"; }, 3000);
}

function showErrorMessage(msg: string): void {
  const el = document.getElementById("error-message");
  if (!el) return;
  el.textContent = msg;
  el.style.display = "block";
  setTimeout(() => { el.style.display = "none"; }, 4000);
}

// ============================================================
// QRコードスキャナー
// ============================================================

let _qrScanner: Html5Qrcode | null = null;

async function openQrScanner(): Promise<void> {
  const modal = document.getElementById("qr-modal");
  modal?.classList.remove("hidden");

  _qrScanner = new Html5Qrcode("qr-reader");
  try {
    await _qrScanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 240, height: 240 } },
      (decodedText) => {
        closeQrScanner();
        window.location.href = decodedText;
      },
      undefined,
    );
  } catch {
    closeQrScanner();
    showErrorMessage("カメラの起動に失敗しました。カメラへのアクセスを許可してください。");
  }
}

function closeQrScanner(): void {
  const modal = document.getElementById("qr-modal");
  modal?.classList.add("hidden");
  _qrScanner?.stop().catch(() => {});
  _qrScanner = null;
}

function setupQrScanner(): void {
  document.getElementById("qr-scan-btn")?.addEventListener("click", openQrScanner);
  document.getElementById("qr-close-btn")?.addEventListener("click", closeQrScanner);
  document.getElementById("qr-modal")?.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeQrScanner();
  });
}

// ============================================================
// プロフィール設定モーダル
// ============================================================

function openModal(): void {
  const modal = document.getElementById("profile-modal");
  const nameInput = document.getElementById(
    "modal-name-input",
  ) as HTMLInputElement | null;
  const preview = document.getElementById(
    "modal-avatar-preview",
  ) as HTMLImageElement | null;

  if (nameInput)
    nameInput.value =
      document.getElementById("profile-name")?.textContent ?? "";
  if (preview) preview.src = _currentAvatarUrl;
  _selectedAvatarFile = null;

  modal?.classList.remove("hidden");
}

function closeModal(): void {
  const modal = document.getElementById("profile-modal");
  if (!modal) return;
  modal.classList.add("closing");
  setTimeout(() => {
    modal.classList.remove("closing");
    modal.classList.add("hidden");
  }, 280);
  _selectedAvatarFile = null;
}

async function saveProfile(): Promise<void> {
  if (!_clientId) return;

  const nameInput = document.getElementById(
    "modal-name-input",
  ) as HTMLInputElement | null;
  const saveBtn = document.getElementById(
    "modal-save-btn",
  ) as HTMLButtonElement | null;
  const name = nameInput?.value.trim() ?? "";

  if (!name) return;

  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.textContent = "保存中...";
  }

  let imageUrl: string | undefined = undefined;
  if (_selectedAvatarFile) {
    const uploaded = await uploadAvatarToStorage(
      "client-avatars",
      _clientId,
      _selectedAvatarFile,
    );
    if (uploaded) imageUrl = uploaded;
  }

  const patch: Record<string, unknown> = { display_name: name };
  if (imageUrl) patch.profile_image_url = imageUrl;

  const { error } = await supabase
    .from("clients")
    .update(patch)
    .eq("id", _clientId);

  if (!error) {
    const nameEl = document.getElementById("profile-name");
    if (nameEl) nameEl.textContent = name;
    if (imageUrl) {
      _currentAvatarUrl = imageUrl;
      const avatarEl = document.getElementById(
        "profile-avatar",
      ) as HTMLImageElement | null;
      if (avatarEl) avatarEl.src = imageUrl;
    }
    closeModal();
    showSuccessMessage();
  } else {
    closeModal();
    showErrorMessage("保存に失敗しました。しばらくたってから再度お試しください。");
  }

  if (saveBtn) {
    saveBtn.disabled = false;
    saveBtn.textContent = "保存";
  }
}

function setupModal(): void {
  document
    .getElementById("profile-action-btn")
    ?.addEventListener("click", openModal);
  document
    .getElementById("modal-close-btn")
    ?.addEventListener("click", closeModal);
  document
    .getElementById("modal-cancel-btn")
    ?.addEventListener("click", closeModal);
  document
    .getElementById("modal-save-btn")
    ?.addEventListener("click", saveProfile);

  // オーバーレイタップで閉じる
  document.getElementById("profile-modal")?.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeModal();
  });

  // アバターファイル選択 → プレビュー更新
  const fileInput = document.getElementById(
    "modal-avatar-input",
  ) as HTMLInputElement | null;
  const preview = document.getElementById(
    "modal-avatar-preview",
  ) as HTMLImageElement | null;

  fileInput?.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    _selectedAvatarFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (preview) preview.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

setupModal();
setupPointUse();
setupQrScanner();
(async () => {
  const clientId = await checkClientAuth();
  if (!clientId) return;
  _clientId = clientId;
  await loadProfile();
})();
