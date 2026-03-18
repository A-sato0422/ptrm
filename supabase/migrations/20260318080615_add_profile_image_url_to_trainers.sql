-- trainers テーブルにプロフィール画像 URL カラムを追加する
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
