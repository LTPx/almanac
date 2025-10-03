"use client";

import { useState, useEffect, useCallback } from "react";

interface NFT {
  id: string;
  tokenId: string;
  unitId: string;
  contractAddress: string;
  transactionHash: string | null;
  metadataUri: string;
  mintedAt: string;
  metadata?: {
    name?: string;
    description?: string;
    image?: string;
    attributes?: Array<{
      trait_type: string;
      value: string;
    }>;
  };
}

export function useNFTs(userId: string, useThirdweb: boolean = false) {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isThirdwebEnabled, setIsThirdwebEnabled] = useState(useThirdweb);

  const fetchNFTs = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const endpoint = isThirdwebEnabled
        ? `/api/users/${userId}/nfts/thirdweb`
        : `/api/users/${userId}/nfts`;

      const res = await fetch(endpoint);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Error al cargar NFTs");
      }

      const data = await res.json();
      setNfts(data.nfts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [userId, isThirdwebEnabled]);

  useEffect(() => {
    fetchNFTs();
  }, [fetchNFTs]);

  return {
    nfts,
    loading,
    error,
    refetch: fetchNFTs,
    isThirdwebEnabled,
    setIsThirdwebEnabled
  };
}
