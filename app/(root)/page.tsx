"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useUser } from "@/context/UserContext";
import { Curriculum } from "@/lib/types";
import CourseHeader, { CourseHeaderRef } from "@/components/course-header";
import { useCurriculums } from "@/hooks/use-curriculums";
import { useCurriculumStore } from "@/store/useCurriculumStore";
import { Loader2, BookOpen } from "lucide-react";
import { useHome } from "@/hooks/useHome";
import { TutorialSpotlight } from "@/components/tutorial/tutorial";
import { TutorialLearningPath } from "@/components/tutorial/tutorial-learning-path";
import LearningPath from "@/components/units-learning";
import {
  TutorialProvider,
  useTutorial
} from "@/components/tutorial/tutorial-provider";
import { TutorialTestSystem } from "@/components/tutorial/tutorial-test-system";
import { createTutorialSteps } from "@/components/tutorial/tutorial-steps";
import TutorialNFTMinting from "@/components/tutorial/tutorial-nft-minting";
import { TutorialChatDemo } from "@/components/tutorial/tutorial-chat-demo";

const ContentLoadingScreen = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
      <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
        Cargando
      </p>
    </div>
  </div>
);

function HomePageContent() {
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [selectedCurriculum, setSelectedCurriculum] =
    useState<Curriculum | null>(null);
  const { selectedCurriculumId, setSelectedCurriculumId } =
    useCurriculumStore();
  const courseHeaderRef = useRef<CourseHeaderRef>(null);

  const user = useUser();
  const userId = user?.id || "";
  const { isLoading, error, fetchCurriculums, fetchCurriculumWithUnits } =
    useCurriculums();

  const {
    gamification,
    isPremium,
    isLoading: isLoadingGamification,
    refetch: refetchGamification
  } = useHome(userId);

  const {
    isActive: isTutorialActive,
    currentStep,
    hasCompleted,
    startTutorial,
    completeTutorial,
    setStep,
    nextStep,
    prevStep,
    resetTutorial
  } = useTutorial();

  const tutorialSteps = useMemo(
    () => [
      ...createTutorialSteps(courseHeaderRef).slice(0, 4),
      {
        id: "test-demo",
        title: "Práctica Interactiva",
        description: "Demo del sistema de pruebas",
        isFullScreen: true,
        customContent: (
          <TutorialTestSystem
            key="tutorial-test-system"
            hearts={gamification?.hearts ?? 0}
            onClose={() => {
              nextStep();
            }}
          />
        )
      },
      ...createTutorialSteps(courseHeaderRef).slice(4, 7),
      {
        id: "chat-demo",
        title: "Demo del Tutor",
        description: "Conoce a tu tutor personal",
        isFullScreen: true,
        customContent: (
          <TutorialChatDemo
            key="tutorial-chat-demo"
            onClose={() => {
              nextStep();
            }}
            onBack={() => {
              prevStep();
            }}
          />
        )
      },
      ...createTutorialSteps(courseHeaderRef).slice(7, 8),
      {
        id: "nft-minting",
        title: "Crea tu Medalla NFT",
        description: "Aprende a mintear tus certificados",
        isFullScreen: true,
        customContent: (
          <TutorialNFTMinting
            key="tutorial-nft-minting"
            onClose={() => {
              nextStep();
            }}
            onBack={() => {
              prevStep();
            }}
          />
        )
      }
    ],
    [nextStep, prevStep, gamification?.hearts, courseHeaderRef]
  );

  useEffect(() => {
    const loadUnits = async () => {
      const data = await fetchCurriculums({ active: "true" });
      if (data) {
        setCurriculums(data);
        if (data.length > 0 && !selectedCurriculumId) {
          setSelectedCurriculumId(data[0].id.toString());
        }
      }
    };
    loadUnits();
  }, [fetchCurriculums, selectedCurriculumId, setSelectedCurriculumId]);

  useEffect(() => {
    if (!selectedCurriculumId) return;

    const loadUnit = async () => {
      const unit = await fetchCurriculumWithUnits(selectedCurriculumId);
      if (unit) setSelectedCurriculum(unit);
    };
    loadUnit();
  }, [selectedCurriculumId, fetchCurriculumWithUnits]);

  useEffect(() => {
    if (
      !isLoading &&
      !isLoadingGamification &&
      !hasCompleted &&
      curriculums.length > 0 &&
      selectedCurriculum &&
      !isTutorialActive
    ) {
      setTimeout(() => {
        startTutorial();
      }, 500);
    }
  }, [
    isLoading,
    isLoadingGamification,
    hasCompleted,
    curriculums,
    selectedCurriculum,
    isTutorialActive,
    startTutorial
  ]);

  const handleTestComplete = useCallback(async () => {
    await refetchGamification();
  }, [refetchGamification]);

  const handleCurriculumChange = (curriculumId: string) => {
    setSelectedCurriculumId(curriculumId);
  };

  const handleTutorialComplete = () => {
    completeTutorial();
    courseHeaderRef.current?.closeSelect();
  };

  const handleTutorialStepChange = (step: number) => {
    console.log(`📌 Tutorial cambió a paso: ${step}`);
    setStep(step);

    const stepConfig = tutorialSteps[step];
    if (stepConfig?.id !== "review-units" && stepConfig?.id !== "start-test") {
      courseHeaderRef.current?.closeSelect();
    }
  };

  const isInitialLoading = isLoading && curriculums.length === 0;
  const isGamificationLoading = isLoadingGamification && !gamification;

  if (isInitialLoading || isGamificationLoading) {
    return (
      <div className="HomePage">
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
              <BookOpen className="w-6 h-6 text-purple-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Cargando tu progreso
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Preparando todo para ti...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="HomePage">
      {isTutorialActive && (
        <TutorialSpotlight
          show={true}
          steps={tutorialSteps}
          onComplete={handleTutorialComplete}
          onStepChange={handleTutorialStepChange}
          initialStep={currentStep}
        />
      )}

      <CourseHeader
        ref={courseHeaderRef}
        curriculums={curriculums}
        selectedCurriculumId={selectedCurriculumId}
        onUnitChange={handleCurriculumChange}
        lives={gamification?.hearts ?? 0}
        zaps={gamification?.zapTokens ?? 0}
        isPremium={isPremium}
        preventSelectClose={isTutorialActive && currentStep === 1}
      />

      {error && (
        <div className="px-6 py-4">
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      )}

      {isLoading ? (
        <ContentLoadingScreen />
      ) : selectedCurriculum ? (
        <div className="h-full">
          {hasCompleted && (
            <button
              onClick={resetTutorial}
              className="fixed bottom-4 right-4 z-[10000] bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-purple-700 transition-colors text-sm font-semibold"
            >
              🔄 Reiniciar Tutorial
            </button>
          )}

          {isTutorialActive ? (
            <TutorialLearningPath
              key={selectedCurriculum.id}
              hearts={gamification?.hearts ?? 0}
              curriculum={selectedCurriculum}
              userId={userId}
              onTestComplete={handleTestComplete}
            />
          ) : (
            <LearningPath
              key={selectedCurriculum.id}
              hearts={gamification?.hearts ?? 0}
              curriculum={selectedCurriculum}
              userId={userId}
              onTestComplete={handleTestComplete}
            />
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-gray-500 dark:text-gray-400">
            No se encontraron datos
          </p>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <TutorialProvider>
      <HomePageContent />
    </TutorialProvider>
  );
}
