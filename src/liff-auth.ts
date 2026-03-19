/**
 * src/liff-auth.ts
 *
 * LIFF 認証の中核モジュール。
 * - 開発環境: LIFF をスキップし、DB から固定ユーザーを返す
 * - 本番環境: liff.init() → IDトークン取得 → Edge Function（line-auth）で検証
 *             → Supabase Auth セッションを verifyOtp で確立
 *
 * LocalStorage は使用しない（persistSession: false）。
 * LIFF SDK 自身がセッションを管理するため、ページ遷移のたびに liff.init() を呼ぶ。
 */

import liff from "@line/liff";
import { supabase } from "./supabase";

const LIFF_ID = import.meta.env.VITE_LIFF_ID as string;

// 開発環境用の固定ユーザー
const DEV_CLIENT_LINE_ID = "U_client_test_001";
const DEV_TRAINER_LINE_ID = "U_trainer_test_002";

// ============================================================
// クライアント認証（FLOW A: ケース①②③④）
// ============================================================

/**
 * クライアント向けページの認証。
 * 成功時は clients.id（UUID）を返す。
 * 未登録時は id-confirm.html へリダイレクトして null を返す。
 * 開発環境では LIFF をスキップし、固定 LINE ID でクライアントを検索する。
 */
export async function initClientAuth(): Promise<string | null> {
  if (import.meta.env.DEV) {
    const { data, error } = await supabase
      .from("clients")
      .select("id")
      .eq("line_user_id", DEV_CLIENT_LINE_ID)
      .single();
    if (error || !data) {
      console.error("Dev auth: client not found", error?.message);
      return null;
    }
    return data.id as string;
  }

  // sessionStorage にキャッシュがあれば liff.init() ごとスキップ
  const cachedClientId = sessionStorage.getItem("client_id");
  if (cachedClientId) {
    return cachedClientId;
  }

  // --- 本番: LIFF 初期化 ---
  // タイムアウト付きで init を実行。ハングまたはエラー時は LINE 再認証へフォールバック
  try {
    console.log("[liff-auth] liff.init() start");
    await Promise.race([
      liff.init({ liffId: LIFF_ID }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("liff.init timeout")), 10000),
      ),
    ]);
    console.log("[liff-auth] liff.init() done, isLoggedIn:", liff.isLoggedIn());
  } catch (e) {
    console.warn("[liff-auth] liff.init() failed, redirect to login:", e);
    liff.login({ redirectUri: window.location.href });
    return null;
  }

  if (!liff.isLoggedIn()) {
    // FLOW A では LINE アプリ経由でアクセスするため、通常は必ずログイン済み
    // 未ログイン時はLINEログイン画面へ（リダイレクト先はLIFFエンドポイントURLで決まる）
    liff.login({ redirectUri: window.location.href });
    return null; // リダイレクト後はここに戻らない
  }

  const idToken = liff.getIDToken();
  if (!idToken) {
    console.error("LIFF: IDToken unavailable");
    return null;
  }

  // LINE ユーザー ID をログ出力
  const decodedToken = liff.getDecodedIDToken();
  console.log("LIFF: LINE User ID =", decodedToken?.sub);

  // Edge Function でトークン検証 & セッション発行
  const { data: result, error: fnError } = await supabase.functions.invoke(
    "line-auth",
    {
      body: { id_token: idToken, mode: "client" },
    },
  );

  if (fnError) {
    console.error("line-auth function error:", fnError.message);
    return null;
  }

  if (result.status === "unregistered") {
    // ケース①③: clients 未登録 → ID 確認画面
    window.location.replace("id-confirm.html");
    return null;
  }

  if (result.status !== "ok") {
    console.error("Auth failed:", result.status);
    return null;
  }

  // Supabase Auth セッション確立（LocalStorage には保存しない）
  const { error: sessionError } = await supabase.auth.verifyOtp({
    type: "magiclink",
    token_hash: result.hashed_token,
  });
  if (sessionError) {
    console.error("Session setup failed:", sessionError.message);
    return null;
  }

  // 認証成功: 次回ページ遷移で Edge Function をスキップするためキャッシュ
  sessionStorage.setItem("client_id", result.client_id as string);
  return result.client_id as string;
}

// ============================================================
// トレーナー認証（FLOW B: ケース⑤⑥）
// ============================================================

/**
 * トレーナー向けページの認証。
 * 成功時は trainers.id（UUID）を返す。
 * 未登録時は error.html へリダイレクトして null を返す。
 * 開発環境では LIFF をスキップし、DB の最初のアクティブトレーナーを返す。
 */
export async function initTrainerAuth(): Promise<string | null> {
  if (import.meta.env.DEV) {
    const { data, error } = await supabase
      .from("trainers")
      .select("id")
      .eq("line_user_id", DEV_TRAINER_LINE_ID)
      .eq("delete_flg", false)
      .single();
    if (error || !data) {
      window.location.replace("error.html");
      return null;
    }
    return data.id as string;
  }

  // sessionStorage にキャッシュがあれば liff.init() ごとスキップ
  const cachedTrainerId = sessionStorage.getItem("trainer_id");
  if (cachedTrainerId) {
    return cachedTrainerId;
  }

  // --- 本番: LIFF 初期化 ---
  await liff.init({ liffId: LIFF_ID });

  if (!liff.isLoggedIn()) {
    // FLOW B: URL 直打ちでは未ログインのケースがある → LINE ログイン画面へ
    liff.login({ redirectUri: window.location.href });
    return null; // リダイレクト後はここに戻らない
  }

  const idToken = liff.getIDToken();
  if (!idToken) {
    console.error("LIFF: IDToken unavailable");
    return null;
  }

  const { data: result, error: fnError } = await supabase.functions.invoke(
    "line-auth",
    {
      body: { id_token: idToken, mode: "trainer" },
    },
  );

  if (fnError) {
    console.error("line-auth function error:", fnError.message);
    return null;
  }

  if (result.status === "forbidden") {
    // ケース⑤: trainers 未登録 → アクセス拒否画面
    window.location.replace("error.html");
    return null;
  }

  if (result.status !== "ok") {
    console.error("Auth failed:", result.status);
    return null;
  }

  const { error: sessionError } = await supabase.auth.verifyOtp({
    type: "magiclink",
    token_hash: result.hashed_token,
  });
  if (sessionError) {
    console.error("Session setup failed:", sessionError.message);
    return null;
  }

  // 認証成功: 次回ページ遷移で Edge Function をスキップするためキャッシュ
  sessionStorage.setItem("trainer_id", result.trainer_id as string);
  return result.trainer_id as string;
}

// ============================================================
// ユーティリティ
// ============================================================

/**
 * LIFF から取得した LINE ユーザー ID を返す。
 * liff.init() 済みであることが前提。
 * 開発環境では固定の開発用 LINE ID を返す。
 */
export function getLineUserId(): string | null {
  if (import.meta.env.DEV) return DEV_CLIENT_LINE_ID;
  return liff.getDecodedIDToken()?.sub ?? null;
}
