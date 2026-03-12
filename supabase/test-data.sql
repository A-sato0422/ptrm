-- ============================================================
-- PTRM ダミーデータ投入 SQL
-- トレーナー3名 / クライアント30名 / タスク20件（4カテゴリ×5）
-- ※ UUID は全て gen_random_uuid() で自動生成
-- ============================================================

-- 既存データをクリア（依存順に削除）
TRUNCATE point_history   CASCADE;
TRUNCATE trainer_memos   CASCADE;
TRUNCATE level_history   CASCADE;
TRUNCATE will_matrix     CASCADE;
TRUNCATE client_tasks    CASCADE;
TRUNCATE client_levels   CASCADE;
TRUNCATE tasks           CASCADE;
TRUNCATE clients         CASCADE;
TRUNCATE trainers        CASCADE;
TRUNCATE stages          CASCADE;
TRUNCATE categories      CASCADE;


-- ============================================================
-- 1. カテゴリー（4種目固定）
-- ============================================================
INSERT INTO categories (name) VALUES
  ('マットピラティス'),
  ('ウェイトトレーニング'),
  ('スポーツトレーニング'),
  ('ムーブメントトレーニング');


-- ============================================================
-- 2. ステージ（6段階）
-- ============================================================
INSERT INTO stages (stage_no, name, description, level_to) VALUES
  (1, '導入・習得期',     'トレーニングの基礎を学び、正しいフォームを身につけるステージです。',          5),
  (2, '定着・習慣期',     '基礎が定着し、トレーニングが日常の一部になるステージです。',                 10),
  (3, '向上・変化期',     '体の変化を実感し、さらなるレベルアップを目指すステージです。',               15),
  (4, '応用・発展期',     '★40代レベルへの挑戦。応用技術を習得し、パフォーマンスを高めるステージです。', 20),
  (5, '洗練・専門期',     '高度な技術を洗練させ、専門性を追求するステージです。',                       25),
  (6, '究極・レジェンド', '最高峰の技術と体力を兼ね備えた究極のステージです。',                         30);


-- ============================================================
-- 3. トレーナー（3名）
-- ============================================================
INSERT INTO trainers (line_user_id, display_name, delete_flg) VALUES
  ('U_trainer_yamashita', '山下 太郎', false),
  ('U_trainer_suzuki',    '鈴木 花子', false),
  ('U_trainer_tanaka',    '田中 健一', false);


-- ============================================================
-- 4. クライアント（30名）
-- ============================================================
INSERT INTO clients (line_user_id, display_name, course_name, points, next_goal) VALUES
  ('U_client_001', '佐藤 美咲',   'スタンダード', 120, '全項目Lv.6達成で2合目クリア'),
  ('U_client_002', '高橋 裕子',   'プレミアム',   80,  'ウェイトトレーニングLv.3達成'),
  ('U_client_003', '渡辺 恵子',   'スタンダード', 45,  'マットピラティスLv.2達成'),
  ('U_client_004', '伊藤 真由美', 'プレミアム',   200, '全項目Lv.11達成で3合目クリア'),
  ('U_client_005', '山本 智子',   'スタンダード', 30,  'スポーツトレーニングLv.2達成'),
  ('U_client_006', '中村 洋子',   'プレミアム',   150, '全項目Lv.16達成で4合目クリア'),
  ('U_client_007', '小林 和子',   'スタンダード', 60,  'ムーブメントトレーニングLv.4達成'),
  ('U_client_008', '加藤 節子',   'スタンダード', 10,  'マットピラティスLv.2達成'),
  ('U_client_009', '吉田 幸子',   'プレミアム',   90,  '全項目Lv.6達成で2合目クリア'),
  ('U_client_010', '山田 久美子', 'スタンダード', 35,  'ウェイトトレーニングLv.3達成'),
  ('U_client_011', '松本 理恵',   'プレミアム',   170, '全項目Lv.21達成で5合目クリア'),
  ('U_client_012', '井上 雅子',   'スタンダード', 55,  'スポーツトレーニングLv.5達成'),
  ('U_client_013', '木村 京子',   'スタンダード', 20,  'マットピラティスLv.2達成'),
  ('U_client_014', '林 由美',     'プレミアム',   110, '全項目Lv.11達成で3合目クリア'),
  ('U_client_015', '斎藤 直美',   'スタンダード', 40,  'ウェイトトレーニングLv.4達成'),
  ('U_client_016', '清水 敏子',   'プレミアム',   95,  '全項目Lv.6達成で2合目クリア'),
  ('U_client_017', '山口 千代',   'スタンダード', 15,  'マットピラティスLv.2達成'),
  ('U_client_018', '森 知恵子',   'スタンダード', 70,  'ムーブメントトレーニングLv.6達成'),
  ('U_client_019', '池田 恵美',   'プレミアム',   130, '全項目Lv.11達成で3合目クリア'),
  ('U_client_020', '橋本 良子',   'スタンダード', 25,  'スポーツトレーニングLv.3達成'),
  ('U_client_021', '阿部 典子',   'プレミアム',   180, '全項目Lv.21達成で5合目クリア'),
  ('U_client_022', '石川 美代子', 'スタンダード', 50,  'ウェイトトレーニングLv.5達成'),
  ('U_client_023', '前田 文子',   'スタンダード', 5,   'マットピラティスLv.1達成'),
  ('U_client_024', '藤田 光代',   'プレミアム',   140, '全項目Lv.16達成で4合目クリア'),
  ('U_client_025', '後藤 春子',   'スタンダード', 65,  'ムーブメントトレーニングLv.7達成'),
  ('U_client_026', '岡田 弘子',   'プレミアム',   100, '全項目Lv.6達成で2合目クリア'),
  ('U_client_027', '村上 淑子',   'スタンダード', 75,  'スポーツトレーニングLv.6達成'),
  ('U_client_028', '近藤 美智子', 'スタンダード', 0,   'マットピラティスLv.1達成'),
  ('U_client_029', '石田 登美子', 'プレミアム',   160, '全項目Lv.16達成で4合目クリア'),
  ('U_client_030', '坂本 千鶴',   'スタンダード', 85,  '全項目Lv.11達成で3合目クリア');


