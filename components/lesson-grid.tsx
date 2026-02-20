"use client";

import React, { useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { Unit } from "@/lib/types";
import LessonNode from "./lesson-node";
import { NoHeartsModal } from "./modals/hearts-modal";
import {
  LessonStateInfo,
  useLessonStatesStore
} from "@/hooks/use-lessonsStates";
import { useScrollToAvailableNode } from "@/hooks/use-scroll-lesson";
import SpecialYellowNode from "./special-node";

interface LessonGridProps {
  units: Unit[];
  hearts: number;
  onStartUnit: (unit: Unit) => void;
  onStartFinalTest: () => void;
  isTutorialMode?: boolean;
  curriculumId: string | number;
  finalTestState: "locked" | "available" | "completed";
  simulateOptionalNode?: boolean;
  forcedOptionalNodeId?: number;
}

export const LessonGrid: React.FC<LessonGridProps> = ({
  units,
  hearts,
  onStartUnit,
  onStartFinalTest,
  isTutorialMode = false,
  curriculumId,
  finalTestState,
  simulateOptionalNode = false,
  forcedOptionalNodeId = undefined
}) => {
  const { setLessonStates } = useLessonStatesStore();

  useScrollToAvailableNode([units], {
    enabled: !isTutorialMode,
    delay: 600,
    behavior: "smooth",
    block: "center"
  });

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

  const getLockedColor = (mandatory: boolean) => {
    return mandatory ? "border-[#90D398]" : "border-[#708BB1]";
  };

  const firstLesson =
    units.length > 0
      ? units.reduce((min, unit) => (unit.position < min.position ? unit : min))
      : null;

  const pathLayout = generatePathLayout();
  const allNodes = pathLayout.flatMap((rowData) => rowData.nodes);

  const mandatoryNodes = allNodes.filter((node) => node.mandatory);
  const highestPositionNode =
    mandatoryNodes.length > 0
      ? mandatoryNodes.reduce((max, node) =>
          node.position > max.position ? node : max
        )
      : null;

  const optionalNodes = units.filter((u) => !u.mandatory);
  let highestOptionalNode: Unit | null = null;

  if (simulateOptionalNode && forcedOptionalNodeId) {
    highestOptionalNode =
      units.find((u) => u.id === forcedOptionalNodeId) || null;
  } else if (optionalNodes.length > 0) {
    highestOptionalNode = optionalNodes.reduce((max, node) =>
      node.position > max.position ? node : max
    );
  }

  useEffect(() => {
    const lessonStatesInfo: LessonStateInfo[] = allNodes.map((node) => ({
      unitId: node.id,
      name: node.name,
      state: node.state || "locked",
      position: node.position,
      mandatory: node.mandatory,
      isFirstMandatory: false,
      isHighestPosition: highestPositionNode?.id === node.id,
      isOptionalHighest: highestOptionalNode?.id === node.id
    }));

    setLessonStates(curriculumId, lessonStatesInfo);
  }, [units, curriculumId]);

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

  const firstNodeCol = firstLesson ? getRowCol(firstLesson.position).col : 2;

  return (
    <>
      <div className="max-w-sm mx-auto lesson-grid">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-5 gap-3 lg:gap-6 mb-6 lg:mb-6"
          data-row="special"
        >
          {Array.from({ length: 5 }, (_, col) => (
            <motion.div
              key={col}
              variants={itemVariants}
              className="flex justify-center"
            >
              {col === firstNodeCol ? (
                <SpecialYellowNode
                  hearts={hearts}
                  state={finalTestState}
                  onStartFinalTest={onStartFinalTest}
                />
              ) : (
                <div className="w-16 h-16"></div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {pathLayout.map((rowData, rowIndex) => {
          return (
            <motion.div
              key={rowIndex}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-5 gap-3 lg:gap-6 mb-6 lg:mb-6"
              data-row={rowIndex}
            >
              {Array.from({ length: 5 }, (_, col) => {
                const nodeData = rowData.nodes.find((n) => n.col === col);
                const isHighestPosition =
                  nodeData && highestPositionNode && nodeData.mandatory
                    ? nodeData.id === highestPositionNode.id
                    : false;
                const isOptionalHighest =
                  nodeData && highestOptionalNode
                    ? nodeData.id === highestOptionalNode.id
                    : false;
                const displayAsMandatory = nodeData
                  ? simulateOptionalNode && nodeData.id === forcedOptionalNodeId
                    ? false
                    : nodeData.mandatory
                  : false;
                const lessonState = nodeData?.state || "locked";
                const shouldFloat = lessonState === "available";

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
                        state={lessonState}
                        color={getLockedColor(displayAsMandatory)}
                        mandatory={displayAsMandatory}
                        hearts={hearts}
                        shouldFloat={shouldFloat}
                        isFirstMandatory={false}
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
