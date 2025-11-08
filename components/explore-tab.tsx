"use client";

import { useState, useEffect, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";

interface CollectionNFT {
  id: string;
  name: string;
  imageUrl: string;
  tokenId?: string;
  owner?: string;
  rarity?: string;
}

interface ExploreTabProps {
  nfts: any[];
  isActive: boolean;
}

export function ExploreTab({ nfts, isActive }: ExploreTabProps) {
  const [collectionNFTs, setCollectionNFTs] = useState<CollectionNFT[]>([]);
  const [loadingCollection, setLoadingCollection] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const userNFTIds = useState(() => new Set(nfts.map((nft) => nft.id)))[0];

  useEffect(() => {
    userNFTIds.clear();
    nfts.forEach((nft) => userNFTIds.add(nft.id));
  }, [nfts, userNFTIds]);

  const fetchAllCollectionNFTs = useCallback(async () => {
    if (hasFetched) return;

    try {
      setLoadingCollection(true);
      const collectionsResponse = await fetch("/api/nft-collections");
      if (!collectionsResponse.ok) {
        throw new Error("Error fetching collections");
      }
      const collections = await collectionsResponse.json();

      const allNFTsPromises = collections.map(async (collection: any) => {
        const response = await fetch(
          `/api/nft-collections/${collection.id}/nfts?limit=50`
        );
        if (response.ok) {
          const data = await response.json();
          return data.nfts || [];
        }
        return [];
      });

      const allNFTsArrays = await Promise.all(allNFTsPromises);
      const allNFTs = allNFTsArrays.flat();

      const filteredNFTs = allNFTs.filter(
        (nft: CollectionNFT) => !userNFTIds.has(nft.id)
      );

      setCollectionNFTs(filteredNFTs);
      setHasFetched(true);
    } catch (error) {
      console.error("Error fetching collection NFTs:", error);
      setCollectionNFTs([]);
    } finally {
      setLoadingCollection(false);
    }
  }, [userNFTIds, hasFetched]);

  useEffect(() => {
    if (isActive && !hasFetched) {
      fetchAllCollectionNFTs();
    }
  }, [isActive, hasFetched, fetchAllCollectionNFTs]);

  if (loadingCollection) {
    return (
      <div className="px-4 pt-6 pb-4">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg bg-gray-700" />
          ))}
        </div>
      </div>
    );
  }

  if (collectionNFTs.length === 0 && nfts.length === 0) {
    return (
      <div className="px-4 min-h-full flex flex-col items-center justify-center -mt-20">
        <div className="flex flex-col items-center gap-4 max-w-sm mx-auto text-center">
          <div className="w-20 h-20 rounded-full border-2 border-gray-600 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-gray-500" strokeWidth={1.5} />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">
              Explora la colección
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Obtén tu primera medalla para explorar la colección completa
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (collectionNFTs.length === 0 && nfts.length > 0) {
    return (
      <div className="px-4 min-h-full flex flex-col items-center justify-center -mt-20">
        <div className="flex flex-col items-center gap-4 max-w-sm mx-auto text-center">
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
        {collectionNFTs.map((nft) => (
          <div
            key={nft.id}
            className="relative aspect-square rounded-xl overflow-hidden bg-gray-800 hover:opacity-80 transition-opacity"
          >
            <img
              src={nft.imageUrl || "/placeholder.png"}
              alt={nft.name || "NFT"}
              className="object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
              <p className="text-xs font-medium truncate">
                {nft.name || "NFT"}
              </p>
            </div>
            {nft.rarity && (
              <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-semibold text-white">
                {nft.rarity}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
