"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ArrowLeft } from "lucide-react";

interface TutorialStep {
  id: string;
  target?: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  action?: () => void;
  customContent?: React.ReactNode;
  isFullScreen?: boolean;
}

interface TutorialSpotlightProps {
  steps: TutorialStep[];
  onComplete: () => void;
  show: boolean;
  onStepChange?: (step: number) => void;
  initialStep?: number;
}

export const TutorialSpotlight: React.FC<TutorialSpotlightProps> = ({
  steps,
  onComplete,
  show,
  onStepChange,
  initialStep = 0
}) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [showTooltip] = useState(true);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInternalChangeRef = useRef(false);

  const userScrolling = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastScrollTarget = useRef<Element | "top" | null>(null);

  const step = steps[currentStep];
  const isFullScreenStep = step?.isFullScreen || false;

  const scrollToTarget = useCallback(
    (element: Element, force: boolean = false) => {
      if (userScrolling.current && !force) return;

      if (lastScrollTarget.current === element && !force) return;

      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      const isInView = rect.top >= 100 && rect.bottom <= viewportHeight - 100;
      if (isInView && !force) return;

      lastScrollTarget.current = element;

      const absoluteTop = window.pageYOffset + rect.top;
      const middle = absoluteTop - viewportHeight / 2 + rect.height / 2;

      const shouldUseInstant =
        force || Math.abs(window.pageYOffset - middle) > viewportHeight;

      window.scrollTo({
        top: middle,
        behavior: shouldUseInstant ? "auto" : "smooth"
      });
    },
    []
  );

  const scrollToTop = useCallback((instant: boolean = false) => {
    lastScrollTarget.current = null;

    window.scrollTo({
      top: 0,
      behavior: instant ? "auto" : "smooth"
    });

    setTimeout(() => {
      userScrolling.current = false;
    }, 300);
  }, []);

  useEffect(() => {
    if (!isInternalChangeRef.current && initialStep !== currentStep) {
      console.log(
        `🔄 Sincronizando desde padre: ${currentStep} → ${initialStep}`
      );
      setCurrentStep(initialStep);

      lastScrollTarget.current = null;
    }

    isInternalChangeRef.current = false;
  }, [initialStep]);

  useEffect(() => {
    if (onStepChange && isInternalChangeRef.current) {
      console.log(`📌 Notificando cambio al padre: ${currentStep}`);
      onStepChange(currentStep);
    }

    const event = new CustomEvent("tutorial-step-change", {
      detail: { stepId: steps[currentStep]?.id, stepIndex: currentStep }
    });
    window.dispatchEvent(event);

    const stepConfig = steps[currentStep];

    if (stepConfig?.id !== "review-units" && stepConfig?.id !== "start-test") {
      const selectTrigger = document.querySelector(
        ".course-header-select button"
      );
      const selectContent = document.querySelector(
        "[data-radix-select-content]"
      );

      if (selectContent && selectTrigger instanceof HTMLElement) {
        const isOpen = selectContent.getAttribute("data-state") === "open";
        if (isOpen) {
          selectTrigger.click();
        }
      }
    }
  }, [currentStep, onStepChange, steps]);

  useEffect(() => {
    if (!show || isFullScreenStep) return;

    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
    }

    const updateTargetPosition = () => {
      const stepConfig = steps[currentStep];

      if (!stepConfig?.target || stepConfig.target.trim() === "") {
        return;
      }

      const shouldScrollToTop =
        stepConfig.id === "review-units" || stepConfig.id === "final-unit";

      if (shouldScrollToTop && lastScrollTarget.current !== "top") {
        scrollToTop(true);
        lastScrollTarget.current = "top" as any;
      }

      let target: Element | null = null;

      if (stepConfig.id === "review-units") {
        target =
          document.querySelector("[data-radix-select-content]") ||
          document.querySelector('[data-tutorial-select="true"]') ||
          document.querySelector('[role="listbox"]');

        if (target) {
          const rect = target.getBoundingClientRect();
          if (rect.height > 0 && rect.width > 0) {
            setTargetRect(rect);
          }
        }
      } else if (stepConfig.id === "start-test") {
        target = document.querySelector('[data-tutorial-start-button="true"]');

        if (target) {
          const rect = target.getBoundingClientRect();
          if (rect.height > 0 && rect.width > 0) {
            setTargetRect(rect);
          }
        }
      } else if (stepConfig.id === "unit-explanations") {
        target = document.querySelector('[data-highest-position="true"]');

        if (target) {
          const rect = target.getBoundingClientRect();
          if (rect.height > 0 && rect.width > 0) {
            setTargetRect(rect);
          }
        }
      } else if (stepConfig.id === "completed-unit") {
        target = document.querySelector('[data-highest-position-node="true"]');

        if (target) {
          const rect = target.getBoundingClientRect();
          if (rect.height > 0 && rect.width > 0) {
            setTargetRect(rect);
          }
        }
      } else {
        target = document.querySelector(stepConfig.target);

        if (target) {
          const rect = target.getBoundingClientRect();
          if (rect.height > 0 && rect.width > 0) {
            setTargetRect(rect);
          }
        }
      }

      if (target && !userScrolling.current && !shouldScrollToTop) {
        scrollToTarget(target, false);
      }
    };

    setIsTransitioning(true);

    if (steps[currentStep]?.action) {
      steps[currentStep].action?.();
    }

    const initialDelay = isInternalChangeRef.current ? 100 : 150;
    setTimeout(() => {
      requestAnimationFrame(() => {
        updateTargetPosition();
      });
    }, initialDelay);

    const quickUpdate = setTimeout(() => {
      updateTargetPosition();
      setIsTransitioning(false);
    }, 250);

    if (
      steps[currentStep]?.id === "review-units" ||
      steps[currentStep]?.id === "start-test"
    ) {
      updateIntervalRef.current = setInterval(updateTargetPosition, 100);
    }

    const handleResize = () => {
      requestAnimationFrame(updateTargetPosition);
    };

    const handleScroll = () => {
      userScrolling.current = true;

      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      scrollTimeout.current = setTimeout(() => {
        userScrolling.current = false;
      }, 1000);

      requestAnimationFrame(updateTargetPosition);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      clearTimeout(quickUpdate);
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [currentStep, steps, show, isFullScreenStep, scrollToTarget, scrollToTop]);

  const handleNext = () => {
    if (isTransitioning) return;

    if (currentStep < steps.length - 1) {
      setIsTransitioning(true);
      setFadeOut(true);
      lastScrollTarget.current = null;

      setTimeout(() => {
        isInternalChangeRef.current = true;
        setCurrentStep(currentStep + 1);
        setFadeOut(false);
      }, 200);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (isTransitioning) return;

    if (currentStep > 0) {
      setIsTransitioning(true);
      setFadeOut(true);
      lastScrollTarget.current = null;
      userScrolling.current = false;

      setTimeout(() => {
        isInternalChangeRef.current = true;
        setCurrentStep(currentStep - 1);
        setFadeOut(false);
      }, 200);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!show) return null;

  if (step?.customContent) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={`custom-${currentStep}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9998] flex justify-center"
        >
          {step.customContent}
        </motion.div>
      </AnimatePresence>
    );
  }

  if (!targetRect) return null;

  const tooltipPosition = getTooltipPosition(
    targetRect,
    step?.position || "bottom"
  );

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="tutorial-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[9998]"
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <mask id="spotlight-mask">
              <rect width="100%" height="100%" fill="white" />
              <motion.rect
                key={`spotlight-${currentStep}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
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
          key={`border-${currentStep}`}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{
            opacity: fadeOut ? 0 : 1,
            scale: fadeOut ? 0.92 : 1
          }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
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

        <AnimatePresence mode="wait">
          {showTooltip && (
            <motion.div
              key={`tooltip-${currentStep}`}
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{
                opacity: fadeOut ? 0 : 1,
                y: fadeOut ? -10 : 0,
                scale: fadeOut ? 0.96 : 1
              }}
              exit={{ opacity: 0, y: -10, scale: 0.96 }}
              transition={{
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1]
              }}
              className="absolute bg-white rounded-2xl shadow-2xl p-6 max-w-sm pointer-events-auto z-[9999]"
              style={{
                left: tooltipPosition.left,
                top: tooltipPosition.top
              }}
            >
              <button
                onClick={handleSkip}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
              <motion.div
                className="pr-6"
                animate={{ opacity: fadeOut ? 0 : 1 }}
                transition={{ duration: 0.2 }}
              >
                {step.icon && (
                  <div className="mb-3 text-purple-600">{step.icon}</div>
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex gap-1">
                  {steps.map((_, index) => (
                    <motion.div
                      key={index}
                      initial={false}
                      animate={{
                        width: index === currentStep ? 24 : 8,
                        backgroundColor:
                          index === currentStep ? "#9333ea" : "#d1d5db"
                      }}
                      transition={{
                        duration: 0.3,
                        ease: "easeInOut"
                      }}
                      className="h-2 rounded-full"
                    />
                  ))}
                </div>

                <div className="flex gap-2">
                  {currentStep > 0 && (
                    <motion.button
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                      onClick={handlePrev}
                      disabled={isTransitioning}
                      className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1 disabled:opacity-50"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Atrás
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNext}
                    disabled={isTransitioning}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 flex items-center gap-2 text-sm font-semibold disabled:opacity-50 shadow-md hover:shadow-lg"
                  >
                    {currentStep === steps.length - 1
                      ? "¡Empezar!"
                      : "Siguiente"}
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

function getTooltipPosition(
  targetRect: DOMRect,
  position?: string // Hacer el parámetro opcional
): { left: number; top: number } {
  const spacing = 20;
  const tooltipWidth = 384;
  const padding = 16;
  const topSpacing = 70;

  let left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
  let top = 0;

  // Usar "bottom" como valor por defecto si position es undefined
  const pos = position || "bottom";

  switch (pos) {
    case "top":
      top = targetRect.top - 220 - topSpacing;
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
