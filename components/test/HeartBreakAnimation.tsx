"use client";

import React from "react";
import { motion } from "framer-motion";
import { Heart, HeartCrack, ShoppingBag, X } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface HeartBreakAnimationProps {
  onComplete: () => void;
  onExit?: () => void;
}

export const HeartBreakAnimation: React.FC<HeartBreakAnimationProps> = ({
  onComplete,
  onExit
}) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center backdrop-blur-md"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[650px] h-[100dvh] bg-gradient-to-b from-background via-background to-card/50 flex flex-col items-center justify-center p-8 relative overflow-hidden"
      >
        {onExit && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            onClick={onExit}
            className="absolute top-6 right-6 z-20 p-2 rounded-full bg-card/80 hover:bg-card text-foreground/60 hover:text-foreground transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X size={24} />
          </motion.button>
        )}

        <motion.div
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: [0, 3, 4], opacity: [1, 0.5, 0] }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute bg-gradient-to-r from-destructive/40 to-destructive/30 rounded-full w-64 h-64 blur-3xl"
        />

        <motion.div
          initial={{ scale: 0, y: 50 }}
          animate={{
            scale: 1,
            y: 0,
            x: [0, -10, 10, -5, 5, 0]
          }}
          transition={{
            scale: {
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.1
            },
            y: {
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.1
            },
            x: { duration: 0.4, delay: 0.6 }
          }}
          className="relative z-10 bg-card rounded-full p-2 shadow-lg"
        >
          <div className="bg-gradient-to-br from-destructive/90 to-destructive p-8 rounded-full shadow-[0_0_40px_rgba(237,83,40,0.5)] relative">
            <motion.div
              initial={{ opacity: 1, scale: 1 }}
              animate={{ opacity: 0, scale: 1.3 }}
              transition={{ duration: 0.4, delay: 0.8 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Heart size={80} fill="white" color="white" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
              className="relative"
            >
              <HeartCrack size={80} color="white" strokeWidth={2.5} />
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.5 }}
          className="text-center mt-8 z-10 space-y-3"
        >
          <h1 className="text-3xl font-bold text-destructive">
            {t("modals", "noHeartsTitle")}
          </h1>
          <p className="text-foreground/80 font-medium text-lg max-w-md">
            {t("modals", "noHeartsMessage")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.5 }}
          className="mt-8 z-10 w-full max-w-md space-y-3"
        >
          <motion.button
            onClick={onComplete}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 bg-primary hover:brightness-110 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-3"
          >
            <ShoppingBag size={24} />
            {t("modals", "goToStore")}
          </motion.button>

          {onExit && (
            <motion.button
              onClick={onExit}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-card/50 hover:bg-card border border-border text-foreground/80 hover:text-foreground font-semibold rounded-xl transition-all"
            >
              {t("modals", "exitExam")}
            </motion.button>
          )}
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
              delay: 0.8 + i * 0.05,
              ease: "easeOut"
            }}
            className="absolute w-2 h-2 bg-destructive/60 rounded-full"
          />
        ))}

        <motion.div
          initial={{ opacity: 0, x: 0, y: 0, rotate: 0 }}
          animate={{
            opacity: [0, 1, 0],
            x: -60,
            y: -40,
            rotate: -45
          }}
          transition={{ duration: 1, delay: 0.9 }}
          className="absolute"
        >
          <Heart
            size={20}
            fill="rgba(237,83,40,0.5)"
            color="rgba(237,83,40,0.5)"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 0, y: 0, rotate: 0 }}
          animate={{
            opacity: [0, 1, 0],
            x: 60,
            y: -30,
            rotate: 45
          }}
          transition={{ duration: 1, delay: 0.95 }}
          className="absolute"
        >
          <Heart
            size={16}
            fill="rgba(237,83,40,0.4)"
            color="rgba(237,83,40,0.4)"
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
