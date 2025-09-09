"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Question } from "@/lib/types";
import { MultipleChoiceQuestion } from "./multiple-choice-question";
import { TrueFalseQuestion } from "./true-false-question";
import { FillInBlankQuestion } from "./fill-in-blank-question";
import { OrderWordsQuestion } from "./order-words-question";

export function TestQuestion({
  question,
  onAnswer,
  showResult = false,
  isCorrect = false,
  selectedAnswer
}: any) {
  const [selected, setSelected] = useState<string>(selectedAnswer || "");
  const [hasAnswered, setHasAnswered] = useState(showResult);

  useEffect(() => {
    setSelected(selectedAnswer || "");
    setHasAnswered(showResult);
  }, [question.id, selectedAnswer, showResult]);

  const handleSubmitAnswer = () => {
    if (!selected || hasAnswered) return;
    onAnswer(question.id, selected);
    setHasAnswered(true);
  };

  const renderQuestionType = () => {
    switch (question.type) {
      case "MULTIPLE_CHOICE":
        return (
          <MultipleChoiceQuestion
            {...{
              question,
              selected,
              setSelected,
              showResult,
              isCorrect,
              hasAnswered
            }}
          />
        );
      case "TRUE_FALSE":
        return (
          <TrueFalseQuestion
            {...{
              question,
              selected,
              setSelected,
              showResult,
              isCorrect,
              hasAnswered
            }}
          />
        );
      case "FILL_IN_BLANK":
        return (
          <FillInBlankQuestion {...{ selected, setSelected, hasAnswered }} />
        );
      case "ORDER_WORDS":
        return (
          <OrderWordsQuestion
            question={question}
            hasAnswered={hasAnswered}
            setHasAnswered={setHasAnswered}
            onAnswer={onAnswer}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 h-full py-[50px]">
      <div className="flex h-full items-center justify-center">
        <div className="flex h-full flex-col justify-between w-full max-w-[650px] gap-y-2 px-6">
          <div>
            <h1 className="mb-5 text-center text-lg font-bold text-white lg:text-start lg:text-3xl">
              {question.title}
            </h1>
            <div className="mb-6">{renderQuestionType()}</div>
          </div>
          <div>
            {showResult && (
              <div className="mb-6 flex items-center gap-2">
                <CheckCircle
                  className={`w-6 h-6 ${isCorrect ? "text-green-500" : "text-red-500"}`}
                />
                <span
                  className={`font-medium ${isCorrect ? "text-green-500" : "text-red-500"}`}
                >
                  {isCorrect ? "¡Correcto!" : "Incorrecto"}
                </span>
              </div>
            )}
            {!hasAnswered && question.type !== "ORDER_WORDS" && (
              <Button
                onClick={handleSubmitAnswer}
                disabled={!selected}
                className="w-full bg-[#1F941C] hover:bg-[#187515] text-white py-8 text-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {question.type === "FILL_IN_BLANK"
                  ? "Enviar Respuesta"
                  : "Check Answer →"}
              </Button>
            )}
            {hasAnswered && showResult && (
              <Button
                onClick={() => {}}
                className="mt-6 w-full bg-[#1F941C] hover:bg-[#187515] text-white py-8 text-xl font-medium"
              >
                Continue
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
