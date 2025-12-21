"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

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
      className="absolute inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onComplete}
    >
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-3xl shadow-2xl p-8 max-w-md mx-4 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-400/20 rounded-full blur-2xl translate-y-12 -translate-x-12" />

        {/* Content */}
        <div className="relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <span className="text-white text-sm font-semibold">
              Pregunta {questionNumber} de {totalQuestions}
            </span>
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-white">
              {icon}
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white text-center mb-4">
            {title}
          </h2>

          {/* Description */}
          <p className="text-white/90 text-center mb-8 leading-relaxed">
            {description}
          </p>

          {/* Continue button */}
          <button
            onClick={onComplete}
            className="w-full bg-white hover:bg-gray-100 text-purple-700 font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span>Entendido</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Helper text */}
          <p className="text-white/60 text-xs text-center mt-4">
            Toca en cualquier lugar para continuar
          </p>
        </div>

        {/* Animated glow */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-3xl"
        />
      </motion.div>
    </motion.div>
  );
}
