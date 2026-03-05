-- client_tasks テーブルに完了時レベルを記録するカラムを追加
-- 宿題完了提出時に、そのカテゴリの current_level を保存する
ALTER TABLE client_tasks ADD COLUMN level_at_completion INT;
