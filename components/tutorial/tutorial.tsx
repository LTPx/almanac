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
  beforeStepChange?: () => void;
  hideTooltip?: boolean;
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
  const [containerBounds, setContainerBounds] = useState<DOMRect | null>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInternalChangeRef = useRef(false);

  const userScrolling = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastScrollTarget = useRef<Element | "top" | null>(null);

  const step = steps[currentStep];
  const isFullScreenStep = step?.isFullScreen || false;

  const showTooltip = !step?.hideTooltip;

  useEffect(() => {
    const updateContainerBounds = () => {
      const mainContainer = document.querySelector("main")?.parentElement;
      if (mainContainer) {
        setContainerBounds(mainContainer.getBoundingClientRect());
      }
    };

    updateContainerBounds();
    window.addEventListener("resize", updateContainerBounds);

    return () => window.removeEventListener("resize", updateContainerBounds);
  }, []);

  useEffect(() => {
    if (show && !step) {
      onComplete();
    }
  }, [show, step, onComplete]);

  useEffect(() => {
    if (step?.id !== "review-units") return;

    const handleCurriculumChange = () => {
      setTimeout(() => {
        if (!isTransitioning) {
          handleNext();
        }
      }, 400);
    };

    window.addEventListener("curriculum-changed", handleCurriculumChange);

    return () => {
      window.removeEventListener("curriculum-changed", handleCurriculumChange);
    };
  }, [step, isTransitioning]);

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
    if (!show || isFullScreenStep || !step) return;

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
        target = document.querySelector('[data-tutorial-book="true"]');

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
  }, [
    currentStep,
    steps,
    show,
    isFullScreenStep,
    step,
    scrollToTarget,
    scrollToTop
  ]);

  const handleNext = () => {
    if (isTransitioning) return;

    if (currentStep < steps.length - 1) {
      const nextStep = steps[currentStep + 1];
      if (nextStep?.beforeStepChange) {
        nextStep.beforeStepChange();
      }

      setIsTransitioning(true);
      setFadeOut(true);
      setTargetRect(null);
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
      const prevStep = steps[currentStep - 1];
      if (prevStep?.id === "review-units") {
      } else {
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

      setIsTransitioning(true);
      setFadeOut(true);
      setTargetRect(null);
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

  const handleSpotlightClick = (e: React.MouseEvent) => {
    if (!targetRect || isTransitioning) return;

    if (step?.id === "review-units") {
      return;
    }

    const clickX = e.clientX;
    const clickY = e.clientY;

    const isInsideSpotlight =
      clickX >= targetRect.left - 8 &&
      clickX <= targetRect.right + 8 &&
      clickY >= targetRect.top - 8 &&
      clickY <= targetRect.bottom + 8;

    if (isInsideSpotlight) {
      handleNext();
    }
  };

  if (!show || !step) return null;

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

  const tooltipPosition = showTooltip
    ? getTooltipPosition(
        targetRect,
        step?.position || "bottom",
        containerBounds
      )
    : { left: 0, top: 0 };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="tutorial-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[9998]"
        onClick={step?.id === "review-units" ? undefined : handleSpotlightClick}
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

        {step?.id !== "review-units" && (
          <motion.div
            key={`clickable-area-${currentStep}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute cursor-pointer z-[9999] hover:bg-purple-500/10 transition-colors rounded-xl"
            style={{
              left: targetRect.left - 12,
              top: targetRect.top - 12,
              width: targetRect.width + 24,
              height: targetRect.height + 24
            }}
            title="Click para continuar"
          />
        )}

        {!showTooltip && (
          <motion.div
            key={`click-here-tooltip-${currentStep}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: fadeOut ? 0 : 1,
              scale: fadeOut ? 0.9 : 1
            }}
            transition={{
              opacity: { duration: 0.3 },
              scale: { duration: 0.3 }
            }}
            className="absolute z-[10000]"
            style={{
              left: targetRect.left + targetRect.width / 2 - 100,
              top: targetRect.top - 100,
              transform: "translateX(-50%)"
            }}
          >
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-3 pointer-events-auto">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  disabled={currentStep === 0 || isTransitioning}
                  className="bg-purple-500 hover:bg-purple-600 text-white p-2.5 rounded-full shadow-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-purple-500"
                  title="Paso anterior"
                >
                  <ArrowLeft className="w-4 h-4" />
                </motion.button>

                <motion.div
                  animate={{
                    y: [-3, 3, -3]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="bg-purple-600 text-white px-5 py-2.5 rounded-xl shadow-2xl font-semibold text-sm flex flex-col items-center gap-1"
                >
                  <span>Click aquí</span>
                  <span className="text-xs text-purple-200 font-medium">
                    {currentStep + 1} / {steps.length}
                  </span>
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  disabled={isTransitioning}
                  className="bg-purple-500 hover:bg-purple-600 text-white p-2.5 rounded-full shadow-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Siguiente paso"
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>

              <motion.div
                animate={{
                  y: [-3, 3, -3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-0 h-0 mt-[-1px] pointer-events-none"
                style={{
                  borderLeft: "10px solid transparent",
                  borderRight: "10px solid transparent",
                  borderTop: "10px solid rgb(147, 51, 234)"
                }}
              />
            </div>
          </motion.div>
        )}

        {showTooltip ? (
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
        ) : (
          <>
            <motion.div
              key={`intense-glow-${currentStep}`}
              className="absolute pointer-events-none z-[9998] rounded-2xl"
              style={{
                left: targetRect.left - 8,
                top: targetRect.top - 8,
                width: targetRect.width + 16,
                height: targetRect.height + 16
              }}
              initial={{ opacity: 0 }}
              animate={{
                opacity: fadeOut ? 0 : 1,
                boxShadow: fadeOut
                  ? "none"
                  : [
                      "0 0 20px 5px rgba(168, 85, 247, 0.6), 0 0 40px 10px rgba(168, 85, 247, 0.4), 0 0 60px 15px rgba(168, 85, 247, 0.2)",
                      "0 0 30px 8px rgba(168, 85, 247, 0.8), 0 0 60px 15px rgba(168, 85, 247, 0.5), 0 0 90px 20px rgba(168, 85, 247, 0.3)",
                      "0 0 20px 5px rgba(168, 85, 247, 0.6), 0 0 40px 10px rgba(168, 85, 247, 0.4), 0 0 60px 15px rgba(168, 85, 247, 0.2)"
                    ]
              }}
              transition={{
                opacity: { duration: 0.3 },
                boxShadow: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
            />

            <motion.div
              key={`intense-border-${currentStep}`}
              className="absolute pointer-events-none z-[9999] rounded-2xl border-4"
              style={{
                left: targetRect.left - 8,
                top: targetRect.top - 8,
                width: targetRect.width + 16,
                height: targetRect.height + 16,
                borderColor: "rgb(168, 85, 247)"
              }}
              animate={{
                opacity: [0.4, 0.8, 0.4]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            <motion.div
              key={`outer-ring-${currentStep}`}
              className="absolute pointer-events-none z-[9997] rounded-2xl border-2 border-purple-400"
              style={{
                left: targetRect.left - 12,
                top: targetRect.top - 12,
                width: targetRect.width + 24,
                height: targetRect.height + 24
              }}
              animate={{
                opacity: [0.2, 0.5, 0.2],
                scale: [1, 1.01, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </>
        )}

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
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleSkip}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
              <motion.div
                className="pr-6"
                animate={{ opacity: fadeOut ? 0 : 1 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  {step.description}
                </p>
              </motion.div>

              <div className="mb-5">
                <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${((currentStep + 1) / steps.length) * 100}%`
                    }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="h-full bg-purple-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePrev}
                    disabled={isTransitioning || currentStep === 0}
                    className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Atras
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNext}
                    disabled={isTransitioning}
                    className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 text-sm font-medium disabled:opacity-50 shadow-md hover:shadow-lg"
                  >
                    {currentStep === steps.length - 1
                      ? "¡Empezar!"
                      : "Siguiente"}
                  </motion.button>
                </div>

                <div className="text-sm text-gray-400 font-medium">
                  {currentStep + 1} de {steps.length}
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
  position?: string,
  containerBounds?: DOMRect | null
): { left: number; top: number } {
  const spacing = 20;
  const tooltipWidth = 384;
  const padding = 16;
  const topSpacing = 70;

  const minX = containerBounds?.left ?? padding;
  const maxX = containerBounds?.right ?? window.innerWidth - padding;

  let left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
  let top = 0;

  const pos = position || "bottom";

  switch (pos) {
    case "top":
      top = targetRect.top - 190 - topSpacing;
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

  if (left < minX) {
    left = minX;
  }
  if (left + tooltipWidth > maxX) {
    left = maxX - tooltipWidth;
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
