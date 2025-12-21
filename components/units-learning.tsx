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
};

const LearningPath: React.FC<LearningPathProps> = ({
  curriculum,
  userId,
  hearts,
  onTestComplete,
  showAsCompleted = false,
  showOptionalAsAvailable = false,
  showAllCompletedExceptFirst = false
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

  const optionalNodes = assignedUnits.filter((u) => !u.mandatory);
  const highestOptionalNode =
    optionalNodes.length > 0
      ? optionalNodes.reduce((max, node) =>
          node.position > max.position ? node : max
        )
      : null;

  const firstLesson =
    assignedUnits.length > 0
      ? assignedUnits.reduce((min, unit) =>
          unit.position < min.position ? unit : min
        )
      : null;

  let finalApprovedUnits = progress.approvedUnits;

  if (showAsCompleted && highestPositionUnit) {
    finalApprovedUnits = [...progress.approvedUnits, highestPositionUnit.id];
  }

  if (showOptionalAsAvailable && highestOptionalNode) {
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

    finalApprovedUnits = [...progress.approvedUnits, ...adjacentToApprove];
  }

  if (showAllCompletedExceptFirst && firstLesson) {
    const allExceptFirst = assignedUnits
      .filter((unit) => unit.id !== firstLesson.id)
      .map((unit) => unit.id);

    console.log("🎯 PASO 8 - Tutorial Final Unit");
    console.log(
      "Primera lección:",
      firstLesson.name,
      "ID:",
      firstLesson.id,
      "Pos:",
      firstLesson.position
    );
    console.log("Total unidades:", assignedUnits.length);
    console.log("IDs a aprobar:", allExceptFirst);

    finalApprovedUnits = allExceptFirst;
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
              isInTutorialStep7={showOptionalAsAvailable}
              isInTutorialStep8={showAllCompletedExceptFirst}
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
            isInTutorialStep7={showOptionalAsAvailable}
            isInTutorialStep8={showAllCompletedExceptFirst}
          />
        )}
      </div>
    </div>
  );
};

export default LearningPath;
