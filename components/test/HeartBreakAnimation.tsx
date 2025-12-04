"use client";

import React from "react";
import { motion } from "framer-motion";
import { Heart, HeartCrack } from "lucide-react";

interface HeartBreakAnimationProps {
  onComplete: () => void;
}

export const HeartBreakAnimation: React.FC<HeartBreakAnimationProps> = ({
  onComplete
}) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with red tint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm"
      />

      {/* The Modal */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
          scale: 1,
          opacity: 1,
          x: [0, -10, 10, -5, 5, 0] // The "Shake" Effect
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
          x: { duration: 0.4 } // Shake duration
        }}
        className="relative z-10 w-full max-w-sm mx-4 bg-slate-800 border border-slate-700 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl shadow-red-900/20"
      >
        {/* The Breaking Heart Animation */}
        <div className="relative mb-6">
          <motion.div
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center text-red-500"
          >
            <Heart size={80} fill="currentColor" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: "spring" }}
            className="text-slate-600 relative z-10"
          >
            <HeartCrack size={80} />
          </motion.div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Sin Corazones</h2>
        <p className="text-slate-400 mb-8">
          Te has quedado sin corazones. ¿Quieres comprar más para continuar?
        </p>

        {/* Action Button */}
        <div className="w-full">
          <button
            onClick={onComplete}
            className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            Ir a la Tienda
          </button>
        </div>
      </motion.div>
    </div>
  );
};
