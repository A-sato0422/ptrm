-- ============================================================
-- PTRM ダミーデータ投入 SQL
-- トレーナー3名 / クライアント200名 / タスク20件（4カテゴリ×5）/ クライアントタスク100名×4件
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
-- 4. クライアント（200名）
-- ============================================================
DO $$
DECLARE
  i INT;
  surnames TEXT[] := ARRAY[
    '田中','鈴木','高橋','伊藤','渡辺','山本','中村','小林','加藤','吉田',
    '山田','松本','井上','木村','林','斎藤','清水','山口','森','池田',
    '橋本','阿部','石川','前田','藤田','後藤','岡田','村上','近藤','石田',
    '坂本','遠藤','青木','藤井','西村','福田','岡本','三浦','松田','中島'
  ];
  given_names TEXT[] := ARRAY[
    '美咲','裕子','恵子','真由美','智子','洋子','和子','節子','幸子','久美子',
    '理恵','雅子','京子','由美','直美','敏子','千代','知恵子','恵美','良子',
    '典子','美代子','文子','光代','春子','弘子','淑子','美智子','登美子','千鶴',
    '愛子','佳子','明美','朋子','順子','道子','麻衣','絵里','奈美','真紀'
  ];
  goals TEXT[] := ARRAY[
    '全項目Lv.6達成で2合目クリア',
    'マットピラティスLv.3達成',
    'ウェイトトレーニングLv.4達成',
    'スポーツトレーニングLv.2達成',
    'ムーブメントトレーニングLv.5達成',
    '全項目Lv.11達成で3合目クリア',
    'マットピラティスLv.7達成',
    'ウェイトトレーニングLv.8達成',
    'スポーツトレーニングLv.6達成',
    'ムーブメントトレーニングLv.9達成'
  ];
BEGIN
  FOR i IN 1..200 LOOP
    INSERT INTO clients (line_user_id, display_name, course_name, points, next_goal) VALUES (
      'U_client_' || LPAD(i::TEXT, 3, '0'),
      surnames[((i - 1) % 40) + 1] || ' ' || given_names[((i * 7 - 1) % 40) + 1],
      CASE WHEN i % 3 = 0 THEN 'プレミアム' ELSE 'スタンダード' END,
      (i * 13 + 7) % 201,
      goals[(i % 10) + 1]
    );
  END LOOP;
END $$;


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
  ((SELECT id FROM categories WHERE name = 'ウェイトトレーニング'), 'スクワット（自体重）',   '下半身の基礎筋力と骨密度向上のための基本種目です。',                           'https://www.youtube.com/watch?v=example06'),
  ((SELECT id FROM categories WHERE name = 'ウェイトトレーニング'), 'デッドリフト（軽負荷）', '背面の筋力強化と正しいヒンジ動作の習得に不可欠です。',                         'https://www.youtube.com/watch?v=example07'),
  ((SELECT id FROM categories WHERE name = 'ウェイトトレーニング'), 'ベンチプレス（軽負荷）', '上半身の押す動作を強化し、日常生活のパフォーマンスを向上させます。',           'https://www.youtube.com/watch?v=example08'),
  ((SELECT id FROM categories WHERE name = 'ウェイトトレーニング'), 'ダンベルロウ',           '背中の筋力と姿勢改善に直結する重要な種目です。',                               'https://www.youtube.com/watch?v=example09'),
  ((SELECT id FROM categories WHERE name = 'ウェイトトレーニング'), 'ショルダープレス',       '肩周りの安定性を高め、日常の腕を上げる動作を楽にします。',                     'https://www.youtube.com/watch?v=example10');

-- スポーツトレーニング（5件）
INSERT INTO tasks (category_id, title, why_text, youtube_url) VALUES
  ((SELECT id FROM categories WHERE name = 'スポーツトレーニング'), 'ラダードリル（基本）',   '足の運びとアジリティを向上させ、転倒予防にもつながります。',                   'https://www.youtube.com/watch?v=example11'),
  ((SELECT id FROM categories WHERE name = 'スポーツトレーニング'), 'ミニハードルジャンプ',   '下半身のパワー発揮と着地時の衝撃吸収能力を鍛えます。',                         'https://www.youtube.com/watch?v=example12'),
  ((SELECT id FROM categories WHERE name = 'スポーツトレーニング'), 'メディシンボールスロー', '全身の連動性とパワー発揮のタイミングを習得します。',                           'https://www.youtube.com/watch?v=example13'),
  ((SELECT id FROM categories WHERE name = 'スポーツトレーニング'), 'アジリティTドリル',      '方向転換の素早さと体幹安定性を同時に高めます。',                               'https://www.youtube.com/watch?v=example14'),
  ((SELECT id FROM categories WHERE name = 'スポーツトレーニング'), 'バランスボールキャッチ', '動的バランスと反応速度の向上を目指すエクササイズです。',                       'https://www.youtube.com/watch?v=example15');

