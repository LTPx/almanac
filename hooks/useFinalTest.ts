"use client";

import { useState } from "react";

export interface FinalTestData {
  finalTestAttemptId: number;
  curriculum: {
    id: string;
    title: string;
  };
  finalTest: {
    id: number;
    title: string | null;
    description: string | null;
    passingScore: number;
  };
  questions: {
    id: number;
    type: string;
    title: string;
    order: number;
    content: any;
    answers: { id: number; text: string }[];
  }[];
  totalQuestions: number;
}

export interface FinalTestResultsInterface {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  passed: boolean;
  passingScore: number;
  experienceGained: number;
  curriculumCompleted: boolean;
  curriculumRewards: any;
  timeQuizInSeconds: number;
}

export function useFinalTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startFinalTest = async (
    userId: string,
    curriculumId: string,
    lang?: string
  ): Promise<FinalTestData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/final-test/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId, curriculumId, lang })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al iniciar el test final");
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
    finalTestAttemptId: number,
    questionId: number,
    userAnswer: string,
    timeSpent?: number
  ) => {
    try {
      const response = await fetch("/api/final-test/submit-answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          finalTestAttemptId,
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

  const completeFinalTest = async (
    finalTestAttemptId: number
  ): Promise<FinalTestResultsInterface | null> => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/final-test/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ finalTestAttemptId })
      });

      const data = await response.json();
      return data.results;
    } catch (err) {
      console.error("Error al completar test final:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    startFinalTest,
    submitAnswer,
    completeFinalTest
  };
}
