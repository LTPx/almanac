"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Flag } from "lucide-react";
import { MultipleChoiceQuestion } from "./multiple-choice-question";
import { TrueFalseQuestion } from "./true-false-question";
import { FillInBlankQuestion } from "./fill-in-blank-question";
import { OrderWordsQuestion } from "./order-words-question";
import { motion } from "framer-motion";
import { useAudio } from "react-use";

interface TestQuestionProps {
  question: any;
  onAnswer: (questionId: number, answer: string) => void;
  onNext: () => void;
  showResult?: boolean;
  isCorrect?: boolean;
  selectedAnswer?: string;
  onReportError?: () => void;
  isDisabled?: boolean;
}

export function TestQuestion({
  question,
  onAnswer,
  onNext,
  showResult = false,
  isCorrect = false,
  selectedAnswer,
  isDisabled = false,
  onReportError
}: TestQuestionProps) {
  const [selected, setSelected] = useState<string>(selectedAnswer || "");
  const [hasAnswered, setHasAnswered] = useState(showResult);

  const [correctAudio, , correctControls] = useAudio({ src: "/correct.wav" });
  const [incorrectAudio, , incorrectControls] = useAudio({
    src: "/incorrect.wav"
  });

  useEffect(() => {
    setSelected(selectedAnswer || "");
    setHasAnswered(showResult);
  }, [question.id, selectedAnswer, showResult]);

  const [hasPlayedAudio, setHasPlayedAudio] = useState(false);

  useEffect(() => {
    if (showResult && !hasPlayedAudio) {
      if (isCorrect) {
        correctControls.play();
      } else {
        incorrectControls.play();
      }
      setHasPlayedAudio(true);
    }
  }, [
    showResult,
    isCorrect,
    hasPlayedAudio,
    correctControls,
    incorrectControls
  ]);

  useEffect(() => {
    setHasPlayedAudio(false);
    setHasAnswered(false);
  }, [question.id]);

  const handleSubmitAnswer = () => {
    if (hasAnswered) return;

    if (question.type === "ORDER_WORDS") {
      const slots = JSON.parse(selected || "[]");
      const usedWords = slots.filter((s: string | null) => s !== null).length;
      const requiredWords = question.content.correctOrder.length;
      if (!Array.isArray(slots) || usedWords < requiredWords) return;
    }

    if (!selected) return;

    onAnswer(question.id, selected);
    setHasAnswered(true);
  };

  const getCorrectAnswer = () => {
    switch (question.type) {
      case "MULTIPLE_CHOICE":
      case "TRUE_FALSE":
        return question.content.correctAnswer;
      case "FILL_IN_BLANK":
        return question.content.correctAnswer;
      case "ORDER_WORDS":
        return question.content.correctOrder.join(" ");
      default:
        return "";
    }
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
          <FillInBlankQuestion
            {...{ selected, setSelected, hasAnswered, isCorrect, showResult }}
          />
        );
      case "ORDER_WORDS":
        return (
          <OrderWordsQuestion
            question={question}
            selected={selected}
            setSelected={setSelected}
            hasAnswered={hasAnswered}
            isCorrect={isCorrect}
            showResult={showResult}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto py-6 sm:py-8 md:py-12">
        <div className="w-full max-w-[650px] mx-auto px-4 sm:px-6">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-start text-base sm:text-lg lg:text-2xl xl:text-3xl font-bold text-white leading-tight">
              {question.title}
            </h1>
          </div>

          <div className="mb-4 sm:mb-6">{renderQuestionType()}</div>

          {onReportError && !showResult && (
            <div className="flex justify-end">
              <button
                onClick={onReportError}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-400 hover:text-orange-500 hover:bg-orange-500/10 rounded-lg transition-all duration-200"
              >
                <Flag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Reportar un problema</span>
                <span className="sm:hidden">Reportar</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 w-full border-t border-gray-800 bg-background">
        <div className="w-full max-w-[650px] mx-auto px-4 sm:px-6 py-4 sm:py-5 space-y-3 sm:space-y-4">
          {showResult && (
            <div className="space-y-2 sm:space-y-3">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="flex items-center gap-2"
              >
                {isCorrect ? (
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[#32C781] flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[#FFB040] flex-shrink-0" />
                )}
                <span
                  className={`font-medium text-sm sm:text-base ${isCorrect ? "text-[#32C781]" : "text-[#FFB040]"}`}
                >
                  {isCorrect ? "¡Correcto!" : "Incorrecto"}
                </span>
              </motion.div>

              {!isCorrect && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="bg-[#FFB040]/10 border border-[#FFB040]/50 rounded-lg p-3 max-h-[150px] overflow-y-auto"
                >
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFB040] mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-[#FFB040] mb-1">
                        Respuesta correcta:
                      </p>
                      <p className="text-white font-medium text-sm sm:text-base break-words">
                        {getCorrectAnswer()}
                      </p>
                      {question.content.explanation && (
                        <p className="text-gray-300 text-xs sm:text-sm mt-2 break-words">
                          {question.content.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {isCorrect &&
                question.type === "FILL_IN_BLANK" &&
                selected.trim().toLowerCase() !==
                  getCorrectAnswer().trim().toLowerCase() && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="bg-[#32C781]/10 border border-[#32C781]/50 rounded-lg p-3 max-h-[150px] overflow-y-auto"
                  >
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#32C781] mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-white mb-1 text-sm sm:text-base">
                          Revisa la ortografía correcta
                        </p>
                        <p className="text-white text-xs sm:text-sm break-words">
                          {getCorrectAnswer()}
                        </p>
                        {question.content.explanation && (
                          <p className="text-gray-300 text-xs sm:text-sm mt-2 break-words">
                            {question.content.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
            </div>
          )}

          {!hasAnswered && (
            <Button
              onClick={handleSubmitAnswer}
              disabled={
                !selected ||
                (question.type === "ORDER_WORDS" &&
                  (() => {
                    const slots = JSON.parse(selected || "[]");
                    const usedWords = slots.filter(
                      (s: string | null) => s !== null
                    ).length;
                    const requiredWords = question.content.correctOrder.length;
                    return usedWords < requiredWords;
                  })())
              }
              className="
                w-full py-5 sm:py-6 md:py-8 text-base sm:text-lg md:text-xl font-semibold rounded-xl sm:rounded-2xl shadow-lg
                bg-[#32C781] hover:bg-[#28a36a] text-white disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {question.type === "FILL_IN_BLANK"
                ? "Enviar Respuesta"
                : "Check Answer →"}
            </Button>
          )}

          {hasAnswered && showResult && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <Button
                onClick={onNext}
                className={`
                  w-full text-white py-5 sm:py-6 md:py-8 text-base sm:text-lg md:text-xl font-medium rounded-xl sm:rounded-2xl shadow-md
                  ${isCorrect ? "bg-[#32C781] hover:bg-[#28a36a]" : "bg-[#FFB040] hover:bg-[#e09a2f]"}
                `}
                disabled={isDisabled}
              >
                Continuar →
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {correctAudio}
      {incorrectAudio}
    </div>
  );
}
