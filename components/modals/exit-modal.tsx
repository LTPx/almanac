"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle
} from "@/components/ui/dialog";
import { useExitModal } from "@/store/use-exit-modal";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, LogOut, Sparkles, AlertCircle } from "lucide-react";

interface ExitModalProps {
  onEndSession?: () => void;
}

export const ExitModal = ({ onEndSession }: ExitModalProps) => {
  const [isClient, setIsClient] = useState(false);
  const { isOpen, close } = useExitModal();

  useEffect(() => setIsClient(true), []);

  if (!isClient) return null;

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogOverlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[199]" />
      <DialogContent className="w-[calc(100%-2rem)] max-w-md sm:w-full z-[200] border-border/50 bg-gradient-to-b from-card via-card to-background overflow-hidden p-6 sm:p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

        <DialogHeader className="relative z-10">
          <div className="mb-6 sm:mb-8 flex w-full items-center justify-center">
            <AnimatePresence mode="wait">
              {isOpen && (
                <motion.div
                  initial={{ scale: 0, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: 0.1
                  }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                  <motion.div
                    animate={{
                      rotate: [0, -10, 10, -10, 0]
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      repeatDelay: 0.5
                    }}
                    className="relative bg-card rounded-full p-1.5 sm:p-2 shadow-lg"
                  >
                    <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 p-4 sm:p-6 rounded-full shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                      <AlertCircle className="h-10 w-10 sm:h-14 sm:w-14 text-amber-500 stroke-[2.5]" />
                    </div>
                  </motion.div>

                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{
                        scale: [0, 1, 0],
                        opacity: [0, 0.8, 0],
                        x: [0, Math.cos((i * 60 * Math.PI) / 180) * 35],
                        y: [0, Math.sin((i * 60 * Math.PI) / 180) * 35]
                      }}
                      transition={{
                        duration: 2,
                        delay: 0.3 + i * 0.1,
                        repeat: Infinity,
                        repeatDelay: 1
                      }}
                      className="absolute w-1.5 h-1.5 bg-amber-500/50 rounded-full"
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="space-y-2 sm:space-y-3"
          >
            <DialogTitle className="text-center text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-tight">
              ¡Espera, no te vayas!
            </DialogTitle>

            <DialogDescription className="text-center text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
              Estás a punto de salir de la lección. ¿Estás seguro de que quieres
              abandonar tu progreso?
            </DialogDescription>
          </motion.div>
        </DialogHeader>

        <DialogFooter className="mb-2 relative z-10 mt-6 sm:mt-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="flex w-full flex-col gap-y-3"
          >
            <Button
              className="w-full rounded-xl py-4 sm:py-5 md:py-6 text-xs sm:text-sm md:text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group"
              size="lg"
              onClick={close}
            >
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform flex-shrink-0" />
              <span className="truncate">Continuar Aprendiendo</span>
              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-primary-foreground/70 group-hover:text-primary-foreground transition-colors flex-shrink-0" />
            </Button>

            <Button
              variant="ghost"
              className="w-full text-muted-foreground hover:text-foreground transition-colors py-4 sm:py-5 md:py-6 text-xs sm:text-sm md:text-base flex items-center justify-center gap-2 group"
              size="lg"
              onClick={() => {
                close();
                if (onEndSession) {
                  onEndSession();
                }
              }}
            >
              <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              <span>Terminar Sesión</span>
            </Button>
          </motion.div>
        </DialogFooter>

        <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-gradient-to-tr from-accent/5 to-transparent rounded-tr-full pointer-events-none" />
      </DialogContent>
    </Dialog>
  );
};
