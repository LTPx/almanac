"use client";

import React from "react";
import { motion } from "framer-motion";
import { Lock, CheckCircle, BookOpen } from "lucide-react";
import { StepPopover } from "./step-popover";

type LessonNodeProps = {
  id: number;
  name: string;
  description?: string | null;
  state: "completed" | "available" | "locked";
  color?: string;
  mandatory?: boolean;
  onStartLesson: () => void;
};

const LessonNode: React.FC<LessonNodeProps> = ({
  name,
  description,
  state,
  color,
  mandatory = false,
  onStartLesson
}) => {
  const getBackgroundColor = () => {
    if (state === "completed") {
      return mandatory
        ? "bg-[#5EC16A] border-[#5EC16A]"
        : "bg-[#E6E7EB] border-[#E6E7EB]";
    }
    if (state === "available") {
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

  const nodeContent = (
    <motion.div
      whileHover={state !== "completed" ? { scale: 1.05, y: -2 } : {}}
      whileTap={{ scale: 0.95 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 17
      }}
      className={`
        w-full h-full lg:h-16 flex items-center justify-center
        relative
        ${getBackgroundColor()}
        ${state === "locked" ? `${color} border-dashed` : "shadow-lg"}
        rounded-2xl border-2 cursor-pointer
      `}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 10,
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
    <StepPopover
      title={name}
      message={description || ""}
      buttonText="Empezar mi Prueba"
      onButtonClick={onStartLesson}
      isLocked={false}
      isOptional={!mandatory}
    >
      {nodeContent}
    </StepPopover>
  );
};

export default LessonNode;
