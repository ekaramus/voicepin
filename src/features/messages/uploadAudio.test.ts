import { uploadAudio } from "./uploadAudio";

vi.mock("@/lib/supabase/client", () => ({
  createSupabaseBrowserClient: () => ({
    storage: {
      from: () => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: () => ({
          data: { publicUrl: "https://test-url" },
        }),
      }),
    },
  }),
}));

describe("uploadAudio", () => {
  it("uploads audio and returns public URL", async () => {
    const result = await uploadAudio(new Blob());

    expect(result.publicUrl).toBe("https://test-url");
  });
});