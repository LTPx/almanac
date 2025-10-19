"use client";

import * as React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverArrow
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

interface StepPopoverProps {
  title?: string;
  message?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  className?: string;
  children: React.ReactNode;
  isLocked?: boolean;
  isOptional?: boolean;
}

export function StepPopover({
  title = "",
  message = "",
  buttonText,
  onButtonClick,
  className,
  children,
  isLocked = false,
  isOptional = false
}: StepPopoverProps) {
  const getPopoverClass = () => {
    if (className) return className;
    if (isLocked) return "bg-gray-700 text-white p-4";
    if (isOptional) return "bg-[#1983DD] text-white p-4";
    return "bg-[#1F941C] text-white p-4";
  };

  const getArrowClass = () => {
    if (isLocked) return "fill-gray-700";
    if (isOptional) return "fill-[#1983DD]";
    return "fill-[#1F941C]";
  };

  const getButtonTextColor = () => {
    if (isLocked) return "text-gray-400";
    if (isOptional) return "text-[#1983DD]";
    return "text-[#1F941C]";
  };

  const buttonBgColor = isLocked
    ? "bg-gray-600 hover:bg-gray-600"
    : "bg-white hover:bg-white/90";

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className={`${getPopoverClass()} rounded-xl relative`}>
        <div className="absolute top-4 right-4">
          <BookOpen className="w-6 h-6 text-white opacity-90" />
        </div>

        <div className="pr-10">
          {title && <h3 className="font-bold text-lg">{title}</h3>}
          {message && <p className="mt-2 line-clamp-4 text-sm">{message}</p>}
        </div>

        {buttonText && onButtonClick && (
          <Button
            className={`text-[15px] font-bold ${buttonBgColor} h-[60px] w-full focus-visible:ring-0 mt-3 ${getButtonTextColor()} rounded-xl`}
            onClick={onButtonClick}
            disabled={isLocked}
          >
            {buttonText}
          </Button>
        )}
        <PopoverArrow className={`${getArrowClass()} w-4 h-4`} />
      </PopoverContent>
    </Popover>
  );
}
