"use client";

import * as React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverArrow
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, useAnimation, AnimatePresence } from "framer-motion";

interface StepPopoverProps {
  title?: string;
  message?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  className?: string;
  children: React.ReactNode;
  isLocked?: boolean;
  isOptional?: boolean;
  isFirstMandatory?: boolean;
  isCompleted?: boolean;
  mandatory?: boolean;
  unitId?: number;
  isHighestPosition?: boolean;
  isOptionalHighest?: boolean;
}

export function StepPopover({
  title = "",
  message = "",
  buttonText,
  onButtonClick,
  className,
  children,
  isLocked = false,
  isOptional = false,
  isFirstMandatory = false,
  isCompleted = false,
  mandatory = false,
  unitId,
  isHighestPosition = false,
  isOptionalHighest = false
}: StepPopoverProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const controls = useAnimation();
  const loopsCompleted = React.useRef(0);
  const animationCancelled = React.useRef(false);
  const openTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    const handleTutorialStep = (e: any) => {
      const { stepId } = e.detail;

      const popoverSteps = {
        highestPosition: ["unit-explanations", "start-test"],
        optionalHighest: ["optional-unit"],
        firstMandatory: ["final-unit"]
      };

      const shouldBeOpen =
        (isHighestPosition && popoverSteps.highestPosition.includes(stepId)) ||
        (isOptionalHighest && popoverSteps.optionalHighest.includes(stepId)) ||
        (isFirstMandatory && popoverSteps.firstMandatory.includes(stepId));

      if (shouldBeOpen && !isOpen) {
        if (openTimeoutRef.current) {
          clearTimeout(openTimeoutRef.current);
        }
        openTimeoutRef.current = setTimeout(() => {
          setIsOpen(true);
        }, 100);
      } else if (!shouldBeOpen && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("tutorial-step-change", handleTutorialStep);
    return () => {
      window.removeEventListener("tutorial-step-change", handleTutorialStep);
      if (openTimeoutRef.current) {
        clearTimeout(openTimeoutRef.current);
      }
    };
  }, [isHighestPosition, isOptionalHighest, isFirstMandatory, isOpen]);
  const startPulseAnimation = React.useCallback(async () => {
    while (loopsCompleted.current < 4 && !animationCancelled.current) {
      if (isHovered) break;

      await controls.start({
        scale: [1, 1.1, 1],
        opacity: [1, 0.9, 1],
        transition: {
          duration: 1.6,
          ease: "easeInOut"
        }
      });

      if (animationCancelled.current || isHovered) break;

      loopsCompleted.current += 1;
    }
  }, [controls, isHovered]);

  React.useEffect(() => {
    if (isOpen) {
      loopsCompleted.current = 0;
      animationCancelled.current = false;
      startPulseAnimation();
    } else {
      animationCancelled.current = true;
      controls.stop();
    }
  }, [isOpen, controls, startPulseAnimation]);

  React.useEffect(() => {
    if (isHovered) {
      controls.stop();
      controls.start({
        scale: 1.2,
        opacity: 1,
        transition: {
          duration: 0.2,
          ease: "easeOut"
        }
      });
    } else if (isOpen) {
      controls.start({
        scale: 1,
        opacity: 1,
        transition: {
          duration: 0.2,
          ease: "easeOut"
        }
      });
    }
  }, [isHovered, isOpen, controls]);

  const getPopoverClass = () => {
    if (className) return className;
    if (isLocked) return "bg-gray-700 text-white p-4";
    if (isCompleted) {
      if (isFirstMandatory && mandatory)
        return "bg-[#F9F0B6] text-gray-900 p-4";
      if (mandatory) return "bg-[#5EC16A] text-white p-4";
      return "bg-[#1983DD] text-white p-4";
    }
    if (isFirstMandatory) return "bg-[#F9F0B6] text-gray-900 p-4";
    if (isOptional) return "bg-[#1983DD] text-white p-4";
    return "bg-[#1F941C] text-white p-4";
  };

  const getArrowClass = () => {
    if (isLocked) return "fill-gray-700";
    if (isCompleted) {
      if (isFirstMandatory && mandatory) return "fill-[#F9F0B6]";
      if (mandatory) return "fill-[#5EC16A]";
      return "fill-[#1983DD]";
    }
    if (isFirstMandatory) return "fill-[#F9F0B6]";
    if (isOptional) return "fill-[#1983DD]";
    return "fill-[#1F941C]";
  };

  const getButtonTextColor = () => {
    if (isLocked) return "text-gray-400";
    if (isCompleted) {
      if (isFirstMandatory && mandatory) return "text-gray-900";
      if (mandatory) return "text-[#5EC16A]";
      return "text-[#1983DD]";
    }
    if (isFirstMandatory) return "text-gray-900";
    if (isOptional) return "text-[#1983DD]";
    return "text-[#1F941C]";
  };

  const getIconColor = () => {
    if (isCompleted && !mandatory) return "text-white opacity-90";
    if (isFirstMandatory) return "text-gray-900 opacity-90";
    return "text-white opacity-90";
  };

  const buttonBgColor = isLocked
    ? "bg-gray-600 hover:bg-gray-600"
    : "bg-white hover:bg-white/90";

  const handleBookClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/contents?unit=${unitId}`);
  };

  const handleOpenChange = (open: boolean) => {
    const isTutorialActive = document.querySelector(
      ".fixed.inset-0.z-\\[9998\\]"
    );
    if (
      !isTutorialActive ||
      (!isHighestPosition && !isOptionalHighest && !isFirstMandatory)
    ) {
      setIsOpen(open);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <AnimatePresence>
        {isOpen && (
          <PopoverContent
            className={`${getPopoverClass()} rounded-xl relative`}
            asChild
            forceMount
            data-highest-position={isHighestPosition ? "true" : undefined}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{
                duration: 0.2,
                ease: [0.4, 0, 0.2, 1]
              }}
            >
              <motion.button
                onClick={handleBookClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="absolute top-4 right-4 cursor-pointer focus:outline-none group"
                aria-label="Ver contenidos"
                animate={controls}
                initial={{ scale: 1, opacity: 1 }}
                whileTap={{ scale: 0.9 }}
              >
                <BookOpen
                  className={`w-9 h-9 ${getIconColor()} group-hover:opacity-100 transition-opacity drop-shadow-sm`}
                />
              </motion.button>
              <div className="pr-10">
                {title && <h3 className="font-bold text-lg">{title}</h3>}
                {message && (
                  <p className="mt-2 line-clamp-4 text-sm">{message}</p>
                )}
              </div>
              {buttonText && onButtonClick && (
                <Button
                  data-tutorial-start-button={
                    isHighestPosition ? "true" : undefined
                  }
                  className={`text-[15px] font-bold ${buttonBgColor} h-[60px] w-full focus-visible:ring-0 mt-3 ${getButtonTextColor()} rounded-xl transition-all duration-200`}
                  onClick={onButtonClick}
                  disabled={isLocked}
                >
                  {buttonText}
                </Button>
              )}
              <PopoverArrow className={`${getArrowClass()} w-4 h-4`} />
            </motion.div>
          </PopoverContent>
        )}
      </AnimatePresence>
    </Popover>
  );
}
