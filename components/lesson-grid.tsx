"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { Unit } from "@/lib/types";
import LessonNode from "./lesson-node";
import { NoHeartsModal } from "./modals/hearts-modal";

interface LessonGridProps {
  units: Unit[];
  approvedUnits: number[];
  hearts: number;
  onStartUnit: (unit: Unit) => void;
}

export const LessonGrid: React.FC<LessonGridProps> = ({
  units,
  approvedUnits,
  hearts,
  onStartUnit
}) => {
  type Node = Unit & { type: "unit"; col: number; row: number };

  const getRowCol = (position: number) => {
    const row = Math.floor(position / 5);
    const col = position % 5;
    return { row, col };
  };

  const generatePathLayout = (): { row: number; nodes: Node[] }[] => {
    const maxPosition = Math.max(...units.map((l) => l.position));
    const totalRows = Math.floor(maxPosition / 5) + 1;

    const grid: { row: number; nodes: Node[] }[] = Array.from(
      { length: totalRows },
      (_, row) => ({ row, nodes: [] })
    );

    units.forEach((unit) => {
      const { row, col } = getRowCol(unit.position);
      if (!grid[row]) grid[row] = { row, nodes: [] };
      grid[row].nodes.push({ ...unit, type: "unit", col, row });
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
        const allMandatoryCompleted = mandatoryLessons.every((unit) =>
          approvedUnits.includes(unit.id)
        );

        if (!allMandatoryCompleted) {
          return false;
        }
      }
    }

    return true;
  };

  const getLessonState = (unit: Node): "completed" | "available" | "locked" => {
    if (approvedUnits.includes(unit.id)) return "completed";

    if (!isRowUnlocked(unit.row)) return "locked";

    return "available";
  };

  const getLockedColor = (mandatory: boolean) => {
    return mandatory ? "border-[#90D398]" : "border-[#708BB1]";
  };

  const firstLesson =
    units.length > 0
      ? units.reduce((min, unit) => (unit.position < min.position ? unit : min))
      : null;

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

  return (
    <>
      <div className="max-w-sm mx-auto">
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
                  ? approvedUnits.includes(nodeData.id)
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
                        hearts={hearts}
                        shouldFloat={
                          isBottomRow && nodeData.mandatory && !isCompleted
                        }
                        isFirstMandatory={
                          nodeData.id === firstLesson?.id && nodeData.mandatory
                        }
                        onStartLesson={() => onStartUnit(nodeData)}
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

      <NoHeartsModal />
    </>
  );
};
