"use client";

import React from "react";
import { Curriculum } from "@/lib/types";
import { useTutorial } from "./tutorial-provider";
import LearningPath from "../units-learning";

interface TutorialLearningPathProps {
  curriculum: Curriculum;
  userId: string;
  hearts: number;
  onTestComplete?: () => void;
}

export function TutorialLearningPath({
  curriculum,
  userId,
  hearts,
  onTestComplete
}: TutorialLearningPathProps) {
  const { isActive, currentStep } = useTutorial();

  if (!isActive) {
    return (
      <LearningPath
        curriculum={curriculum}
        userId={userId}
        hearts={hearts}
        onTestComplete={onTestComplete}
      />
    );
  }

  const getTutorialProps = () => {
    const assignedUnits =
      curriculum.units?.filter(
        (unit) =>
          unit.position !== null &&
          unit.position !== undefined &&
          unit.position >= 0
      ) || [];
    const optionalNodes = assignedUnits.filter((u) => !u.mandatory);
    const hasOptionalNodes = optionalNodes.length > 0;
    let simulatedOptionalNodeId: number | undefined = undefined;
    if (!hasOptionalNodes && assignedUnits.length > 0) {
      const mandatoryNodes = assignedUnits.filter((u) => u.mandatory);
      if (mandatoryNodes.length >= 2) {
        const sortedMandatory = mandatoryNodes.sort(
          (a, b) => b.position - a.position
        );
        simulatedOptionalNodeId = sortedMandatory[1].id;
      } else if (mandatoryNodes.length === 1) {
        simulatedOptionalNodeId = mandatoryNodes[0].id;
      }
    }

    switch (currentStep) {
      case 0:
      case 1:
      case 2:
      case 3:
        return {
          showAsCompleted: false,
          showOptionalAsAvailable: false,
          showAllCompletedExceptFirst: false,
          isTutorialMode: true
        };

      case 6:
        return {
          showAsCompleted: true,
          showOptionalAsAvailable: false,
          showAllCompletedExceptFirst: false,
          isTutorialMode: true
        };

      case 7:
        return {
          showAsCompleted: false,
          showOptionalAsAvailable: true,
          showAllCompletedExceptFirst: false,
          isTutorialMode: true,
          simulateOptionalNode: !hasOptionalNodes,
          forcedOptionalNodeId: simulatedOptionalNodeId
        };

      case 10:
        return {
          showAsCompleted: false,
          showOptionalAsAvailable: false,
          showAllCompletedExceptFirst: true,
          isTutorialMode: true
        };

      default:
        return {
          showAsCompleted: false,
          showOptionalAsAvailable: false,
          showAllCompletedExceptFirst: false,
          isTutorialMode: true
        };
    }
  };

  return (
    <LearningPath
      curriculum={curriculum}
      userId={userId}
      hearts={hearts}
      onTestComplete={onTestComplete}
      {...getTutorialProps()}
    />
  );
}
