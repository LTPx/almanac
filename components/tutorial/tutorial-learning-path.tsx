"use client";

import React from "react";
import { Curriculum } from "@/lib/types";
import { useTutorial } from "./tutorial-provider";
import LearningPath from "../units-learning";
import { TUTORIAL_STEP_IDS } from "./tutorial-steps";

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
    const steps = Object.values(TUTORIAL_STEP_IDS);
    const currentStepId = steps[currentStep];

    switch (currentStepId) {
      case TUTORIAL_STEP_IDS.COMPLETED_UNIT:
        return { showAsCompleted: true };

      case TUTORIAL_STEP_IDS.OPTIONAL_UNIT:
        return { showOptionalAsAvailable: true };

      case TUTORIAL_STEP_IDS.FINAL_UNIT:
        return { showAllCompletedExceptFirst: true };

      default:
        return {};
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
