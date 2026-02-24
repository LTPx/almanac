"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HeaderBar } from "../header-bar";
import { CheckSquare, PenLine, ArrowDownUp } from "lucide-react";
import { TestResults } from "../test/TestResults";
import { TestQuestion } from "../test/TestQuestion";
import { TutorialInlineCard } from "./tutorial-overlay";
import { useTranslation } from "@/hooks/useTranslation";

interface TutorialTestSystemProps {
  onClose: () => void;
  hearts: number;
  onBack?: () => void;
}

export function TutorialTestSystem({
  onClose,
  hearts,
  onBack
}: TutorialTestSystemProps) {
  const { t } = useTranslation();

  const DEMO_QUESTIONS = [
    {
      id: 1,
      type: "MULTIPLE_CHOICE",
      title: t("tutorialTest", "q1Title"),
      answers: [
        { id: 1, text: t("tutorialTest", "q1Opt1"), isCorrect: false },
        { id: 2, text: t("tutorialTest", "q1Opt2"), isCorrect: true },
        { id: 3, text: t("tutorialTest", "q1Opt3"), isCorrect: false },
        { id: 4, text: t("tutorialTest", "q1Opt4"), isCorrect: false }
      ],
      content: {
        options: [
          t("tutorialTest", "q1Opt1"),
          t("tutorialTest", "q1Opt2"),
          t("tutorialTest", "q1Opt3"),
          t("tutorialTest", "q1Opt4")
        ],
        correctAnswer: t("tutorialTest", "q1CorrectAnswer"),
        explanation: t("tutorialTest", "q1Explanation")
      }
    },
    {
      id: 2,
      type: "FILL_IN_BLANK",
      title: t("tutorialTest", "q2Title"),
      content: {
        correctAnswer: t("tutorialTest", "q2CorrectAnswer"),
        explanation: t("tutorialTest", "q2Explanation")
      }
    },
    {
      id: 3,
      type: "ORDER_WORDS",
      title: t("tutorialTest", "q3Title"),
      content: {
        words: t("tutorialTest", "q3Words").split(","),
        correctOrder: t("tutorialTest", "q3CorrectOrder").split(","),
        explanation: t("tutorialTest", "q3Explanation")
      }
    }
  ];

  const TUTORIAL_MESSAGES = [
    {
      icon: <CheckSquare className="w-6 h-6" />,
      title: t("tutorialTest", "multipleChoiceTitle"),
      description: t("tutorialTest", "multipleChoiceDesc")
    },
    {
      icon: <PenLine className="w-6 h-6" />,
      title: t("tutorialTest", "fillBlankTitle"),
      description: t("tutorialTest", "fillBlankDesc")
    },
    {
      icon: <ArrowDownUp className="w-6 h-6" />,
      title: t("tutorialTest", "orderWordsTitle"),
      description: t("tutorialTest", "orderWordsDesc")
    }
  ];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<{
    [key: number]: { answer: string; isCorrect: boolean };
  }>({});
  const [showResults, setShowResults] = useState(false);
  const [showInlineCard, setShowInlineCard] = useState(true);
  const [animationKey, setAnimationKey] = useState(0);
  const [simulatedHearts, setSimulatedHearts] = useState(hearts);
  const [justAnsweredCorrect, setJustAnsweredCorrect] = useState(false);

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

      if (!isCorrect) {
        setSimulatedHearts((prev) => Math.max(0, prev - 1));
      } else {
        setJustAnsweredCorrect(true);
        setTimeout(() => setJustAnsweredCorrect(false), 1000);
      }

      setShowResult(true);
    },
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

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

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
      <div className="bg-background h-screen flex flex-col overflow-hidden">
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
              lessonName={t("tutorialTest", "lessonName")}
              onReturnToLessons={onClose}
              isTutorialMode={true}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="bg-background w-full max-w-[650px] h-screen flex flex-col overflow-hidden relative">
      <div className="flex-shrink-0">
        <HeaderBar
          onClose={handleBack}
          hearts={simulatedHearts}
          percentage={progress}
          isPremium={false}
          justAnsweredCorrect={justAnsweredCorrect}
          isTutorialMode={true}
        />
      </div>

      <div className="relative flex-1 flex items-center justify-center overflow-y-auto min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={animationKey}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="w-full h-full flex flex-col"
          >
            <div className="flex-1 h-full py-4 md:py-8">
              <div className="flex h-full items-center justify-center">
                <div className="flex h-full flex-col justify-between w-full max-w-[650px] gap-y-2 md:gap-y-4 px-4 md:px-6">
                  <div className="flex-shrink-0">
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

                  <div className="flex-1 flex flex-col min-h-0 justify-center">
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
