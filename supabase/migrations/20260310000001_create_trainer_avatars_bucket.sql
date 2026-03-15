-- トレーナー用プロフィール画像バケットを作成する
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'trainer-avatars',
  'trainer-avatars',
  true,
  5242880,   -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 開発中の一時ポリシー（LIFF認証実装後に差し替える）
CREATE POLICY "dev_allow_all_trainer_avatars"
  ON storage.objects FOR ALL
  USING (bucket_id = 'trainer-avatars')
  WITH CHECK (bucket_id = 'trainer-avatars');
