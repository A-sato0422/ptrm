/**
 * tests/client-crud.test.ts
 * client-crud.ts の CRUD API 関数単体テスト
 * Supabase クライアントをモックする
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchCategories,
  _resetCategoriesCache,
  updateLevel,
  createMemo,
  updateMemo,
  deleteMemo,
  createTask,
  updateTask,
  toggleTask,
  deleteClientTask,
} from "../src/api/client-crud";

// ============================================================
// Supabase モック
// ============================================================

/**
 * Supabase のチェーンメソッドを柔軟にモックするためのヘルパー。
 * from("table").select/insert/update/delete... の各チェーンを
 * 一つの Mock で表現する。
 */
function createSupabaseMock(response: {
  data?: unknown;
  error?: { message: string } | null;
}) {
  const chain: Record<string, unknown> = {};
  const methods = ["select", "insert", "update", "delete", "eq", "single"];
  for (const m of methods) {
    chain[m] = vi.fn().mockReturnValue(chain);
  }
  // 最終 await で response を返す (.single() や最後の .eq() で解決するように)
  (chain as any)[Symbol.for("nodejs.rejection")] = undefined;
  (chain as any).then = (resolve: (v: unknown) => void) => resolve(response);
  return chain;
}

vi.mock("../src/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from "../src/supabase";

// ============================================================
// テストヘルパー
// ============================================================

/** supabase.from() がチェーンを返すよう設定するユーティリティ */
function mockFrom(response: {
  data?: unknown;
  error?: { message: string } | null;
}) {
  const chain = createSupabaseMock(response);
  (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(chain);
  return chain;
}

/** 1回目は一方のレスポンス、2回目は別のレスポンスを返すよう設定する */
function mockFromSequence(
  responses: Array<{ data?: unknown; error?: { message: string } | null }>,
) {
  let callIndex = 0;
  (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(() => {
    const response = responses[callIndex] ?? responses[responses.length - 1];
    callIndex++;
    return createSupabaseMock(response);
  });
}

// ============================================================
// fetchCategories
// ============================================================

describe("fetchCategories", () => {
  beforeEach(() => {
    _resetCategoriesCache();
    vi.clearAllMocks();
  });

  it("正常系: カテゴリ一覧を取得して返す", async () => {
    mockFrom({
      data: [
        { id: "cat-1", name: "マットピラティス" },
        { id: "cat-2", name: "ウェイトトレーニング" },
      ],
      error: null,
    });

    const result = await fetchCategories();

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("マットピラティス");
    expect(supabase.from).toHaveBeenCalledWith("categories");
  });

  it("正常系: 2回目の呼び出しはキャッシュから返す（Supabase は呼ばない）", async () => {
    mockFrom({
      data: [{ id: "cat-1", name: "マットピラティス" }],
      error: null,
    });

    await fetchCategories(); // 1回目: Supabase 呼び出し
    vi.clearAllMocks();
    const result = await fetchCategories(); // 2回目: キャッシュ

    expect(supabase.from).not.toHaveBeenCalled();
    expect(result).toHaveLength(1);
  });

  it("エラー系: 取得失敗時に空配列を返す", async () => {
    mockFrom({ data: null, error: { message: "DB接続エラー" } });

    const result = await fetchCategories();

    expect(result).toEqual([]);
  });
});

// ============================================================
// updateLevel
// ============================================================

describe("updateLevel", () => {
  beforeEach(() => vi.clearAllMocks());

  it("正常系: 更新成功時に true を返す", async () => {
    mockFrom({ data: null, error: null });

    const result = await updateLevel("client-1", "level-1", "cat-1", 5, 3);

    expect(result).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith("client_levels");
  });

  it("正常系: prevLevel === newLevel のとき level_history に INSERT しない", async () => {
    mockFrom({ data: null, error: null });

    await updateLevel("client-1", "level-1", "cat-1", 5, 5);

    // client_levels の UPDATE のみ呼ばれる（level_history は呼ばれない）
    expect(supabase.from).toHaveBeenCalledTimes(1);
    expect(supabase.from).toHaveBeenCalledWith("client_levels");
    expect(supabase.from).not.toHaveBeenCalledWith("level_history");
  });

  it("正常系: prevLevel !== newLevel のとき level_history に INSERT する", async () => {
    mockFromSequence([
      { data: null, error: null }, // client_levels UPDATE
      { data: null, error: null }, // level_history INSERT
    ]);

    await updateLevel("client-1", "level-1", "cat-1", 7, 3);

    expect(supabase.from).toHaveBeenCalledWith("level_history");
  });

  it("エラー系: client_levels 更新失敗時に false を返す", async () => {
    mockFrom({ data: null, error: { message: "UPDATE失敗" } });

    const result = await updateLevel("client-1", "level-1", "cat-1", 5, 3);

    expect(result).toBe(false);
  });

  it("エラー系: level_history の INSERT 失敗は全体の結果に影響しない（true を返す）", async () => {
    mockFromSequence([
      { data: null, error: null }, // client_levels UPDATE: 成功
      { data: null, error: { message: "履歴INSERT失敗" } }, // level_history INSERT: 失敗
    ]);

    const result = await updateLevel("client-1", "level-1", "cat-1", 7, 3);

    expect(result).toBe(true); // 履歴失敗はエラー扱いしない
  });
});

// ============================================================
// createMemo
// ============================================================

describe("createMemo", () => {
  beforeEach(() => vi.clearAllMocks());

  it("正常系: INSERT 成功時に生成された UUID を返す", async () => {
    mockFrom({ data: { id: "new-memo-uuid" }, error: null });

    const result = await createMemo("client-1", "テストメモ");

    expect(result).toBe("new-memo-uuid");
    expect(supabase.from).toHaveBeenCalledWith("trainer_memos");
  });

  it("エラー系: INSERT 失敗時に null を返す", async () => {
    mockFrom({ data: null, error: { message: "INSERT失敗" } });

    const result = await createMemo("client-1", "テストメモ");

    expect(result).toBeNull();
  });
});

// ============================================================
// updateMemo
// ============================================================

describe("updateMemo", () => {
  beforeEach(() => vi.clearAllMocks());

  it("正常系: UPDATE 成功時に true を返す", async () => {
    mockFrom({ data: null, error: null });

    const result = await updateMemo("memo-uuid", "更新内容");

    expect(result).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith("trainer_memos");
  });

  it("エラー系: UPDATE 失敗時に false を返す", async () => {
    mockFrom({ data: null, error: { message: "UPDATE失敗" } });

    const result = await updateMemo("memo-uuid", "更新内容");

    expect(result).toBe(false);
  });
});

// ============================================================
// deleteMemo
// ============================================================

describe("deleteMemo", () => {
  beforeEach(() => vi.clearAllMocks());

  it("正常系: DELETE 成功時に true を返す", async () => {
    mockFrom({ data: null, error: null });

    const result = await deleteMemo("memo-uuid");

    expect(result).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith("trainer_memos");
  });

  it("エラー系: DELETE 失敗時に false を返す", async () => {
    mockFrom({ data: null, error: { message: "DELETE失敗" } });

    const result = await deleteMemo("memo-uuid");

    expect(result).toBe(false);
  });
});

// ============================================================
// createTask
// ============================================================

describe("createTask", () => {
  beforeEach(() => vi.clearAllMocks());

  it("正常系: tasks + client_tasks INSERT 成功時に {dbTaskId, clientTaskId} を返す", async () => {
    mockFromSequence([
      { data: { id: "task-uuid-new" }, error: null }, // tasks INSERT
      { data: { id: "ct-uuid-new" }, error: null }, // client_tasks INSERT
    ]);

    const result = await createTask(
      "client-1",
      "cat-1",
      "新しいタスク",
      "理由",
      "https://youtube.com/watch?v=xyz",
    );

    expect(result).not.toBeNull();
    expect(result!.dbTaskId).toBe("task-uuid-new");
    expect(result!.clientTaskId).toBe("ct-uuid-new");
  });

  it("エラー系: tasks INSERT 失敗時に null を返す", async () => {
    mockFrom({ data: null, error: { message: "tasks INSERT失敗" } });

    const result = await createTask("client-1", "cat-1", "タイトル", "", "");

    expect(result).toBeNull();
  });

  it("エラー系: client_tasks INSERT 失敗時に null を返す", async () => {
    mockFromSequence([
      { data: { id: "task-uuid" }, error: null }, // tasks INSERT: 成功
      { data: null, error: { message: "client_tasks INSERT失敗" } }, // client_tasks: 失敗
    ]);

    const result = await createTask("client-1", "cat-1", "タイトル", "", "");

    expect(result).toBeNull();
  });
});

// ============================================================
// updateTask
// ============================================================

describe("updateTask", () => {
  beforeEach(() => vi.clearAllMocks());

  it("正常系: UPDATE 成功時に true を返す", async () => {
    mockFrom({ data: null, error: null });

    const result = await updateTask(
      "task-uuid",
      "更新タイトル",
      "更新理由",
      "",
    );

    expect(result).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith("tasks");
  });

  it("エラー系: UPDATE 失敗時に false を返す", async () => {
    mockFrom({ data: null, error: { message: "UPDATE失敗" } });

    const result = await updateTask("task-uuid", "タイトル", "", "");

    expect(result).toBe(false);
  });
});

// ============================================================
// toggleTask
// ============================================================

describe("toggleTask", () => {
  beforeEach(() => vi.clearAllMocks());

  it("正常系: 完了フラグ true で UPDATE 成功時に true を返す", async () => {
    mockFrom({ data: null, error: null });

    const result = await toggleTask("ct-uuid", true);

    expect(result).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith("client_tasks");
  });

  it("正常系: 未完了フラグ false で UPDATE 成功時に true を返す", async () => {
    mockFrom({ data: null, error: null });

    const result = await toggleTask("ct-uuid", false);

    expect(result).toBe(true);
  });

  it("エラー系: UPDATE 失敗時に false を返す", async () => {
    mockFrom({ data: null, error: { message: "UPDATE失敗" } });

    const result = await toggleTask("ct-uuid", true);

    expect(result).toBe(false);
  });
});

// ============================================================
// deleteClientTask
// ============================================================

describe("deleteClientTask", () => {
  beforeEach(() => vi.clearAllMocks());

  it("正常系: DELETE 成功時に true を返す", async () => {
    mockFrom({ data: null, error: null });

    const result = await deleteClientTask("ct-uuid");

    expect(result).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith("client_tasks");
  });

  it("エラー系: DELETE 失敗時に false を返す", async () => {
    mockFrom({ data: null, error: { message: "DELETE失敗" } });

    const result = await deleteClientTask("ct-uuid");

    expect(result).toBe(false);
  });
});
