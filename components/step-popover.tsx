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
import { useRouter } from "next/navigation";

interface StepPopoverProps {
  title?: string;
  message?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  className?: string;
  children: React.ReactNode;
  isLocked?: boolean;
  isOptional?: boolean;
  isFirstMandatory?: boolean;
}

export function StepPopover({
  title = "",
  message = "",
  buttonText,
  onButtonClick,
  className,
  children,
  isLocked = false,
  isOptional = false,
  isFirstMandatory = false
}: StepPopoverProps) {
  const router = useRouter();

  const getPopoverClass = () => {
    if (className) return className;
    if (isLocked) return "bg-gray-700 text-white p-4";
    if (isFirstMandatory) return "bg-[#F9F0B6] text-gray-900 p-4";
    if (isOptional) return "bg-[#1983DD] text-white p-4";
    return "bg-[#1F941C] text-white p-4";
  };

  const getArrowClass = () => {
    if (isLocked) return "fill-gray-700";
    if (isFirstMandatory) return "fill-[#F9F0B6]";
    if (isOptional) return "fill-[#1983DD]";
    return "fill-[#1F941C]";
  };

  const getButtonTextColor = () => {
    if (isLocked) return "text-gray-400";
    if (isFirstMandatory) return "text-gray-900";
    if (isOptional) return "text-[#1983DD]";
    return "text-[#1F941C]";
  };

  const getIconColor = () => {
    if (isFirstMandatory) return "text-gray-900 opacity-90";
    return "text-white opacity-90";
  };

  const buttonBgColor = isLocked
    ? "bg-gray-600 hover:bg-gray-600"
    : "bg-white hover:bg-white/90";

  const handleBookClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push("/contents");
  };

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className={`${getPopoverClass()} rounded-xl relative`}>
        <button
          onClick={handleBookClick}
          className="absolute top-4 right-4 hover:scale-110 transition-transform cursor-pointer focus:outline-none"
          aria-label="Ver contenidos"
        >
          <BookOpen className={`w-6 h-6 ${getIconColor()} hover:opacity-100`} />
        </button>

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
