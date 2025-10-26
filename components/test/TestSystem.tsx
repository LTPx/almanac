"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { TestQuestion } from "./TestQuestion";
import { TestResults } from "./TestResults";
import { useTest } from "@/hooks/useTest";
import { HeaderBar } from "../header-bar";
import { NoHeartsTestModal } from "../modals/no-hearts-test-modal";
import { useNoHeartsTestModal } from "@/store/use-no-hearts-test-modal";

import type {
  TestData,
  TestResultsInterface as TestResultsType
} from "@/lib/types";
import Store from "@/app/(root)/store/page";

interface TestSystemProps {
  userId: string;
  initialLessonId: number;
  onClose: () => void;
  hearts: number;
  onHeartsChange?: (hearts: number) => void;
}

type TestState = "testing" | "review-intro" | "reviewing" | "results";

export function TestSystem({
  userId,
  initialLessonId,
  onClose,
  hearts: initialHearts,
  onHeartsChange
}: TestSystemProps) {
  const [state, setState] = useState<TestState>("testing");
  const [showStore, setShowStore] = useState(false);
  const [currentTest, setCurrentTest] = useState<TestData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);
  const [answers, setAnswers] = useState<{
    [questionId: number]: { answer: string; isCorrect: boolean };
  }>({});
  const [results, setResults] = useState<TestResultsType | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(
    Date.now()
  );
  const [currentHearts, setCurrentHearts] = useState(initialHearts);
  const [justAnsweredCorrect, setJustAnsweredCorrect] = useState(false);
  const [firstPassQuestionCount, setFirstPassQuestionCount] = useState(0);
  const [failedQuestions, setFailedQuestions] = useState<number[]>([]);

  const { error, startTest, submitAnswer, completeTest } = useTest();
  const hasInitialized = useRef(false);
  const modalTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { open: openNoHeartsModal } = useNoHeartsTestModal();

  const handleOpenStore = useCallback(() => {
    setShowStore(true);
  }, []);

  const handleExitTest = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (
      currentHearts === 0 &&
      (state === "testing" || state === "reviewing") &&
      !showStore
    ) {
      if (modalTimeoutRef.current) {
        clearTimeout(modalTimeoutRef.current);
      }

      modalTimeoutRef.current = setTimeout(() => {
        openNoHeartsModal(handleOpenStore, handleExitTest);
      }, 100);
    }

    return () => {
      if (modalTimeoutRef.current) {
        clearTimeout(modalTimeoutRef.current);
      }
    };
  }, [
    currentHearts,
    state,
    showStore,
    openNoHeartsModal,
    handleOpenStore,
    handleExitTest
  ]);

  const handleStartTest = useCallback(
    async (lessonId: number) => {
      const testData = await startTest(userId, lessonId);
      if (testData) {
        setCurrentTest(testData);
        setCurrentQuestionIndex(0);
        setAnswers({});
        setQuestionStartTime(Date.now());
        setState("testing");
        setFirstPassQuestionCount(testData.questions.length);
        setFailedQuestions([]);
      }
    },
    [startTest, userId]
  );

  useEffect(() => {
    if (!hasInitialized.current) {
      handleStartTest(initialLessonId);
      hasInitialized.current = true;
    }
  }, [handleStartTest, initialLessonId]);

  const handleAnswer = useCallback(
    async (questionId: number, answer: string) => {
      if (!currentTest) return;

      const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
      const result = await submitAnswer(
        currentTest.testAttemptId,
        questionId,
        answer,
        timeSpent
      );

      if (!result) return;

      setAnswers((prev) => ({
        ...prev,
        [questionId]: { answer, isCorrect: result.isCorrect }
      }));

      setJustAnsweredCorrect(result.isCorrect);
      setTimeout(() => setJustAnsweredCorrect(false), 1000);

      if (!result.isCorrect) {
        const newHearts = Math.max(0, currentHearts - 1);
        setCurrentHearts(newHearts);

        if (state === "testing") {
          setFailedQuestions((prev) =>
            prev.includes(questionId) ? prev : [...prev, questionId]
          );
        }

        setCurrentTest((prevTest) => {
          if (!prevTest) return prevTest;

          const failedQuestion = prevTest.questions.find(
            (q) => q.id === questionId
          );
          if (!failedQuestion) return prevTest;

          const alreadyQueued = prevTest.questions
            .slice(currentQuestionIndex + 1)
            .some((q) => q.id === questionId);

          if (alreadyQueued) return prevTest;

          return {
            ...prevTest,
            questions: [...prevTest.questions, failedQuestion]
          };
        });
      }
    },
    [
      currentTest,
      questionStartTime,
      submitAnswer,
      currentHearts,
      state,
      currentQuestionIndex
    ]
  );

  const handleCloseStore = useCallback(async () => {
    let updatedHearts = currentHearts;

    try {
      const response = await fetch(`/api/hearts/purchase?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        updatedHearts = data.currentHearts;

        if (updatedHearts !== currentHearts) {
          setCurrentHearts(updatedHearts);
          onHeartsChange?.(updatedHearts);
        }
      }
    } catch (error) {
      console.error("Error recargando corazones:", error);
    }

    setShowStore(false);

    if (updatedHearts > 0 && currentTest) {
      const currentQuestionId = currentTest.questions[currentQuestionIndex]?.id;

      if (currentQuestionId) {
        setAnswers((prev) => {
          const updated = { ...prev };
          delete updated[currentQuestionId];
          return updated;
        });
      }

      if (currentQuestionIndex < currentTest.questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setQuestionStartTime(Date.now());
        setAnimationKey((prev) => prev + 1);
      }
    }
  }, [
    currentHearts,
    userId,
    onHeartsChange,
    currentTest,
    currentQuestionIndex
  ]);

  const handleCompleteTest = useCallback(async () => {
    if (!currentTest) return;
    const testResults = await completeTest(currentTest.testAttemptId);
    if (testResults) {
      setResults(testResults);
      setState("results");
    }
  }, [currentTest, completeTest]);

  const handleNext = useCallback(() => {
    if (!currentTest) return;

    const currentQuestionId = currentTest.questions[currentQuestionIndex]?.id;

    if (currentQuestionId) {
      setAnswers((prev) => {
        const updated = { ...prev };
        delete updated[currentQuestionId];
        return updated;
      });
    }

    if (
      state === "testing" &&
      currentQuestionIndex === firstPassQuestionCount - 1
    ) {
      if (failedQuestions.length > 0) {
        setState("review-intro");
      } else {
        handleCompleteTest();
        return;
      }
    }

    if (currentQuestionIndex < currentTest.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setQuestionStartTime(Date.now());
      setAnimationKey((prev) => prev + 1);
    } else {
      handleCompleteTest();
    }
  }, [
    currentTest,
    currentQuestionIndex,
    state,
    firstPassQuestionCount,
    failedQuestions.length,
    handleCompleteTest
  ]);

  const handleStartReview = useCallback(() => {
    setState("reviewing");
  }, []);

  const progress = currentTest
    ? ((currentQuestionIndex + 1) / currentTest.questions.length) * 100
    : 0;

  if (error) {
    return (
      <div className="bg-gray-900 min-h-screen p-6 flex items-center justify-center">
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-6 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
          <p className="text-gray-300">{error}</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background h-[100dvh] flex flex-col overflow-hidden">
      {(state === "testing" || state === "reviewing") && currentTest && (
        <>
          <HeaderBar
            onClose={onClose}
            hearts={currentHearts}
            percentage={progress}
            hasActiveSubscription={false}
            justAnsweredCorrect={justAnsweredCorrect}
          />
          <div className="relative flex-1 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={animationKey}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="absolute w-full h-full flex"
              >
                <TestQuestion
                  question={currentTest.questions[currentQuestionIndex]}
                  onAnswer={handleAnswer}
                  onNext={handleNext}
                  showResult={
                    !!answers[currentTest.questions[currentQuestionIndex]?.id]
                  }
                  isCorrect={
                    answers[currentTest.questions[currentQuestionIndex]?.id]
                      ?.isCorrect
                  }
                  selectedAnswer={
                    answers[currentTest.questions[currentQuestionIndex]?.id]
                      ?.answer
                  }
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </>
      )}

      {state === "review-intro" && (
        <AnimatePresence>
          <motion.div
            key="review-intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="flex-1 flex items-center justify-center px-6"
          >
            <div className="text-center max-w-md w-full">
              <h1 className="text-3xl font-bold text-[#EFFF0A] mb-3">
                ¡Bien hecho!
              </h1>
              <p className="text-lg white mb-6">
                Ahora vamos a repasar los errores
              </p>
              <button
                onClick={handleStartReview}
                className="w-full py-3 bg-[#1983DD] hover:bg-[#1666B0] text-white font-semibold rounded-lg transition-colors"
              >
                Comenzar repaso
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {state === "results" && results && currentTest && (
        <AnimatePresence>
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full flex items-center justify-center"
          >
            <TestResults
              hearts={currentHearts}
              results={results}
              lessonName={currentTest.lesson.name}
              onReturnToLessons={onClose}
            />
          </motion.div>
        </AnimatePresence>
      )}

      {showStore && (
        <AnimatePresence>
          <motion.div
            key="store"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed inset-0 w-full h-full flex justify-center overflow-y-auto bg-background z-[250]"
          >
            <div className="relative max-w-[650px] h-full">
              <div className="absolute top-4 left-4 z-50">
                <button
                  onClick={handleCloseStore}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-white shadow-lg"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Volver al examen</span>
                </button>
              </div>
              <Store />
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      <NoHeartsTestModal />
    </div>
  );
}
