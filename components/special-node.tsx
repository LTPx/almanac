"use client";

import React from "react";
import { motion } from "framer-motion";
import { Lock, Trophy, CheckCircle } from "lucide-react";
import { StepPopover } from "./step-popover";
import { useNoHeartsModal } from "@/store/no-hearts-modal";

type SpecialYellowNodeProps = {
  hearts: number;
  state: "locked" | "available" | "completed";
  onStartFinalTest: () => void;
};

const SpecialYellowNode: React.FC<SpecialYellowNodeProps> = ({
  hearts,
  state,
  onStartFinalTest
}) => {
  const { open: openNoHeartsModal } = useNoHeartsModal();

  const handleClick = () => {
    if (state === "locked") return;

    if (hearts === 0) {
      openNoHeartsModal("Test Final");
      return;
    }

    onStartFinalTest();
  };

  const getNodeStyles = () => {
    if (state === "completed") {
      return "bg-[#F9F0B6] border-[#F9F0B6] shadow-lg";
    }
    if (state === "available") {
      return "bg-[#F9F0B6] border-[#F9F0B6] shadow-lg";
    }
    return "bg-transparent border-[#F9F0B6] border-dashed";
  };

  const getIcon = () => {
    if (state === "completed") {
      return <CheckCircle className="w-7 h-7 text-gray-800" />;
    }
    if (state === "available") {
      return <Trophy className="w-7 h-7 text-gray-800" />;
    }
    return <Lock className="w-6 h-6 text-white" />;
  };

  const getMessage = () => {
    if (state === "completed") {
      return "¡Felicidades! Has completado el test final. Puedes volver a intentarlo para mejorar tu puntuación.";
    }
    if (state === "available") {
      return "¡Has completado todas las unidades! Pon a prueba todos los conocimientos adquiridos en este test final.";
    }
    return "Completa todas las unidades obligatorias para desbloquear el test final.";
  };

  const getButtonText = () => {
    if (state === "completed") return "Volver a Intentar";
    if (state === "available") return "Empezar Test Final";
    return "BLOQUEADO";
  };

  const nodeContent = (
    <motion.div
      whileHover={state !== "locked" ? { scale: 1.05, y: -2 } : {}}
      whileTap={state !== "locked" ? { scale: 0.95 } : {}}
      animate={state === "available" ? { y: [0, -8, 0] } : {}}
      data-first-mandatory={"true"}
      transition={
        state === "available"
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
        ${getNodeStyles()}
        rounded-t-[2rem] rounded-b-lg
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
        {getIcon()}
      </motion.div>
    </motion.div>
  );

  return (
    <StepPopover
      unitId={-1}
      title="Test Final"
      message={getMessage()}
      buttonText={getButtonText()}
      onButtonClick={handleClick}
      isLocked={state === "locked"}
      isSpecialYellow={true}
    >
      {nodeContent}
    </StepPopover>
  );
};

export default SpecialYellowNode;
