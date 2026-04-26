import { Mic } from "lucide-react";

type RecordButtonProps = {
  isRecording?: boolean;
  onClick: () => void;
  label?: string;
};

export function RecordButton({
  isRecording = false,
  onClick,
  label = "Record",
}: RecordButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isRecording}
      onClick={onClick}
      className="grid h-20 w-20 place-items-center rounded-full border-[3px] border-[#27251f] bg-[#d94f2b] text-[#f4ead7] shadow-[6px_6px_0_#27251f] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
    >
      <Mic size={32} strokeWidth={3} />
    </button>
  );
}