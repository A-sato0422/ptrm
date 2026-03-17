/**
 * supabase/functions/line-auth/index.ts
 *
 * LINE IDトークンを検証し、Supabase Auth セッションを発行する Edge Function。
 *
 * リクエスト:
 *   POST /functions/v1/line-auth
 *   Body: { id_token: string, mode: "client" | "trainer" }
 *
 * レスポンス:
 *   { status: "ok",          role: "client"|"trainer", client_id|trainer_id, hashed_token }
 *   { status: "unregistered" }  ← clients 未登録（ケース①③）
 *   { status: "forbidden"   }  ← trainers 未登録（ケース⑤）
 *   { status: "invalid_token" | "server_error" }
 *
 * 必要な Supabase Secrets（supabase secrets set で設定）:
 *   LINE_CHANNEL_ID  … LIFF アプリのチャンネル ID
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const LINE_CHANNEL_ID = Deno.env.get('LINE_CHANNEL_ID')!

// ============================================================
// LINE IDトークン検証
// ============================================================

/** LINE API でトークンを検証し、LINE ユーザー ID（sub）を返す。失敗時は null。*/
async function verifyLineIdToken(idToken: string): Promise<string | null> {
  const res = await fetch('https://api.line.me/oauth2/v2.1/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ id_token: idToken, client_id: LINE_CHANNEL_ID }),
  })
  if (!res.ok) {
    const errorBody = await res.text()
    console.error('LINE verify failed:', res.status, errorBody)
    return null
  }
  const payload = await res.json()
  // payload.sub が LINE ユーザー ID
  return typeof payload.sub === 'string' ? payload.sub : null
}

// ============================================================
// Supabase Auth ユーザー確保 + セッショントークン発行
// ============================================================

/**
 * supabaseAdmin を使って auth.users にユーザーを確保し、
 * マジックリンクの hashed_token を返す。
 * DB の clients/trainers テーブルの UUID と auth.users.id を一致させることで
 * RLS ポリシー（auth.uid() = <table>.id）が有効になる。
 */
async function ensureAuthUserAndGenerateToken(
  supabaseAdmin: ReturnType<typeof createClient>,
  userId: string,
  syntheticEmail: string,
  lineUserId: string,
): Promise<string | null> {
  // 既存 auth ユーザーの確認
  const { data: existing } = await supabaseAdmin.auth.admin.getUserById(userId)

  if (!existing.user) {
    // 初回: clients/trainers.id と同じ UUID で auth ユーザーを作成
    const { error: createError } = await supabaseAdmin.auth.admin.createUser({
      id: userId,
      email: syntheticEmail,
      email_confirm: true,
      user_metadata: { line_user_id: lineUserId },
    })
    if (createError) {
      console.error('createUser error:', createError.message)
      return null
    }
  }

  // マジックリンクを生成してトークンハッシュを取得
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: syntheticEmail,
  })
  if (linkError || !linkData?.properties?.hashed_token) {
    console.error('generateLink error:', linkError?.message)
    return null
  }

  return linkData.properties.hashed_token
}

// ============================================================
// メインハンドラー
// ============================================================

Deno.serve(async (req: Request) => {
  // CORS プリフライト
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const json = (body: Record<string, unknown>, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  let id_token: string
  let mode: string
  try {
    const body = await req.json()
    id_token = body.id_token
    mode = body.mode
    if (!id_token || !mode) throw new Error('missing fields')
  } catch {
    return json({ status: 'bad_request' }, 400)
  }

  // LINE IDトークン検証
  const lineUserId = await verifyLineIdToken(id_token)
  if (!lineUserId) {
    return json({ status: 'invalid_token' }, 401)
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  })

  // ============================================================
  // FLOW B: トレーナー認証（mode === "trainer"）
  // ============================================================
  if (mode === 'trainer') {
    const { data: trainer, error: dbError } = await supabaseAdmin
      .from('trainers')
      .select('id')
      .eq('line_user_id', lineUserId)
      .eq('delete_flg', false)
      .single()

    if (dbError || !trainer) {
      // ケース⑤: trainers 未登録 → アクセス拒否
      return json({ status: 'forbidden' }, 403)
    }

    const syntheticEmail = `${lineUserId}@line.ptrm`
    const hashedToken = await ensureAuthUserAndGenerateToken(
      supabaseAdmin,
      trainer.id,
      syntheticEmail,
      lineUserId,
    )
    if (!hashedToken) return json({ status: 'server_error' }, 500)

    // ケース⑥: trainers 登録済み → セッション発行
    return json({ status: 'ok', role: 'trainer', trainer_id: trainer.id, hashed_token: hashedToken })
  }

  // ============================================================
  // FLOW A: クライアント認証（mode === "client"）
  // ============================================================
  const { data: client, error: dbError } = await supabaseAdmin
    .from('clients')
    .select('id')
    .eq('line_user_id', lineUserId)
    .single()

  if (dbError || !client) {
    // ケース①③: clients 未登録 → ID 確認画面へ
    return json({ status: 'unregistered' })
  }

  const syntheticEmail = `${lineUserId}@line.ptrm`
  const hashedToken = await ensureAuthUserAndGenerateToken(
    supabaseAdmin,
    client.id,
    syntheticEmail,
    lineUserId,
  )
  if (!hashedToken) return json({ status: 'server_error' }, 500)

  // ケース②④: clients 登録済み → セッション発行
  return json({ status: 'ok', role: 'client', client_id: client.id, hashed_token: hashedToken })
})
