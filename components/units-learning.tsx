"use client";

import React, { useState, useEffect } from "react";
import { LessonGrid } from "./lesson-grid";
import { TestSystem } from "./test/TestSystem";
import { Curriculum, Unit } from "@/lib/types";
import { useProgress } from "@/hooks/useProgress";
import { TutorialTestSystem } from "./tutorial/tutorial-test-system";

type LearningPathProps = {
  curriculum: Curriculum;
  userId: string;
  hearts: number;
  onTestComplete?: () => void;
  isTutorialMode?: boolean;
  onTutorialComplete?: () => void;
  showAsCompleted?: boolean;
  openTutorialTest?: boolean; // Nueva prop
};

const LearningPath: React.FC<LearningPathProps> = ({
  curriculum,
  userId,
  hearts,
  onTestComplete,
  isTutorialMode = false,
  onTutorialComplete,
  showAsCompleted = false,
  openTutorialTest = false
}) => {
  console.log(curriculum);
  const [activeUnit, setActiveUnit] = useState<Unit | null>(null);
  const { progress, isLoading, refetch } = useProgress(userId, curriculum.id);

  const assignedUnits =
    curriculum.units?.filter(
      (unit) =>
        unit.position !== null &&
        unit.position !== undefined &&
        unit.position >= 0
    ) || [];

  // Si estamos en el paso final del tutorial, encontrar el nodo con mayor posición
  const highestPositionUnit =
    assignedUnits.length > 0
      ? assignedUnits.reduce((max, unit) =>
          unit.position > max.position ? unit : max
        )
      : null;

  // Crear lista de unidades aprobadas simulando que la de mayor posición está completada
  const tutorialApprovedUnits =
    showAsCompleted && highestPositionUnit
      ? [...progress.approvedUnits, highestPositionUnit.id]
      : progress.approvedUnits;

  // Abrir automáticamente el test tutorial cuando se activa openTutorialTest
  useEffect(() => {
    if (openTutorialTest && !activeUnit && highestPositionUnit) {
      setActiveUnit(highestPositionUnit);
    }
  }, [openTutorialTest, activeUnit, highestPositionUnit]);

  const handleCloseTest = () => {
    setActiveUnit(null);

    // Si estamos en modo tutorial, marcar como completado
    if (isTutorialMode && onTutorialComplete) {
      onTutorialComplete();
    }

    refetch();
    if (onTestComplete) {
      onTestComplete();
    }
  };

  if (activeUnit && hearts === 0 && !isTutorialMode) {
    setActiveUnit(null);
    return (
      <div className="flex flex-col">
        <div className="px-6 py-8">
          {isLoading ? (
            <div>Cargando progreso...</div>
          ) : (
            <LessonGrid
              units={assignedUnits}
              approvedUnits={tutorialApprovedUnits}
              onStartUnit={setActiveUnit}
              hearts={hearts}
            />
          )}
        </div>
      </div>
    );
  }

  if (activeUnit) {
    return (
      <div className="fixed inset-0 z-[100] flex justify-center items-start bg-black/50">
        <div className="w-full max-w-[650px] bg-white shadow-xl overflow-hidden">
          {isTutorialMode ? (
            <TutorialTestSystem
              hearts={hearts || 0}
              onClose={handleCloseTest}
            />
          ) : (
            <TestSystem
              hearts={hearts || 0}
              userId={userId}
              unitId={activeUnit.id}
              curriculumId={curriculum.id}
              onClose={handleCloseTest}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="px-6 py-8">
        {isLoading ? (
          <div>Cargando progreso...</div>
        ) : (
          <LessonGrid
            units={assignedUnits}
            approvedUnits={tutorialApprovedUnits}
            onStartUnit={setActiveUnit}
            hearts={hearts}
          />
        )}
      </div>
    </div>
  );
};

export default LearningPath;
