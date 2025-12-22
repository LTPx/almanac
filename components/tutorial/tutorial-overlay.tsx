"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";

interface TutorialInlineCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  questionNumber: number;
  totalQuestions: number;
  onDismiss?: () => void;
}

export function TutorialInlineCard({
  icon,
  title,
  description,
  questionNumber,
  totalQuestions,
  onDismiss
}: TutorialInlineCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="mb-5 bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-md rounded-2xl p-5 border border-primary/30 shadow-xl relative overflow-hidden"
    >
      <motion.div
        animate={{
          opacity: [0.08, 0.18, 0.08],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-0 right-0 w-32 h-32 bg-primary/15 rounded-full blur-3xl"
      />

      <motion.div
        animate={{
          opacity: [0.05, 0.12, 0.05]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5
        }}
        className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full blur-2xl"
      />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="inline-flex items-center gap-2 bg-primary/15 backdrop-blur-sm rounded-full px-4 py-2 border border-primary/30 shadow-sm">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-primary text-sm font-bold tracking-tight">
            Pregunta {questionNumber} de {totalQuestions}
          </span>
        </div>

        {onDismiss && (
          <motion.button
            onClick={onDismiss}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted/50"
            aria-label="Cerrar explicación"
          >
            <X className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      <div className="flex items-start gap-4 relative z-10">
        <motion.div
          animate={{
            y: [0, -2, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="flex-shrink-0 bg-gradient-to-br from-primary/15 to-primary/10 backdrop-blur-sm rounded-xl p-3 text-primary border border-primary/30 shadow-md [&>svg]:w-5 [&>svg]:h-5"
        >
          {icon}
        </motion.div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-foreground mb-2 leading-tight">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      <motion.div
        animate={{
          scaleX: [0.8, 1, 0.8]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent"
      />
    </motion.div>
  );
}
