/**
 * tests/mapper.test.ts
 * mapDbClientToDisplay の単体テスト
 * 副作用なし・純粋関数のため Supabase モック不要
 */

import { describe, it, expect } from "vitest";
import { mapDbClientToDisplay } from "../src/lib/mapper";
import { DEFAULT_AVATAR_URL } from "../src/shared";

// ============================================================
// テスト用フィクスチャ
// ============================================================

const BASE_DB_CLIENT = {
  id: "client-uuid-001",
  display_name: "山田 太郎",
  profile_image_url: "https://example.com/avatar.png",
  course_name: "スタンダード",
  updated_at: "2026-01-15T10:00:00Z",
  client_levels: [
    {
      id: "level-uuid-blue",
      category_id: "cat-uuid-blue",
      current_level: 3,
      categories: { name: "マットピラティス" },
    },
    {
      id: "level-uuid-red",
      category_id: "cat-uuid-red",
      current_level: 5,
      categories: { name: "ウェイトトレーニング" },
    },
    {
      id: "level-uuid-green",
      category_id: "cat-uuid-green",
      current_level: 2,
      categories: { name: "スポーツトレーニング" },
    },
    {
      id: "level-uuid-yellow",
      category_id: "cat-uuid-yellow",
      current_level: 7,
      categories: { name: "ムーブメントトレーニング" },
    },
  ],
  trainer_memos: [
    {
      id: "memo-uuid-001",
      content: "最初のメモ",
      created_at: "2026-01-10T09:00:00Z",
      trainers: { display_name: "鈴木コーチ" },
    },
    {
      id: "memo-uuid-002",
      content: "最新のメモ",
      created_at: "2026-01-15T10:00:00Z",
      trainers: { display_name: "田中コーチ" },
    },
  ],
  client_tasks: [
    {
      id: "ct-uuid-001",
      is_completed: false,
      tasks: {
        id: "task-uuid-001",
        title: "スクワット30回",
        why_text: "下半身強化のため",
        youtube_url: "https://youtube.com/watch?v=abc",
      },
    },
    {
      id: "ct-uuid-002",
      is_completed: true,
      tasks: {
        id: "task-uuid-002",
        title: "プランク1分",
        why_text: null,
        youtube_url: null,
      },
    },
  ],
  will_matrix: [
    { like_status: 1, tasks: { title: "ヨガ" } },
    { like_status: 1, tasks: { title: "ストレッチ" } },
    { like_status: -1, tasks: { title: "バーベル" } },
    { like_status: 0, tasks: { title: "どちらでもよい" } },
  ],
};

// ============================================================
// 正常系テスト
// ============================================================

describe("mapDbClientToDisplay - 正常系", () => {
  it("基本フィールドが正しくマッピングされる", () => {
    const client = mapDbClientToDisplay(BASE_DB_CLIENT);

    expect(client.id).toBe("client-uuid-001");
    expect(client.name).toBe("山田 太郎");
    expect(client.avatarUrl).toBe("https://example.com/avatar.png");
    expect(client.course).toBe("スタンダード");
    expect(client.status).toBe("Active");
    expect(client.nextGoal).toBe("");
  });

  it("4カテゴリのレベルが色キーに正しくマッピングされる", () => {
    const client = mapDbClientToDisplay(BASE_DB_CLIENT);

    expect(client.levels.blue).toBe(3);
    expect(client.levels.red).toBe(5);
    expect(client.levels.green).toBe(2);
    expect(client.levels.yellow).toBe(7);
  });

  it("categoryIdMap / levelIdMap が正しく構築される", () => {
    const client = mapDbClientToDisplay(BASE_DB_CLIENT);

    expect(client.categoryIdMap?.blue).toBe("cat-uuid-blue");
    expect(client.categoryIdMap?.red).toBe("cat-uuid-red");
    expect(client.levelIdMap?.blue).toBe("level-uuid-blue");
    expect(client.levelIdMap?.yellow).toBe("level-uuid-yellow");
  });

  it("メモ履歴が created_at 降順（新しい順）にソートされる", () => {
    const client = mapDbClientToDisplay(BASE_DB_CLIENT);

    expect(client.history).toHaveLength(2);
    expect(client.history![0].content).toBe("最新のメモ");
    expect(client.history![1].content).toBe("最初のメモ");
  });

  it("メモに dbId (trainer_memos.id UUID) が設定される", () => {
    const client = mapDbClientToDisplay(BASE_DB_CLIENT);

    expect(client.history![0].dbId).toBe("memo-uuid-002");
    expect(client.history![1].dbId).toBe("memo-uuid-001");
  });

  it("メモの担当トレーナー名が設定される", () => {
    const client = mapDbClientToDisplay(BASE_DB_CLIENT);

    expect(client.history![0].trainer).toBe("田中コーチ");
    expect(client.history![1].trainer).toBe("鈴木コーチ");
  });

  it("タスクに dbTaskId / clientTaskId が設定される", () => {
    const client = mapDbClientToDisplay(BASE_DB_CLIENT);

    expect(client.currentTasks[0].dbTaskId).toBe("task-uuid-001");
    expect(client.currentTasks[0].clientTaskId).toBe("ct-uuid-001");
    expect(client.currentTasks[1].dbTaskId).toBe("task-uuid-002");
    expect(client.currentTasks[1].clientTaskId).toBe("ct-uuid-002");
  });

  it("タスクの完了状態が正しく設定される", () => {
    const client = mapDbClientToDisplay(BASE_DB_CLIENT);

    expect(client.currentTasks[0].completed).toBe(false);
    expect(client.currentTasks[1].completed).toBe(true);
  });

  it("タスクの理由・YouTube URL が設定される", () => {
    const client = mapDbClientToDisplay(BASE_DB_CLIENT);

    expect(client.currentTasks[0].reason).toBe("下半身強化のため");
    expect(client.currentTasks[0].youtubeUrl).toBe(
      "https://youtube.com/watch?v=abc",
    );
    expect(client.currentTasks[1].reason).toBe("");
    expect(client.currentTasks[1].youtubeUrl).toBe("");
  });

  it("will_matrix の like_status=1 がlikes に、-1 が dislikes にマッピングされる", () => {
    const client = mapDbClientToDisplay(BASE_DB_CLIENT);

    expect(client.preferences.likes).toBe("ヨガ、ストレッチ");
    expect(client.preferences.dislikes).toBe("バーベル");
  });

  it("lastMemo は最新メモの先頭20文字", () => {
    const client = mapDbClientToDisplay(BASE_DB_CLIENT);

    expect(client.lastMemo).toBe("最新のメモ");
  });

  it("previousNote は最新メモの full content", () => {
    const client = mapDbClientToDisplay(BASE_DB_CLIENT);

    expect(client.previousNote).toBe("最新のメモ");
  });
});

