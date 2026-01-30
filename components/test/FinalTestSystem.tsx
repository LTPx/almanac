"use client";

import { motion, AnimatePresence } from "framer-motion";
import { TestQuestion } from "./TestQuestion";
import { TestResults } from "./TestResults";
import { HeaderBar } from "../header-bar";
import { StreakCelebration } from "./StreakCelebration";
import { HeartBreakAnimation } from "./HeartBreakAnimation";
import StoreContent from "../store-content";
import { ReportErrorModal } from "../modals/report-error-modal";
import InterstitialAd from "../interstitialAd";
import { SuccessCompletion } from "./SuccessCompletion";
import { MistakeAnalyzerOverlay } from "./MistakeAnalyzerOverlay";
import { useFinalTestSystem } from "@/hooks/useFinalTestSystem";

interface FinalTestSystemProps {
  userId: string;
  curriculumId: string;
  onClose: () => void;
  hearts: number;
  onHeartsChange?: (hearts: number) => void;
}

export function FinalTestSystem(props: FinalTestSystemProps) {
  const {
    // State
    state,
    error,
    currentTest,
    animationKey,
    results,
    currentHearts,
    justAnsweredCorrect,
    isPremium,
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
  } = useFinalTestSystem(props);

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
                  {currentQuestion && (
                    <TestQuestion
                      question={currentQuestion}
                      onAnswer={handleAnswer}
                      onNext={handleNext}
                      onReportError={() => setShowReportModal(true)}
                      showResult={!!currentQuestionAnswer}
                      isCorrect={currentQuestionAnswer?.isCorrect}
                      selectedAnswer={currentQuestionAnswer?.answer}
                      isDisabled={isAnimationPlaying}
                    />
                  )}
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
              lessonName={currentTest.finalTest.title || "Test Final"}
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
                onHeartsUpdate={handleHeartsUpdate}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {currentTest && currentQuestion && (
        <ReportErrorModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          questionId={currentQuestion.id}
          questionText={currentQuestion.title}
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
            onComplete={handleStreakCelebrationComplete}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMistakeAnalyzer && (
          <MistakeAnalyzerOverlay
            errorCount={uniqueFailedQuestions.size}
            onComplete={handleMistakeAnalyzerComplete}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccessCelebration && (
          <SuccessCompletion
            onStartComplete={handleSuccessCelebrationStartComplete}
            onComplete={handleSuccessCelebrationComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
