"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

interface TutorialTestOverlayProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  questionNumber: number;
  totalQuestions: number;
  onComplete: () => void;
}

export function TutorialTestOverlay({
  icon,
  title,
  description,
  questionNumber,
  totalQuestions,
  onComplete
}: TutorialTestOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md"
      onClick={onComplete}
    >
      <motion.div
        initial={{ scale: 0.85, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.85, y: 30, opacity: 0 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 22,
          duration: 0.4
        }}
        className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl shadow-2xl p-8 max-w-md mx-4 overflow-hidden border border-gray-700/50"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          animate={{
            opacity: [0.15, 0.3, 0.15]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-0 right-0 w-40 h-40 bg-[#32c781]/20 rounded-full blur-3xl -translate-y-20 translate-x-20"
        />
        <motion.div
          animate={{
            opacity: [0.1, 0.25, 0.1]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-0 left-0 w-32 h-32 bg-[#32c781]/20 rounded-full blur-2xl translate-y-16 -translate-x-16"
        />

        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -20, 0],
              x: [0, Math.random() * 10 - 5, 0],
              opacity: [0, 0.4, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
            className="absolute w-1 h-1 bg-[#32c781]/40 rounded-full"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`
            }}
          />
        ))}

        <div className="relative z-10">
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-[#32c781]/20 backdrop-blur-sm rounded-full px-5 py-2.5 mb-6 border border-[#32c781]/30 shadow-lg"
          >
            <Sparkles className="w-4 h-4 text-[#32c781]" />
            <span className="text-[#32c781] text-sm font-bold tracking-wide">
              Pregunta {questionNumber} de {totalQuestions}
            </span>
          </motion.div>

          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.3
            }}
            className="flex justify-center mb-6"
          >
            <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-5 text-white shadow-xl border border-gray-700/50 relative overflow-hidden">
              <motion.div
                animate={{
                  rotate: 360,
                  opacity: [0.1, 0.2, 0.1]
                }}
                transition={{
                  rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                  opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                }}
                className="absolute inset-0 bg-gradient-to-br from-[#32c781]/10 to-transparent"
              />
              <div className="relative z-10">{icon}</div>
            </div>
          </motion.div>

          <motion.h2
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold text-white text-center mb-4 drop-shadow-lg"
          >
            {title}
          </motion.h2>

          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-300 text-center mb-8 leading-relaxed text-base"
          >
            {description}
          </motion.p>

          <motion.button
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            onClick={onComplete}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-[#32c781] hover:bg-[#2ab570] text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-2xl shadow-[#32c781]/20 hover:shadow-[#32c781]/30 group relative overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.6 }}
            />
            <span className="relative z-10">¡Entendido!</span>
            <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-gray-500 text-xs text-center mt-4 flex items-center justify-center gap-2"
          >
            <span className="inline-block w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse" />
            Toca en cualquier lugar para continuar
          </motion.p>
        </div>

        <motion.div
          animate={{
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 rounded-3xl border border-[#32c781]/20 pointer-events-none"
        />
      </motion.div>
    </motion.div>
  );
}
