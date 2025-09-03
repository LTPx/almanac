"use client";

import React from "react";
import { Lock, CheckCircle, BookOpen } from "lucide-react";

type LessonNodeProps = {
  id: number;
  name: string;
  state: "completed" | "active" | "available" | "locked";
  color?: string;
};

const LessonNode: React.FC<LessonNodeProps> = ({ id, name, state, color }) => {
  return (
    <div className="relative group">
      <div
        className={`
          w-16 h-16 flex items-center justify-center
          transition-all duration-200 relative
          ${state === "completed" ? "bg-[#5EC16A] border-green-400 shadow-lg" : ""}
          ${state === "active" ? "bg-blue-500 border-blue-400 animate-pulse shadow-lg" : ""}
          ${state === "available" ? "bg-gray-600 border-gray-500" : ""}
          ${state === "locked" ? `${color} border-dashed` : ""}
          rounded-2xl border-2
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

      {name && (
        <div
          className="absolute top-20 left-1/2 transform -translate-x-1/2 
                      bg-gray-800 text-white px-3 py-2 rounded-lg text-sm 
                      opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10"
        >
          {name} {state === "locked" && "(Bloqueada)"}
        </div>
      )}
    </div>
  );
};

export default LessonNode;
