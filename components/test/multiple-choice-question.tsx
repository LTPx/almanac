"use client";

import { Question } from "@/lib/types";

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
    <div className="space-y-3">
      {question.answers.map((answer) => {
        const isSelected = selected === answer.id.toString();
        const shouldShowCorrect = showResult && isSelected && isCorrect;
        const shouldShowIncorrect = showResult && isSelected && !isCorrect;

        return (
          <button
            key={answer.id}
            onClick={() => !hasAnswered && setSelected(answer.id.toString())}
            disabled={hasAnswered}
            className={`
              w-full p-4 text-left rounded-lg border-2 transition-all
              ${isSelected && !showResult ? "bg-[#1983DD] border-[#1983DD] text-white" : ""}
              ${!isSelected && !showResult ? "text-gray-300 hover:border-[#1983DD]" : ""}
              ${shouldShowCorrect ? "bg-[1F941C] border-1F941C text-white" : ""}
              ${shouldShowIncorrect ? "bg-red-500 border-red-500 text-white" : ""}
              ${hasAnswered ? "cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            {answer.text}
          </button>
        );
      })}
    </div>
  );
}
