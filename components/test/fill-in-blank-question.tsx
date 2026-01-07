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
  let resultClasses = "";
  if (showResult && isCorrect) {
    resultClasses =
      "bg-[#32C781] border-[#32C781] text-white placeholder-white shadow-[0_0_20px_#32C781]";
  } else if (showResult && !isCorrect) {
    resultClasses =
      "bg-red-500 border-red-500 text-white placeholder-white shadow-[0_0_20px_red]";
  } else {
    resultClasses = "text-white placeholder-gray-400 focus:border-[#1983DD]";
  }

  return (
    <motion.div
      animate={{
        x: showResult && !isCorrect ? [-8, 8, -6, 6, -4, 4, 0] : 0,
        scale: showResult && isCorrect ? [1, 1.05, 1] : 1
      }}
      transition={{ duration: 0.4 }}
    >
      <input
        type="text"
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        disabled={hasAnswered}
        placeholder="Escribe tu respuesta..."
        className={`w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all shadow-md text-sm sm:text-base ${resultClasses}`}
      />
    </motion.div>
  );
}
