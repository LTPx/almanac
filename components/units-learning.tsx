"use client";

import React, { useState, useEffect, useRef } from "react";
import { LessonGrid } from "./lesson-grid";
import { TestSystem } from "./test/TestSystem";
import { FinalTestSystem } from "./test/FinalTestSystem";
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
  resumeTestAttemptId?: number;
  simulateOptionalNode?: boolean;
  forcedOptionalNodeId?: number;
};

const LearningPath: React.FC<LearningPathProps> = ({
  curriculum,
  userId,
  hearts,
  onTestComplete,
  showAsCompleted = false,
  showOptionalAsAvailable = false,
  showAllCompletedExceptFirst = false,
  isTutorialMode = false,
  resumeTestAttemptId,
  simulateOptionalNode = false,
  forcedOptionalNodeId = undefined
}) => {
  const [activeUnit, setActiveUnit] = useState<Unit | null>(null);
  const [showFinalTest, setShowFinalTest] = useState(false);
  const [resumeTestId, setResumeTestId] = useState<number | undefined>(
    resumeTestAttemptId
  );
  const { progress, isLoading, refetch } = useProgress(userId, curriculum.id);
  const hasCheckedResume = useRef(false);

  useEffect(() => {
    console.log(
      "🔄 Resume effect - resumeTestAttemptId:",
      resumeTestAttemptId,
      "hasChecked:",
      hasCheckedResume.current,
      "isLoading:",
      isLoading
    );
    if (resumeTestAttemptId && !hasCheckedResume.current && !isLoading) {
      hasCheckedResume.current = true;
      console.log(
        "📡 Fetching resume data for testAttemptId:",
        resumeTestAttemptId
      );
      fetch(
        `/api/test/resume?testAttemptId=${resumeTestAttemptId}&userId=${userId}`
      )
        .then((res) => res.json())
        .then((data) => {
          console.log("📥 Resume API response:", data);
          if (data.lesson?.id) {
            console.log(
              "🔍 Looking for unit with id:",
              data.lesson.id,
              "in units:",
              curriculum.units?.map((u) => u.id)
            );
            const unitToResume = curriculum.units?.find(
              (u) => u.id === data.lesson.id
            );
            if (unitToResume) {
              console.log("✅ Found unit to resume:", unitToResume.name);
              setActiveUnit(unitToResume);
            } else {
              console.log("❌ Unit not found in curriculum");
            }
          } else {
            console.log("❌ No lesson id in response:", data);
          }
        })
        .catch((err) => {
          console.error("❌ Resume fetch error:", err);
        });
    }
  }, [resumeTestAttemptId, userId, curriculum.units, isLoading]);

  const assignedUnits =
    curriculum.units?.filter(
      (unit) =>
        unit.position !== null &&
        unit.position !== undefined &&
        unit.position >= 0
    ) || [];

  let finalApprovedUnits = progress.approvedUnits;
  const isInitialTutorialState =
    isTutorialMode &&
    !showAsCompleted &&
    !showOptionalAsAvailable &&
    !showAllCompletedExceptFirst;

  if (isInitialTutorialState) {
    finalApprovedUnits = [];
  } else if (showAsCompleted) {
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
    if (simulateOptionalNode && forcedOptionalNodeId) {
      const simulatedNode = assignedUnits.find(
        (u) => u.id === forcedOptionalNodeId
      );

      if (simulatedNode) {
        const optionalRow = Math.floor(simulatedNode.position / 5);
        const optionalCol = simulatedNode.position % 5;

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
    } else {
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
    }
  }

  const handleCloseTest = () => {
    setActiveUnit(null);
    setResumeTestId(undefined);
    refetch();
    if (onTestComplete) {
      onTestComplete();
    }
  };

  const handleCloseFinalTest = () => {
    setShowFinalTest(false);
    refetch();
    if (onTestComplete) {
      onTestComplete();
    }
  };

  const getFinalTestState = (): "locked" | "available" | "completed" => {
    const mandatoryUnits = assignedUnits.filter((u) => u.mandatory);
    const allMandatoryCompleted = mandatoryUnits.every((u) =>
      finalApprovedUnits.includes(u.id)
    );

    if (allMandatoryCompleted && mandatoryUnits.length > 0) {
      return "available";
    }
    return "locked";
  };

  const finalTestState = getFinalTestState();

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
              onStartFinalTest={() => setShowFinalTest(true)}
              hearts={hearts}
              isTutorialMode={isTutorialMode}
              showOptionalAsAvailable={showOptionalAsAvailable}
              curriculumId={curriculum.id}
              finalTestState={finalTestState}
              simulateOptionalNode={simulateOptionalNode}
              forcedOptionalNodeId={forcedOptionalNodeId}
            />
          )}
        </div>
      </div>
    );
  }

  if (showFinalTest) {
    return (
      <div className="fixed inset-0 z-[100] flex justify-center items-start bg-black/50">
        <div className="w-full max-w-[650px] bg-white shadow-xl overflow-hidden">
          <FinalTestSystem
            hearts={hearts || 0}
            userId={userId}
            curriculumId={curriculum.id}
            onClose={handleCloseFinalTest}
          />
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
            resumeTestAttemptId={resumeTestId}
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
            onStartFinalTest={() => setShowFinalTest(true)}
            hearts={hearts}
            isTutorialMode={isTutorialMode}
            showOptionalAsAvailable={showOptionalAsAvailable}
            curriculumId={curriculum.id}
            finalTestState={finalTestState}
            simulateOptionalNode={simulateOptionalNode}
            forcedOptionalNodeId={forcedOptionalNodeId}
          />
        )}
      </div>
    </div>
  );
};

export default LearningPath;
