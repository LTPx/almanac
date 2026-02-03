"use client";

import React from "react";
import Link from "next/link";

interface CardNFTProps {
  image: string;
  title: string;
  description?: string;
  onClick?: () => void;
  id: string;
  rarity?: string;
}

const rarityColors: Record<string, string> = {
  NORMAL: "text-gray-400",
  RARE: "text-blue-400",
  EPIC: "text-purple-400",
  UNIQUE: "text-yellow-400"
};

const rarityLabels: Record<string, string> = {
  NORMAL: "Normal",
  RARE: "Rare",
  EPIC: "Epic",
  UNIQUE: "Unique"
};

export const CardNFT: React.FC<CardNFTProps> = ({
  image,
  title,
  onClick,
  id,
  rarity = "NORMAL"
}) => {
  const rarityColor = rarityColors[rarity];
  const rarityLabel = rarityLabels[rarity];

  return (
    <Link href={`/achievements/${id}`}>
      <button
        onClick={onClick}
        className="relative aspect-square rounded-xl overflow-hidden bg-gray-800 hover:opacity-80 hover:scale-[1.02] transition-all active:scale-95"
      >
        <img
          src={image || "/placeholder.png"}
          alt={title || "NFT"}
          className="object-cover w-full h-full"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
          <p className="text-xs font-medium truncate text-white">
            {title || "NFT"}
          </p>
        </div>
        {rarity && (
          <div
            className={`absolute top-2 right-2 ${rarityColor} bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-semibold`}
          >
            {rarityLabel}
          </div>
        )}
      </button>
    </Link>
  );
};
