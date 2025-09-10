"use client";

import { ChevronRight } from "lucide-react";

const MenuItem = ({
  title,
  onClick
}: {
  title: string;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className="cursor-pointer w-full flex items-center justify-between p-4 text-left hover:bg-gray-800 transition-colors border-b border-gray-700 last:border-b-0"
  >
    <span className="text-white font-medium text-base">{title}</span>
    <ChevronRight className="w-5 h-5 text-gray-400" />
  </button>
);

export default MenuItem;
