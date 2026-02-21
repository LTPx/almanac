"use client";

import React from "react";
import { motion } from "framer-motion";
import { Lock, CheckCircle, BookOpen } from "lucide-react";
import { StepPopover } from "./step-popover";
import { useNoHeartsModal } from "@/store/no-hearts-modal";
import { useTranslation } from "@/hooks/useTranslation";

type LessonNodeProps = {
  id: number;
  unitId: number;
  name: string;
  description?: string | null;
  state: "completed" | "available" | "locked";
  color?: string;
  mandatory?: boolean;
  shouldFloat?: boolean;
  hearts: number;
  isFirstMandatory?: boolean;
  isHighestPosition?: boolean;
  isOptionalHighest?: boolean;
  onStartLesson: () => void;
};

const LessonNode: React.FC<LessonNodeProps> = ({
  unitId,
  name,
  description,
  state,
  color,
  mandatory = false,
  shouldFloat = false,
  hearts,
  isFirstMandatory = false,
  isHighestPosition = false,
  isOptionalHighest = false,
  onStartLesson
}) => {
  const { open: openNoHeartsModal } = useNoHeartsModal();
  const { t } = useTranslation();
  const hasNoHearts = hearts === 0;

  const getBackgroundColor = () => {
    if (state === "completed") {
      return mandatory
        ? "bg-[#5EC16A] border-[#5EC16A]"
        : "bg-[#1983DD] border-[#1983DD]";
    }
    if (state === "available") {
      return mandatory
        ? "bg-[#5EC16A] border-[#5EC16A]"
        : "bg-[#1983DD] border-[#1983DD]";
    }
    return "";
  };

  const handleStartLesson = () => {
    if (hasNoHearts && (state === "available" || state === "completed")) {
      openNoHeartsModal(name);
    } else {
      onStartLesson();
    }
  };

  const nodeContent = (
    <motion.div
      whileHover={state !== "completed" ? { scale: 1.05, y: -2 } : {}}
      whileTap={state !== "completed" ? { scale: 0.95 } : {}}
      animate={shouldFloat ? { y: [0, -8, 0] } : {}}
      transition={
        shouldFloat
          ? {
              y: {
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              },
              scale: {
                type: "spring",
                stiffness: 400,
                damping: 17
              }
            }
          : {
              type: "spring",
              stiffness: 400,
              damping: 17
            }
      }
      className={`
      w-full h-full lg:h-16 flex items-center justify-center
      relative
      ${getBackgroundColor()}
      ${state === "locked" ? `${color} border-dashed` : "shadow-lg"}
      rounded-2xl
      border-2 ${state !== "locked" ? "cursor-pointer" : "cursor-not-allowed opacity-75"}
    `}
      data-highest-position-node={
        isHighestPosition && state === "completed" ? "true" : undefined
      }
      data-highest-position-mandatory={isHighestPosition ? "true" : undefined}
      data-optional-node={isOptionalHighest ? "true" : undefined}
      data-available-node={state === "available" ? "true" : undefined}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.1
        }}
      >
        {state === "completed" && (
          <CheckCircle className="w-7 h-7 text-white" />
        )}
        {state === "available" && <BookOpen className="w-7 h-7 text-white" />}
        {state === "locked" && <Lock className="w-6 h-6 text-white" />}
      </motion.div>
    </motion.div>
  );

  if (state === "completed") {
    return (
      <StepPopover
        unitId={unitId}
        title={name}
        message={description || t("learningPath", "levelCompletedMessage")}
        buttonText={t("learningPath", "retryTest")}
        onButtonClick={handleStartLesson}
        isLocked={false}
        isCompleted={true}
        mandatory={mandatory}
        isFirstMandatory={isFirstMandatory}
        isHighestPosition={isHighestPosition}
        isOptionalHighest={isOptionalHighest}
      >
        {nodeContent}
      </StepPopover>
    );
  }

  if (state === "locked") {
    return (
      <StepPopover
        unitId={unitId}
        title={name}
        message={t("learningPath", "levelLockedMessage")}
        buttonText={t("learningPath", "statusClosed")}
        onButtonClick={() => {}}
        isLocked={true}
        isHighestPosition={isHighestPosition}
        isOptionalHighest={isOptionalHighest}
      >
        {nodeContent}
      </StepPopover>
    );
  }

  return (
    <StepPopover
      unitId={unitId}
      title={name}
      message={description || ""}
      buttonText={t("learningPath", "startTest")}
      onButtonClick={handleStartLesson}
      isLocked={false}
      isOptional={!mandatory}
      isFirstMandatory={isFirstMandatory}
      isHighestPosition={isHighestPosition}
      isOptionalHighest={isOptionalHighest}
    >
      {nodeContent}
    </StepPopover>
  );
};

export default LessonNode;
