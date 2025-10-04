"use client";

import React from "react";
import LessonNode from "./lesson-node";
import { Lesson } from "@/lib/types";

interface LessonGridProps {
  lessons: Lesson[];
  approvedLessons: number[];
  onStartLesson: (lesson: Lesson) => void;
}

export const LessonGrid: React.FC<LessonGridProps> = ({
  lessons,
  approvedLessons,
  onStartLesson
}) => {
  type Node = Lesson & { type: "lesson"; col: number };

  const getRowCol = (position: number) => {
    const row = Math.floor(position / 5);
    const col = position % 5;
    return { row, col };
  };

  const generatePathLayout = (): { row: number; nodes: Node[] }[] => {
    const maxPosition = Math.max(...lessons.map((l) => l.position));
    const totalRows = Math.floor(maxPosition / 5) + 1;

    const grid: { row: number; nodes: Node[] }[] = Array.from(
      { length: totalRows },
      (_, row) => ({ row, nodes: [] })
    );

    lessons.forEach((lesson) => {
      const { row, col } = getRowCol(lesson.position);
      if (!grid[row]) grid[row] = { row, nodes: [] };
      grid[row].nodes.push({ ...lesson, type: "lesson", col });
    });

    return grid;
  };

  const getLessonState = (lessonId: number) => {
    if (approvedLessons.includes(lessonId)) return "completed";

    const sortedLessons = [...lessons].sort((a, b) => a.position - b.position);
    const firstPending = sortedLessons.find(
      (l) => !approvedLessons.includes(l.id)
    );

    if (firstPending?.id === lessonId) return "available";

    return "locked";
  };

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

  const pathLayout = generatePathLayout();

  return (
    <div className="max-w-sm mx-auto">
      {pathLayout.map((rowData, rowIndex) => (
        <div
          key={rowIndex}
          className="grid grid-cols-5 gap-4 lg:gap-6 mb-4 lg:mb-6"
        >
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
                    onStartLesson={() => onStartLesson(nodeData)}
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
  );
};
