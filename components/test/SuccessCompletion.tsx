"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface SuccessCompletionProps {
  onComplete?: () => void;
  onStartComplete?: () => void;
}

export const SuccessCompletion = ({
  onComplete,
  onStartComplete
}: SuccessCompletionProps) => {
  const checkmarkPath = "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z";
  const [shouldExit, setShouldExit] = useState(false);

  useEffect(() => {
    if (onStartComplete) {
      onStartComplete();
    }
  }, [onStartComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: shouldExit ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center backdrop-blur-md"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{
          opacity: shouldExit ? 0 : 1,
          scale: shouldExit ? 0.95 : 1
        }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[650px] h-[100dvh] bg-gradient-to-b from-background via-background to-card/50 flex flex-col items-center justify-center p-8 relative overflow-hidden"
      >
        <motion.div
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: [0, 3, 4], opacity: [1, 0.5, 0] }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute bg-gradient-to-r from-primary/40 to-accent/30 rounded-full w-64 h-64 blur-3xl"
        />

        <motion.div
          initial={{ scale: 0, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.1
          }}
          className="relative z-10 bg-card rounded-full p-2 shadow-lg"
        >
          <div className="bg-gradient-to-br from-primary to-accent p-8 rounded-full shadow-[0_0_40px_rgba(50,199,129,0.5)]">
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
              // Iniciar animación de salida
              setShouldExit(true);
              // Esperar a que termine la animación de salida antes de cerrar
              setTimeout(() => {
                onComplete?.();
              }, 500);
            }, 1500);
          }}
          className="text-center mt-8 z-10 space-y-2"
        >
          <h1 className="text-4xl font-bold text-primary">¡Quiz Completado!</h1>
          <p className="text-foreground/80 font-medium text-lg">
            Puntuación Perfecta
          </p>
        </motion.div>

        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
              x: [0, Math.cos((i * 45 * Math.PI) / 180) * 100],
              y: [0, Math.sin((i * 45 * Math.PI) / 180) * 100]
            }}
            transition={{
              duration: 1.5,
              delay: 0.4 + i * 0.05,
              ease: "easeOut"
            }}
            className="absolute w-2 h-2 bg-primary/60 rounded-full"
          />
        ))}
      </motion.div>
    </motion.div>
  );
};
