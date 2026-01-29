"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle
} from "@/components/ui/dialog";
import { Heart, Zap } from "lucide-react";
import { useNoHeartsTestModal } from "@/store/use-no-hearts-test-modal";
import Image from "next/image";

export const NoHeartsTestModal = () => {
  const [isClient, setIsClient] = useState(false);
  const { isOpen, close, onRefill, onExit } = useNoHeartsTestModal();

  useEffect(() => setIsClient(true), []);

  if (!isClient) return null;

  const handleRefill = () => {
    if (onRefill) onRefill();
    close();
  };

  const handleExit = () => {
    if (onExit) onExit();
    close();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) return;
      }}
    >
      <DialogOverlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[199]" />
      <DialogContent
        className="w-[calc(100%-2rem)] max-w-md sm:w-full z-[200] p-6 sm:p-8"
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <div className="mb-4 sm:mb-5 flex w-full items-center justify-center">
            <div className="relative">
              <Image
                src="/mascot_sad.svg"
                alt="Mascota triste"
                width={100}
                height={100}
                className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32"
              />
              <div className="absolute -right-1 sm:-right-2 -top-1 sm:-top-2">
                <Heart className="h-9 w-9 sm:h-11 sm:w-11 md:h-12 md:w-12 text-red-500 fill-red-500 opacity-100" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-base sm:text-lg font-bold">
                    0
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogTitle className="text-center text-xl sm:text-2xl font-bold text-white leading-tight">
            ¡Te quedaste sin vidas!
          </DialogTitle>
        </DialogHeader>

        <DialogFooter className="mb-2 sm:mb-4 mt-4 sm:mt-6">
          <div className="flex w-full flex-col gap-y-3">
            <Button
              className="w-full rounded-2xl py-4 sm:py-5 md:py-6 text-sm sm:text-base md:text-lg font-bold bg-blue-500 hover:bg-blue-600 flex items-center justify-center gap-2"
              size="lg"
              onClick={handleRefill}
            >
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-300 text-yellow-300 flex-shrink-0" />
              <span>RECARGA</span>
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-2xl py-4 sm:py-5 md:py-6 text-sm sm:text-base md:text-lg font-bold border-2 border-gray-600 hover:bg-gray-700 text-white"
              size="lg"
              onClick={handleExit}
            >
              Salir del Examen
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
