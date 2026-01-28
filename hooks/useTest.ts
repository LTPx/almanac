"use client";

import { TestData, TestResultsInterface } from "@/lib/types";
import { useState } from "react";

export function useTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startTest = async (
    userId: string,
    unitId: number
  ): Promise<TestData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/test/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId, unitId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al iniciar el test");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = async (
    testAttemptId: number,
    questionId: number,
    userAnswer: string,
    timeSpent?: number
  ) => {
    try {
      const response = await fetch("/api/test/submit-answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          testAttemptId,
          questionId,
          userAnswer,
          timeSpent
        })
      });

      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Error al enviar respuesta:", err);
      return null;
    }
  };

  const completeTest = async (
    testAttemptId: number
  ): Promise<TestResultsInterface | null> => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/test/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ testAttemptId })
      });

      const data = await response.json();
      return data.results;
    } catch (err) {
      console.error("Error al completar test:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const resumeTest = async (
    testAttemptId: number,
    userId: string
  ): Promise<(TestData & { currentQuestionIndex: number; previousAnswers: Record<number, { answer: string; isCorrect: boolean }> }) | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/test/resume?testAttemptId=${testAttemptId}&userId=${userId}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al resumir el test");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const startReviewTest = async (
    userId: string,
    curriculumId: string
  ): Promise<TestData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/test/start-review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId, curriculumId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al iniciar el repaso");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    startTest,
    startReviewTest,
    submitAnswer,
    completeTest,
    resumeTest
  };
}
