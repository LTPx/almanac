"use client";

import { useState } from "react";
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
              ${isSelected && !showResult ? "bg-[#708BB1] border-[#708BB1] text-white" : ""}
              ${!isSelected && !showResult ? "bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500" : ""}
              ${shouldShowCorrect ? "bg-green-500 border-green-500 text-white" : ""}
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
