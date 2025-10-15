"use client";

import React, { useState } from "react";
import { LessonGrid } from "./lesson-grid";
import { TestSystem } from "./test/TestSystem";
import { Unit, Lesson } from "@/lib/types";
import { useProgress } from "@/hooks/useProgress";

type LearningPathProps = {
  unit: Unit;
  userId: string;
  hearts: number;
  onTestComplete?: () => void;
};

const LearningPath: React.FC<LearningPathProps> = ({
  unit,
  userId,
  hearts,
  onTestComplete
}) => {
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const { progress, isLoading, refetch } = useProgress(userId, unit.id);

  const handleCloseTest = () => {
    setActiveLesson(null);
    refetch();
    if (onTestComplete) {
      onTestComplete();
    }
  };

  if (activeLesson && hearts === 0) {
    setActiveLesson(null);
    return (
      <div className="flex flex-col">
        <div className="px-6 py-8">
          {isLoading ? (
            <div>Cargando progreso...</div>
          ) : (
            <LessonGrid
              lessons={unit.lessons || []}
              approvedLessons={progress.approvedLessons}
              onStartLesson={setActiveLesson}
              hearts={hearts}
            />
          )}
        </div>
      </div>
    );
  }

  if (activeLesson) {
    return (
      <div className="fixed inset-0 z-100 flex justify-center items-start bg-black/50">
        <div className="w-full max-w-[650px] bg-white shadow-xl overflow-hidden">
          <TestSystem
            hearts={hearts || 0}
            userId={userId}
            initialLessonId={activeLesson.id}
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
            lessons={unit.lessons || []}
            approvedLessons={progress.approvedLessons}
            onStartLesson={setActiveLesson}
            hearts={hearts}
          />
        )}
      </div>
    </div>
  );
};

export default LearningPath;
