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
    switch (currentStep) {
      case 5:
        return {
          showAsCompleted: true,
          showOptionalAsAvailable: false,
          showAllCompletedExceptFirst: false,
          isTutorialMode: true
        };
      case 6:
        return {
          showAsCompleted: false,
          showOptionalAsAvailable: true,
          showAllCompletedExceptFirst: false,
          isTutorialMode: true
        };

      case 7:
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
