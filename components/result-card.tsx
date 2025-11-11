import { InfinityIcon, Clock, Target, Star } from "lucide-react";
import Image from "next/image";

import { cn } from "@/lib/utils";

type ResultCardProps = {
  value: number | string;
  variant: "points" | "hearts" | "speed" | "accuracy";
  speed?: "rapid" | "normal" | "slow";
  accuracyLabel?: string;
};

export const ResultCard = ({
  value,
  variant,
  speed,
  accuracyLabel
}: ResultCardProps) => {
  const getImageSrc = () => {
    if (variant === "hearts") return "/heart.svg";
    return null;
  };

  const getTitle = () => {
    if (variant === "hearts") return "Hearts Left";
    if (variant === "points") return "Experiencia";
    if (variant === "speed") {
      if (speed === "rapid") return "Rápido";
      if (speed === "slow") return "Lento";
      return "Normal";
    }
    if (variant === "accuracy") return accuracyLabel || "Exacto";
    return "";
  };

  const getBorderColor = () => {
    if (variant === "points") return "border-[#EFFF0A]";
    if (variant === "hearts") return "border-rose-500";
    if (variant === "speed") {
      if (speed === "rapid") return "border-[#4A5FCC]";
      if (speed === "slow") return "border-orange-500";
      return "border-blue-500";
    }

    if (variant === "accuracy") {
      const score =
        typeof value === "number" ? value : parseInt(value as string);
      if (score === 100) return "border-[#2ECC71]";
      if (score >= 90) return "border-[#3498DB]";
      if (score >= 80) return "border-[#9B59B6]";
      if (score >= 70) return "border-[#F39C12]";
      return "border-[#E67E22]";
    }
    return "";
  };

  const getBgColor = () => {
    if (variant === "points") return "bg-[#EFFF0A]";
    if (variant === "hearts") return "bg-rose-500";
    if (variant === "speed") {
      if (speed === "rapid") return "bg-[#4A5FCC]";
      if (speed === "slow") return "bg-orange-500";
      return "bg-blue-500";
    }

    if (variant === "accuracy") {
      const score =
        typeof value === "number" ? value : parseInt(value as string);
      if (score === 100) return "bg-[#2ECC71]";
      if (score >= 90) return "bg-[#3498DB]";
      if (score >= 80) return "bg-[#9B59B6]";
      if (score >= 70) return "bg-[#F39C12]";
      return "bg-[#E67E22]";
    }
    return "";
  };

  const getTextColor = () => {
    if (variant === "points") return "text-[#EFFF0A]";
    if (variant === "hearts") return "text-rose-500";
    if (variant === "speed") {
      if (speed === "rapid") return "text-[#4A5FCC]";
      if (speed === "slow") return "text-orange-500";
      return "text-blue-500";
    }

    if (variant === "accuracy") {
      const score =
        typeof value === "number" ? value : parseInt(value as string);
      if (score === 100) return "text-[#2ECC71]";
      if (score >= 90) return "text-[#3498DB]";
      if (score >= 80) return "text-[#9B59B6]";
      if (score >= 70) return "text-[#F39C12]";
      return "text-[#E67E22]";
    }
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
    if (variant === "points") {
      return <Star className="h-7 w-7 mr-1.5 stroke-[2.5] fill-[#EFFF0A]" />;
    }
    if (variant === "speed") {
      return <Clock className="h-7 w-7 mr-1.5 stroke-[2.5]" />;
    }
    if (variant === "accuracy") {
      return <Target className="h-7 w-7 mr-1.5 stroke-[2.5]" />;
    }
    return null;
  };

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
          "rounded-t-xl p-1.5 text-center text-xs font-bold uppercase text-[#272A33]",
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
