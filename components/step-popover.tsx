"use client";

import * as React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverArrow
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
  className = "bg-[#1F941C] text-white p-4",
  children
}: StepPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className={`${className} rounded-md relative`}>
        {title && <h3 className="font-bold">{title}</h3>}
        {message && <p className="mt-2">{message}</p>}
        {buttonText && onButtonClick && (
          <Button
            className="text-[15px] font-bold bg-white h-[60px] w-full focus-visible:ring-0 hover:bg-white/90 mt-3 text-[#1F941C]"
            onClick={onButtonClick}
          >
            {buttonText}
          </Button>
        )}
        <PopoverArrow className="fill-[#1F941C] w-4 h-4" />
      </PopoverContent>
    </Popover>
  );
}
