"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TestQuestion } from "./TestQuestion";
import { TestResults } from "./TestResults";
import { useTest } from "@/hooks/useTest";
import { HeaderBar } from "../header-bar";
import { useNoHeartsTestModal } from "@/store/use-no-hearts-test-modal";
import { StreakCelebration } from "./StreakCelebration";
import { HeartBreakAnimation } from "./HeartBreakAnimation";
import type {
  TestData,
  TestResultsInterface as TestResultsType
} from "@/lib/types";
import StoreContent from "../store-content";
import { ReportErrorModal } from "../modals/report-erros-modal";
import InterstitialAd from "../interstitialAd";
import { useUser } from "@/context/UserContext";
import { SuccessCompletion } from "./SuccessCompletion";
import { MistakeAnalyzerOverlay } from "./MistakeAnalyzerOverlay";

interface TestSystemProps {
  userId: string;
  unitId: number;
  curriculumId: string;
  onClose: () => void;
  hearts: number;
  onHeartsChange?: (hearts: number) => void;
  resumeTestAttemptId?: number;
  isReviewMode?: boolean;
}

type TestState =
  | "testing"
  | "review-intro"
  | "reviewing"
  | "results"
  | "success-celebration"
  | "ad-after-results";

export function TestSystem({
  userId,
  unitId,
  curriculumId,
  onClose,
  hearts: initialHearts,
  onHeartsChange,
  resumeTestAttemptId,
  isReviewMode
}: TestSystemProps) {
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

  const user = useUser();
  const isPremium = user?.isPremium || false;
  const showAd = isPremium ? false : true;

  const [uniqueFailedQuestions, setUniqueFailedQuestions] = useState<
    Set<number>
  >(new Set());

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

  const handleReportError = async (report: {
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
  };

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
        setUniqueFailedQuestions(new Set());
        setConsecutiveCorrect(0);
        isCompletingTestRef.current = false;
        hasCompletedRef.current = false;
      }
    },
    [startTest, userId]
  );

  useEffect(() => {
    if (!hasInitialized.current) {
      if (resumeTestAttemptId) {
        // Resumir test existente
        resumeTest(resumeTestAttemptId, userId).then((data) => {
          if (data) {
            setCurrentTest(data);
            setCurrentQuestionIndex(data.currentQuestionIndex);
            setAnswers(data.previousAnswers);
            setQuestionStartTime(Date.now());
            setState("testing");
            setFirstPassQuestionCount(data.questions.length);
            // Calcular failedQuestions desde previousAnswers
            const failed = Object.entries(data.previousAnswers)
              .filter(([, val]) => !val.isCorrect)
              .map(([key]) => parseInt(key));
            setFailedQuestions(failed);
            setUniqueFailedQuestions(new Set(failed));
          }
        });
      } else if (isReviewMode) {
        startReviewTest(userId, curriculumId).then((testData) => {
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
        const newHearts = Math.max(0, currentHearts - 1);
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
      {(state === "testing" || state === "reviewing") &&
        currentTest &&
        !showSuccessCelebration &&
        !showMistakeAnalyzer && (
          <>
            <HeaderBar
              onClose={onClose}
              hearts={currentHearts}
              percentage={progress}
              isPremium={isPremium}
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
                    onReportError={() => setShowReportModal(true)}
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
                    isDisabled={isAnimationPlaying}
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute inset-0 w-full h-full flex items-center justify-center"
          >
            <TestResults
              hearts={currentHearts}
              results={results}
              lessonName={currentTest.lesson.name}
              onReturnToLessons={handleReturnFromResults}
            />
          </motion.div>
        </AnimatePresence>
      )}

      {state === "ad-after-results" && (
        <InterstitialAd
          onClose={handleAdAfterResultsClose}
          curriculumId={curriculumId}
        />
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
              <StoreContent
                onBack={handleCloseStore}
                showBackButton={true}
                title="Tienda"
                backButtonVariant="button"
                onHeartsUpdate={(newHearts: number) => {
                  setCurrentHearts(newHearts);
                  if (onHeartsChange) {
                    onHeartsChange(newHearts);
                  }
                }}
                testAttemptId={currentTest?.testAttemptId}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {currentTest && (
        <ReportErrorModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          questionId={currentTest.questions[currentQuestionIndex]?.id}
          questionText={
            currentTest.questions[currentQuestionIndex]?.title ||
            currentTest.questions[currentQuestionIndex]?.title
          }
          onSubmit={handleReportError}
        />
      )}

      <AnimatePresence>
        {showHeartBreakAnimation && (
          <HeartBreakAnimation
            onComplete={handleHeartBreakComplete}
            onExit={handleExitTest}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showStreakCelebration && (
          <StreakCelebration
            count={5}
            onComplete={() => {
              setShowStreakCelebration(false);
              setIsAnimationPlaying(false);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMistakeAnalyzer && (
          <MistakeAnalyzerOverlay
            errorCount={uniqueFailedQuestions.size}
            onComplete={() => {
              setShowMistakeAnalyzer(false);
              setState("reviewing");
              setCurrentQuestionIndex((prev) => prev + 1);
              setQuestionStartTime(Date.now());
              setAnimationKey((prev) => prev + 1);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccessCelebration && (
          <SuccessCompletion
            onStartComplete={() => {
              handleCompleteTest();
            }}
            onComplete={() => {
              setShowSuccessCelebration(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
