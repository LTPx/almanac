"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";

interface StreakCelebrationProps {
  count: number;
  onComplete: () => void;
}

export const StreakCelebration: React.FC<StreakCelebrationProps> = ({
  count = 5,
  onComplete
}) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, y: 50 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 1.5, opacity: 0, filter: "blur(10px)" }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
    >
      <div className="relative">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-tr from-orange-500 to-yellow-300 blur-xl opacity-50 rounded-full w-48 h-48 -translate-x-4 -translate-y-4"
        />

        <div className="relative bg-gradient-to-b from-orange-500 to-red-600 p-1 rounded-3xl shadow-2xl border-4 border-yellow-400 transform rotate-[-5deg]">
          <div className="bg-slate-900 px-8 py-6 rounded-2xl flex flex-col items-center">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"]
              }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="text-orange-400 mb-2"
            >
              <Flame size={64} fill="currentColor" />
            </motion.div>

            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
              {count} Seguidas!
            </h2>
            <p className="text-yellow-400 font-bold text-sm mt-1">
              Multiplicador Activo
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
