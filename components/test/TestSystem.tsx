"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TestQuestion } from "./TestQuestion";
import { TestResults } from "./TestResults";
import { useTest } from "@/hooks/useTest";
import { HeaderBar } from "../header-bar";

import type {
  TestData,
  TestResultsInterface as TestResultsType
  // Lesson
} from "@/lib/types";

interface TestSystemProps {
  userId: string;
  initialLessonId: number;
  onClose: () => void;
  hearts: number;
}

type TestState = "testing" | "results";

export function TestSystem({
  userId,
  initialLessonId,
  onClose,
  hearts
}: TestSystemProps) {
  const [state, setState] = useState<TestState>("testing");
  const [currentTest, setCurrentTest] = useState<TestData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{
    [questionId: number]: { answer: string; isCorrect: boolean };
  }>({});
  const [results, setResults] = useState<TestResultsType | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(
    Date.now()
  );

  const { error, startTest, submitAnswer, completeTest } = useTest();

  const handleStartTest = useCallback(
    async (lessonId: number) => {
      const testData = await startTest(userId, lessonId);
      if (testData) {
        setCurrentTest(testData);
        setCurrentQuestionIndex(0);
        setAnswers({});
        setQuestionStartTime(Date.now());
        setState("testing");
      }
    },
    [startTest, userId]
  );

  useEffect(() => {
    handleStartTest(initialLessonId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnswer = async (questionId: number, answer: string) => {
    if (!currentTest) return;

    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    const result = await submitAnswer(
      currentTest.testAttemptId,
      questionId,
      answer,
      timeSpent
    );

    if (result) {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: { answer, isCorrect: result.isCorrect }
      }));
    }
  };

  const handleNext = () => {
    if (!currentTest) return;

    if (currentQuestionIndex < currentTest.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setQuestionStartTime(Date.now());
    } else {
      handleCompleteTest();
    }
  };

  const handleCompleteTest = async () => {
    if (!currentTest) return;
    const testResults = await completeTest(currentTest.testAttemptId);
    if (testResults) {
      setResults(testResults);
      setState("results");
    }
  };

  const handleRetakeTest = () => {
    if (currentTest) {
      handleStartTest(currentTest.lesson.id);
    }
  };

  const progress = currentTest
    ? ((currentQuestionIndex + 1) / currentTest.totalQuestions) * 100
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
      {state === "testing" && currentTest && (
        <>
          <HeaderBar
            onClose={onClose}
            hearts={hearts}
            percentage={progress}
            hasActiveSubscription={false}
            justAnsweredCorrect={
              answers[currentTest.questions[currentQuestionIndex].id]?.isCorrect
            }
          />

          <div className="relative flex-1 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestionIndex}
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
                    !!answers[currentTest.questions[currentQuestionIndex].id]
                  }
                  isCorrect={
                    answers[currentTest.questions[currentQuestionIndex].id]
                      ?.isCorrect
                  }
                  selectedAnswer={
                    answers[currentTest.questions[currentQuestionIndex].id]
                      ?.answer
                  }
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </>
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
              hearts={hearts}
              results={results}
              lessonName={currentTest.lesson.name}
              onReturnToLessons={onClose}
              onRetakeTest={results.passed ? undefined : handleRetakeTest}
            />
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
