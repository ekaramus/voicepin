const conversations = [
  {
    id: "me",
    name: "Me",
    preview: "Remember: record the demo before lunch.",
    duration: "0:08",
    pinned: true,
  },
  {
    id: "anna",
    name: "Anna",
    preview: "Leaving now, be there in ten.",
    duration: "0:06",
    pinned: false,
  },
];

export function ConversationHome() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b-2 border-[#27251f] px-5 py-4">
        <h1 className="text-2xl font-black tracking-[-0.08em]">VoicePin</h1>
        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#6f6758]">
          tiny voice snapshots
        </p>
      </header>

      <section className="border-b-2 border-[#27251f] bg-[#27251f] px-5 py-3 text-[#f4ead7]">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#f7d35f]">
          Beta recorder
        </p>
        <p className="mt-1 text-sm">No typing. Max 20 seconds.</p>
      </section>

      <div>
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            className="w-full border-b-2 border-[#27251f] p-4 text-left active:bg-[#eadfc9]"
          >
            <div className="flex items-start gap-3">
              <div
                className={
                  conversation.pinned
                    ? "grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#27251f] bg-[#f7d35f] text-sm font-black shadow-[4px_4px_0_#27251f]"
                    : "grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#27251f] bg-[#b8d8c0] text-sm font-black shadow-[4px_4px_0_#27251f]"
                }
              >
                {conversation.name.slice(0, 2).toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="font-black tracking-[-0.04em]">
                  {conversation.name}
                </h2>
                <p className="mt-1 truncate text-sm text-[#5a5347]">
                  {conversation.preview}
                </p>
                <p className="mt-2 text-xs font-bold text-[#d94f2b]">
                  {conversation.duration}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-auto flex justify-center p-6">
        <button className="grid h-20 w-20 place-items-center rounded-full border-[3px] border-[#27251f] bg-[#d94f2b] text-[#f4ead7] shadow-[6px_6px_0_#27251f]">
          REC
        </button>
      </div>
    </div>
  );
}