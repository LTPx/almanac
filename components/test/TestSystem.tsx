"use client";

import { useState, useEffect } from "react";
import { TestQuestion } from "./TestQuestion";
import { TestResults } from "./TestResults";
import { useTest } from "@/hooks/useTest";

import type {
  TestData,
  Question,
  TestResultsInterface as TestResultsType
} from "@/lib/types";
import { HeaderBar } from "../header-bar";

interface TestSystemProps {
  userId: string;
  initialLesson: {
    id: number;
    name: string;
    description: string | null;
    experiencePoints: number;
  };
  onClose: () => void;
}

type TestState = "testing" | "results";

export function TestSystem({
  userId,
  initialLesson,
  onClose
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

  const { isLoading, error, startTest, submitAnswer, completeTest } = useTest();

  useEffect(() => {
    handleStartTest(initialLesson.id);
  }, []);

  const handleStartTest = async (lessonId: number) => {
    const testData = await startTest(userId, lessonId);
    if (testData) {
      setCurrentTest(testData);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setQuestionStartTime(Date.now());
      setState("testing");
    }
  };

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

      setTimeout(() => {
        if (currentQuestionIndex < currentTest.questions.length - 1) {
          setCurrentQuestionIndex((prev) => prev + 1);
          setQuestionStartTime(Date.now());
        } else {
          handleCompleteTest();
        }
      }, 2000);
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

  if (state === "testing" && currentTest) {
    const currentQuestion = currentTest.questions[currentQuestionIndex];
    const questionAnswer = answers[currentQuestion.id];

    return (
      <div className="bg-gray-900 min-h-screen flex flex-col">
        <HeaderBar
          onClose={onClose}
          hearts={5}
          percentage={20}
          hasActiveSubscription={false}
        />
        {/* <div className="bg-gray-800 p-4 flex justify-between items-center">
          <div className="max-w-2xl flex-1">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300 text-sm">
                Pregunta {currentQuestionIndex + 1} de{" "}
                {currentTest.totalQuestions}
              </span>
              <span className="text-gray-300 text-sm">
                {currentTest.lesson.name}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-100 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    ((currentQuestionIndex + 1) / currentTest.totalQuestions) *
                    100
                  }%`
                }}
              />
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-4 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Cerrar
          </button>
        </div> */}

        <TestQuestion
          question={currentQuestion}
          onAnswer={handleAnswer}
          showResult={!!questionAnswer}
          isCorrect={questionAnswer?.isCorrect}
          selectedAnswer={questionAnswer?.answer}
        />
      </div>
    );
  }

  if (state === "results" && results && currentTest) {
    return (
      <div className="bg-gray-900 min-h-screen flex flex-col">
        <div className="p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Cerrar
          </button>
        </div>
        <TestResults
          results={results}
          lessonName={currentTest.lesson.name}
          onReturnToLessons={onClose}
          onRetakeTest={results.passed ? undefined : handleRetakeTest}
        />
      </div>
    );
  }

  return null;
}
