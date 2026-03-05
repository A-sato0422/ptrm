-- client_tasks テーブルに論理削除用カラムを追加
-- tasks テーブルの deleted_at と同じ規約に揃える
-- NULL: 有効（アクティブな宿題） / 日時あり: 論理削除済み（トレーナーが課題から外した）
-- 完了済みの宿題は is_completed = true で保持され、deleted_at とは独立して参照可能
ALTER TABLE client_tasks ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
