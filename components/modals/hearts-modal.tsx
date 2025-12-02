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
import { Heart } from "lucide-react";
import { useNoHeartsModal } from "@/store/no-hearts-modal";

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
      <DialogOverlay className="fixed inset-0 bg-black/20 z-[199]" />
      <DialogContent className="max-w-md z-[200]">
        <DialogHeader>
          <div className="mb-5 flex w-full items-center justify-center">
            <div className="relative">
              <Heart className="h-20 w-20 text-red-500 fill-red-500" />
              <div className="absolute -right-2 -bottom-2 bg-red-600 rounded-full w-8 h-8 flex items-center justify-center text-white text-sm font-bold">
                0
              </div>
            </div>
          </div>

          <DialogTitle className="text-center text-2xl font-bold">
            ¡Sin vidas!
          </DialogTitle>

          <DialogDescription className="text-center text-base">
            Te quedaste sin vidas. ¡Completa otras lecciones o vuelve mañana
            para obtener más!
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mb-4">
          <div className="flex w-full flex-col gap-y-4">
            <Button
              className="w-full rounded-[10px] py-[25px] text-[15px] bg-blue-500 hover:bg-blue-600"
              size="lg"
              onClick={handleGetHearts}
            >
              Obtener Vidas
            </Button>

            {/* <Button
              variant="ghost"
              className="w-full"
              size="lg"
              onClick={close}
            >
              Volver
            </Button> */}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
