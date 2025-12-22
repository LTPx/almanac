"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ChevronDown,
  AlertCircle,
  Share2,
  ExternalLink,
  Shield,
  Calendar
} from "lucide-react";
import Image from "next/image";
import { getExplorerUrl } from "@/lib/utils";
import Link from "next/link";

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

export default function NFTPublicPage() {
  const params = useParams();
  const nftId = params?.id as string;

  const [nft, setNft] = useState<NFTDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aboutExpanded, setAboutExpanded] = useState(true);
  const [blockchainExpanded, setBlockchainExpanded] = useState(false);
  const [moreFromCollection, setMoreFromCollection] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchNFTDetail();
  }, [nftId]);

  const fetchNFTDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/public/nfts/${nftId}`);

      if (!response.ok) {
        throw new Error("NFT not found");
      }

      const data = await response.json();
      setNft(data);

      if (data.nftAsset?.collection?.id) {
        fetchMoreFromCollection(data.nftAsset.collection.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const fetchMoreFromCollection = async (collectionId: string) => {
    try {
      const response = await fetch(
        `/api/public/nft-collections/${collectionId}/nfts?limit=6`
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
    const shareData = {
      title: `${nft?.nftAsset?.name || "NFT"} - ${nft?.collectionName || "Collection"}`,
      // text: `Check out this NFT from ${nft?.collectionName || "the collection"}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="w-full from-gray-950 via-gray-900 to-black text-white">
        {/* Background blur effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 opacity-20 blur-3xl"
            style={{
              background: `radial-gradient(circle at 50% 0%, rgba(34, 197, 94, 0.3), transparent 70%)`
            }}
          />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-12">
          {/* Collection Badge Skeleton */}
          <div className="flex items-center gap-2 mb-6">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="h-5 w-32" />
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* NFT Image Skeleton */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-md">
                <Skeleton className="aspect-square rounded-3xl" />
              </div>
            </div>

            {/* NFT Info Skeleton */}
            <div className="space-y-6">
              {/* Title */}
              <div>
                <Skeleton className="h-12 w-3/4 mb-3" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-24 rounded-xl" />
                <Skeleton className="h-24 rounded-xl" />
              </div>

              {/* Share Button */}
              <Skeleton className="h-14 w-full rounded-xl" />

              {/* About Section */}
              <Skeleton className="h-48 rounded-2xl" />

              {/* Blockchain Details */}
              <Skeleton className="h-32 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !nft) {
    return (
      <div className="min-h-screen from-gray-950 via-gray-900 to-black text-white flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "NFT not found"}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const achievements = nft.curriculum?.units || [];

  return (
    <div className="min-h-screen from-gray-950 via-gray-900 to-black text-white">
      {/* Hero Section */}
      <div className="relative">
        {/* Background blur effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 opacity-20 blur-3xl"
            style={{
              background: `radial-gradient(circle at 50% 0%, rgba(34, 197, 94, 0.3), transparent 70%)`
            }}
          />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-12">
          {/* Collection Badge */}
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-green-400" />
            <span className="text-sm font-medium text-gray-300">
              {nft.collectionName}
            </span>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* NFT Image */}
            <div className="flex justify-center lg:sticky lg:top-8">
              <div className="relative w-full max-w-md">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-3xl blur-2xl" />
                <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-green-400 to-green-600 shadow-2xl border border-green-500/20">
                  <Image
                    src={nft.nftAsset?.imageUrl || "/placeholder.png"}
                    alt={nft.nftAsset?.name || "NFT"}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* NFT Info */}
            <div className="space-y-6">
              {/* Title and Owner */}
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold mb-3 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  {nft.nftAsset?.name}
                </h1>
                <div className="flex items-center gap-2 text-gray-400">
                  <span className="text-sm">Owned by</span>
                  <span className="font-mono text-sm text-green-400">
                    {formatAddress(nft.owner)}
                  </span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-400 uppercase tracking-wider">
                      Minted
                    </span>
                  </div>
                  <p className="font-semibold">{formatDate(nft.mintedAt)}</p>
                </div>
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-400 uppercase tracking-wider">
                      Chain
                    </span>
                  </div>
                  <p className="font-semibold">{nft.chain}</p>
                </div>
              </div>

              {/* Share Button */}
              <Button
                onClick={handleShare}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white py-6 text-base font-semibold rounded-xl shadow-lg shadow-green-500/25 transition-all"
              >
                <Share2 className="w-5 h-5 mr-2" />
                {copied ? "Link Copied!" : "Share this NFT"}
              </Button>

              {/* About Section */}
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
                <button
                  onClick={() => setAboutExpanded(!aboutExpanded)}
                  className="flex items-center justify-between w-full p-6 hover:bg-gray-800/50 transition-colors"
                >
                  <h2 className="text-xl font-semibold">About</h2>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform ${
                      aboutExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {aboutExpanded && (
                  <div className="px-6 pb-6 space-y-4">
                    <p className="text-gray-300 leading-relaxed">
                      {nft.nftAsset?.collection?.description ||
                        "This NFT represents a unique digital achievement."}
                    </p>

                    {/* Achievements */}
                    {achievements.length > 0 && (
                      <div>
                        <p className="font-semibold mb-3 text-green-400">
                          Achievements
                        </p>
                        <div className="space-y-2">
                          {achievements.map((achievement, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg"
                            >
                              <div className="w-2 h-2 rounded-full bg-green-400" />
                              <span className="text-sm text-gray-300">
                                {achievement}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Blockchain Details */}
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
                <button
                  onClick={() => setBlockchainExpanded(!blockchainExpanded)}
                  className="flex items-center justify-between w-full p-6 hover:bg-gray-800/50 transition-colors"
                >
                  <h2 className="text-xl font-semibold">Blockchain Details</h2>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform ${
                      blockchainExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {blockchainExpanded && (
                  <div className="px-6 pb-6 space-y-3">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-400 text-sm">
                        Contract Address
                      </span>
                      <span className="font-mono text-sm text-green-400">
                        {formatAddress(nft.contractAddress)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-400 text-sm">Token ID</span>
                      <span className="font-mono text-sm">{nft.tokenId}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-400 text-sm">
                        Token Standard
                      </span>
                      <span className="text-sm">{nft.tokenStandard}</span>
                    </div>
                    {nft.transactionHash && (
                      <Link
                        href={getExplorerUrl(nft.contractAddress, nft.tokenId)}
                        target="_blank"
                        className="flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors mt-3"
                      >
                        <span>View on Block Explorer </span>
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* More from Collection */}
      {moreFromCollection.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold mb-6">More from this collection</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {moreFromCollection.slice(0, 8).map((item, index) => (
              <button
                key={index}
                onClick={() => (window.location.href = `/nft/${item.id}`)}
                className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-800 hover:scale-105 transition-transform duration-300"
              >
                <img
                  src={item.imageUrl || "/placeholder.png"}
                  alt={item.name || "NFT"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-sm font-semibold truncate">
                      {item.name || "NFT"}
                    </p>
                    <p className="text-xs text-gray-400">
                      #{item.tokenId || "—"}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-800 mt-16">
        <div className="max-w-5xl mx-auto px-4 py-8 text-center text-gray-500 text-sm">
          <p>This NFT is verified on the blockchain</p>
        </div>
      </div>
    </div>
  );
}
