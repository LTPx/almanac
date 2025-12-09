"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { Heart, ShoppingBag, Sparkles } from "lucide-react";
import { useNoHeartsModal } from "@/store/no-hearts-modal";
import { motion, AnimatePresence } from "framer-motion";

export const NoHeartsModal = () => {
  const [isClient, setIsClient] = useState(false);
  const { isOpen, close } = useNoHeartsModal();
  const router = useRouter();

  useEffect(() => setIsClient(true), []);

  if (!isClient) return null;

  const handleGetHearts = () => {
    close();
    router.push("/store");
  };

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogOverlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[199]" />
      <DialogContent className="max-w-md z-[200] border-border/50 bg-gradient-to-b from-card via-card to-background overflow-hidden p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 via-transparent to-transparent pointer-events-none" />

        <DialogHeader className="relative z-10">
          <div className="mb-8 flex w-full items-center justify-center">
            <AnimatePresence mode="wait">
              {isOpen && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: 0.1
                  }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-destructive/30 rounded-full blur-2xl animate-pulse" />

                  <div className="relative bg-card rounded-full p-2 shadow-lg">
                    <div className="bg-gradient-to-br from-destructive to-destructive/80 p-6 rounded-full shadow-[0_0_30px_rgba(237,83,40,0.4)]">
                      <Heart className="h-14 w-14 text-white fill-white" />
                    </div>
                  </div>

                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
                    className="absolute -right-1 -bottom-1 bg-destructive rounded-full w-9 h-9 flex items-center justify-center text-white text-base font-bold shadow-lg ring-4 ring-card"
                  >
                    0
                  </motion.div>

                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0],
                        x: [0, Math.cos((i * 60 * Math.PI) / 180) * 60],
                        y: [0, Math.sin((i * 60 * Math.PI) / 180) * 60]
                      }}
                      transition={{
                        duration: 1.2,
                        delay: 0.3 + i * 0.08,
                        ease: "easeOut"
                      }}
                      className="absolute w-1.5 h-1.5 bg-destructive/60 rounded-full"
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
            className="space-y-3"
          >
            <DialogTitle className="text-center text-3xl font-bold text-foreground">
              ¡Sin Corazones!
            </DialogTitle>

            <DialogDescription className="text-center text-base text-muted-foreground leading-relaxed px-4">
              Te quedaste sin corazones. ¡Completa otras lecciones o vuelve
              mañana para obtener más!
            </DialogDescription>
          </motion.div>
        </DialogHeader>

        <DialogFooter className="mb-2 relative z-10 mt-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="flex w-full"
          >
            <Button
              className="w-full rounded-xl py-6 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group"
              size="lg"
              onClick={handleGetHearts}
            >
              <ShoppingBag className="h-5 w-5 group-hover:rotate-12 transition-transform" />
              Obtener Corazones
              <Sparkles className="h-4 w-4 text-primary-foreground/70 group-hover:text-primary-foreground transition-colors" />
            </Button>
          </motion.div>
        </DialogFooter>

        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-accent/5 to-transparent rounded-tr-full pointer-events-none" />
      </DialogContent>
    </Dialog>
  );
};
