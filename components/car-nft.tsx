"use client";

import React from "react";

interface CardNFTProps {
  image: string;
  title: string;
}

export const CardNFT: React.FC<CardNFTProps> = ({ image, title }) => {
  return (
    <div className="cursor-pointer rounded-lg overflow-hidden border border-gray-700 hover:shadow-lg transition-shadow">
      <img src={image} alt={title} className="w-full h-32 object-cover" />
      <div className="p-2">
        <h3 className="text-white text-base font-medium">{title}</h3>
      </div>
    </div>
  );
};
