"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ArrowLeft } from "lucide-react";

interface TutorialStep {
  id: string;
  target: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  action?: () => void;
}

interface TutorialSpotlightProps {
  steps: TutorialStep[];
  onComplete: () => void;
  show: boolean;
  onStepChange?: (step: number) => void;
}

export const TutorialSpotlight: React.FC<TutorialSpotlightProps> = ({
  steps,
  onComplete,
  show,
  onStepChange
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (onStepChange) {
      onStepChange(currentStep);
    }

    const stepConfig = steps[currentStep];
    if (stepConfig.id !== "review-units") {
      const selectTrigger = document.querySelector(
        ".course-header-select button"
      );
      const selectContent = document.querySelector(
        "[data-radix-select-content]"
      );

      if (selectContent && selectTrigger instanceof HTMLElement) {
        setTimeout(() => {
          const isOpen = selectContent.getAttribute("data-state") === "open";
          if (isOpen) {
            selectTrigger.click();
          }
        }, 100);
      }
    }
  }, [currentStep, onStepChange, steps]);

  useEffect(() => {
    if (!show) return;

    const updateTargetPosition = () => {
      const stepConfig = steps[currentStep];
      let target: Element | null = null;

      if (stepConfig.id === "review-units") {
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });

        target =
          document.querySelector("[data-radix-select-content]") ||
          document.querySelector('[data-tutorial-select="true"]') ||
          document.querySelector('[role="listbox"]') ||
          document.querySelector(".tutorial-select-content");

        if (target) {
          const rect = target.getBoundingClientRect();

          if (rect.height > 0 && rect.width > 0) {
            setTargetRect(rect);
          }
        }
      } else if (stepConfig.id === "unit-explanations") {
        target = document.querySelector('[data-highest-position="true"]');
      } else {
        target = document.querySelector(stepConfig.target);
      }

      if (target && stepConfig.id !== "review-units") {
        target.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center"
        });

        const rect = target.getBoundingClientRect();
        if (rect.height > 0 && rect.width > 0) {
          setTargetRect(rect);
        }
      }
    };

    if (steps[currentStep].action) {
      steps[currentStep].action?.();

      setTimeout(() => {
        updateTargetPosition();

        setTimeout(() => {
          updateTargetPosition();
        }, 200);
      }, 300);
    } else {
      updateTargetPosition();
    }

    const interval = setInterval(() => {
      if (
        steps[currentStep].id === "review-units" ||
        steps[currentStep].id === "unit-explanations"
      ) {
        updateTargetPosition();
      }
    }, 100);

    window.addEventListener("resize", updateTargetPosition);
    window.addEventListener("scroll", updateTargetPosition);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", updateTargetPosition);
      window.removeEventListener("scroll", updateTargetPosition);
    };
  }, [currentStep, steps, show]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!show || !targetRect) return null;

  const step = steps[currentStep];
  const tooltipPosition = getTooltipPosition(targetRect, step.position);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9998]"
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <mask id="spotlight-mask">
              <rect width="100%" height="100%" fill="white" />
              <motion.rect
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                x={targetRect.left - 8}
                y={targetRect.top - 8}
                width={targetRect.width + 16}
                height={targetRect.height + 16}
                rx={12}
                fill="black"
              />
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.7)"
            mask="url(#spotlight-mask)"
            className="pointer-events-auto"
          />
        </svg>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="absolute pointer-events-none z-[9999]"
          style={{
            left: targetRect.left - 12,
            top: targetRect.top - 12,
            width: targetRect.width + 24,
            height: targetRect.height + 24
          }}
        >
          <div className="w-full h-full border-4 border-purple-500 rounded-xl shadow-2xl shadow-purple-500/50 animate-pulse" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="absolute bg-white rounded-2xl shadow-2xl p-6 max-w-sm pointer-events-auto z-[9999]"
          style={{
            left: tooltipPosition.left,
            top: tooltipPosition.top
          }}
        >
          <button
            onClick={handleSkip}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="pr-6">
            {step.icon && (
              <div className="mb-3 text-purple-600">{step.icon}</div>
            )}
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {step.title}
            </h3>
            <p className="text-gray-600 mb-4 text-sm leading-relaxed">
              {step.description}
            </p>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex gap-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === currentStep
                      ? "w-6 bg-purple-600"
                      : "w-2 bg-gray-300"
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Atrás
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm font-semibold"
              >
                {currentStep === steps.length - 1 ? "¡Empezar!" : "Siguiente"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

function getTooltipPosition(
  targetRect: DOMRect,
  position: string = "bottom"
): { left: number; top: number } {
  const spacing = 20;
  const tooltipWidth = 384;
  const padding = 16;

  let left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
  let top = 0;

  switch (position) {
    case "top":
      top = targetRect.top - 220 - spacing;
      break;
    case "bottom":
      top = targetRect.bottom + spacing;
      break;
    case "left":
      left = targetRect.left - tooltipWidth - spacing;
      top = targetRect.top;
      break;
    case "right":
      left = targetRect.right + spacing;
      top = targetRect.top;
      break;
    default:
      top = targetRect.bottom + spacing;
  }

  const maxWidth = window.innerWidth;
  if (left < padding) {
    left = padding;
  }
  if (left + tooltipWidth > maxWidth - padding) {
    left = maxWidth - tooltipWidth - padding;
  }

  if (top < padding) {
    top = targetRect.bottom + spacing;
  }

  const tooltipHeight = 280;
  if (top + tooltipHeight > window.innerHeight - padding) {
    top = Math.max(padding, targetRect.top - tooltipHeight - spacing);
  }

  return { left, top };
}