-- ムーブメントトレーニング（5件）
INSERT INTO tasks (category_id, title, why_text, youtube_url) VALUES
  ((SELECT id FROM categories WHERE name = 'ムーブメントトレーニング'), 'キャットカウストレッチ',       '背骨の可動域を広げ、自律神経の調整にも効果があります。',                       'https://www.youtube.com/watch?v=example16'),
  ((SELECT id FROM categories WHERE name = 'ムーブメントトレーニング'), 'ヒップサークル',               '股関節の可動域を改善し、歩行パターンの質を向上させます。',                     'https://www.youtube.com/watch?v=example17'),
  ((SELECT id FROM categories WHERE name = 'ムーブメントトレーニング'), 'ソラシックローテーション',     '胸椎の回旋可動域を広げ、肩こりや腰痛の予防につながります。',                   'https://www.youtube.com/watch?v=example18'),
  ((SELECT id FROM categories WHERE name = 'ムーブメントトレーニング'), 'ベアクロール',                 '四肢の協調性と体幹の安定性を動きの中で鍛えます。',                             'https://www.youtube.com/watch?v=example19'),
  ((SELECT id FROM categories WHERE name = 'ムーブメントトレーニング'), 'ワールドグレイテストストレッチ', '全身の主要な筋群を効率的にストレッチする万能エクササイズです。',               'https://www.youtube.com/watch?v=example20');


-- ============================================================
-- 6. クライアントレベル（200名 × 4カテゴリ = 800行）
-- ============================================================
DO $$
DECLARE
  i INT;
  client_id UUID;
  cat_mat UUID;
  cat_wt  UUID;
  cat_st  UUID;
  cat_mt  UUID;
BEGIN
  SELECT id INTO cat_mat FROM categories WHERE name = 'マットピラティス';
  SELECT id INTO cat_wt  FROM categories WHERE name = 'ウェイトトレーニング';
  SELECT id INTO cat_st  FROM categories WHERE name = 'スポーツトレーニング';
  SELECT id INTO cat_mt  FROM categories WHERE name = 'ムーブメントトレーニング';

  FOR i IN 1..200 LOOP
    SELECT id INTO client_id FROM clients WHERE line_user_id = 'U_client_' || LPAD(i::TEXT, 3, '0');
    INSERT INTO client_levels (client_id, category_id, current_level) VALUES
      (client_id, cat_mat, (i % 10) + 1),
      (client_id, cat_wt,  ((i + 2) % 10) + 1),
      (client_id, cat_st,  ((i + 4) % 10) + 1),
      (client_id, cat_mt,  ((i + 6) % 10) + 1);
  END LOOP;
END $$;


-- ============================================================
-- 7. クライアントタスク（100名 × 4件 = 400行）
-- ============================================================
-- クライアント001-100 に各4件ずつ割り当て（20タスクをローテーション）
DO $$
DECLARE
  i INT;
  client_id UUID;
  task_ids  UUID[];
BEGIN
  -- タスクIDを title 順で取得（20件固定）
  SELECT ARRAY_AGG(id ORDER BY title) INTO task_ids FROM tasks;

  FOR i IN 1..100 LOOP
    SELECT id INTO client_id FROM clients WHERE line_user_id = 'U_client_' || LPAD(i::TEXT, 3, '0');
    INSERT INTO client_tasks (client_id, task_id, is_completed, completed_at) VALUES
      (
        client_id,
        task_ids[((i - 1) * 4 % 20) + 1],
        (i % 3 = 0),
        CASE WHEN i % 3 = 0 THEN ('2026-03-01 10:00:00+09')::TIMESTAMPTZ ELSE NULL END
      ),
      (
        client_id,
        task_ids[((i - 1) * 4 + 1) % 20 + 1],
        (i % 5 = 0),
        CASE WHEN i % 5 = 0 THEN ('2026-03-02 14:00:00+09')::TIMESTAMPTZ ELSE NULL END
      ),
      (
        client_id,
        task_ids[((i - 1) * 4 + 2) % 20 + 1],
        false,
        NULL
      ),
      (
        client_id,
        task_ids[((i - 1) * 4 + 3) % 20 + 1],
        false,
        NULL
      );
  END LOOP;
END $$;


-- ============================================================
-- 8. Will Matrix（好み評価サンプル）
-- ============================================================
INSERT INTO will_matrix (client_id, task_id, like_status) VALUES
  -- U_client_001
  ((SELECT id FROM clients WHERE line_user_id='U_client_001'), (SELECT id FROM tasks WHERE title='ハンドレッド'),            1),
  ((SELECT id FROM clients WHERE line_user_id='U_client_001'), (SELECT id FROM tasks WHERE title='スクワット（自体重）'),   -1),
  ((SELECT id FROM clients WHERE line_user_id='U_client_001'), (SELECT id FROM tasks WHERE title='キャットカウストレッチ'),  1),
  -- U_client_004
  ((SELECT id FROM clients WHERE line_user_id='U_client_004'), (SELECT id FROM tasks WHERE title='シングルレッグストレッチ'), 1),
  ((SELECT id FROM clients WHERE line_user_id='U_client_004'), (SELECT id FROM tasks WHERE title='メディシンボールスロー'),  -1),
  ((SELECT id FROM clients WHERE line_user_id='U_client_004'), (SELECT id FROM tasks WHERE title='ベンチプレス（軽負荷）'),   0),
  -- U_client_006
  ((SELECT id FROM clients WHERE line_user_id='U_client_006'), (SELECT id FROM tasks WHERE title='ヒップサークル'),            1),
  ((SELECT id FROM clients WHERE line_user_id='U_client_006'), (SELECT id FROM tasks WHERE title='ソラシックローテーション'),  1),
  ((SELECT id FROM clients WHERE line_user_id='U_client_006'), (SELECT id FROM tasks WHERE title='アジリティTドリル'),        -1),
  -- U_client_011
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
