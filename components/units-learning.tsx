"use client";

import React, { useState, useEffect } from "react";
import LessonNode from "./lesson-node";
import { TestSystem } from "./test/TestSystem";

// Tipos
type Lesson = {
  id: number;
  name: string;
  description?: string | null;
  position: number;
  unitId: number;
};

type Unit = {
  id: number;
  name: string;
  description: string | null;
  order: number;
  isActive: boolean;
  _count: { lessons: number };
  lessons: Lesson[];
};

type LearningPathProps = {
  unit: Unit;
  userId: string;
};

const LearningPath: React.FC<LearningPathProps> = ({ unit, userId }) => {
  type Node = Lesson & { type: "lesson"; col: number };

  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  const getRowCol = (position: number) => {
    const row = Math.floor(position / 5);
    const col = position % 5;
    return { row, col };
  };

  const generatePathLayout = () => {
    const maxPosition = Math.max(...unit.lessons.map((l) => l.position));
    const totalRows = Math.floor(maxPosition / 5) + 1;

    const grid: { row: number; nodes: Node[] }[] = Array.from(
      { length: totalRows },
      (_, row) => ({ row, nodes: [] })
    );

    unit.lessons.forEach((lesson) => {
      const { row, col } = getRowCol(lesson.position);
      if (!grid[row]) grid[row] = { row, nodes: [] };
      grid[row].nodes.push({ ...lesson, type: "lesson", col });
    });

    return grid;
  };

  const [pathLayout, setPathLayout] = useState<
    { row: number; nodes: Node[] }[]
  >([]);

  useEffect(() => {
    setPathLayout(generatePathLayout());
  }, [unit]);

  const getLessonState = (lessonId: number) => "locked";

  const getLockedColor = (lessonId: number) => {
    const colors = [
      "border-purple-400",
      "border-blue-400",
      "border-pink-400",
      "border-orange-400",
      "border-red-400",
      "border-cyan-400",
      "border-indigo-400",
      "border-emerald-400"
    ];
    return colors[lessonId % colors.length];
  };

  // Si hay una lección activa, mostramos TestSystem en pantalla completa
  if (activeLesson) {
    return (
      <div className="fixed inset-0 z-100">
        <TestSystem
          userId={userId}
          initialLesson={activeLesson}
          onClose={() => setActiveLesson(null)}
        />
      </div>
    );
  }

  // Si no hay lección activa, mostramos el grid
  return (
    <div className="min-h-screen flex flex-col">
      <div className="text-center py-6">
        <h1 className="text-2xl font-bold text-white">{unit.name}</h1>
      </div>

      <div className="flex-1 px-6 pb-8">
        <div className="max-w-sm mx-auto">
          {pathLayout.map((rowData, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-5 gap-6 mb-6">
              {Array.from({ length: 5 }, (_, col) => {
                const nodeData = rowData.nodes.find((n) => n.col === col);
                return (
                  <div key={col} className="flex justify-center">
                    {nodeData ? (
                      <LessonNode
                        id={nodeData.id}
                        name={nodeData.name}
                        description={nodeData.description}
                        state={getLessonState(nodeData.id)}
                        color={getLockedColor(nodeData.id)}
                        onStartLesson={() => setActiveLesson(nodeData)}
                      />
                    ) : (
                      <div className="w-16 h-16"></div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LearningPath;
