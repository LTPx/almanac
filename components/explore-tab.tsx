"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";

interface NFTAsset {
  id: number;
  name: string;
  imageUrl: string;
  rarity: string;
  isUsed: boolean;
}

interface ExploreTabProps {
  nfts: any[];
  isActive: boolean;
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

export function ExploreTab({ nfts, isActive }: ExploreTabProps) {
  const router = useRouter();
  const [availableNFTs, setAvailableNFTs] = useState<NFTAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (isActive && !hasFetched) {
      fetchAvailableNFTs();
    }
  }, [isActive, hasFetched]);

  const fetchAvailableNFTs = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/nft-assets?isUsed=false");

      if (!response.ok) {
        throw new Error("Error fetching NFT assets");
      }

      const data = await response.json();
      console.log("Available NFT Assets:", data);

      setAvailableNFTs(data.nftAssets || []);
      setHasFetched(true);
    } catch (error) {
      console.error("Error fetching available NFTs:", error);
      setAvailableNFTs([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 px-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg bg-gray-700" />
          ))}
        </div>
      </div>
    );
  }

  if (availableNFTs.length === 0 && nfts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="mt-[-250px] flex flex-col items-center gap-4 max-w-sm mx-auto text-center">
          <div className="w-20 h-20 rounded-full border-2 border-gray-600 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-gray-500" strokeWidth={1.5} />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">
              ¡Explora la colección!
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Obtén tu primera medalla para explorar la colección completa
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (availableNFTs.length === 0 && nfts.length > 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="mt-[-250px] flex flex-col items-center gap-4 max-w-sm mx-auto text-center">
          <div className="w-20 h-20 rounded-full border-2 border-gray-600 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-gray-500" strokeWidth={1.5} />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">
              ¡Completaste todas las medallas!
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Has obtenido todas las medallas disponibles
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {availableNFTs.map((nft) => {
          const rarityColor = rarityColors[nft.rarity || "NORMAL"];
          const rarityLabel = rarityLabels[nft.rarity || "NORMAL"];

          return (
            <button
              key={nft.id}
              onClick={() => router.push(`/achievements/nft/${nft.id}`)}
              className="relative aspect-square rounded-xl overflow-hidden bg-gray-800 hover:opacity-80 hover:scale-[1.02] transition-all active:scale-95"
            >
              <img
                src={nft.imageUrl || "/placeholder.png"}
                alt={nft.name || "NFT"}
                className="object-cover w-full h-full"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <p className="text-xs font-medium truncate text-white">
                  {nft.name || "NFT"}
                </p>
              </div>
              {nft.rarity && (
                <div
                  className={`absolute top-2 right-2 ${rarityColor} bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-semibold`}
                >
                  {rarityLabel}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