-- ============================================================
-- 5. タスク（4カテゴリ × 5件 = 20件）
-- ============================================================

-- マットピラティス（5件）
INSERT INTO tasks (category_id, title, why_text, youtube_url) VALUES
  ((SELECT id FROM categories WHERE name = 'マットピラティス'), 'ハンドレッド',                 '体幹の安定性と呼吸のコントロールを養うための基本エクササイズです。',           'https://www.youtube.com/watch?v=example01'),
  ((SELECT id FROM categories WHERE name = 'マットピラティス'), 'ロールアップ',                 '背骨の柔軟性と腹筋群の連動を高め、日常動作の安定につながります。',             'https://www.youtube.com/watch?v=example02'),
  ((SELECT id FROM categories WHERE name = 'マットピラティス'), 'シングルレッグストレッチ',     '左右の体幹バランスと股関節の可動域向上に効果的です。',                         'https://www.youtube.com/watch?v=example03'),
  ((SELECT id FROM categories WHERE name = 'マットピラティス'), 'ダブルレッグストレッチ',       '全身の協調性を高め、体幹の安定性をさらに強化します。',                         'https://www.youtube.com/watch?v=example04'),
  ((SELECT id FROM categories WHERE name = 'マットピラティス'), 'スパインストレッチフォワード', '背骨のモビリティを向上させ、デスクワークでの姿勢改善につながります。',         'https://www.youtube.com/watch?v=example05');

-- ウェイトトレーニング（5件）
INSERT INTO tasks (category_id, title, why_text, youtube_url) VALUES
  ((SELECT id FROM categories WHERE name = 'ウェイトトレーニング'), 'スクワット（自体重）', '下半身の基礎筋力と骨密度向上のための基本種目です。',                           'https://www.youtube.com/watch?v=example06'),
  ((SELECT id FROM categories WHERE name = 'ウェイトトレーニング'), 'デッドリフト（軽負荷）', '背面の筋力強化と正しいヒンジ動作の習得に不可欠です。',                         'https://www.youtube.com/watch?v=example07'),
  ((SELECT id FROM categories WHERE name = 'ウェイトトレーニング'), 'ベンチプレス（軽負荷）', '上半身の押す動作を強化し、日常生活のパフォーマンスを向上させます。',           'https://www.youtube.com/watch?v=example08'),
  ((SELECT id FROM categories WHERE name = 'ウェイトトレーニング'), 'ダンベルロウ',           '背中の筋力と姿勢改善に直結する重要な種目です。',                               'https://www.youtube.com/watch?v=example09'),
  ((SELECT id FROM categories WHERE name = 'ウェイトトレーニング'), 'ショルダープレス',       '肩周りの安定性を高め、日常の腕を上げる動作を楽にします。',                     'https://www.youtube.com/watch?v=example10');

-- スポーツトレーニング（5件）
INSERT INTO tasks (category_id, title, why_text, youtube_url) VALUES
  ((SELECT id FROM categories WHERE name = 'スポーツトレーニング'), 'ラダードリル（基本）',     '足の運びとアジリティを向上させ、転倒予防にもつながります。',                   'https://www.youtube.com/watch?v=example11'),
  ((SELECT id FROM categories WHERE name = 'スポーツトレーニング'), 'ミニハードルジャンプ',     '下半身のパワー発揮と着地時の衝撃吸収能力を鍛えます。',                         'https://www.youtube.com/watch?v=example12'),
  ((SELECT id FROM categories WHERE name = 'スポーツトレーニング'), 'メディシンボールスロー',   '全身の連動性とパワー発揮のタイミングを習得します。',                           'https://www.youtube.com/watch?v=example13'),
  ((SELECT id FROM categories WHERE name = 'スポーツトレーニング'), 'アジリティTドリル',        '方向転換の素早さと体幹安定性を同時に高めます。',                               'https://www.youtube.com/watch?v=example14'),
  ((SELECT id FROM categories WHERE name = 'スポーツトレーニング'), 'バランスボールキャッチ',   '動的バランスと反応速度の向上を目指すエクササイズです。',                       'https://www.youtube.com/watch?v=example15');

