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
  showOptionalAsAvailable?: boolean;
  showAllCompletedExceptFirst?: boolean;
  isTutorialMode?: boolean;
};

const LearningPath: React.FC<LearningPathProps> = ({
  curriculum,
  userId,
  hearts,
  onTestComplete,
  showAsCompleted = false,
  showOptionalAsAvailable = false,
  showAllCompletedExceptFirst = false,
  isTutorialMode = false
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

  let finalApprovedUnits = progress.approvedUnits;

  if (showAsCompleted) {
    const mandatoryUnits = assignedUnits.filter((u) => u.mandatory);
    const highestPositionUnit =
      mandatoryUnits.length > 0
        ? mandatoryUnits.reduce((max, unit) =>
            unit.position > max.position ? unit : max
          )
        : assignedUnits.length > 0
          ? assignedUnits.reduce((max, unit) =>
              unit.position > max.position ? unit : max
            )
          : null;

    if (highestPositionUnit) {
      finalApprovedUnits = [highestPositionUnit.id];
    }
  } else if (showOptionalAsAvailable) {
    const optionalNodes = assignedUnits.filter((u) => !u.mandatory);
    const highestOptionalNode =
      optionalNodes.length > 0
        ? optionalNodes.reduce((max, node) =>
            node.position > max.position ? node : max
          )
        : null;

    if (highestOptionalNode) {
      const optionalRow = Math.floor(highestOptionalNode.position / 5);
      const optionalCol = highestOptionalNode.position % 5;

      const adjacentToApprove: number[] = [];

      assignedUnits.forEach((unit) => {
        const unitRow = Math.floor(unit.position / 5);
        const unitCol = unit.position % 5;

        const rowDiff = Math.abs(unitRow - optionalRow);
        const colDiff = Math.abs(unitCol - optionalCol);

        if (
          (rowDiff === 0 && colDiff === 1) ||
          (rowDiff === 1 && colDiff === 0)
        ) {
          adjacentToApprove.push(unit.id);
        }
      });

      finalApprovedUnits = adjacentToApprove;
    }
  } else if (showAllCompletedExceptFirst) {
    const firstLesson =
      assignedUnits.length > 0
        ? assignedUnits.reduce((min, unit) =>
            unit.position < min.position ? unit : min
          )
        : null;

    if (firstLesson) {
      const allExceptFirst = assignedUnits
        .filter((unit) => unit.id !== firstLesson.id)
        .map((unit) => unit.id);

      finalApprovedUnits = allExceptFirst;
    }
  }

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
              approvedUnits={finalApprovedUnits}
              onStartUnit={setActiveUnit}
              hearts={hearts}
              isTutorialMode={isTutorialMode}
              showOptionalAsAvailable={showOptionalAsAvailable}
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
            approvedUnits={finalApprovedUnits}
            onStartUnit={setActiveUnit}
            hearts={hearts}
            isTutorialMode={isTutorialMode}
            showOptionalAsAvailable={showOptionalAsAvailable}
          />
        )}
      </div>
    </div>
  );
};

export default LearningPath;
