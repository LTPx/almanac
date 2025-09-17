"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { MultipleChoiceQuestion } from "./multiple-choice-question";
import { TrueFalseQuestion } from "./true-false-question";
import { FillInBlankQuestion } from "./fill-in-blank-question";
import { OrderWordsQuestion } from "./order-words-question";
import { motion } from "framer-motion";
import { useAudio } from "react-use";

export function TestQuestion({
  question,
  onAnswer,
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
          <FillInBlankQuestion
            {...{ selected, setSelected, hasAnswered, isCorrect, showResult }}
          />
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
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 30 }}
                className="mb-6 flex items-center gap-2"
              >
                <CheckCircle
                  className={`w-6 h-6 ${isCorrect ? "text-[#32C781]" : "text-red-500"}`}
                />
                <span
                  className={`font-medium ${isCorrect ? "text-[#32C781]" : "text-red-500"}`}
                >
                  {isCorrect ? "¡Correcto!" : "Incorrecto"}
                </span>
              </motion.div>
            )}

            {!hasAnswered && question.type !== "ORDER_WORDS" && (
              <Button
                onClick={handleSubmitAnswer}
                disabled={!selected}
                className="w-full bg-[#32C781] hover:bg-[#28a36a] text-white py-8 text-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {question.type === "FILL_IN_BLANK"
                  ? "Enviar Respuesta"
                  : "Check Answer →"}
              </Button>
            )}

            {hasAnswered && showResult && (
              <Button
                onClick={() => {}}
                className="mt-6 w-full bg-[#32C781] hover:bg-[#28a36a] text-white py-8 text-xl font-medium"
              >
                Continue
              </Button>
            )}

            {/* Incluir tags de audio para precarga (opcional) */}
            {correctAudio}
            {incorrectAudio}
          </div>
        </div>
      </div>
    </div>
  );
}