-- ムーブメントトレーニング（5件）
INSERT INTO tasks (category_id, title, why_text, youtube_url) VALUES
  ((SELECT id FROM categories WHERE name = 'ムーブメントトレーニング'), 'キャットカウストレッチ',       '背骨の可動域を広げ、自律神経の調整にも効果があります。',                       'https://www.youtube.com/watch?v=example16'),
  ((SELECT id FROM categories WHERE name = 'ムーブメントトレーニング'), 'ヒップサークル',               '股関節の可動域を改善し、歩行パターンの質を向上させます。',                     'https://www.youtube.com/watch?v=example17'),
  ((SELECT id FROM categories WHERE name = 'ムーブメントトレーニング'), 'ソラシックローテーション',     '胸椎の回旋可動域を広げ、肩こりや腰痛の予防につながります。',                   'https://www.youtube.com/watch?v=example18'),
  ((SELECT id FROM categories WHERE name = 'ムーブメントトレーニング'), 'ベアクロール',                 '四肢の協調性と体幹の安定性を動きの中で鍛えます。',                             'https://www.youtube.com/watch?v=example19'),
  ((SELECT id FROM categories WHERE name = 'ムーブメントトレーニング'), 'ワールドグレイテストストレッチ', '全身の主要な筋群を効率的にストレッチする万能エクササイズです。',               'https://www.youtube.com/watch?v=example20');


