"use client";

import React, { useState } from "react";
import { LessonGrid } from "./lesson-grid";
import { TestSystem } from "./test/TestSystem";
import { Curriculum, Unit } from "@/lib/types";
import { useProgress } from "@/hooks/useProgress";

type LearningPathProps = {
  curriculum: Curriculum;
  userId: string;
  hearts: number;
  onTestComplete?: () => void;
  showAsCompleted?: boolean;
};

const LearningPath: React.FC<LearningPathProps> = ({
  curriculum,
  userId,
  hearts,
  onTestComplete,
  showAsCompleted = false
}) => {
  const [activeUnit, setActiveUnit] = useState<Unit | null>(null);
  const { progress, isLoading, refetch } = useProgress(userId, curriculum.id);

  const assignedUnits =
    curriculum.units?.filter(
      (unit) =>
        unit.position !== null &&
        unit.position !== undefined &&
        unit.position >= 0
    ) || [];

  const highestPositionUnit =
    assignedUnits.length > 0
      ? assignedUnits.reduce((max, unit) =>
          unit.position > max.position ? unit : max
        )
      : null;

  const tutorialApprovedUnits =
    showAsCompleted && highestPositionUnit
      ? [...progress.approvedUnits, highestPositionUnit.id]
      : progress.approvedUnits;

  const handleCloseTest = () => {
    setActiveUnit(null);
    refetch();
    if (onTestComplete) {
      onTestComplete();
    }
  };

  if (activeUnit && hearts === 0) {
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
          <TestSystem
            hearts={hearts || 0}
            userId={userId}
            unitId={activeUnit.id}
            curriculumId={curriculum.id}
            onClose={handleCloseTest}
          />
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
