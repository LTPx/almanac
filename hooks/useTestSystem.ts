"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTest } from "@/hooks/useTest";
import { useNoHeartsTestModal } from "@/store/use-no-hearts-test-modal";
import { useUser } from "@/context/UserContext";
import type {
  TestData,
  TestResultsInterface as TestResultsType
} from "@/lib/types";

export type TestState =
  | "testing"
  | "review-intro"
  | "reviewing"
  | "results"
  | "success-celebration"
  | "ad-after-results";

interface UseTestSystemProps {
  userId: string;
  unitId: number;
  curriculumId: string;
  onClose: () => void;
  hearts: number;
  onHeartsChange?: (hearts: number) => void;
  resumeTestAttemptId?: number;
  isReviewMode?: boolean;
  lang?: string;
}

export function useTestSystem({
  userId,
  unitId,
  curriculumId,
  onClose,
  hearts: initialHearts,
  onHeartsChange,
  resumeTestAttemptId,
  isReviewMode,
  lang
}: UseTestSystemProps) {
  const [state, setState] = useState<TestState>("testing");
  const [showStore, setShowStore] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
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
  const [showSuccessCelebration, setShowSuccessCelebration] = useState(false);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [showStreakCelebration, setShowStreakCelebration] = useState(false);
  const [showMistakeAnalyzer, setShowMistakeAnalyzer] = useState(false);
  const [showHeartBreakAnimation, setShowHeartBreakAnimation] = useState(false);
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(false);
  const [uniqueFailedQuestions, setUniqueFailedQuestions] = useState<
    Set<number>
  >(new Set());

  const user = useUser();
  const isPremium = user?.isPremium || false;
  const showAd = !isPremium;

  const {
    error,
    startTest,
    startReviewTest,
    submitAnswer,
    completeTest,
    resumeTest
  } = useTest();

  const hasInitialized = useRef(false);
  const modalTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isCompletingTestRef = useRef(false);
  const hasCompletedRef = useRef(false);

  const { open: openNoHeartsModal } = useNoHeartsTestModal();

  // Cleanup refs on unmount
  useEffect(() => {
    return () => {
      isCompletingTestRef.current = false;
      hasCompletedRef.current = false;
    };
  }, []);

  const handleOpenStore = useCallback(() => {
    setShowStore(true);
  }, []);

  const handleExitTest = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleReportError = useCallback(
    async (report: {
      questionId: number;
      reason: string;
      description: string;
    }) => {
      try {
        const response = await fetch("/api/questions/report", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            questionId: report.questionId,
            reason: report.reason,
            description: report.description
          })
        });

        if (!response.ok) {
          throw new Error("Error al enviar el reporte");
        }

        const data = await response.json();
        console.log("✅ Reporte enviado exitosamente:", data);
      } catch (error) {
        console.error("❌ Error al enviar reporte:", error);
        throw error;
      }
    },
    []
  );

  // No hearts modal effect
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
      const testData = await startTest(userId, lessonId, lang);
      if (testData) {
        setCurrentTest(testData);
        setCurrentQuestionIndex(0);
        setAnswers({});
        setQuestionStartTime(Date.now());
        setState("testing");
        setFirstPassQuestionCount(testData.questions.length);
        setFailedQuestions([]);
        setUniqueFailedQuestions(new Set());
        setConsecutiveCorrect(0);
        isCompletingTestRef.current = false;
        hasCompletedRef.current = false;
      }
    },
    [startTest, userId]
  );

  // Initialize test
  useEffect(() => {
    if (!hasInitialized.current) {
      if (resumeTestAttemptId) {
        resumeTest(resumeTestAttemptId, userId, lang).then((data) => {
          if (data) {
            setCurrentTest(data);
            setCurrentQuestionIndex(data.currentQuestionIndex);
            setAnswers(data.previousAnswers);
            setQuestionStartTime(Date.now());
            setState("testing");
            setFirstPassQuestionCount(data.questions.length);
            const failed = Object.entries(data.previousAnswers)
              .filter(([, val]) => !val.isCorrect)
              .map(([key]) => parseInt(key));
            setFailedQuestions(failed);
            setUniqueFailedQuestions(new Set(failed));
          }
        });
      } else if (isReviewMode) {
        startReviewTest(userId, curriculumId, lang).then((testData) => {
          if (testData) {
            setCurrentTest(testData);
            setCurrentQuestionIndex(0);
            setAnswers({});
            setQuestionStartTime(Date.now());
            setState("testing");
            setFirstPassQuestionCount(testData.questions.length);
            setFailedQuestions([]);
            setUniqueFailedQuestions(new Set());
            setConsecutiveCorrect(0);
            isCompletingTestRef.current = false;
            hasCompletedRef.current = false;
          }
        });
      } else {
        handleStartTest(unitId);
      }
      hasInitialized.current = true;
    }
  }, [
    handleStartTest,
    unitId,
    resumeTestAttemptId,
    resumeTest,
    userId,
    isReviewMode,
    startReviewTest,
    curriculumId
  ]);

  // Before unload warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state === "testing" || state === "reviewing") {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [state]);

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

      if (result.isCorrect) {
        const newStreak = consecutiveCorrect + 1;
        setConsecutiveCorrect(newStreak);

        if (newStreak === 5) {
          setIsAnimationPlaying(true);
          setShowStreakCelebration(true);
        }
      } else {
        setConsecutiveCorrect(0);
      }

      if (!result.isCorrect) {
        const newHearts = result.hearts;
        setCurrentHearts(newHearts);

        if (newHearts === 0) {
          setShowHeartBreakAnimation(true);
        }

        if (state === "testing") {
          setFailedQuestions((prev) =>
            prev.includes(questionId) ? prev : [...prev, questionId]
          );

          setUniqueFailedQuestions((prev) => {
            const newSet = new Set(prev);
            newSet.add(questionId);
            return newSet;
          });
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
      currentQuestionIndex,
      consecutiveCorrect
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

    if (updatedHearts === 0) {
      setTimeout(() => {
        setShowHeartBreakAnimation(true);
      }, 100);
      return;
    }

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
    if (isCompletingTestRef.current || hasCompletedRef.current) {
      console.log("⚠️ Test completion already in progress or completed");
      return;
    }

    isCompletingTestRef.current = true;
    console.log("✅ Starting test completion...");

    try {
      const testResults = await completeTest(currentTest.testAttemptId);

      if (testResults) {
        const totalQuestions = firstPassQuestionCount;
        const failedCount = uniqueFailedQuestions.size;
        const correctCount = totalQuestions - failedCount;
        const accurateScore = (correctCount / totalQuestions) * 100;

        const correctedResults = {
          ...testResults,
          score: accurateScore
        };

        setResults(correctedResults);
        setState("results");
        hasCompletedRef.current = true;
        console.log("✅ Test completed successfully");
      }
    } catch (error) {
      console.error("❌ Error completing test:", error);
      isCompletingTestRef.current = false;
    }
  }, [
    currentTest,
    completeTest,
    firstPassQuestionCount,
    uniqueFailedQuestions
  ]);

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
        setShowMistakeAnalyzer(true);
        return;
      } else {
        setState("success-celebration");
        setShowSuccessCelebration(true);
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

  const handleHeartBreakComplete = useCallback(() => {
    setShowHeartBreakAnimation(false);
    handleOpenStore();
  }, [handleOpenStore]);

  const handleReturnFromResults = useCallback(() => {
    if (showAd) {
      setState("ad-after-results");
    } else {
      onClose();
    }
  }, [showAd, onClose]);

  const handleAdAfterResultsClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleMistakeAnalyzerComplete = useCallback(() => {
    setShowMistakeAnalyzer(false);
    setState("reviewing");
    setCurrentQuestionIndex((prev) => prev + 1);
    setQuestionStartTime(Date.now());
    setAnimationKey((prev) => prev + 1);
  }, []);

  const handleStreakCelebrationComplete = useCallback(() => {
    setShowStreakCelebration(false);
    setIsAnimationPlaying(false);
  }, []);

  const handleSuccessCelebrationStartComplete = useCallback(() => {
    handleCompleteTest();
  }, [handleCompleteTest]);

  const handleSuccessCelebrationComplete = useCallback(() => {
    setShowSuccessCelebration(false);
  }, []);

  const handleHeartsUpdate = useCallback(
    (newHearts: number) => {
      setCurrentHearts(newHearts);
      onHeartsChange?.(newHearts);
    },
    [onHeartsChange]
  );

  const progress = currentTest
    ? ((currentQuestionIndex + 1) / currentTest.questions.length) * 100
    : 0;

  const currentQuestion = currentTest?.questions[currentQuestionIndex];
  const currentQuestionAnswer = currentQuestion
    ? answers[currentQuestion.id]
    : undefined;

  return {
    // State
    state,
    error,
    currentTest,
    currentQuestionIndex,
    animationKey,
    answers,
    results,
    currentHearts,
    justAnsweredCorrect,
    isPremium,
    showAd,
    progress,
    currentQuestion,
    currentQuestionAnswer,

    // UI State
    showStore,
    showReportModal,
    showSuccessCelebration,
    showStreakCelebration,
    showMistakeAnalyzer,
    showHeartBreakAnimation,
    isAnimationPlaying,
    uniqueFailedQuestions,

    // Handlers
    onClose,
    handleAnswer,
    handleNext,
    handleCloseStore,
    handleExitTest,
    handleReportError,
    handleHeartBreakComplete,
    handleReturnFromResults,
    handleAdAfterResultsClose,
    handleMistakeAnalyzerComplete,
    handleStreakCelebrationComplete,
    handleSuccessCelebrationStartComplete,
    handleSuccessCelebrationComplete,
    handleHeartsUpdate,
    setShowReportModal,

    // Props passthrough
    curriculumId
  };
}
