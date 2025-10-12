"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
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
  type Node = Lesson & { type: "lesson"; col: number; row: number };

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
      grid[row].nodes.push({ ...lesson, type: "lesson", col, row });
    });

    return grid.filter((rowData) => rowData.nodes.length > 0);
  };

  const isRowUnlocked = (targetRow: number): boolean => {
    const pathLayout = generatePathLayout();

    const maxRow = Math.max(...pathLayout.map((r) => r.row));
    if (targetRow === maxRow) return true;

    for (let row = maxRow; row > targetRow; row--) {
      const rowData = pathLayout.find((r) => r.row === row);
      if (!rowData) continue;

      const mandatoryLessons = rowData.nodes.filter((n) => n.mandatory);

      if (mandatoryLessons.length > 0) {
        const allMandatoryCompleted = mandatoryLessons.every((lesson) =>
          approvedLessons.includes(lesson.id)
        );

        if (!allMandatoryCompleted) {
          return false;
        }
      }
    }

    return true;
  };

  const getLessonState = (
    lesson: Node
  ): "completed" | "available" | "locked" => {
    if (approvedLessons.includes(lesson.id)) return "completed";

    if (!isRowUnlocked(lesson.row)) return "locked";

    return "available";
  };

  const getLockedColor = (mandatory: boolean) => {
    return mandatory ? "border-[#90D398]" : "border-[#708BB1]";
  };

  const firstLesson =
    lessons.length > 0
      ? lessons.reduce((min, lesson) =>
          lesson.position < min.position ? lesson : min
        )
      : null;

  const startCol = firstLesson ? getRowCol(firstLesson.position).col : null;

  const pathLayout = generatePathLayout();
  const maxRow =
    pathLayout.length > 0 ? Math.max(...pathLayout.map((r) => r.row)) : 0;

  const containerVariants: Variants = {
    hidden: {
      opacity: 0
    },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.9
    },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
        duration: 0.6
      }
    }
  };

  const startIndicatorVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0,
      y: -20
    },
    show: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 150,
        damping: 18,
        duration: 0.8
      }
    }
  };

  return (
    <div className="max-w-sm mx-auto">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-5 gap-3 lg:gap-6 mb-6 lg:mb-6"
      >
        {Array.from({ length: 5 }, (_, col) => (
          <motion.div
            key={col}
            variants={itemVariants}
            className="flex justify-center"
          >
            {startCol === col ? (
              <motion.div
                initial="hidden"
                animate="show"
                variants={startIndicatorVariants}
                className="w-full h-full lg:h-16 flex flex-col items-center"
              >
                <div className="bg-[#F9F0B6] rounded-t-full w-full h-full lg:h-16 flex items-center justify-center shadow-lg"></div>
              </motion.div>
            ) : (
              <div className="w-full h-16 lg:h-16"></div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {pathLayout.map((rowData, rowIndex) => {
        const isBottomRow = rowData.row === maxRow;

        return (
          <motion.div
            key={rowIndex}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-5 gap-3 lg:gap-6 mb-6 lg:mb-6"
          >
            {Array.from({ length: 5 }, (_, col) => {
              const nodeData = rowData.nodes.find((n) => n.col === col);
              const isCompleted = nodeData
                ? approvedLessons.includes(nodeData.id)
                : false;

              return (
                <motion.div
                  key={col}
                  variants={itemVariants}
                  className="flex justify-center"
                >
                  {nodeData ? (
                    <LessonNode
                      id={nodeData.id}
                      name={nodeData.name}
                      description={nodeData.description}
                      state={getLessonState(nodeData)}
                      color={getLockedColor(nodeData.mandatory)}
                      mandatory={nodeData.mandatory}
                      shouldFloat={
                        isBottomRow && nodeData.mandatory && !isCompleted
                      }
                      onStartLesson={() => onStartLesson(nodeData)}
                    />
                  ) : (
                    <div className="w-16 h-16"></div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        );
      })}
    </div>
  );
};
