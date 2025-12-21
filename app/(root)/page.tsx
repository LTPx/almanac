"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useUser } from "@/context/UserContext";
import { Curriculum } from "@/lib/types";
import CourseHeader, { CourseHeaderRef } from "@/components/course-header";
import { useCurriculums } from "@/hooks/use-curriculums";
import LearningPath from "@/components/units-learning";
import { useCurriculumStore } from "@/store/useCurriculumStore";
import {
  Loader2,
  BookOpen,
  List,
  GraduationCap,
  Target,
  Award
} from "lucide-react";
import { useHome } from "@/hooks/useHome";
import { TutorialSpotlight } from "@/components/tutorial/tutorial";
import { TutorialTestSystem } from "@/components/tutorial/tutorial-test-system";

const ContentLoadingScreen = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
      </div>
      <div className="text-center">
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
          Cargando
        </p>
      </div>
    </div>
  </div>
);

export default function HomePage() {
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [selectedCurriculum, setSelectedCurriculum] =
    useState<Curriculum | null>(null);
  const { selectedCurriculumId, setSelectedCurriculumId } =
    useCurriculumStore();
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentTutorialStep, setCurrentTutorialStep] = useState(0);
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

  const handleAdvanceToNextStep = useCallback(() => {
    console.log("🚀 Avanzando al siguiente paso...");
    setCurrentTutorialStep((prev) => {
      console.log(`📍 Paso actual: ${prev}, Nuevo paso: ${prev + 1}`);
      return prev + 1;
    });
  }, []);

  const tutorialSteps = useMemo(
    () => [
      {
        id: "welcome",
        target: ".course-header-select",
        title: "¡Bienvenido a Almanac! 🎉",
        description:
          "Aquí puedes elegir el curriculum que quieres estudiar. Cada curriculum tiene diferentes unidades de aprendizaje.",
        icon: <BookOpen className="w-8 h-8" />,
        position: "bottom" as const
      },
      {
        id: "review-units",
        target: "[data-radix-select-content]",
        title: "Revisa las unidades 📚",
        description:
          "Explora todas las unidades disponibles. Cada una contiene diferentes lecciones que te ayudarán a aprender paso a paso.",
        icon: <List className="w-8 h-8" />,
        position: "bottom" as const,
        action: () => {
          courseHeaderRef.current?.openSelect();
        }
      },
      {
        id: "unit-explanations",
        target: "[data-highest-position='true']",
        title: "Aprende con explicaciones 📖",
        description:
          "Cada unidad tiene explicaciones detalladas que puedes revisar antes de hacer las pruebas. ¡Tómate tu tiempo para aprender!",
        icon: <GraduationCap className="w-8 h-8" />,
        position: "top" as const,
        action: () => {
          courseHeaderRef.current?.closeSelect();
        }
      },
      {
        id: "start-test",
        target: "[data-tutorial-start-button='true']",
        title: "¡Hora de practicar! 🎯",
        description:
          "Cuando estés listo, empieza una prueba. Ahora te mostraremos un ejemplo con los tipos de preguntas que encontrarás.",
        icon: <Target className="w-8 h-8" />,
        position: "bottom" as const
      },
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
              console.log("✅ Test completado, avanzando al paso 6...");
              handleAdvanceToNextStep();
            }}
          />
        )
      },
      {
        id: "completed-unit",
        target: "[data-highest-position='true']",
        title: "¡Unidad Completada! 🎉",
        description:
          "Si apruebas la unidad, puedes continuar a la siguiente. ¡Sigue aprendiendo para completar todo el curriculum!",
        icon: <Award className="w-8 h-8" />,
        position: "top" as const,
        action: () => {
          courseHeaderRef.current?.closeSelect();
        }
      },
      {
        id: "optional-unit",
        target: "[data-optional-node='true']",
        title: "Unidades Opcionales 🌟",
        description:
          "Algunas unidades son obligatorias y otras son opcionales. Las opcionales te permiten practicar más y mejorar tus habilidades, pero no son necesarias para avanzar.",
        icon: <Target className="w-8 h-8" />,
        position: "top" as const,
        action: () => {
          courseHeaderRef.current?.closeSelect();
        }
      },
      {
        id: "final-unit",
        target: "[data-first-mandatory='true']",
        title: "¡Unidad Final! 🏆",
        description:
          "Cuando superes la unidad final, recibirás un token que te permitirá crear tu certificado digital único.",
        icon: <Award className="w-8 h-8" />,
        position: "top" as const,
        action: () => {
          courseHeaderRef.current?.closeSelect();
        }
      }
    ],
    [gamification?.hearts, handleAdvanceToNextStep]
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
      curriculums.length > 0 &&
      selectedCurriculum
    ) {
      const hasSeenTutorial = localStorage.getItem("tutorial_completed");
      if (!hasSeenTutorial) {
        setTimeout(() => {
          setShowTutorial(true);
        }, 500);
      }
    }
  }, [isLoading, isLoadingGamification, curriculums, selectedCurriculum]);

  const handleTestComplete = useCallback(async () => {
    await refetchGamification();
  }, [refetchGamification]);

  const handleCurriculumChange = (curriculumId: string) => {
    setSelectedCurriculumId(curriculumId);
  };

  const handleTutorialComplete = () => {
    localStorage.setItem("tutorial_completed", "true");
    setShowTutorial(false);
    setCurrentTutorialStep(0);
    courseHeaderRef.current?.closeSelect();
  };

  const handleTutorialStepChange = (step: number) => {
    console.log(`📌 Tutorial cambió a paso: ${step}`);
    setCurrentTutorialStep(step);

    const stepConfig = tutorialSteps[step];

    if (stepConfig?.id !== "review-units" && stepConfig?.id !== "start-test") {
      courseHeaderRef.current?.closeSelect();
    }
  };

  const isInitialLoading = isLoading && curriculums.length === 0;
  const isGamificationLoading = isLoadingGamification && !gamification;

  const resetTutorial = () => {
    localStorage.removeItem("tutorial_completed");
    setShowTutorial(true);
    setCurrentTutorialStep(0);
  };

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
      <TutorialSpotlight
        show={showTutorial}
        steps={tutorialSteps}
        onComplete={handleTutorialComplete}
        onStepChange={handleTutorialStepChange}
        initialStep={currentTutorialStep}
      />
      <CourseHeader
        ref={courseHeaderRef}
        curriculums={curriculums}
        selectedCurriculumId={selectedCurriculumId}
        onUnitChange={handleCurriculumChange}
        lives={gamification?.hearts ?? 0}
        zaps={gamification?.zapTokens ?? 0}
        isPremium={isPremium}
        preventSelectClose={showTutorial && currentTutorialStep === 1}
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
          <button
            onClick={resetTutorial}
            className="fixed bottom-4 right-4 z-[10000] bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-purple-700 transition-colors text-sm font-semibold"
          >
            🔄 Reiniciar Tutorial
          </button>
          <LearningPath
            key={selectedCurriculum.id}
            hearts={gamification?.hearts ?? 0}
            curriculum={selectedCurriculum}
            userId={userId}
            onTestComplete={handleTestComplete}
            showAsCompleted={currentTutorialStep === 5}
            showOptionalAsAvailable={currentTutorialStep === 6}
          />
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
