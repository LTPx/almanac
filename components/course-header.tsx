"use client";

import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle
} from "react";
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
  preventSelectClose?: boolean;
}

export interface CourseHeaderRef {
  openSelect: () => void;
  closeSelect: () => void;
}

const CourseHeader = forwardRef<CourseHeaderRef, CourseHeaderProps>(
  (
    {
      curriculums,
      selectedCurriculumId,
      onUnitChange,
      zaps = 0,
      lives = 0,
      className = "",
      isPremium = false,
      preventSelectClose = false
    },
    ref
  ) => {
    const selectedCurriculum = curriculums.find(
      (u) => u.id.toString() === selectedCurriculumId
    );
    const prevZaps = useRef(zaps);
    const prevLives = useRef(lives);
    const { open: openNoHeartsModal } = useNoHeartsModal();
    const [isSelectOpen, setIsSelectOpen] = React.useState(false);

    useImperativeHandle(ref, () => ({
      openSelect: () => {
        setIsSelectOpen(true);
        setTimeout(() => {
          const trigger = document.querySelector(
            ".course-header-select button"
          );
          if (trigger instanceof HTMLElement) {
            trigger.click();
          }
        }, 50);
      },
      closeSelect: () => {
        setIsSelectOpen(false);
      }
    }));

    useEffect(() => {
      prevZaps.current = zaps;
      prevLives.current = lives;
    });

    const handleUnitChange = (value: string) => {
      if ("vibrate" in navigator) {
        navigator.vibrate(10);
      }
      onUnitChange(value);
      const event = new CustomEvent("curriculum-selected");
      window.dispatchEvent(event);
    };

    const handleHeartClick = () => {
      if (lives === 0 && !isPremium) {
        openNoHeartsModal("");
      }
    };

    const handleSelectOpenChange = (open: boolean) => {
      if (!open && preventSelectClose) {
        return;
      }
      setIsSelectOpen(open);
    };

    return (
      <div
        className={`w-full max-w-[650px] sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-4 shadow-sm ${className}`}
      >
        <div className="flex items-center justify-between gap-2 sm:gap-3 mx-auto">
          <motion.div
            className="flex-1 min-w-0 max-w-xs sm:max-w-sm md:max-w-64 course-header-select"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Select
              value={selectedCurriculumId}
              onValueChange={handleUnitChange}
              open={isSelectOpen}
              onOpenChange={handleSelectOpenChange}
            >
              <SelectTrigger className="w-full text-black">
                <SelectValue placeholder="Selecciona una unidad...">
                  <span className="truncate block font-semibold">
                    {selectedCurriculum
                      ? selectedCurriculum.title
                      : "Selecciona una unidad..."}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent
                className="bg-white text-black z-[9999] tutorial-select-content max-h-[200px] sm:max-h-[250px] overflow-y-auto"
                data-tutorial-select="true"
              >
                {curriculums.map((curriculum) => (
                  <SelectItem
                    key={curriculum.id}
                    value={curriculum.id.toString()}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="truncate">{curriculum.title}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>

          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={`zaps-${zaps}`}
                initial={{ scale: 1 }}
                animate={{
                  scale: prevZaps.current !== zaps ? [1, 1.3, 1] : 1,
                  boxShadow: [
                    "0 0 0px rgba(168, 85, 247, 0.4)",
                    "0 0 20px rgba(168, 85, 247, 0.6)",
                    "0 0 0px rgba(168, 85, 247, 0.4)"
                  ]
                }}
                transition={{
                  duration: 0.3,
                  boxShadow: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg bg-purple-50 cursor-pointer hover:bg-purple-100 transition-colors zaps-counter"
              >
                <Link
                  href="/store"
                  className="flex items-center gap-1.5 sm:gap-2"
                >
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 fill-current flex-shrink-0" />
                  {isPremium ? (
                    <motion.span
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-lg sm:text-xl font-bold text-purple-600"
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
                      className="text-xs sm:text-sm font-medium text-purple-600"
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
                onClick={
                  lives === 0 && !isPremium ? handleHeartClick : undefined
                }
                className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg transition-colors hearts-counter ${
                  lives <= 2
                    ? "bg-red-100 hover:bg-red-200"
                    : "bg-red-50 hover:bg-red-100"
                } ${lives === 0 && !isPremium ? "cursor-pointer" : ""}`}
              >
                <motion.div
                  animate={{
                    scale: lives <= 2 ? [1, 1.2, 1] : 1,
                    rotate:
                      prevLives.current !== lives ? [0, -10, 10, -10, 0] : 0
                  }}
                  transition={{
                    scale: {
                      duration: 0.8,
                      repeat: lives <= 2 ? Infinity : 0
                    },
                    rotate: { duration: 0.5 }
                  }}
                >
                  <Heart
                    className={`w-4 h-4 sm:w-5 sm:h-5 fill-current flex-shrink-0 ${
                      lives <= 2 ? "text-red-600" : "text-red-500"
                    }`}
                  />
                </motion.div>
                {isPremium ? (
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-lg sm:text-xl font-bold text-red-600"
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
                    className={`text-xs sm:text-sm font-medium ${
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
  }
);

CourseHeader.displayName = "CourseHeader";

export default CourseHeader;
