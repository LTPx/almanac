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
  cardPlaced: boolean;
  step: string;
  showFloatingCard: boolean;
  positionRef: React.RefObject<HTMLDivElement>;
}

export const AlmanacSlot: React.FC<AlmanacSlotProps> = ({
  slot,
  earnedItem,
  cardPlaced,
  step,
  showFloatingCard,
  positionRef
}) => {
  const isEarnedSlot = slot.id === earnedItem.id;
  const shouldShowCard =
    isEarnedSlot &&
    (step === "ready-to-mint" || cardPlaced) &&
    !showFloatingCard;

  return (
    <div
      ref={isEarnedSlot ? positionRef : null}
      className={`w-20 h-24 rounded-lg border-2 flex items-center justify-center relative transition-all duration-500
        ${
          slot.filled || shouldShowCard
            ? "border-[#32c781]/50 bg-gradient-to-br from-slate-700/50 to-slate-800/50"
            : "border-gray-700 bg-gray-800/50"
        }
        ${
          isEarnedSlot && step === "ready-to-mint"
            ? "border-[#32c781] shadow-[0_0_15px_rgba(50,199,129,0.5)]"
            : ""
        }
      `}
    >
      {slot.filled && (
        <div className="w-12 h-16 bg-gradient-to-br from-slate-600 to-slate-700 rounded flex items-center justify-center border-2 border-slate-500 shadow-lg">
          <Award size={20} className="text-slate-300" />
        </div>
      )}

      {shouldShowCard && (
        <div className="w-12 h-16 bg-gradient-to-br from-slate-600 to-slate-700 rounded flex items-center justify-center border-2 border-slate-500 shadow-lg relative overflow-hidden">
          <Award size={20} className="text-slate-300" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#32C781]/10 to-transparent" />
        </div>
      )}
    </div>
  );
};

interface FloatingCardProps {
  cardRef: React.RefObject<HTMLDivElement>;
  cardPosition: { x: number; y: number };
  isAnimating: boolean;
}

export const FloatingCard: React.FC<FloatingCardProps> = ({
  cardRef,
  cardPosition,
  isAnimating
}) => (
  <div className="absolute z-50 flex flex-col items-center translate-y-32">
    <div
      ref={cardRef}
      style={{
        transform: `translate(${cardPosition.x}px, ${cardPosition.y}px) scale(${isAnimating ? 0.5 : 1})`,
        transition: isAnimating
          ? "transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
          : "none",
        opacity: isAnimating && cardPosition.x !== 0 ? 0.95 : 1
      }}
      className="w-24 h-32 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl shadow-[0_0_30px_rgba(50,199,129,0.3)] flex items-center justify-center border-4 border-slate-600 relative overflow-hidden"
    >
      <div
        className="absolute inset-0 rounded-lg border-2 border-[#32C781]/30"
        style={{ animation: "pulse-ring-1 2s ease-in-out infinite" }}
      />
      <div
        className="absolute inset-0 rounded-lg border-2 border-[#1983DD]/20"
        style={{ animation: "pulse-ring-2 2s ease-in-out 0.5s infinite" }}
      />
      <Award
        size={32}
        className="text-slate-400 z-10"
        style={{ animation: "float-icon 2s ease-in-out infinite" }}
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-[#32C781]/20 to-transparent h-full"
        style={{ animation: "scan-line 2s linear infinite" }}
      />
    </div>
  </div>
);
