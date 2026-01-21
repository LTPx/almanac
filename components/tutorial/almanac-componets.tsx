import React from "react";
import { Award } from "lucide-react";

interface AlmanacSlotProps {
  slot: {
    id: number;
    filled: boolean;
  };
  earnedItem: {
    id: number;
    name: string;
    icon: string;
  };
  step: string;
  positionRef: React.RefObject<HTMLDivElement>;
}

export const AlmanacSlot: React.FC<AlmanacSlotProps> = ({
  slot,
  earnedItem,
  step,
  positionRef
}) => {
  const isEarnedSlot = slot.id === earnedItem.id;
  const isSpecialSlot = isEarnedSlot && step === "ready-to-mint";

  return (
    <div
      ref={isEarnedSlot ? positionRef : null}
      className={`w-20 h-24 rounded-lg border-2 flex items-center justify-center relative transition-all duration-500
        ${
          slot.filled
            ? "border-[#32c781]/50 bg-gradient-to-br from-slate-700/50 to-slate-800/50"
            : "border-gray-700 bg-gray-800/50"
        }
        ${
          isSpecialSlot
            ? "border-[#32c781] shadow-[0_0_20px_rgba(50,199,129,0.6)] animate-pulse"
            : ""
        }
      `}
    >
      {slot.filled && (
        <div
          className={`w-12 h-16 bg-gradient-to-br from-slate-600 to-slate-700 rounded flex items-center justify-center border-2 border-slate-500 shadow-lg relative overflow-hidden
          ${isSpecialSlot ? "shadow-[0_0_15px_rgba(50,199,129,0.5)]" : ""}
        `}
        >
          <Award
            size={20}
            className={`${isSpecialSlot ? "text-[#32c781]" : "text-slate-300"}`}
          />
          {isSpecialSlot && (
            <>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#32C781]/20 to-transparent animate-[shimmer_2s_ease-in-out_infinite]" />
              <div className="absolute inset-0 rounded border border-[#32c781]/30 animate-pulse" />
            </>
          )}
        </div>
      )}
    </div>
  );
};
