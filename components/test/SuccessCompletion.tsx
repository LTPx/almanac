"use client";

import { motion } from "framer-motion";

interface SuccessCompletionProps {
  onComplete?: () => void;
}

export const SuccessCompletion = ({ onComplete }: SuccessCompletionProps) => {
  const checkmarkPath = "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z";

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none bg-slate-900/95">
      <motion.div
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: [0, 3, 4], opacity: [1, 0.5, 0] }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute bg-gradient-to-r from-emerald-500 to-teal-300 rounded-full w-64 h-64 blur-xl"
      />
      <motion.div
        initial={{ scale: 0, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        className="relative z-10 bg-slate-900 rounded-full p-2"
      >
        <div className="bg-gradient-to-br from-emerald-400 to-teal-600 p-6 rounded-full shadow-[0_0_40px_rgba(16,185,129,0.6)]">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
            <motion.path
              d={checkmarkPath}
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, ease: "easeInOut", delay: 0.3 }}
            />
          </svg>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        onAnimationComplete={() => {
          setTimeout(() => {
            onComplete?.();
          }, 600);
        }}
        className="text-center mt-8 z-10"
      >
        <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">
          ¡Quiz Completado!
        </h1>
        <p className="text-emerald-400 font-bold text-lg mt-2">
          Puntuación Perfecta
        </p>
      </motion.div>
    </div>
  );
};
