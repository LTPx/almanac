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
      <DialogOverlay className="fixed inset-0 z-[199]" />
      <DialogContent
        className="max-w-md z-[200]"
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <div className="mb-5 flex w-full items-center justify-center">
            <div className="relative">
              <Image
                src="/mascot_sad.svg"
                alt="Mascota triste"
                width={120}
                height={120}
              />
              <div className="absolute -right-2 -top-2">
                <Heart className="h-12 w-12 text-red-500 fill-red-500 opacity-100" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-lg font-bold">0</span>
                </div>
              </div>
            </div>
          </div>

          <DialogTitle className="text-center text-2xl font-bold text-white">
            ¡Te quedaste sin vidas!
          </DialogTitle>
        </DialogHeader>

        <DialogFooter className="mb-4">
          <div className="flex w-full flex-col gap-y-3">
            <Button
              className="w-full rounded-2xl py-6 text-lg font-bold bg-blue-500 hover:bg-blue-600"
              size="lg"
              onClick={handleRefill}
            >
              <Zap className="w-5 h-5 mr-2 fill-yellow-300 text-yellow-300" />
              RECARGA
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-2xl py-6 text-lg font-bold border-2 border-gray-600 hover:bg-gray-700 text-white"
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
