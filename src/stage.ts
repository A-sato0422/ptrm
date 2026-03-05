/**
 * src/stage.ts
 * ステージ画面（stage.html）専用スクリプト
 * - stagesテーブルからステージ一覧を取得して描画
 * - client_levelsの最小レベルから現在ステージを算出
 */

import { supabase } from "./supabase";
import { initLayout } from "./page-init";

initLayout();

// 開発用：後でLIFF認証の line_user_id に差し替える
const DEV_CLIENT_LINE_ID = "U_client_test_001";

// ステージ番号ごとのアイコン絵文字
const STAGE_ICONS: Record<number, string> = {
  1: "🏠",
  2: "🏃",
  3: "🧘",
  4: "⚡",
  5: "💪",
  6: "🏔️",
};

interface Stage {
  stage_no: number;
  name: string;
  description: string | null;
  level_to: number;
}

async function getClientId(): Promise<string | null> {
  const { data, error } = await supabase
    .from("clients")
    .select("id")
    .eq("line_user_id", DEV_CLIENT_LINE_ID)
    .single();
  if (error || !data) {
    console.error("クライアントID取得エラー:", error?.message);
    return null;
  }
  return data.id;
}

/** 全カテゴリの current_level の最小値を返す（レコードなしの場合は 1）*/
async function getMinLevel(clientId: string): Promise<number> {
  const { data, error } = await supabase
    .from("client_levels")
    .select("current_level")
    .eq("client_id", clientId);
  if (error || !data || data.length === 0) return 1;
  return Math.min(...data.map((l: { current_level: number }) => l.current_level));
}

function renderStages(stages: Stage[], minLevel: number): void {
  // 現在ステージ: minLevel が level_to 未満の最初のステージ
  const currentStage =
    stages.find((s) => minLevel < s.level_to) ?? stages[stages.length - 1];
  const maxStageNo = stages[stages.length - 1]?.stage_no ?? 6;
  const remainingCount = maxStageNo - currentStage.stage_no;

  // ステータスカードを更新
  const statusValue = document.querySelector<HTMLElement>(".status-value");
  const statusSubtitle = document.querySelector<HTMLElement>(".status-subtitle");
  if (statusValue) statusValue.textContent = `第${currentStage.stage_no}合目 到着！`;
  if (statusSubtitle) {
    statusSubtitle.textContent =
      remainingCount > 0
        ? `頂上まであと${remainingCount}ステージ`
        : "頂上に到達しました！";
  }

  const container = document.getElementById("stage-list");
  if (!container) return;

  const rows: string[] = [];

  // stage 6（最上位）→ stage 1 の順に描画
  for (let i = stages.length - 1; i >= 0; i--) {
    const stage = stages[i];
    const isActive = stage.stage_no === currentStage.stage_no;
    const isCompleted = minLevel >= stage.level_to;
    // 最上位ステージかつ未到達の場合は locked
    const isLocked = !isActive && !isCompleted && stage.stage_no === maxStageNo;

    let dotClass = "trail-dot";
    let cardClass = "stage-card";
    let iconClass = "stage-icon";
    let badgeClass = "stage-badge";

    if (isActive) {
      dotClass += " active-dot";
      cardClass += " active-stage";
      iconClass += " active-icon";
      badgeClass += " active-badge";
    } else if (isCompleted) {
      dotClass += " completed-dot";
      cardClass += " completed-stage";
      iconClass += " completed-icon";
      badgeClass += " completed-badge";
    } else {
      cardClass += " inactive-stage";
      if (isLocked) cardClass += " locked-stage";
    }

    const badgeText = `${stage.stage_no}合目`;

    const icon = STAGE_ICONS[stage.stage_no] ?? "🗻";
    const description = stage.description ?? "";

    rows.push(
      `<div class="stage-row">` +
        `<div class="${dotClass}"></div>` +
        `<div class="${cardClass}">` +
        `<div class="${iconClass}"><span class="icon">${icon}</span></div>` +
        `<span class="${badgeClass}">${badgeText}</span>` +
        `<h3 class="stage-title">${stage.name}</h3>` +
        `<p class="stage-description">${description}</p>` +
        `</div>` +
        `</div>`,
    );
  }

  // ベースキャンプ（一番下）
  rows.push(`<div class="stage-row base-camp"></div>`);

  container.innerHTML = rows.join("");
}

async function init(): Promise<void> {
  const [stagesResult, clientId] = await Promise.all([
    supabase
      .from("stages")
      .select("stage_no, name, description, level_to")
      .order("stage_no", { ascending: true }),
    getClientId(),
  ]);

  if (stagesResult.error) {
    console.error("ステージ取得エラー:", stagesResult.error.message);
  }

  const stages: Stage[] = (stagesResult.data as Stage[]) ?? [];
  if (stages.length === 0) return;

  const minLevel = clientId ? await getMinLevel(clientId) : 1;
  renderStages(stages, minLevel);
}

init();
