"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";

type SuccessProgressBarProps = {
  value: number;
  triggerSuccess?: boolean;
};

export const SuccessProgressBar = ({
  value,
  triggerSuccess
}: SuccessProgressBarProps) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (triggerSuccess) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [triggerSuccess]);

  return (
    <div className="relative w-full h-4 bg-gray-700 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className="absolute left-0 top-0 h-full bg-[#32C781] rounded-full"
      />
    </div>
  );
};
