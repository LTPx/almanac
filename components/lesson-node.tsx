"use client";

import React from "react";
import { motion } from "framer-motion";
import { Lock, CheckCircle, BookOpen } from "lucide-react";
import { StepPopover } from "./step-popover";
import { useNoHeartsModal } from "@/store/no-hearts-modal";
import { NoHeartsModal } from "./modals/hearts-modal";

type LessonNodeProps = {
  id: number;
  name: string;
  description?: string | null;
  state: "completed" | "available" | "locked";
  color?: string;
  mandatory?: boolean;
  shouldFloat?: boolean;
  hearts: number;
  onStartLesson: () => void;
};

const LessonNode: React.FC<LessonNodeProps> = ({
  name,
  description,
  state,
  color,
  mandatory = false,
  shouldFloat = false,
  hearts,
  onStartLesson
}) => {
  const { open: openNoHeartsModal } = useNoHeartsModal();
  const hasNoHearts = hearts === 0;
  const isLockedByHearts = state === "available" && hasNoHearts;

  const getBackgroundColor = () => {
    if (state === "completed") {
      return mandatory
        ? "bg-[#5EC16A] border-[#5EC16A]"
        : "bg-[#E6E7EB] border-[#E6E7EB]";
    }
    if (state === "available") {
      return isLockedByHearts
        ? "bg-gray-400 border-gray-400"
        : mandatory
          ? "bg-[#5EC16A] border-[#5EC16A]"
          : "bg-[#1983DD] border-[#1983DD]";
    }
    return "";
  };

  const getIconColor = () => {
    if (state === "completed" && !mandatory) {
      return "text-gray-700";
    }
    if (isLockedByHearts) {
      return "text-white";
    }
    return "text-white";
  };

  const handleStartLesson = () => {
    if (hasNoHearts) {
      openNoHeartsModal(name);
    } else {
      onStartLesson();
    }
  };

  const nodeContent = (
    <motion.div
      whileHover={
        state !== "completed" && !isLockedByHearts ? { scale: 1.05, y: -2 } : {}
      }
      whileTap={
        state !== "completed" && !isLockedByHearts ? { scale: 0.95 } : {}
      }
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
        ${state === "locked" || isLockedByHearts ? `${color} border-dashed` : "shadow-lg"}
        rounded-2xl border-2 ${!isLockedByHearts && state !== "locked" ? "cursor-pointer" : "cursor-not-allowed opacity-75"}
      `}
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
          <CheckCircle className={`w-7 h-7 ${getIconColor()}`} />
        )}
        {state === "available" && !isLockedByHearts && (
          <BookOpen className="w-7 h-7 text-white" />
        )}
        {(state === "locked" || isLockedByHearts) && (
          <Lock className="w-6 h-6 text-white" />
        )}
      </motion.div>
    </motion.div>
  );

  if (state === "completed") {
    return nodeContent;
  }

  if (state === "locked") {
    return (
      <StepPopover
        title={name}
        message="¡Completa todos los niveles anteriores para habilitar este nivel!"
        buttonText="CERRADA"
        onButtonClick={() => {}}
        isLocked={true}
      >
        {nodeContent}
      </StepPopover>
    );
  }

  return (
    <>
      <StepPopover
        title={name}
        message={description || ""}
        buttonText="Empezar mi Prueba"
        onButtonClick={handleStartLesson}
        isLocked={false}
        isOptional={!mandatory}
      >
        {nodeContent}
      </StepPopover>
      <NoHeartsModal />
    </>
  );
};

export default LessonNode;
