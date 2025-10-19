import { InfinityIcon, Clock, Target } from "lucide-react";
import Image from "next/image";

import { cn } from "@/lib/utils";

type ResultCardProps = {
  value: number | string;
  variant: "points" | "hearts" | "speed" | "accuracy";
  speed?: "rapid" | "normal" | "slow";
};

export const ResultCard = ({ value, variant, speed }: ResultCardProps) => {
  const getImageSrc = () => {
    if (variant === "points") return "/points.svg";
    if (variant === "hearts") return "/heart.svg";
    return null;
  };

  const getTitle = () => {
    if (variant === "hearts") return "Hearts Left";
    if (variant === "points") return "Total XP";
    if (variant === "speed") {
      if (speed === "rapid") return "Rápido";
      if (speed === "slow") return "Lento";
      return "Normal";
    }
    if (variant === "accuracy") return "Exacto";
    return "";
  };

  const getBorderColor = () => {
    if (variant === "points") return "border-orange-400";
    if (variant === "hearts") return "border-rose-500";
    if (variant === "speed") {
      if (speed === "rapid") return "border-[#4A5FCC]";
      if (speed === "slow") return "border-orange-500";
      return "border-blue-500";
    }
    if (variant === "accuracy") return "border-[#2ECC71]";
    return "";
  };

  const getBgColor = () => {
    if (variant === "points") return "bg-orange-400";
    if (variant === "hearts") return "bg-rose-500";
    if (variant === "speed") {
      if (speed === "rapid") return "bg-[#4A5FCC]";
      if (speed === "slow") return "bg-orange-500";
      return "bg-blue-500";
    }
    if (variant === "accuracy") return "bg-[#2ECC71]";
    return "";
  };

  const getTextColor = () => {
    if (variant === "points") return "text-orange-400";
    if (variant === "hearts") return "text-rose-500";
    if (variant === "speed") {
      if (speed === "rapid") return "text-[#4A5FCC]";
      if (speed === "slow") return "text-orange-500";
      return "text-blue-500";
    }
    if (variant === "accuracy") return "text-[#2ECC71]";
    return "";
  };

  const getIcon = () => {
    const imageSrc = getImageSrc();
    if (imageSrc) {
      return (
        <Image
          src={imageSrc}
          alt={variant}
          height={30}
          width={30}
          className="mr-1.5"
        />
      );
    }
    if (variant === "speed") {
      return <Clock className="h-7 w-7 mr-1.5 stroke-[2.5]" />;
    }
    if (variant === "accuracy") {
      return <Target className="h-7 w-7 mr-1.5 stroke-[2.5]" />;
    }
    return null;
  };

  // const imageSrc = getImageSrc();

  return (
    <div
      className={cn(
        "w-full rounded-2xl border-2",
        getBorderColor(),
        getBgColor()
      )}
    >
      <div
        className={cn(
          "rounded-t-xl p-1.5 text-center text-xs font-bold uppercase text-white",
          getBgColor()
        )}
      >
        {getTitle()}
      </div>

      <div
        className={cn(
          "flex items-center justify-center rounded-2xl bg-background p-6 text-lg font-bold",
          getTextColor()
        )}
      >
        {getIcon()}
        {typeof value === "number" && value === Infinity ? (
          <InfinityIcon className="h-6 w-6 stroke-[3]" />
        ) : variant === "accuracy" ? (
          `${value}%`
        ) : (
          value
        )}
      </div>
    </div>
  );
};
