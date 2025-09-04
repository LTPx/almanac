"use client";

import React from "react";
import { Lock, CheckCircle, BookOpen } from "lucide-react";
import { StepPopover } from "./step-popover";

type LessonNodeProps = {
  id: number;
  name: string;
  description?: string | null;
  state: "completed" | "active" | "available" | "locked";
  color?: string;
  onStartLesson: () => void;
};

const LessonNode: React.FC<LessonNodeProps> = ({
  id,
  name,
  description,
  state,
  color,
  onStartLesson
}) => {
  return (
    <StepPopover
      onButtonClick={onStartLesson}
      buttonText="Empezar mi Prueba"
      title={name}
      message={description || ""}
    >
      <div
        className={`
          w-16 h-16 flex items-center justify-center
          transition-all duration-200 relative
          ${state === "completed" ? "bg-[#5EC16A] border-green-400 shadow-lg" : ""}
          ${state === "active" ? "bg-blue-500 border-blue-400 animate-pulse shadow-lg" : ""}
          ${state === "available" ? "bg-gray-600 border-gray-500" : ""}
          ${state === "locked" ? `${color} border-dashed` : ""}
          rounded-2xl border-2 cursor-pointer
        `}
      >
        {state === "completed" && (
          <CheckCircle className="w-7 h-7 text-white" />
        )}
        {state === "active" && <BookOpen className="w-7 h-7 text-white" />}
        {state === "available" && (
          <div className="w-5 h-5 bg-white rounded-full"></div>
        )}
        {state === "locked" && <Lock className="w-6 h-6 text-white" />}
      </div>
    </StepPopover>
  );
};

export default LessonNode;
