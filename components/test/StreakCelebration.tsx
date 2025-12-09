"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Flame, Sparkles } from "lucide-react";

interface StreakCelebrationProps {
  count: number;
  onComplete: () => void;
}

export const StreakCelebration: React.FC<StreakCelebrationProps> = ({
  count = 5,
  onComplete
}) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, y: 50 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 1.5, opacity: 0, filter: "blur(10px)" }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
    >
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
            x: [0, Math.cos((i * 30 * Math.PI) / 180) * 150],
            y: [0, Math.sin((i * 30 * Math.PI) / 180) * 150]
          }}
          transition={{
            duration: 1.5,
            delay: i * 0.05,
            ease: "easeOut"
          }}
          className="absolute"
        >
          <Sparkles size={16} className="text-yellow-400" fill="currentColor" />
        </motion.div>
      ))}

      <div className="relative">
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.3, 0.15]
          }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-gradient-to-tr from-orange-500 via-yellow-400 to-red-500 blur-3xl rounded-full w-64 h-64 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"
        />

        <div className="relative flex flex-col items-center gap-4">
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              rotate: [-5, 5, -5],
              y: [-5, 5, -5]
            }}
            transition={{
              scale: { repeat: Infinity, duration: 0.6 },
              rotate: { repeat: Infinity, duration: 1.2, ease: "easeInOut" },
              y: { repeat: Infinity, duration: 2, ease: "easeInOut" }
            }}
            className="relative"
          >
            <motion.div
              animate={{
                opacity: [0.6, 1, 0.6],
                scale: [1, 1.2, 1]
              }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="absolute inset-0 -inset-4 text-yellow-300 blur-xl"
            >
              <Flame size={100} fill="currentColor" />
            </motion.div>

            <Flame
              size={100}
              className="text-orange-400 relative z-10 drop-shadow-2xl"
              fill="currentColor"
              strokeWidth={1.5}
            />
          </motion.div>

          <div className="text-center space-y-2 relative z-10">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
            >
              <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-orange-300 to-red-400 italic uppercase tracking-tight drop-shadow-lg">
                ¡{count} Seguidas!
              </h2>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-orange-200 font-bold text-lg drop-shadow-md"
            >
              ¡Imparable! 🔥
            </motion.p>
          </div>
        </div>

        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`spark-${i}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1.5, 0],
              opacity: [0, 1, 0],
              y: [0, -80 - i * 10]
            }}
            transition={{
              duration: 1.2,
              delay: 0.3 + i * 0.1,
              ease: "easeOut"
            }}
            className="absolute left-1/2 bottom-0"
            style={{
              marginLeft: `${(i - 3) * 15}px`
            }}
          >
            <div className="w-2 h-2 bg-yellow-400 rounded-full shadow-lg shadow-yellow-400/50" />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
