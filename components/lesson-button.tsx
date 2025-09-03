"use client";

import { Check, Crown, Star } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LessonButtonProps = {
  id: number;
  index: number;
  totalCount: number;
  locked?: boolean;
  current?: boolean;
  completed?: boolean;
};

export const LessonButton = ({
  id,
  index,
  totalCount,
  locked,
  current,
  completed,
}: LessonButtonProps) => {
  const isFirst = index === 0;
  const isLast = index === totalCount;

  const Icon = completed ? Check : isLast ? Crown : Star;

  // Color según estado
  const bgColor = completed
    ? "bg-green-500 text-white"
    : locked
    ? "bg-white text-neutral-400 border border-neutral-300"
    : "bg-white text-black border border-neutral-300";

  const href = locked ? "#" : `/lesson/${id}`;

  return (
    <Link
      href={href}
      aria-disabled={locked}
      style={{ pointerEvents: locked ? "none" : "auto" }}
    >
      <div
        className="relative"
        style={{
          marginTop: isFirst ? 24 : 12,
        }}
      >
        <Button
          className={cn(
            "h-24 w-24 flex flex-col items-center justify-center rounded-md transition-colors duration-300",
            bgColor
          )}
        >
          <Icon className="h-8 w-8 mb-1" />
          {!current && !locked && <span className="text-sm font-medium">Lesson {index + 1}</span>}
          {current && <span className="text-sm font-medium uppercase text-green-600">Start</span>}
        </Button>
      </div>
    </Link>
  );
};
