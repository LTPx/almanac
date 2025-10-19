"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { MultipleChoiceQuestion } from "./multiple-choice-question";
import { TrueFalseQuestion } from "./true-false-question";
import { FillInBlankQuestion } from "./fill-in-blank-question";
import { OrderWordsQuestion } from "./order-words-question";
import { motion } from "framer-motion";
import { useAudio } from "react-use";

export function TestQuestion({
  question,
  onAnswer,
  onNext,
  showResult = false,
  isCorrect = false,
  selectedAnswer
}: any) {
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
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="flex items-center gap-2"
                >
                  {isCorrect ? (
                    <CheckCircle className="w-6 h-6 text-[#32C781]" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                  <span
                    className={`font-medium ${isCorrect ? "text-[#32C781]" : "text-red-500"}`}
                  >
                    {isCorrect ? "¡Correcto!" : "Incorrecto"}
                  </span>
                </motion.div>

                {!isCorrect && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="bg-red-500/10 border border-red-500/50 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-2">
                      <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-red-400 mb-1">
                          Respuesta correcta:
                        </p>
                        <p className="text-white font-medium">
                          {getCorrectAnswer()}
                        </p>
                        {question.content.explanation && (
                          <p className="text-gray-300 text-sm mt-2">
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
                      const requiredWords =
                        question.content.correctOrder.length;
                      return usedWords < requiredWords;
                    })())
                }
                className="
                  w-full py-8 text-xl font-semibold rounded-2xl shadow-lg
                  bg-[#32C781] hover:bg-[#28a36a] text-white
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
                    mt-6 w-full text-white py-8 text-xl font-medium rounded-2xl shadow-md
                    ${isCorrect ? "bg-[#32C781] hover:bg-[#28a36a]" : "bg-red-500 hover:bg-red-600"}
                  `}
                >
                  Continuar →
                </Button>
              </motion.div>
            )}

            {correctAudio}
            {incorrectAudio}
          </div>
        </div>
      </div>
    </div>
  );
}
