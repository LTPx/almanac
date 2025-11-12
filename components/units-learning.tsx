"use client";

import React, { useState } from "react";
import { LessonGrid } from "./lesson-grid";
import { TestSystem } from "./test/TestSystem";
import { Curriculum, Unit } from "@/lib/types";

type LearningPathProps = {
  curriculum: Curriculum;
  approvedUnits: number[];
  userId: string;
  hearts: number;
  onTestComplete?: () => void;
};

const LearningPath: React.FC<LearningPathProps> = ({
  curriculum,
  userId,
  hearts,
  onTestComplete,
  approvedUnits
}) => {
  const [activeUnit, setActiveUnit] = useState<Unit | null>(null);
  const handleCloseTest = () => {
    setActiveUnit(null);
    // refetch();
    if (onTestComplete) {
      onTestComplete();
    }
  };

  if (activeUnit && hearts === 0) {
    setActiveUnit(null);
    return (
      <div className="flex flex-col">
        <div className="px-6 py-8">
          <LessonGrid
            units={curriculum.units || []}
            approvedUnits={approvedUnits}
            onStartUnit={setActiveUnit}
            hearts={hearts}
          />
        </div>
      </div>
    );
  }

  if (activeUnit) {
    return (
      <div className="fixed inset-0 z-100 flex justify-center items-start bg-black/50">
        <div className="w-full max-w-[650px] bg-white shadow-xl overflow-hidden">
          <TestSystem
            hearts={hearts || 0}
            userId={userId}
            initialLessonId={activeUnit.id}
            onClose={handleCloseTest}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="px-6 py-8">
        <LessonGrid
          units={curriculum.units || []}
          approvedUnits={approvedUnits}
          onStartUnit={setActiveUnit}
          hearts={hearts}
        />
      </div>
    </div>
  );
};

export default LearningPath;
