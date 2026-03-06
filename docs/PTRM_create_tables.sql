-- ============================================================
-- PTRM（パーソナル・トレーニング・ロードマップ）
-- Create Table SQL
-- 対象: Supabase (PostgreSQL)
-- バージョン: 2.0
-- ============================================================


-- ============================================================
-- 1. マスターデータ
-- ============================================================

-- カテゴリー（4種目固定）
CREATE TABLE categories (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name  TEXT NOT NULL
);

-- 6ステージ定義（トレーナーが編集可能）
CREATE TABLE stages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_no    INT  NOT NULL UNIQUE,               -- 1〜6
  name        TEXT NOT NULL,
  description TEXT,
  level_to    INT  NOT NULL,                      -- クリア条件：全カテゴリがこのレベルを超えたら次へ
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 宿題マスター
CREATE TABLE tasks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id  UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  title        TEXT NOT NULL,
  why_text     TEXT,                              -- なぜこのタスクが必要か
  youtube_url  TEXT,
  deleted_at   TIMESTAMPTZ DEFAULT NULL,          -- NULL:有効 / 日時あり:論理削除済み
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ============================================================
-- 2. ユーザー系
-- ============================================================

-- クライアント
CREATE TABLE clients (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  line_user_id       TEXT NOT NULL UNIQUE,        -- LIFFから取得するLINEユーザーID
  display_name       TEXT,
  profile_image_url  TEXT,                        -- Supabase Storage等のURL
  course_name        TEXT,                        -- 契約コース名（例：スタンダード、プレミアム）
  points             INT  NOT NULL DEFAULT 0,     -- 事務来店時に溜まるポイント
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- トレーナー
CREATE TABLE trainers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  line_user_id  TEXT NOT NULL UNIQUE,             -- LIFFから取得するLINEユーザーID
  display_name  TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ============================================================
-- 3. クライアント状態
-- ============================================================

-- クライアント別の現在レベル（4カテゴリ分）
CREATE TABLE client_levels (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     UUID NOT NULL REFERENCES clients(id)    ON DELETE CASCADE,
  category_id   UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  current_level INT  NOT NULL DEFAULT 1 CHECK (current_level BETWEEN 1 AND 30),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by    UUID REFERENCES trainers(id)             ON DELETE SET NULL,
  UNIQUE (client_id, category_id)                       -- 1クライアント×1カテゴリは1レコード
);

-- クライアント別の宿題割り当てと完了状態
CREATE TABLE client_tasks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  task_id      UUID NOT NULL REFERENCES tasks(id)   ON DELETE CASCADE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  assigned_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE (client_id, task_id)                           -- 同じタスクの重複割り当てを防ぐ
);

-- クライアント別の好み評価（tasksに対してクライアントが評価）
CREATE TABLE will_matrix (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  task_id     UUID NOT NULL REFERENCES tasks(id)   ON DELETE CASCADE,
  like_status INT  NOT NULL DEFAULT 0
              CHECK (like_status IN (-1, 0, 1)),        -- -1: やりたくない / 0: どちらでもない / 1: やりたい
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (client_id, task_id)                           -- 1クライアント×1タスクは1レコード
);


-- ============================================================
-- 4. 履歴・ログ
-- ============================================================

-- レベル更新履歴
CREATE TABLE level_history (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     UUID NOT NULL REFERENCES clients(id)    ON DELETE CASCADE,
  category_id   UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  level_before  INT  NOT NULL,
  level_after   INT  NOT NULL,
  updated_by    UUID REFERENCES trainers(id)             ON DELETE SET NULL,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- トレーナーメモ（セッション履歴・自分のメモは編集可能）
CREATE TABLE trainer_memos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID NOT NULL REFERENCES clients(id)  ON DELETE CASCADE,
  trainer_id  UUID REFERENCES trainers(id)           ON DELETE SET NULL,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ============================================================
-- 5. updated_at 自動更新トリガー
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stages_updated_at
  BEFORE UPDATE ON stages
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_trainers_updated_at
  BEFORE UPDATE ON trainers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_client_levels_updated_at
  BEFORE UPDATE ON client_levels
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_will_matrix_updated_at
  BEFORE UPDATE ON will_matrix
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_trainer_memos_updated_at
  BEFORE UPDATE ON trainer_memos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 6. Row Level Security（RLS）
-- ============================================================

ALTER TABLE categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE stages         ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients        ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainers       ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_levels  ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_tasks   ENABLE ROW LEVEL SECURITY;
ALTER TABLE will_matrix    ENABLE ROW LEVEL SECURITY;
ALTER TABLE level_history  ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_memos  ENABLE ROW LEVEL SECURITY;

-- 開発中の一時ポリシー（LIFF認証実装後に差し替える）
CREATE POLICY "dev_allow_all" ON categories    FOR ALL USING (true);
CREATE POLICY "dev_allow_all" ON stages         FOR ALL USING (true);
CREATE POLICY "dev_allow_all" ON tasks          FOR ALL USING (true);
CREATE POLICY "dev_allow_all" ON clients        FOR ALL USING (true);
CREATE POLICY "dev_allow_all" ON trainers       FOR ALL USING (true);
CREATE POLICY "dev_allow_all" ON client_levels  FOR ALL USING (true);
CREATE POLICY "dev_allow_all" ON client_tasks   FOR ALL USING (true);
CREATE POLICY "dev_allow_all" ON will_matrix    FOR ALL USING (true);
CREATE POLICY "dev_allow_all" ON level_history  FOR ALL USING (true);
CREATE POLICY "dev_allow_all" ON trainer_memos  FOR ALL USING (true);


-- ============================================================
-- 7. 初期データ
-- ============================================================

-- カテゴリー（4種目固定）
INSERT INTO categories (name) VALUES
  ('マットピラティス'),
  ('ウェイトトレーニング'),
  ('スポーツトレーニング'),
  ('ムーブメントトレーニング');

-- ステージ（6段階・初期値。トレーナーが管理画面から変更可能）
INSERT INTO stages (stage_no, name, description, level_to) VALUES
  (1, 'カウンセリング前',  'お問い合わせ後、体験予約の調整を行っている段階', 5),
  (2, '定着・習慣期',      '基本動作が身につき、習慣化が進む段階',           10),
  (3, '向上・変化期',      'トレーニング効果が実感できる段階',               15),
  (4, '応用・発展期',      '40代レベルへの本格的な挑戦が始まる段階',         20),
  (5, '洗練・専門期',      '動作の質が高まり、専門的な領域へ踏み込む段階',   25),
  (6, '究極・レジェンド',  '到達者わずか。真のレジェンドへ',                 30);
