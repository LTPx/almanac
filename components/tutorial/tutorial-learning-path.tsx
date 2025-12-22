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
    // Mapeo correcto considerando que test-demo está en índice 4
    // Paso 0: welcome
    // Paso 1: review-units
    // Paso 2: unit-explanations
    // Paso 3: start-test
    // Paso 4: test-demo (INSERTADO)
    // Paso 5: completed-unit (antes era 4)
    // Paso 6: optional-unit (antes era 5)
    // Paso 7: final-unit (antes era 6)

    switch (currentStep) {
      case 5: // COMPLETED_UNIT
        return {
          showAsCompleted: true,
          showOptionalAsAvailable: false,
          showAllCompletedExceptFirst: false,
          isTutorialMode: true
        };

      case 6: // OPTIONAL_UNIT
        return {
          showAsCompleted: false,
          showOptionalAsAvailable: true,
          showAllCompletedExceptFirst: false,
          isTutorialMode: true
        };

      case 7: // FINAL_UNIT
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
          isTutorialMode: false
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
