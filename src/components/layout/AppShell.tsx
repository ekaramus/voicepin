import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <main className="min-h-screen w-full bg-[#d7cfbd] p-4 font-mono text-[#27251f]">
      <section className="mx-auto flex min-h-[812px] w-full max-w-[390px] flex-col overflow-hidden rounded-[38px] border-[6px] border-[#27251f] bg-[#f4ead7] shadow-[12px_12px_0_#27251f]">
        <div className="flex h-8 items-center justify-center border-b-2 border-[#27251f] bg-[#d94f2b] text-[10px] font-bold uppercase tracking-[0.24em] text-[#f4ead7]">
          VoicePin / 20 sec max
        </div>

        {children}
      </section>
    </main>
  );
}