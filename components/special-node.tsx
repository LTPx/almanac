"use client";

import React from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { StepPopover } from "./step-popover";

type SpecialYellowNodeProps = {
  hearts: number;
};

const SpecialYellowNode: React.FC<SpecialYellowNodeProps> = ({ hearts }) => {
  const handleClick = () => {
    console.log("click", hearts);
  };

  const nodeContent = (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className="
        w-full h-full lg:h-16 flex items-center justify-center
        relative
        bg-transparent
        border-[#F9F0B6] border-dashed
        rounded-t-[2rem] rounded-b-lg
        border-2 cursor-pointer
      "
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
        <Lock className="w-6 h-6 text-white" />
      </motion.div>
    </motion.div>
  );

  return (
    <StepPopover
      unitId={-1}
      title="Prueba Final"
      message="Pon a prueba todos los conocimientos adquiridos en este test final. ¡Demuestra todo lo que has aprendido!"
      buttonText="Empezar"
      onButtonClick={handleClick}
      isLocked={false}
      isSpecialYellow={true}
    >
      {nodeContent}
    </StepPopover>
  );
};

export default SpecialYellowNode;
