"use client";

import { Infinity, X } from "lucide-react";
import Image from "next/image";
import { useExitModal } from "@/store/use-exit-modal";
import { ExitModal } from "./modals/exit-modal";
import { SuccessProgressBar } from "./animate.progress-bar";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

type HeaderProps = {
  hearts: number;
  percentage: number;
  hasActiveSubscription: boolean;
  justAnsweredCorrect?: boolean;
  onClose?: () => void;
  isTutorialMode?: boolean;
};

export const HeaderBar = ({
  hearts,
  percentage,
  hasActiveSubscription,
  justAnsweredCorrect = false,
  onClose,
  isTutorialMode = false
}: HeaderProps) => {
  const { open } = useExitModal();
  const [previousHearts, setPreviousHearts] = useState(hearts);
  const [isHeartLost, setIsHeartLost] = useState(false);

  useEffect(() => {
    if (hearts < previousHearts) {
      setIsHeartLost(true);
      setTimeout(() => setIsHeartLost(false), 1000);
    }
    setPreviousHearts(hearts);
  }, [hearts, previousHearts]);

  const handleClose = () => {
    if (isTutorialMode && onClose) {
      onClose();
    } else {
      open();
    }
  };

  return (
    <>
      <header className="mx-auto flex w-full max-w-[1140px] items-center justify-between gap-x-4 lg:gap-x-7 px-6 lg:px-10 pt-[20px] lg:pt-[50px]">
        <X
          onClick={handleClose}
          className="cursor-pointer text-slate-500 transition hover:opacity-75"
        />

        <div className="flex-1 lg:mx-4">
          <SuccessProgressBar
            value={percentage}
            triggerSuccess={justAnsweredCorrect}
          />
        </div>

        <div className="relative flex items-center font-bold text-rose-500">
          <AnimatePresence>
            {isHeartLost && (
              <motion.div
                initial={{ opacity: 1, scale: 1, y: 0 }}
                animate={{ opacity: 0, scale: 1.5, y: -30 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute left-0 top-0"
              >
                <Image
                  src="/heart.svg"
                  height={28}
                  width={28}
                  alt="Heart Lost"
                  className="mr-2"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            animate={
              isHeartLost
                ? {
                    x: [-5, 5, -5, 5, 0],
                    scale: [1, 0.9, 0.9, 1]
                  }
                : {}
            }
            transition={{ duration: 0.5 }}
          >
            <Image
              src="/heart.svg"
              height={28}
              width={28}
              alt="Heart"
              className="mr-2"
            />
          </motion.div>

          <motion.span
            key={hearts}
            initial={{ scale: 1 }}
            animate={
              isHeartLost
                ? {
                    scale: [1, 1.3, 1],
                    color: ["#f43f5e", "#ef4444", "#f43f5e"]
                  }
                : {}
            }
            transition={{ duration: 0.5 }}
          >
            {hasActiveSubscription ? (
              <Infinity className="h-6 w-6 shrink-0 stroke-[3]" />
            ) : (
              hearts
            )}
          </motion.span>
        </div>
      </header>

      {!isTutorialMode && <ExitModal onEndSession={onClose} />}
    </>
  );
};
