-- point_history テーブルを作成する
-- クライアントのポイント獲得・使用履歴を記録する

CREATE TABLE point_history (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id  UUID        NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  point      INT         NOT NULL,           -- 正数: 獲得 / 負数: 使用
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- clients.points がマイナスにならないよう制約を追加
ALTER TABLE clients ADD CONSTRAINT chk_points_non_negative CHECK (points >= 0);

ALTER TABLE point_history ENABLE ROW LEVEL SECURITY;

-- TODO:開発中の一時ポリシー（LIFF認証実装後に差し替える）
CREATE POLICY "dev_allow_all" ON point_history FOR ALL USING (true);
