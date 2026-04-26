import { createSupabaseBrowserClient } from "./client";

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    auth: {},
    from: vi.fn(),
    storage: {},
  })),
}));

const originalEnv = process.env;

beforeEach(() => {
  vi.resetModules();
  process.env = {
    ...originalEnv,
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
  };
});

afterEach(() => {
  process.env = originalEnv;
  vi.clearAllMocks();
});

describe("createSupabaseBrowserClient", () => {
  it("creates a Supabase client from validated env", async () => {
    const { createClient } = await import("@supabase/supabase-js");

    createSupabaseBrowserClient();

    expect(createClient).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "anon-key"
    );
  });
});