"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
      <DialogOverlay className="fixed inset-0 bg-black/50 z-[199]" />
      <DialogContent className="max-w-md z-[200]">
        <DialogHeader>
          <div className="mb-5 flex w-full items-center justify-center">
            <Image
              src="/mascot_sad.svg"
              alt="Mascot Sad"
              height={80}
              width={80}
            />
          </div>

          <DialogTitle className="text-center text-2xl font-bold">
            Wait, don&apos;t go!
          </DialogTitle>

          <DialogDescription className="text-center text-base">
            You&apos;re about to leave the lesson. Are you sure?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mb-4">
          <div className="flex w-full flex-col gap-y-4">
            <Button
              className="w-full rounded-[10px] py-[25px] text-[15px]"
              size="lg"
              onClick={close}
            >
              Keep learning
            </Button>

            <Button
              variant="ghost"
              className="w-full"
              size="lg"
              onClick={() => {
                close();
                if (onEndSession) {
                  onEndSession();
                }
                // router.push("/home");
              }}
            >
              End session
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
