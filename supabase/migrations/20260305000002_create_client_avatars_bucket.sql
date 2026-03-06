-- クライアント用プロフィール画像バケットを作成する
-- trainer-avatars と同様に Public バケットとして設定する

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'client-avatars',
  'client-avatars',
  true,
  5242880,   -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 開発中は全操作を全許可（trainer-avatars と同様の単一ポリシー）
CREATE POLICY "dev_allow_all_client_avatars"
  ON storage.objects FOR ALL
  USING (bucket_id = 'client-avatars')
  WITH CHECK (bucket_id = 'client-avatars');
