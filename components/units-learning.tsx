"use client";

import React, { useState } from "react";
import { LessonGrid } from "./lesson-grid";
import { TestSystem } from "./test/TestSystem";
import { Unit, Lesson } from "@/lib/types";
import { useProgress } from "@/hooks/useProgress";

type LearningPathProps = {
  unit: Unit;
  userId: string;
};

const LearningPath: React.FC<LearningPathProps> = ({ unit, userId }) => {
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const { progress, isLoading, refetch } = useProgress(userId, unit.id);

  if (activeLesson) {
    return (
      <div className="fixed inset-0 z-100 flex justify-center items-start bg-black/50 p-4">
        <div className="w-full max-w-[650px] bg-white rounded-2xl shadow-xl overflow-hidden">
          <TestSystem
            userId={userId}
            initialLesson={activeLesson}
            onClose={() => {
              setActiveLesson(null);
              refetch();
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 px-6 py-8">
        {isLoading ? (
          <div>Cargando progreso...</div>
        ) : (
          <LessonGrid
            lessons={unit.lessons || []}
            approvedLessons={progress.approvedLessons}
            onStartLesson={setActiveLesson}
          />
        )}
      </div>
    </div>
  );
};

export default LearningPath;
