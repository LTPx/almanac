"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronLeft, ChevronDown, AlertCircle } from "lucide-react";
import Image from "next/image";
import { useUser } from "@/context/UserContext";

// interface NFTMetadata {
//   name: string;
//   description: string;
//   image: string;
//   attributes?: Array<{
//     trait_type: string;
//     value: string | number;
//   }>;
// }

interface NFTDetail {
  id: string;
  tokenId: string;
  contractAddress: string;
  transactionHash?: string;
  chain: string;
  tokenStandard: string;
  collectionName: string;
  owner: string;
  ownerName?: string;
  mintedAt: string;
  curriculum?: {
    id: string;
    title: string;
    difficulty: string;
    units: string[];
  };
  // metadata: NFTMetadata;
  nftAsset?: {
    id: number;
    name: string;
    imageUrl: string;
    rarity: number;
    collection?: {
      id: string;
      name: string;
      description?: string;
    };
  };
}

export default function NFTDetailPage() {
  const params = useParams();
  const router = useRouter();
  const user = useUser();
  const nftId = params?.id as string;
  const userId = user?.id || "";
  const [nft, setNft] = useState<NFTDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aboutExpanded, setAboutExpanded] = useState(true);
  const [collectionExpanded, setCollectionExpanded] = useState(false);
  const [blockchainExpanded, setBlockchainExpanded] = useState(false);
  const [moreFromCollection, setMoreFromCollection] = useState<any[]>([]);

  const rarityColors: Record<string, { bg: string; text: string }> = {
    NORMAL: { bg: "from-gray-400 to-gray-600", text: "text-gray-400" },
    RARE: { bg: "from-blue-400 to-blue-600", text: "text-blue-400" },
    EPIC: { bg: "from-purple-400 to-purple-600", text: "text-purple-400" },
    UNIQUE: { bg: "from-yellow-400 to-yellow-600", text: "text-yellow-400" }
  };

  const rarityLabels: Record<string, string> = {
    NORMAL: "Normal",
    RARE: "Rare",
    EPIC: "Epic",
    UNIQUE: "Unique"
  };

  useEffect(() => {
    fetchNFTDetail();
  }, [nftId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchNFTDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${userId}/nfts/${nftId}`);

      if (!response.ok) {
        throw new Error("Error al cargar el NFT");
      }

      const data = await response.json();
      setNft(data);

      if (data.collectionId) {
        fetchMoreFromCollection(data.collectionId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const fetchMoreFromCollection = async (collectionId: string) => {
    try {
      const response = await fetch(
        `/api/nft-collections/${collectionId}/nfts?limit=3`
      );
      if (response.ok) {
        const data = await response.json();
        setMoreFromCollection(data.nfts || []);
      }
    } catch (err) {
      console.error("Error fetching collection NFTs:", err);
    }
  };

  const handleShare = async () => {
    const urlNft = `/nft/${nftId}`;
    const shareData = {
      title: nft?.nftAsset?.name || "Mi NFT",
      // text: nft?.nftAsset?.description || "Mira mi certificado NFT",
      url: urlNft
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(urlNft);
        alert("Enlace copiado al portapapeles");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm border-b border-gray-800">
          <div className="flex items-center justify-between p-4">
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex justify-center">
            <Skeleton className="w-[280px] h-[280px] aspect-square rounded-2xl" />
          </div>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (error || !nft) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || "NFT no encontrado"}
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.back()}
              className="ml-3"
            >
              Volver
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const achievements = nft.curriculum?.units || [];
  const rarityColor =
    rarityColors[nft.nftAsset?.rarity || ""] || rarityColors.NORMAL;

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header */}
      <div className="sticky top-[60px] z-10 bg-black/80 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* NFT Image */}
      <div className="p-4 flex justify-center">
        <div className="relative w-[280px] h-[280px] rounded-2xl overflow-hidden bg-gradient-to-br from-green-400 to-green-600 shadow-xl">
          <Image
            src={nft.nftAsset?.imageUrl || ""}
            alt={nft.nftAsset?.name || ""}
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* NFT Info */}
      <div className="px-4 space-y-6">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold mb-1">{nft.nftAsset?.name}</h1>
          <p className="text-gray-400 text-sm">
            {nft.nftAsset?.collection?.name} · Owned by{" "}
            {nft.owner ? formatAddress(nft.owner) : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`${rarityColor.text} font-semibold text-sm px-3 py-1 bg-gray-800 rounded-full border border-gray-700`}
          >
            {rarityLabels[nft.nftAsset?.rarity || ""] || nft.nftAsset?.rarity}
          </div>
        </div>

        {/* About Section */}
        <div className="border-t border-gray-800 pt-4">
          <button
            onClick={() => setAboutExpanded(!aboutExpanded)}
            className="flex items-center justify-between w-full mb-3"
          >
            <h2 className="text-lg font-semibold">About</h2>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${
                aboutExpanded ? "rotate-180" : ""
              }`}
            />
          </button>
          {aboutExpanded && (
            <div className="space-y-3">
              <div>
                <p className="text-xl font-bold mb-2">
                  About {nft.nftAsset?.name} #{nft.tokenId}
                </p>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {nft.nftAsset?.collection?.description}
                </p>
              </div>

              {/* Achievements */}
              {achievements.length > 0 && (
                <div>
                  <p className="font-semibold mb-2">Achievements</p>
                  <div className="space-y-1">
                    {achievements.map((achievement, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-gray-400">{achievement}</span>
                        {/* <span className="font-medium">
                          {achievement.value}%
                        </span> */}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Minted Date */}
              <div>
                <p className="font-semibold mb-1">Minted:</p>
                <p className="text-gray-400 text-sm">
                  {formatDate(nft.mintedAt)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Collection Section */}
        <div className="border-t border-gray-800 pt-4">
          <button
            onClick={() => setCollectionExpanded(!collectionExpanded)}
            className="flex items-center justify-between w-full"
          >
            <h2 className="text-lg font-semibold">
              About {nft.collectionName}
            </h2>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${
                collectionExpanded ? "rotate-180" : ""
              }`}
            />
          </button>
          {collectionExpanded && (
            <div className="mt-3">
              <p className="text-gray-400 text-sm leading-relaxed">
                {nft.nftAsset?.collection?.description}
              </p>
            </div>
          )}
        </div>

        {/* Blockchain Details */}
        <div className="border-t border-gray-800 pt-4">
          <button
            onClick={() => setBlockchainExpanded(!blockchainExpanded)}
            className="flex items-center justify-between w-full"
          >
            <h2 className="text-lg font-semibold">Blockchain details</h2>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${
                blockchainExpanded ? "rotate-180" : ""
              }`}
            />
          </button>
          {blockchainExpanded && (
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Contract address</span>
                <span className="text-blue-400">
                  {formatAddress(nft.contractAddress)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Token ID</span>
                <span>{nft.tokenId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Token Standard</span>
                <span>{nft.tokenStandard}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Chain</span>
                <span>{nft.chain}</span>
              </div>
            </div>
          )}
        </div>

        {/* Share Button */}
        <Button
          onClick={handleShare}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-base font-semibold rounded-xl"
        >
          Share
        </Button>

        {/* More from Collection */}
        {moreFromCollection.length > 0 && (
          <div className="border-t border-gray-800 pt-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                More from this collection
              </h2>
              <ChevronDown className="w-5 h-5" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {moreFromCollection.map((item, index) => (
                <button
                  key={index}
                  onClick={() => router.push(`/achievements/${item.id}`)}
                  className="relative aspect-square rounded-xl overflow-hidden bg-gray-800 hover:opacity-80 transition-opacity"
                >
                  <img
                    src={item.imageUrl || "/placeholder.png"}
                    alt={item.name || "NFT"}
                    className="object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <p className="text-xs font-medium truncate">
                      {item.name || "NFT"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
