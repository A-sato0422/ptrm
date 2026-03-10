-- client_levels.updated_by を削除
-- 更新者情報は level_history.updated_by で一元管理するため不要
ALTER TABLE client_levels DROP COLUMN IF EXISTS updated_by;
