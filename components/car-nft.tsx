"use client";

import React from "react";

interface CardNFTProps {
  image: string;
  title: string;
  description?: string;
  onClick?: () => void;
}

export const CardNFT: React.FC<CardNFTProps> = ({ image, title, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-lg overflow-hidden border border-gray-700"
    >
      <img
        src={image}
        alt={title}
        className="w-full h-32 object-cover bg-gray-800"
      />
      <div className="p-2">
        <h3 className="text-center text-white text-base font-medium">
          {title}
        </h3>
      </div>
    </div>
  );
};
