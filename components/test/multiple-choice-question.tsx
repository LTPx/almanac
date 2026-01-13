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

export function MultipleChoiceQuestion({
  question,
  selected,
  setSelected,
  showResult,
  isCorrect,
  hasAnswered
}: Props) {
  return (
    <div className="space-y-3 sm:space-y-4">
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
              whileTap={{ scale: 1.05 }}
              className={`
                w-full p-3 sm:p-4 text-left rounded-2xl border transition-all
                font-serif
                ${
                  isSelected && !showResult
                    ? "bg-[#1A1A1A] border-[#1983DD] text-[#E0E0E0] shadow-[0_0_15px_rgba(25,131,221,0.3)]"
                    : ""
                }
                ${
                  !isSelected && !showResult
                    ? "bg-[#1A1A1A] border-[rgba(255,255,255,0.1)] text-[#E0E0E0] hover:border-[rgba(25,131,221,0.5)]"
                    : ""
                }
                ${
                  shouldShowCorrect
                    ? "bg-[#1A1A1A] border-[#32C781] text-[#E0E0E0] shadow-[0_0_20px_rgba(50,199,129,0.4)]"
                    : ""
                }
                ${
                  shouldShowIncorrect
                    ? "bg-[#1A1A1A] border-[#FFB040] text-[#E0E0E0] shadow-[0_0_20px_rgba(255,176,64,0.4)]"
                    : ""
                }
                ${hasAnswered ? "cursor-not-allowed" : "cursor-pointer"}
                break-words leading-relaxed text-base sm:text-[16px] font-light
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
