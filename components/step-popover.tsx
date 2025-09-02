"use client";

import * as React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface StepPopoverProps {
  title?: string;
  message?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

export function StepPopover({
  title = "",
  message = "",
  buttonText,
  onButtonClick,
  className = "bg-green-500 text-white p-4",
  children,
}: StepPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className={`${className} rounded-md`}>
        {title && <h3 className="font-bold">{title}</h3>}
        {message && <p className="mt-2">{message}</p>}
        {buttonText && onButtonClick && (
          <Button className="mt-3" onClick={onButtonClick}>
            {buttonText}
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}
