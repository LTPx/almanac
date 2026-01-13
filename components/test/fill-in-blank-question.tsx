"use client";

import { motion } from "framer-motion";

interface Props {
  selected: string;
  setSelected: (val: string) => void;
  hasAnswered: boolean;
  showResult: boolean;
  isCorrect: boolean;
}

export function FillInBlankQuestion({
  selected,
  setSelected,
  hasAnswered,
  showResult,
  isCorrect
}: Props) {
  const shouldShowCorrect = showResult && isCorrect;
  const shouldShowIncorrect = showResult && !isCorrect;

  return (
    <motion.div
      animate={{
        x: shouldShowIncorrect ? [-8, 8, -6, 6, -4, 4, 0] : 0,
        scale: shouldShowCorrect ? [1, 1.05, 1] : 1
      }}
      transition={{ duration: 0.4 }}
    >
      <input
        type="text"
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        disabled={hasAnswered}
        placeholder="Escribe tu respuesta..."
        className={`
          w-full p-3 sm:p-4 rounded-2xl border transition-all
          font-serif font-light text-base sm:text-[16px] leading-relaxed
          ${!showResult ? "bg-[#1A1A1A] border-[rgba(255,255,255,0.1)] text-[#E0E0E0] placeholder-gray-500 hover:border-[rgba(25,131,221,0.5)] focus:border-[#1983DD] focus:shadow-[0_0_15px_rgba(25,131,221,0.3)] focus:outline-none" : ""}
          ${shouldShowCorrect ? "bg-[#1A1A1A] border-[#32C781] text-[#E0E0E0] shadow-[0_0_20px_rgba(50,199,129,0.4)]" : ""}
          ${shouldShowIncorrect ? "bg-[#1A1A1A] border-[#FFB040] text-[#E0E0E0] shadow-[0_0_20px_rgba(255,176,64,0.4)]" : ""}
          ${hasAnswered ? "cursor-not-allowed" : "cursor-text"}
        `}
      />
    </motion.div>
  );
}
