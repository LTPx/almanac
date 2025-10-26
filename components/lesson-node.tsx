"use client";

import React from "react";
import { motion } from "framer-motion";
import { Lock, CheckCircle, BookOpen } from "lucide-react";
import { StepPopover } from "./step-popover";
import { useNoHeartsModal } from "@/store/no-hearts-modal";

type LessonNodeProps = {
  id: number;
  name: string;
  description?: string | null;
  state: "completed" | "available" | "locked";
  color?: string;
  mandatory?: boolean;
  shouldFloat?: boolean;
  hearts: number;
  isFirstMandatory?: boolean;
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
  isFirstMandatory = false,
  onStartLesson
}) => {
  const { open: openNoHeartsModal } = useNoHeartsModal();

  const hasNoHearts = hearts === 0;

  const getBackgroundColor = () => {
    if (state === "completed") {
      return mandatory && isFirstMandatory
        ? "bg-[#F9F0B6] border-[#F9F0B6]"
        : mandatory
          ? "bg-[#5EC16A] border-[#5EC16A]"
          : "bg-[#E6E7EB] border-[#E6E7EB]";
    }
    if (state === "available") {
      if (isFirstMandatory && mandatory) {
        return "bg-transparent";
      }
      return mandatory
        ? "bg-[#5EC16A] border-[#5EC16A]"
        : "bg-[#1983DD] border-[#1983DD]";
    }
    return "";
  };

  const getIconColor = () => {
    if (state === "completed" && !mandatory) {
      return "text-gray-700";
    }
    return "text-white";
  };

  const handleStartLesson = () => {
    if (hasNoHearts && (state === "available" || state === "completed")) {
      openNoHeartsModal(name);
    } else {
      onStartLesson();
    }
  };

  const getFirstMandatoryStyle = () => {
    if (!isFirstMandatory) return "";

    if (state === "completed") {
      return "border-[#F9F0B6] border-solid";
    } else {
      return "border-[#F9F0B6] border-dashed";
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
        ${
          isFirstMandatory
            ? getFirstMandatoryStyle()
            : state === "locked"
              ? `${color} border-dashed`
              : "shadow-lg"
        }
        ${isFirstMandatory ? "rounded-t-[2rem] rounded-b-lg" : "rounded-2xl"}
        border-2 ${state !== "locked" ? "cursor-pointer" : "cursor-not-allowed opacity-75"}
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
        {state === "available" && <BookOpen className="w-7 h-7 text-white" />}
        {state === "locked" && <Lock className="w-6 h-6 text-white" />}
      </motion.div>
    </motion.div>
  );

  if (state === "completed") {
    return (
      <StepPopover
        title={name}
        message={
          description ||
          "¡Nivel completado! Puedes volver a intentarlo para mejorar tu puntuación."
        }
        buttonText="Volver a Intentar"
        onButtonClick={handleStartLesson}
        isLocked={false}
        isCompleted={true}
        mandatory={mandatory}
        isFirstMandatory={isFirstMandatory}
      >
        {nodeContent}
      </StepPopover>
    );
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
    <StepPopover
      title={name}
      message={description || ""}
      buttonText="Empezar mi Prueba"
      onButtonClick={handleStartLesson}
      isLocked={false}
      isOptional={!mandatory}
      isFirstMandatory={isFirstMandatory}
    >
      {nodeContent}
    </StepPopover>
  );
};

export default LessonNode;
