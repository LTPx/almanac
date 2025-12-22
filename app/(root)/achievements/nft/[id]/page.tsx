"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronLeft, ChevronDown, AlertCircle, Lock } from "lucide-react";
import Image from "next/image";

interface NFTAssetDetail {
  id: number;
  name: string;
  imageUrl: string;
  rarity: string;
  metadataUri?: string;
  isUsed: boolean;
  collectionId?: string;
  createdAt: string;
  collection?: {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
  };
  collectionStats: number;
  moreFromCollection: Array<{
    id: number;
    name: string;
    imageUrl: string;
    rarity: string;
  }>;
}

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

export default function NFTAssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assetId = params?.id as string;

  const [nftAsset, setNftAsset] = useState<NFTAssetDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aboutExpanded, setAboutExpanded] = useState(true);
  const [collectionExpanded, setCollectionExpanded] = useState(false);
  const [rarityExpanded, setRarityExpanded] = useState(false);

  useEffect(() => {
    if (assetId) {
      console.log("Asset ID from params:", assetId);
      fetchNFTAssetDetail();
    } else {
      console.warn("Asset ID is undefined, waiting...");
    }
  }, [assetId]);

  const fetchNFTAssetDetail = async () => {
    try {
      setLoading(true);
      console.log("Fetching NFT Asset:", assetId);
      const response = await fetch(`/api/nft-assets/${assetId}`);

      if (!response.ok) {
        throw new Error("Error al cargar el NFT Asset");
      }

      const data = await response.json();
      console.log("NFT Asset data:", data);
      setNftAsset(data);
    } catch (err) {
      console.error("Error fetching NFT Asset:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
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

  if (error || !nftAsset) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || "NFT Asset no encontrado"}
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

  const rarityColor = rarityColors[nftAsset.rarity] || rarityColors.NORMAL;

  return (
    <div className="min-h-screen bg-black text-white pb-20">
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
      <div className="p-4 flex justify-center">
        <div
          className={`relative w-[280px] h-[280px] rounded-2xl overflow-hidden bg-gradient-to-br ${rarityColor.bg} shadow-xl`}
        >
          <Image
            src={nftAsset.imageUrl || "/placeholder.png"}
            alt={nftAsset.name || "NFT Asset"}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">No minteado</span>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">
            {nftAsset.name || "NFT Asset"}
          </h1>
          <p className="text-gray-400 text-sm">
            {nftAsset.collection?.name || "Sin colección"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`${rarityColor.text} font-semibold text-sm px-3 py-1 bg-gray-800 rounded-full border border-gray-700`}
          >
            {rarityLabels[nftAsset.rarity] || nftAsset.rarity}
          </div>
        </div>

        <div className="border-t border-gray-800 pt-4">
          <button
            onClick={() => setAboutExpanded(!aboutExpanded)}
            className="flex items-center justify-between w-full mb-3"
          >
            <h2 className="text-lg font-semibold">Acerca de</h2>
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
                  {nftAsset.name || "NFT Asset"}
                </p>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Este NFT está disponible para mintear. Completa las unidades o
                  cursos requeridos para obtenerlo y añadirlo a tu colección
                  permanentemente en la blockchain.
                </p>
              </div>

              <div>
                <p className="font-semibold mb-1">Creado:</p>
                <p className="text-gray-400 text-sm">
                  {formatDate(nftAsset.createdAt)}
                </p>
              </div>

              <div>
                <p className="font-semibold mb-1">Estado:</p>
                <p className="text-gray-400 text-sm">
                  {nftAsset.isUsed
                    ? "Asignado a usuario"
                    : "Disponible para mintear"}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-800 pt-4">
          <button
            onClick={() => setRarityExpanded(!rarityExpanded)}
            className="flex items-center justify-between w-full"
          >
            <h2 className="text-lg font-semibold">Rareza</h2>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${
                rarityExpanded ? "rotate-180" : ""
              }`}
            />
          </button>
          {rarityExpanded && (
            <div className="mt-3">
              <div className={`${rarityColor.text} font-semibold mb-2`}>
                {rarityLabels[nftAsset.rarity] || nftAsset.rarity}
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                {nftAsset.rarity === "NORMAL" &&
                  "Los NFTs normales son los más comunes y accesibles."}
                {nftAsset.rarity === "RARE" &&
                  "Los NFTs raros tienen características especiales que los hacen menos comunes."}
                {nftAsset.rarity === "EPIC" &&
                  "Los NFTs épicos son difíciles de conseguir y tienen propiedades únicas."}
                {nftAsset.rarity === "UNIQUE" &&
                  "Los NFTs únicos son ediciones limitadas y extremadamente valiosos."}
              </p>
            </div>
          )}
        </div>

        {nftAsset.collection && (
          <div className="border-t border-gray-800 pt-4">
            <button
              onClick={() => setCollectionExpanded(!collectionExpanded)}
              className="flex items-center justify-between w-full"
            >
              <h2 className="text-lg font-semibold">
                Acerca de {nftAsset.collection.name}
              </h2>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${
                  collectionExpanded ? "rotate-180" : ""
                }`}
              />
            </button>
            {collectionExpanded && (
              <div className="mt-3 space-y-2">
                <p className="text-gray-400 text-sm leading-relaxed">
                  {nftAsset.collection.description ||
                    "Sin descripción disponible"}
                </p>
                <div className="flex justify-between text-sm pt-2">
                  <span className="text-gray-400">Total de items:</span>
                  <span className="font-medium">
                    {nftAsset.collectionStats}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl p-4 space-y-3">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-1">
                ¿Cómo obtener este NFT?
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Completa las unidades o cursos asociados para mintear este NFT y
                agregarlo permanentemente a tu colección.
              </p>
            </div>
          </div>
          <Button
            onClick={() => router.push("/")}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-6 text-base font-semibold rounded-lg"
          >
            Ver Cursos Disponibles
          </Button>
        </div>

        {nftAsset.moreFromCollection &&
          nftAsset.moreFromCollection.length > 0 && (
            <div className="border-t border-gray-800 pt-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Más de esta colección</h2>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {nftAsset.moreFromCollection.map((item) => {
                  const itemRarityColor =
                    rarityColors[item.rarity] || rarityColors.NORMAL;
                  return (
                    <button
                      key={item.id}
                      onClick={() =>
                        router.push(`/achievements/nft/${item.id}`)
                      }
                      className="relative aspect-square rounded-xl overflow-hidden bg-gray-800 hover:opacity-80 transition-opacity"
                    >
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${itemRarityColor.bg} opacity-20`}
                      />
                      <img
                        src={item.imageUrl || "/placeholder.png"}
                        alt={item.name || "NFT"}
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                        <p className="text-xs font-medium truncate">
                          {item.name || "NFT"}
                        </p>
                      </div>
                      <div
                        className={`absolute top-2 right-2 ${itemRarityColor.text} bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-semibold`}
                      >
                        {rarityLabels[item.rarity]}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
