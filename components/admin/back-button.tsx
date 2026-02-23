"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  fallback: string;
  className?: string;
}

export function BackButton({ fallback, className }: BackButtonProps) {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="sm"
      className={className}
      onClick={() =>
        window.history.length > 1 ? router.back() : router.push(fallback)
      }
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      Volver
    </Button>
  );
}
