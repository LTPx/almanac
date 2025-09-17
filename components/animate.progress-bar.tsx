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
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 pointer-events-none"
          >
            <Confetti
              width={300}
              height={20}
              recycle={false}
              numberOfPieces={30}
              gravity={0.1}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