// ============================================================
// エラー系 / エッジケーステスト
// ============================================================

describe("mapDbClientToDisplay - エラー系・エッジケース", () => {
  it("display_name が null の場合「名前未設定」にフォールバック", () => {
    const client = mapDbClientToDisplay({
      ...BASE_DB_CLIENT,
      display_name: null,
    });

    expect(client.name).toBe("名前未設定");
  });

  it("profile_image_url が null の場合 DEFAULT_AVATAR_URL にフォールバック", () => {
    const client = mapDbClientToDisplay({
      ...BASE_DB_CLIENT,
      profile_image_url: null,
    });

    expect(client.avatarUrl).toBe(DEFAULT_AVATAR_URL);
  });

  it("client_levels が空の場合、全レベルが 0", () => {
    const client = mapDbClientToDisplay({
      ...BASE_DB_CLIENT,
      client_levels: [],
    });

    expect(client.levels.blue).toBe(0);
    expect(client.levels.red).toBe(0);
    expect(client.levels.green).toBe(0);
    expect(client.levels.yellow).toBe(0);
    expect(client.categoryIdMap).toEqual({});
    expect(client.levelIdMap).toEqual({});
  });

  it("trainer_memos が空の場合、history は空配列", () => {
    const client = mapDbClientToDisplay({
      ...BASE_DB_CLIENT,
      trainer_memos: [],
    });

    expect(client.history).toHaveLength(0);
    expect(client.lastMemo).toBe("");
    expect(client.previousNote).toBe("");
  });

  it("client_tasks が空の場合、currentTasks は空配列", () => {
    const client = mapDbClientToDisplay({
      ...BASE_DB_CLIENT,
      client_tasks: [],
    });

    expect(client.currentTasks).toHaveLength(0);
  });

  it("tasks が null の client_tasks エントリはフィルタリングされる", () => {
    const client = mapDbClientToDisplay({
      ...BASE_DB_CLIENT,
      client_tasks: [
        { id: "ct-null", is_completed: false, tasks: null },
        {
          id: "ct-valid",
          is_completed: false,
          tasks: {
            id: "t-valid",
            title: "有効なタスク",
            why_text: null,
            youtube_url: null,
          },
        },
      ],
    });

    expect(client.currentTasks).toHaveLength(1);
    expect(client.currentTasks[0].title).toBe("有効なタスク");
  });

  it("will_matrix が空の場合は likes / dislikes が空文字", () => {
    const client = mapDbClientToDisplay({
      ...BASE_DB_CLIENT,
      will_matrix: [],
    });

    expect(client.preferences.likes).toBe("");
    expect(client.preferences.dislikes).toBe("");
  });

  it("未知のカテゴリ名は levels に反映されず無視される", () => {
    const client = mapDbClientToDisplay({
      ...BASE_DB_CLIENT,
      client_levels: [
        {
          id: "lv-xxx",
          category_id: "cat-xxx",
          current_level: 9,
          categories: { name: "未知のカテゴリ" },
        },
      ],
    });

    expect(client.levels.blue).toBe(0);
    expect(client.categoryIdMap).toEqual({});
  });

  it("trainers が null のメモでも「トレーナー」にフォールバック", () => {
    const client = mapDbClientToDisplay({
      ...BASE_DB_CLIENT,
      trainer_memos: [
        {
          id: "memo-no-trainer",
          content: "担当者不明",
          created_at: "2026-01-01T00:00:00Z",
          trainers: null,
        },
      ],
    });

    expect(client.history![0].trainer).toBe("トレーナー");
  });

  it("lastMemo は先頭 20 文字に切り取られる", () => {
    const longContent = "あ".repeat(30); // 30文字
    const client = mapDbClientToDisplay({
      ...BASE_DB_CLIENT,
      trainer_memos: [
        {
          id: "memo-long",
          content: longContent,
          created_at: "2026-01-20T00:00:00Z",
          trainers: null,
        },
      ],
    });

    expect(client.lastMemo).toBe("あ".repeat(20));
  });
});
