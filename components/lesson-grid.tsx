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
  isTutorialMode?: boolean;
  showOptionalAsAvailable?: boolean;
}

export const LessonGrid: React.FC<LessonGridProps> = ({
  units,
  approvedUnits,
  hearts,
  onStartUnit,
  isTutorialMode = false,
  showOptionalAsAvailable = false
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

  const isAdjacentToCompleted = (unit: Node): boolean => {
    const pathLayout = generatePathLayout();
    const maxRow =
      pathLayout.length > 0 ? Math.max(...pathLayout.map((r) => r.row)) : 0;

    const completedNodes = pathLayout
      .flatMap((rowData) => rowData.nodes)
      .filter((node) => approvedUnits.includes(node.id));

    if (completedNodes.length === 0) {
      const firstLesson = units
        .filter((u) => {
          const { row } = getRowCol(u.position);
          return row === maxRow;
        })
        .reduce((min, u) => (u.position < min.position ? u : min), units[0]);

      return unit.id === firstLesson?.id;
    }

    return completedNodes.some((completed) => {
      const rowDiff = Math.abs(completed.row - unit.row);
      const colDiff = Math.abs(completed.col - unit.col);

      return (
        (rowDiff === 0 && colDiff === 1) || (rowDiff === 1 && colDiff === 0)
      );
    });
  };

  const getLockedColor = (mandatory: boolean) => {
    return mandatory ? "border-[#90D398]" : "border-[#708BB1]";
  };

  const firstLesson =
    units.length > 0
      ? units.reduce((min, unit) => (unit.position < min.position ? unit : min))
      : null;

  const pathLayout = generatePathLayout();
  const allNodes = pathLayout.flatMap((rowData) => rowData.nodes);

  const highestPositionNode =
    allNodes.length > 0
      ? allNodes.reduce((max, node) =>
          node.position > max.position ? node : max
        )
      : null;

  const optionalNodes = units.filter((u) => !u.mandatory);
  const highestOptionalNode =
    optionalNodes.length > 0
      ? optionalNodes.reduce((max, node) =>
          node.position > max.position ? node : max
        )
      : null;

  const getLessonState = (unit: Node): "completed" | "available" | "locked" => {
    if (isTutorialMode) {
      if (approvedUnits.includes(unit.id)) return "completed";

      if (
        showOptionalAsAvailable &&
        highestOptionalNode &&
        unit.id === highestOptionalNode.id
      ) {
        return "available";
      }

      return "locked";
    }

    if (approvedUnits.includes(unit.id)) return "completed";
    if (isAdjacentToCompleted(unit)) return "available";
    return "locked";
  };

  const maxRow =
    pathLayout.length > 0 ? Math.max(...pathLayout.map((r) => r.row)) : 0;

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
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
      <div className="max-w-sm mx-auto lesson-grid">
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
                const isHighestPosition =
                  nodeData && highestPositionNode
                    ? nodeData.id === highestPositionNode.id
                    : false;
                const isOptionalHighest =
                  nodeData && highestOptionalNode && !nodeData.mandatory
                    ? nodeData.id === highestOptionalNode.id
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
                        unitId={nodeData.id}
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
                        isHighestPosition={isHighestPosition}
                        isOptionalHighest={isOptionalHighest}
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
