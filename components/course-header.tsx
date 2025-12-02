"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Heart } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Curriculum } from "@/lib/types";
import { useNoHeartsModal } from "@/store/no-hearts-modal";

interface CourseHeaderProps {
  curriculums: Curriculum[];
  selectedCurriculumId: string;
  onUnitChange: (unitId: string) => void;
  streakDays?: number;
  zaps?: number;
  lives?: number;
  className?: string;
  isPremium?: boolean;
}

const CourseHeader: React.FC<CourseHeaderProps> = ({
  curriculums,
  selectedCurriculumId,
  onUnitChange,
  zaps = 0,
  lives = 0,
  className = "",
  isPremium = false
}) => {
  const selectedCurriculum = curriculums.find(
    (u) => u.id.toString() === selectedCurriculumId
  );
  const prevZaps = useRef(zaps);
  const prevLives = useRef(lives);
  const { open: openNoHeartsModal } = useNoHeartsModal();

  useEffect(() => {
    prevZaps.current = zaps;
    prevLives.current = lives;
  });

  const handleUnitChange = (value: string) => {
    if ("vibrate" in navigator) {
      navigator.vibrate(10);
    }
    onUnitChange(value);
  };

  const handleHeartClick = () => {
    if (lives === 0 && !isPremium) {
      openNoHeartsModal("");
    }
  };

  return (
    <div
      className={`w-full max-w-[650px] sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-4 shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between mx-auto">
        <motion.div
          className="w-64"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Select value={selectedCurriculumId} onValueChange={handleUnitChange}>
            <SelectTrigger className="w-full text-black">
              <SelectValue placeholder="Selecciona una unidad...">
                {selectedCurriculum
                  ? selectedCurriculum.title
                  : "Selecciona una unidad..."}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white text-black">
              {curriculums.map((curriculum) => (
                <SelectItem
                  key={curriculum.id}
                  value={curriculum.id.toString()}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{curriculum.title}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        <div className="flex items-center gap-4 ml-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={`zaps-${zaps}`}
              initial={{ scale: 1 }}
              animate={{
                scale: prevZaps.current !== zaps ? [1, 1.3, 1] : 1
              }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-50 cursor-pointer hover:bg-purple-100 transition-colors"
            >
              <Link href="/store" className="flex items-center gap-2">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: prevZaps.current !== zaps ? [0, -10, 10, -10, 0] : 0
                  }}
                  transition={{
                    scale: {
                      duration: 0.8,
                      repeat: Infinity,
                      ease: "easeInOut"
                    },
                    rotate: { duration: 0.5 }
                  }}
                >
                  <Zap className="w-5 h-5 text-purple-500 fill-current" />
                </motion.div>
                {!isPremium ? (
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-xl font-bold text-purple-600"
                  >
                    ∞
                  </motion.span>
                ) : (
                  <motion.span
                    key={`zap-value-${zaps}`}
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 10, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm font-medium text-purple-600"
                  >
                    {zaps}
                  </motion.span>
                )}
              </Link>
            </motion.div>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.div
              key={`lives-${lives}`}
              initial={{ scale: 1 }}
              animate={{
                scale:
                  lives <= 2
                    ? [1, 1.1, 1, 1.1, 1]
                    : prevLives.current !== lives
                      ? [1, 1.3, 1]
                      : 1
              }}
              transition={{ duration: lives <= 2 ? 0.6 : 0.3 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={lives === 0 && !isPremium ? handleHeartClick : undefined}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                lives <= 2
                  ? "bg-red-100 hover:bg-red-200"
                  : "bg-red-50 hover:bg-red-100"
              } ${lives === 0 && !isPremium ? "cursor-pointer" : ""}`}
            >
              <motion.div
                animate={{
                  scale: lives <= 2 ? [1, 1.2, 1] : 1,
                  rotate: prevLives.current !== lives ? [0, -10, 10, -10, 0] : 0
                }}
                transition={{
                  scale: { duration: 0.8, repeat: lives <= 2 ? Infinity : 0 },
                  rotate: { duration: 0.5 }
                }}
              >
                <Heart
                  className={`w-5 h-5 fill-current ${
                    lives <= 2 ? "text-red-600" : "text-red-500"
                  }`}
                />
              </motion.div>
              {isPremium ? (
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-xl font-bold text-red-600"
                >
                  ∞
                </motion.span>
              ) : (
                <motion.span
                  key={`lives-value-${lives}`}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 10, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`text-sm font-medium ${
                    lives <= 2 ? "text-red-700 font-bold" : "text-red-600"
                  }`}
                >
                  {lives}
                </motion.span>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CourseHeader;