-- ============================================================
-- 6. クライアントレベル（30名 × 4カテゴリ = 120行）
-- ============================================================
INSERT INTO client_levels (client_id, category_id, current_level, updated_by) VALUES
  -- 001 佐藤 美咲 (Lv5-7: Stage2前半)
  ((SELECT id FROM clients WHERE line_user_id='U_client_001'), (SELECT id FROM categories WHERE name='マットピラティス'),         6, (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_001'), (SELECT id FROM categories WHERE name='ウェイトトレーニング'),     5, (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_001'), (SELECT id FROM categories WHERE name='スポーツトレーニング'),     7, (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_001'), (SELECT id FROM categories WHERE name='ムーブメントトレーニング'), 5, (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita')),
  -- 002 高橋 裕子 (Lv2-4: Stage1中盤)
  ((SELECT id FROM clients WHERE line_user_id='U_client_002'), (SELECT id FROM categories WHERE name='マットピラティス'),         3, (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_002'), (SELECT id FROM categories WHERE name='ウェイトトレーニング'),     2, (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_002'), (SELECT id FROM categories WHERE name='スポーツトレーニング'),     4, (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_002'), (SELECT id FROM categories WHERE name='ムーブメントトレーニング'), 3, (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki')),
  -- 003 渡辺 恵子 (Lv1-2: Stage1序盤)
  ((SELECT id FROM clients WHERE line_user_id='U_client_003'), (SELECT id FROM categories WHERE name='マットピラティス'),         1, (SELECT id FROM trainers WHERE line_user_id='U_trainer_tanaka')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_003'), (SELECT id FROM categories WHERE name='ウェイトトレーニング'),     2, (SELECT id FROM trainers WHERE line_user_id='U_trainer_tanaka')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_003'), (SELECT id FROM categories WHERE name='スポーツトレーニング'),     1, (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_003'), (SELECT id FROM categories WHERE name='ムーブメントトレーニング'), 2, (SELECT id FROM trainers WHERE line_user_id='U_trainer_tanaka')),
  -- 004 伊藤 真由美 (Lv9-12: Stage2~3)
  ((SELECT id FROM clients WHERE line_user_id='U_client_004'), (SELECT id FROM categories WHERE name='マットピラティス'),         11, (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_004'), (SELECT id FROM categories WHERE name='ウェイトトレーニング'),     10, (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_004'), (SELECT id FROM categories WHERE name='スポーツトレーニング'),     12, (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_004'), (SELECT id FROM categories WHERE name='ムーブメントトレーニング'), 9,  (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita')),
  -- 005 山本 智子 (Lv1-3: Stage1)
  ((SELECT id FROM clients WHERE line_user_id='U_client_005'), (SELECT id FROM categories WHERE name='マットピラティス'),         2, (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_005'), (SELECT id FROM categories WHERE name='ウェイトトレーニング'),     3, (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_005'), (SELECT id FROM categories WHERE name='スポーツトレーニング'),     1, (SELECT id FROM trainers WHERE line_user_id='U_trainer_tanaka')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_005'), (SELECT id FROM categories WHERE name='ムーブメントトレーニング'), 2, (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki')),
  -- 006 中村 洋子 (Lv14-17: Stage3~4)
  ((SELECT id FROM clients WHERE line_user_id='U_client_006'), (SELECT id FROM categories WHERE name='マットピラティス'),         16, (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_006'), (SELECT id FROM categories WHERE name='ウェイトトレーニング'),     15, (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_006'), (SELECT id FROM categories WHERE name='スポーツトレーニング'),     17, (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_006'), (SELECT id FROM categories WHERE name='ムーブメントトレーニング'), 14, (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita')),
  -- 007 小林 和子 (Lv3-5: Stage1終盤)
  ((SELECT id FROM clients WHERE line_user_id='U_client_007'), (SELECT id FROM categories WHERE name='マットピラティス'),         4, (SELECT id FROM trainers WHERE line_user_id='U_trainer_tanaka')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_007'), (SELECT id FROM categories WHERE name='ウェイトトレーニング'),     5, (SELECT id FROM trainers WHERE line_user_id='U_trainer_tanaka')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_007'), (SELECT id FROM categories WHERE name='スポーツトレーニング'),     5, (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_007'), (SELECT id FROM categories WHERE name='ムーブメントトレーニング'), 3, (SELECT id FROM trainers WHERE line_user_id='U_trainer_tanaka')),
  -- 008 加藤 節子 (Lv1: Stage1開始)
  ((SELECT id FROM clients WHERE line_user_id='U_client_008'), (SELECT id FROM categories WHERE name='マットピラティス'),         1, (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_008'), (SELECT id FROM categories WHERE name='ウェイトトレーニング'),     1, (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_008'), (SELECT id FROM categories WHERE name='スポーツトレーニング'),     1, (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_008'), (SELECT id FROM categories WHERE name='ムーブメントトレーニング'), 2, (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita')),
  -- 009 吉田 幸子 (Lv5-8: Stage1~2)
  ((SELECT id FROM clients WHERE line_user_id='U_client_009'), (SELECT id FROM categories WHERE name='マットピラティス'),         7, (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_009'), (SELECT id FROM categories WHERE name='ウェイトトレーニング'),     6, (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_009'), (SELECT id FROM categories WHERE name='スポーツトレーニング'),     5, (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_009'), (SELECT id FROM categories WHERE name='ムーブメントトレーニング'), 8, (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki')),
  -- 010 山田 久美子 (Lv2-4: Stage1)
  ((SELECT id FROM clients WHERE line_user_id='U_client_010'), (SELECT id FROM categories WHERE name='マットピラティス'),         3, (SELECT id FROM trainers WHERE line_user_id='U_trainer_tanaka')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_010'), (SELECT id FROM categories WHERE name='ウェイトトレーニング'),     2, (SELECT id FROM trainers WHERE line_user_id='U_trainer_tanaka')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_010'), (SELECT id FROM categories WHERE name='スポーツトレーニング'),     4, (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_010'), (SELECT id FROM categories WHERE name='ムーブメントトレーニング'), 3, (SELECT id FROM trainers WHERE line_user_id='U_trainer_tanaka')),
  -- 011 松本 理恵 (Lv19-22: Stage4~5)
  ((SELECT id FROM clients WHERE line_user_id='U_client_011'), (SELECT id FROM categories WHERE name='マットピラティス'),         21, (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_011'), (SELECT id FROM categories WHERE name='ウェイトトレーニング'),     20, (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_011'), (SELECT id FROM categories WHERE name='スポーツトレーニング'),     22, (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_011'), (SELECT id FROM categories WHERE name='ムーブメントトレーニング'), 19, (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita')),
  -- 012 井上 雅子 (Lv4-6: Stage1~2)
  ((SELECT id FROM clients WHERE line_user_id='U_client_012'), (SELECT id FROM categories WHERE name='マットピラティス'),         5, (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_012'), (SELECT id FROM categories WHERE name='ウェイトトレーニング'),     6, (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_012'), (SELECT id FROM categories WHERE name='スポーツトレーニング'),     4, (SELECT id FROM trainers WHERE line_user_id='U_trainer_tanaka')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_012'), (SELECT id FROM categories WHERE name='ムーブメントトレーニング'), 5, (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki')),
  -- 013 木村 京子 (Lv1-2: Stage1)
  ((SELECT id FROM clients WHERE line_user_id='U_client_013'), (SELECT id FROM categories WHERE name='マットピラティス'),         1, (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_013'), (SELECT id FROM categories WHERE name='ウェイトトレーニング'),     2, (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_013'), (SELECT id FROM categories WHERE name='スポーツトレーニング'),     1, (SELECT id FROM trainers WHERE line_user_id='U_trainer_tanaka')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_013'), (SELECT id FROM categories WHERE name='ムーブメントトレーニング'), 2, (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita')),
  -- 014 林 由美 (Lv8-11: Stage2~3)
  ((SELECT id FROM clients WHERE line_user_id='U_client_014'), (SELECT id FROM categories WHERE name='マットピラティス'),         10, (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_014'), (SELECT id FROM categories WHERE name='ウェイトトレーニング'),     9,  (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_014'), (SELECT id FROM categories WHERE name='スポーツトレーニング'),     11, (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_014'), (SELECT id FROM categories WHERE name='ムーブメントトレーニング'), 8,  (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki')),
  -- 015 斎藤 直美 (Lv3-5: Stage1)
  ((SELECT id FROM clients WHERE line_user_id='U_client_015'), (SELECT id FROM categories WHERE name='マットピラティス'),         4, (SELECT id FROM trainers WHERE line_user_id='U_trainer_tanaka')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_015'), (SELECT id FROM categories WHERE name='ウェイトトレーニング'),     3, (SELECT id FROM trainers WHERE line_user_id='U_trainer_tanaka')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_015'), (SELECT id FROM categories WHERE name='スポーツトレーニング'),     5, (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_015'), (SELECT id FROM categories WHERE name='ムーブメントトレーニング'), 4, (SELECT id FROM trainers WHERE line_user_id='U_trainer_tanaka')),
  -- 016 清水 敏子 (Lv5-8: Stage1~2)
  ((SELECT id FROM clients WHERE line_user_id='U_client_016'), (SELECT id FROM categories WHERE name='マットピラティス'),         7, (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_016'), (SELECT id FROM categories WHERE name='ウェイトトレーニング'),     5, (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_016'), (SELECT id FROM categories WHERE name='スポーツトレーニング'),     8, (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_016'), (SELECT id FROM categories WHERE name='ムーブメントトレーニング'), 6, (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita')),
  -- 017 山口 千代 (Lv1: Stage1開始)
  ((SELECT id FROM clients WHERE line_user_id='U_client_017'), (SELECT id FROM categories WHERE name='マットピラティス'),         1, (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_017'), (SELECT id FROM categories WHERE name='ウェイトトレーニング'),     1, (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_017'), (SELECT id FROM categories WHERE name='スポーツトレーニング'),     2, (SELECT id FROM trainers WHERE line_user_id='U_trainer_tanaka')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_017'), (SELECT id FROM categories WHERE name='ムーブメントトレーニング'), 1, (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki')),
  -- 018 森 知恵子 (Lv5-7: Stage2前半)
  ((SELECT id FROM clients WHERE line_user_id='U_client_018'), (SELECT id FROM categories WHERE name='マットピラティス'),         6, (SELECT id FROM trainers WHERE line_user_id='U_trainer_tanaka')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_018'), (SELECT id FROM categories WHERE name='ウェイトトレーニング'),     7, (SELECT id FROM trainers WHERE line_user_id='U_trainer_tanaka')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_018'), (SELECT id FROM categories WHERE name='スポーツトレーニング'),     5, (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_018'), (SELECT id FROM categories WHERE name='ムーブメントトレーニング'), 5, (SELECT id FROM trainers WHERE line_user_id='U_trainer_tanaka')),
  -- 019 池田 恵美 (Lv9-12: Stage2~3)
  ((SELECT id FROM clients WHERE line_user_id='U_client_019'), (SELECT id FROM categories WHERE name='マットピラティス'),         10, (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_019'), (SELECT id FROM categories WHERE name='ウェイトトレーニング'),     12, (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_019'), (SELECT id FROM categories WHERE name='スポーツトレーニング'),     9,  (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_019'), (SELECT id FROM categories WHERE name='ムーブメントトレーニング'), 11, (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita')),
  -- 020 橋本 良子 (Lv2-3: Stage1)
  ((SELECT id FROM clients WHERE line_user_id='U_client_020'), (SELECT id FROM categories WHERE name='マットピラティス'),         2, (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_020'), (SELECT id FROM categories WHERE name='ウェイトトレーニング'),     3, (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_020'), (SELECT id FROM categories WHERE name='スポーツトレーニング'),     2, (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_020'), (SELECT id FROM categories WHERE name='ムーブメントトレーニング'), 3, (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki')),
  -- 021 阿部 典子 (Lv20-23: Stage4~5)
  ((SELECT id FROM clients WHERE line_user_id='U_client_021'), (SELECT id FROM categories WHERE name='マットピラティス'),         22, (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_021'), (SELECT id FROM categories WHERE name='ウェイトトレーニング'),     21, (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_021'), (SELECT id FROM categories WHERE name='スポーツトレーニング'),     20, (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_021'), (SELECT id FROM categories WHERE name='ムーブメントトレーニング'), 23, (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita')),
  -- 022 石川 美代子 (Lv4-6: Stage1~2)
  ((SELECT id FROM clients WHERE line_user_id='U_client_022'), (SELECT id FROM categories WHERE name='マットピラティス'),         5, (SELECT id FROM trainers WHERE line_user_id='U_trainer_tanaka')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_022'), (SELECT id FROM categories WHERE name='ウェイトトレーニング'),     4, (SELECT id FROM trainers WHERE line_user_id='U_trainer_tanaka')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_022'), (SELECT id FROM categories WHERE name='スポーツトレーニング'),     6, (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_022'), (SELECT id FROM categories WHERE name='ムーブメントトレーニング'), 5, (SELECT id FROM trainers WHERE line_user_id='U_trainer_tanaka')),
  -- 023 前田 文子 (Lv1: Stage1開始)
  ((SELECT id FROM clients WHERE line_user_id='U_client_023'), (SELECT id FROM categories WHERE name='マットピラティス'),         1, (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_023'), (SELECT id FROM categories WHERE name='ウェイトトレーニング'),     1, (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_023'), (SELECT id FROM categories WHERE name='スポーツトレーニング'),     1, (SELECT id FROM trainers WHERE line_user_id='U_trainer_tanaka')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_023'), (SELECT id FROM categories WHERE name='ムーブメントトレーニング'), 1, (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita')),
  -- 024 藤田 光代 (Lv13-16: Stage3~4)
  ((SELECT id FROM clients WHERE line_user_id='U_client_024'), (SELECT id FROM categories WHERE name='マットピラティス'),         15, (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_024'), (SELECT id FROM categories WHERE name='ウェイトトレーニング'),     14, (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_024'), (SELECT id FROM categories WHERE name='スポーツトレーニング'),     16, (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_024'), (SELECT id FROM categories WHERE name='ムーブメントトレーニング'), 13, (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki')),
  -- 025 後藤 春子 (Lv5-8: Stage2前半)
  ((SELECT id FROM clients WHERE line_user_id='U_client_025'), (SELECT id FROM categories WHERE name='マットピラティス'),         6, (SELECT id FROM trainers WHERE line_user_id='U_trainer_tanaka')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_025'), (SELECT id FROM categories WHERE name='ウェイトトレーニング'),     8, (SELECT id FROM trainers WHERE line_user_id='U_trainer_tanaka')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_025'), (SELECT id FROM categories WHERE name='スポーツトレーニング'),     7, (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_025'), (SELECT id FROM categories WHERE name='ムーブメントトレーニング'), 5, (SELECT id FROM trainers WHERE line_user_id='U_trainer_tanaka')),
  -- 026 岡田 弘子 (Lv5-7: Stage2前半)
  ((SELECT id FROM clients WHERE line_user_id='U_client_026'), (SELECT id FROM categories WHERE name='マットピラティス'),         7, (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_026'), (SELECT id FROM categories WHERE name='ウェイトトレーニング'),     6, (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_026'), (SELECT id FROM categories WHERE name='スポーツトレーニング'),     5, (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_026'), (SELECT id FROM categories WHERE name='ムーブメントトレーニング'), 6, (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita')),
  -- 027 村上 淑子 (Lv5-7: Stage2前半)
  ((SELECT id FROM clients WHERE line_user_id='U_client_027'), (SELECT id FROM categories WHERE name='マットピラティス'),         6, (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_027'), (SELECT id FROM categories WHERE name='ウェイトトレーニング'),     5, (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_027'), (SELECT id FROM categories WHERE name='スポーツトレーニング'),     5, (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_027'), (SELECT id FROM categories WHERE name='ムーブメントトレーニング'), 7, (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki')),
  -- 028 近藤 美智子 (Lv1: Stage1開始)
  ((SELECT id FROM clients WHERE line_user_id='U_client_028'), (SELECT id FROM categories WHERE name='マットピラティス'),         1, (SELECT id FROM trainers WHERE line_user_id='U_trainer_tanaka')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_028'), (SELECT id FROM categories WHERE name='ウェイトトレーニング'),     1, (SELECT id FROM trainers WHERE line_user_id='U_trainer_tanaka')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_028'), (SELECT id FROM categories WHERE name='スポーツトレーニング'),     1, (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_028'), (SELECT id FROM categories WHERE name='ムーブメントトレーニング'), 1, (SELECT id FROM trainers WHERE line_user_id='U_trainer_tanaka')),
  -- 029 石田 登美子 (Lv14-17: Stage3~4)
  ((SELECT id FROM clients WHERE line_user_id='U_client_029'), (SELECT id FROM categories WHERE name='マットピラティス'),         16, (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_029'), (SELECT id FROM categories WHERE name='ウェイトトレーニング'),     14, (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_029'), (SELECT id FROM categories WHERE name='スポーツトレーニング'),     15, (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_029'), (SELECT id FROM categories WHERE name='ムーブメントトレーニング'), 17, (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita')),
  -- 030 坂本 千鶴 (Lv9-11: Stage2~3)
  ((SELECT id FROM clients WHERE line_user_id='U_client_030'), (SELECT id FROM categories WHERE name='マットピラティス'),         10, (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_030'), (SELECT id FROM categories WHERE name='ウェイトトレーニング'),     11, (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_030'), (SELECT id FROM categories WHERE name='スポーツトレーニング'),     9,  (SELECT id FROM trainers WHERE line_user_id='U_trainer_tanaka')),
  ((SELECT id FROM clients WHERE line_user_id='U_client_030'), (SELECT id FROM categories WHERE name='ムーブメントトレーニング'), 10, (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki'));


-- ============================================================
-- 7. クライアントタスク（一部のクライアントに宿題を割り当て）
-- ============================================================
INSERT INTO client_tasks (client_id, task_id, is_completed, completed_at) VALUES
  -- 佐藤 美咲: マットピラティス2件（1件完了）+ ウェイト1件
  ((SELECT id FROM clients WHERE line_user_id='U_client_001'), (SELECT id FROM tasks WHERE title='ハンドレッド'),             true,  '2026-03-01 10:00:00+09'),
  ((SELECT id FROM clients WHERE line_user_id='U_client_001'), (SELECT id FROM tasks WHERE title='ロールアップ'),             false, NULL),
  ((SELECT id FROM clients WHERE line_user_id='U_client_001'), (SELECT id FROM tasks WHERE title='スクワット（自体重）'),     false, NULL),
  -- 高橋 裕子: ウェイト1件 + スポーツ1件
  ((SELECT id FROM clients WHERE line_user_id='U_client_002'), (SELECT id FROM tasks WHERE title='デッドリフト（軽負荷）'),   false, NULL),
  ((SELECT id FROM clients WHERE line_user_id='U_client_002'), (SELECT id FROM tasks WHERE title='ラダードリル（基本）'),     false, NULL),
  -- 伊藤 真由美: 各カテゴリ1件ずつ（2件完了）
  ((SELECT id FROM clients WHERE line_user_id='U_client_004'), (SELECT id FROM tasks WHERE title='シングルレッグストレッチ'), true,  '2026-02-28 14:00:00+09'),
  ((SELECT id FROM clients WHERE line_user_id='U_client_004'), (SELECT id FROM tasks WHERE title='ベンチプレス（軽負荷）'),   true,  '2026-03-02 16:00:00+09'),
  ((SELECT id FROM clients WHERE line_user_id='U_client_004'), (SELECT id FROM tasks WHERE title='メディシンボールスロー'),   false, NULL),
  ((SELECT id FROM clients WHERE line_user_id='U_client_004'), (SELECT id FROM tasks WHERE title='キャットカウストレッチ'),   false, NULL),
  -- 中村 洋子: ムーブメント2件 + スポーツ1件（全完了）
  ((SELECT id FROM clients WHERE line_user_id='U_client_006'), (SELECT id FROM tasks WHERE title='ヒップサークル'),           true,  '2026-03-03 11:00:00+09'),
  ((SELECT id FROM clients WHERE line_user_id='U_client_006'), (SELECT id FROM tasks WHERE title='ソラシックローテーション'), true,  '2026-03-04 09:30:00+09'),
  ((SELECT id FROM clients WHERE line_user_id='U_client_006'), (SELECT id FROM tasks WHERE title='アジリティTドリル'),        true,  '2026-03-05 15:00:00+09'),
  -- 松本 理恵: スポーツ2件 + ウェイト2件
  ((SELECT id FROM clients WHERE line_user_id='U_client_011'), (SELECT id FROM tasks WHERE title='バランスボールキャッチ'),   false, NULL),
  ((SELECT id FROM clients WHERE line_user_id='U_client_011'), (SELECT id FROM tasks WHERE title='ミニハードルジャンプ'),     true,  '2026-03-06 10:00:00+09'),
  ((SELECT id FROM clients WHERE line_user_id='U_client_011'), (SELECT id FROM tasks WHERE title='ダンベルロウ'),             false, NULL),
  ((SELECT id FROM clients WHERE line_user_id='U_client_011'), (SELECT id FROM tasks WHERE title='ショルダープレス'),         false, NULL),
  -- 林 由美: マットピラティス1件（完了）+ ムーブメント1件
  ((SELECT id FROM clients WHERE line_user_id='U_client_014'), (SELECT id FROM tasks WHERE title='ダブルレッグストレッチ'),   true,  '2026-03-01 17:00:00+09'),
  ((SELECT id FROM clients WHERE line_user_id='U_client_014'), (SELECT id FROM tasks WHERE title='ベアクロール'),             false, NULL),
  -- 阿部 典子: 全カテゴリ1件ずつ
  ((SELECT id FROM clients WHERE line_user_id='U_client_021'), (SELECT id FROM tasks WHERE title='スパインストレッチフォワード'), false, NULL),
  ((SELECT id FROM clients WHERE line_user_id='U_client_021'), (SELECT id FROM tasks WHERE title='スクワット（自体重）'),         false, NULL),
  ((SELECT id FROM clients WHERE line_user_id='U_client_021'), (SELECT id FROM tasks WHERE title='ラダードリル（基本）'),         false, NULL),
  ((SELECT id FROM clients WHERE line_user_id='U_client_021'), (SELECT id FROM tasks WHERE title='ワールドグレイテストストレッチ'), false, NULL);


-- ============================================================
-- 8. Will Matrix（好み評価サンプル）
-- ============================================================
INSERT INTO will_matrix (client_id, task_id, like_status) VALUES
  -- 佐藤 美咲
  ((SELECT id FROM clients WHERE line_user_id='U_client_001'), (SELECT id FROM tasks WHERE title='ハンドレッド'),            1),
  ((SELECT id FROM clients WHERE line_user_id='U_client_001'), (SELECT id FROM tasks WHERE title='スクワット（自体重）'),   -1),
  ((SELECT id FROM clients WHERE line_user_id='U_client_001'), (SELECT id FROM tasks WHERE title='キャットカウストレッチ'),  1),
  -- 伊藤 真由美
  ((SELECT id FROM clients WHERE line_user_id='U_client_004'), (SELECT id FROM tasks WHERE title='シングルレッグストレッチ'), 1),
  ((SELECT id FROM clients WHERE line_user_id='U_client_004'), (SELECT id FROM tasks WHERE title='メディシンボールスロー'),  -1),
  ((SELECT id FROM clients WHERE line_user_id='U_client_004'), (SELECT id FROM tasks WHERE title='ベンチプレス（軽負荷）'),   0),
  -- 中村 洋子
  ((SELECT id FROM clients WHERE line_user_id='U_client_006'), (SELECT id FROM tasks WHERE title='ヒップサークル'),            1),
  ((SELECT id FROM clients WHERE line_user_id='U_client_006'), (SELECT id FROM tasks WHERE title='ソラシックローテーション'),  1),
  ((SELECT id FROM clients WHERE line_user_id='U_client_006'), (SELECT id FROM tasks WHERE title='アジリティTドリル'),        -1),
  -- 松本 理恵
  ((SELECT id FROM clients WHERE line_user_id='U_client_011'), (SELECT id FROM tasks WHERE title='バランスボールキャッチ'),    1),
  ((SELECT id FROM clients WHERE line_user_id='U_client_011'), (SELECT id FROM tasks WHERE title='ダンベルロウ'),             -1),
  ((SELECT id FROM clients WHERE line_user_id='U_client_011'), (SELECT id FROM tasks WHERE title='ショルダープレス'),          0);


-- ============================================================
-- 9. トレーナーメモ（セッション履歴サンプル）
-- ============================================================
INSERT INTO trainer_memos (client_id, trainer_id, content, created_at) VALUES
  ((SELECT id FROM clients WHERE line_user_id='U_client_001'), (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita'), 'スクワットのフォームが安定してきた。次回からバーベルに移行予定。', '2026-03-01 10:30:00+09'),
  ((SELECT id FROM clients WHERE line_user_id='U_client_001'), (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki'),    'ピラティスのロールアップが上達。呼吸のタイミングを引き続き指導。', '2026-03-04 11:00:00+09'),
  ((SELECT id FROM clients WHERE line_user_id='U_client_004'), (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita'), '全体的にレベルが上がっている。Stage3クリアまであと少し。モチベーション高い。', '2026-03-02 14:30:00+09'),
  ((SELECT id FROM clients WHERE line_user_id='U_client_006'), (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki'),    'ムーブメント系の課題を全てクリア。新しい課題を3件追加予定。', '2026-03-05 16:00:00+09'),
  ((SELECT id FROM clients WHERE line_user_id='U_client_011'), (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita'), 'Stage5に到達。高度なスポーツトレーニングメニューを提案した。', '2026-03-06 10:30:00+09'),
  ((SELECT id FROM clients WHERE line_user_id='U_client_002'), (SELECT id FROM trainers WHERE line_user_id='U_trainer_tanaka'),    '少し腰に違和感ありとのこと。デッドリフトは軽めで実施。次回経過確認。', '2026-03-03 09:00:00+09'),
  ((SELECT id FROM clients WHERE line_user_id='U_client_014'), (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki'),    'マットピラティスの課題を完了。ダブルレッグストレッチに進む。', '2026-03-01 17:30:00+09'),
  ((SELECT id FROM clients WHERE line_user_id='U_client_021'), (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita'), '非常にハイレベル。自主トレメニューの充実を相談。大会出場も視野に。', '2026-03-05 14:00:00+09');


-- ============================================================
-- 10. レベル更新履歴（サンプル）
-- ============================================================
INSERT INTO level_history (client_id, category_id, level_before, level_after, updated_by, updated_at) VALUES
  ((SELECT id FROM clients WHERE line_user_id='U_client_001'), (SELECT id FROM categories WHERE name='マットピラティス'),     5, 6,  (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita'), '2026-03-01 10:00:00+09'),
  ((SELECT id FROM clients WHERE line_user_id='U_client_001'), (SELECT id FROM categories WHERE name='スポーツトレーニング'), 6, 7,  (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki'),    '2026-03-04 11:00:00+09'),
  ((SELECT id FROM clients WHERE line_user_id='U_client_004'), (SELECT id FROM categories WHERE name='マットピラティス'),     10, 11, (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita'), '2026-02-28 14:00:00+09'),
  ((SELECT id FROM clients WHERE line_user_id='U_client_004'), (SELECT id FROM categories WHERE name='スポーツトレーニング'), 11, 12, (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita'), '2026-03-02 16:00:00+09'),
  ((SELECT id FROM clients WHERE line_user_id='U_client_006'), (SELECT id FROM categories WHERE name='マットピラティス'),     15, 16, (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita'), '2026-03-03 11:00:00+09'),
  ((SELECT id FROM clients WHERE line_user_id='U_client_006'), (SELECT id FROM categories WHERE name='スポーツトレーニング'), 16, 17, (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki'),    '2026-03-05 15:00:00+09'),
  ((SELECT id FROM clients WHERE line_user_id='U_client_011'), (SELECT id FROM categories WHERE name='マットピラティス'),     20, 21, (SELECT id FROM trainers WHERE line_user_id='U_trainer_yamashita'), '2026-03-06 10:00:00+09'),
  ((SELECT id FROM clients WHERE line_user_id='U_client_011'), (SELECT id FROM categories WHERE name='スポーツトレーニング'), 21, 22, (SELECT id FROM trainers WHERE line_user_id='U_trainer_suzuki'),    '2026-03-06 10:30:00+09');


-- ============================================================
-- 11. ポイント履歴（サンプル）
-- ============================================================
INSERT INTO point_history (client_id, point, created_at) VALUES
  ((SELECT id FROM clients WHERE line_user_id='U_client_001'), 50,  '2026-02-15 10:00:00+09'),
  ((SELECT id FROM clients WHERE line_user_id='U_client_001'), 50,  '2026-02-22 10:00:00+09'),
  ((SELECT id FROM clients WHERE line_user_id='U_client_001'), 20,  '2026-03-01 10:00:00+09'),
  ((SELECT id FROM clients WHERE line_user_id='U_client_004'), 100, '2026-02-10 14:00:00+09'),
  ((SELECT id FROM clients WHERE line_user_id='U_client_004'), 100, '2026-03-01 14:00:00+09'),
  ((SELECT id FROM clients WHERE line_user_id='U_client_006'), 80,  '2026-02-20 11:00:00+09'),
  ((SELECT id FROM clients WHERE line_user_id='U_client_006'), 70,  '2026-03-05 11:00:00+09'),
  ((SELECT id FROM clients WHERE line_user_id='U_client_011'), 100, '2026-02-01 10:00:00+09'),
  ((SELECT id FROM clients WHERE line_user_id='U_client_011'), 70,  '2026-03-06 10:00:00+09');
