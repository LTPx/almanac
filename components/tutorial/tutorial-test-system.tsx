"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HeaderBar } from "../header-bar";
import { CheckSquare, PenLine, ArrowDownUp } from "lucide-react";
import { TestResults } from "../test/TestResults";
import { TestQuestion } from "../test/TestQuestion";
import { TutorialInlineCard } from "./tutorial-overlay";

interface TutorialTestSystemProps {
  onClose: () => void;
  hearts: number;
}

const DEMO_QUESTIONS = [
  {
    id: 1,
    type: "MULTIPLE_CHOICE",
    title: "¿Cuál es la capital de Francia?",
    answers: [
      { id: 1, text: "Londres", isCorrect: false },
      { id: 2, text: "París", isCorrect: true },
      { id: 3, text: "Berlín", isCorrect: false },
      { id: 4, text: "Madrid", isCorrect: false }
    ],
    content: {
      options: ["Londres", "París", "Berlín", "Madrid"],
      correctAnswer: "París",
      explanation: "París es la capital y ciudad más poblada de Francia."
    }
  },
  {
    id: 2,
    type: "FILL_IN_BLANK",
    title: "Completa la frase: El sol sale por el ____",
    content: {
      correctAnswer: "este",
      explanation: "El sol siempre sale por el este y se pone por el oeste."
    }
  },
  {
    id: 3,
    type: "ORDER_WORDS",
    title: "Ordena las palabras para formar una oración correcta",
    content: {
      words: ["gato", "el", "ratón", "persigue", "al"],
      correctOrder: ["el", "gato", "persigue", "al", "ratón"],
      explanation: "La estructura correcta es: sujeto + verbo + complemento."
    }
  }
];

const TUTORIAL_MESSAGES = [
  {
    icon: <CheckSquare className="w-6 h-6" />,
    title: "Preguntas de Opción Múltiple",
    description:
      "Selecciona la respuesta correcta entre las opciones disponibles. ¡Tómate tu tiempo para leer cada opción!"
  },
  {
    icon: <PenLine className="w-6 h-6" />,
    title: "Preguntas de Completar",
    description:
      "Escribe la palabra o frase que complete correctamente la oración. La ortografía es importante."
  },
  {
    icon: <ArrowDownUp className="w-6 h-6" />,
    title: "Ordenar Palabras",
    description:
      "Arrastra las palabras para formar una oración con sentido. El orden correcto es clave."
  }
];

export function TutorialTestSystem({
  onClose,
  hearts
}: TutorialTestSystemProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<{
    [key: number]: { answer: string; isCorrect: boolean };
  }>({});
  const [showResults, setShowResults] = useState(false);
  const [showInlineCard, setShowInlineCard] = useState(true);
  const [animationKey, setAnimationKey] = useState(0);

  const currentQuestion = DEMO_QUESTIONS[currentQuestionIndex];
  const currentMessage = TUTORIAL_MESSAGES[currentQuestionIndex];

  const checkAnswer = (answer: string): boolean => {
    const question = DEMO_QUESTIONS[currentQuestionIndex];

    switch (question.type) {
      case "MULTIPLE_CHOICE":
        const selectedAnswer = question.answers?.find(
          (a) => a.id.toString() === answer
        );
        return selectedAnswer?.isCorrect || false;

      case "FILL_IN_BLANK":
        if (!question.content.correctAnswer) return false;
        return (
          answer.trim().toLowerCase() ===
          question.content.correctAnswer.toLowerCase()
        );

      case "ORDER_WORDS":
        const userOrder = JSON.parse(answer).filter(
          (w: string | null) => w !== null
        );
        const correctOrder = question.content.correctOrder;
        return JSON.stringify(userOrder) === JSON.stringify(correctOrder);

      default:
        return false;
    }
  };

  const handleAnswer = useCallback(
    (questionId: number, answer: string) => {
      const isCorrect = checkAnswer(answer);

      setAnswers((prev) => ({
        ...prev,
        [questionId]: { answer, isCorrect }
      }));

      setShowResult(true);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentQuestionIndex]
  );

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < DEMO_QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setShowResult(false);
      setShowInlineCard(true);
      setAnimationKey((prev) => prev + 1);
    } else {
      setShowResults(true);
    }
  }, [currentQuestionIndex]);

  const progress = ((currentQuestionIndex + 1) / DEMO_QUESTIONS.length) * 100;

  const correctAnswers = Object.values(answers).filter(
    (a) => a.isCorrect
  ).length;
  const totalQuestions = DEMO_QUESTIONS.length;
  const score = (correctAnswers / totalQuestions) * 100;

  const demoResults = {
    passed: true,
    score: score,
    correctAnswers: correctAnswers,
    totalQuestions: totalQuestions,
    experienceGained: 50,
    timeQuizInSeconds: 120,
    isPerfect: correctAnswers === totalQuestions,
    heartsLost: 0
  };

  if (showResults) {
    return (
      <div className="bg-background h-[100dvh] flex flex-col overflow-hidden">
        <AnimatePresence>
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute inset-0 w-full h-full flex items-center justify-center bg-background"
          >
            <TestResults
              hearts={hearts}
              results={demoResults}
              lessonName="Tutorial Demo"
              onReturnToLessons={onClose}
              isTutorialMode={true}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="bg-background w-full max-w-[650px] h-[100dvh] flex flex-col overflow-hidden relative">
      <HeaderBar
        onClose={onClose}
        hearts={hearts}
        percentage={progress}
        hasActiveSubscription={false}
        justAnsweredCorrect={false}
      />

      <div className="relative flex-1 flex items-center justify-center overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={animationKey}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="w-full h-full flex flex-col"
          >
            <div className="flex-1 h-full pt-[30px]">
              <div className="flex h-full items-center justify-center">
                <div className="flex h-full flex-col justify-between w-full max-w-[650px] gap-y-2 px-6">
                  <div>
                    <AnimatePresence>
                      {showInlineCard && (
                        <TutorialInlineCard
                          icon={currentMessage.icon}
                          title={currentMessage.title}
                          description={currentMessage.description}
                          questionNumber={currentQuestionIndex + 1}
                          totalQuestions={DEMO_QUESTIONS.length}
                          onDismiss={() => setShowInlineCard(false)}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="flex-1 flex flex-col mt-[-30px]">
                    <TestQuestion
                      question={currentQuestion}
                      onAnswer={handleAnswer}
                      onNext={handleNext}
                      showResult={showResult}
                      isCorrect={answers[currentQuestion.id]?.isCorrect}
                      selectedAnswer={answers[currentQuestion.id]?.answer}
                      isDisabled={false}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
