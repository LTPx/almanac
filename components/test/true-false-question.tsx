"use client";

import { Question } from "@/lib/types";
import { motion } from "framer-motion";

interface Props {
  question: Question;
  selected: string;
  setSelected: (val: string) => void;
  showResult: boolean;
  isCorrect: boolean;
  hasAnswered: boolean;
}

export function TrueFalseQuestion({
  question,
  selected,
  setSelected,
  showResult,
  isCorrect,
  hasAnswered
}: Props) {
  return (
    <div className="space-y-3">
      {question.answers.map((answer) => {
        const isSelected = selected === answer.id.toString();
        const shouldShowCorrect = showResult && isSelected && isCorrect;
        const shouldShowIncorrect = showResult && isSelected && !isCorrect;

        return (
          <motion.div
            key={answer.id}
            animate={{
              x: shouldShowIncorrect ? [-8, 8, -6, 6, -4, 4, 0] : 0,
              scale: shouldShowCorrect ? [1, 1.05, 1] : 1
            }}
            transition={{ duration: 0.4 }}
          >
            <motion.button
              onClick={() => {
                if (!hasAnswered) setSelected(answer.id.toString());
              }}
              disabled={hasAnswered}
              whileTap={{ scale: 1.1 }}
              className={`
                w-full p-4 text-left rounded-2xl border-2 transition-all shadow-md
                ${isSelected && !showResult ? "bg-[#1983DD] border-[#1983DD] text-white" : ""}
                ${!isSelected && !showResult ? "text-gray-300 hover:border-[#1983DD]" : ""}
                ${shouldShowCorrect ? "bg-[#32C781] border-[#32C781] text-white shadow-[0_0_20px_#32C781]" : ""}
                ${shouldShowIncorrect ? "bg-red-500 border-red-500 text-white shadow-[0_0_20px_red]" : ""}
                ${hasAnswered ? "cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              {answer.text}
            </motion.button>
          </motion.div>
        );
      })}
    </div>
  );
}
