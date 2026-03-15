"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Eye,
  ExternalLink,
  ChevronsLeftRightEllipsis,
  CheckCircle,
  Image as ImageIcon
} from "lucide-react";
import { NFTAsset } from "@/lib/types";
import { getExplorerUrl } from "@/lib/utils";

const rarityConfig = {
  NORMAL: { label: "Normal", color: "bg-gray-100 text-gray-800", icon: "⚪" },
  RARE: { label: "Raro", color: "bg-blue-100 text-blue-800", icon: "🔵" },
  EPIC: { label: "Épico", color: "bg-purple-100 text-purple-800", icon: "🟣" },
  UNIQUE: { label: "Unico", color: "bg-yellow-100 text-yellow-800", icon: "⭐" }
};

interface NFTGridViewProps {
  nfts: NFTAsset[];
  searchTerm: string;
  selectedRarity: string;
  selectedStatus: string;
  onDelete: (id: number) => void;
}

export default function NFTGridView({
  nfts,
  searchTerm,
  selectedRarity,
  selectedStatus,
  onDelete
}: NFTGridViewProps) {
  if (nfts.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            No hay NFTs
          </h3>
          <p className="mt-2 text-muted-foreground">
            {searchTerm || selectedRarity !== "all" || selectedStatus !== "all"
              ? "No se encontraron NFTs con los filtros actuales."
              : "Comienza agregando tu primer NFT asset."}
          </p>
          {!searchTerm && selectedRarity === "all" && selectedStatus === "all" && (
            <Link href="/admin/nfts/new">
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Crear primer NFT
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {nfts.map((nft) => {
        const rarityInfo = rarityConfig[nft.rarity as keyof typeof rarityConfig];
        return (
          <Card
            key={nft.id}
            className="overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200">
              <img
                src={nft.imageUrl}
                alt={`NFT #${nft.educationalNFT ? nft.educationalNFT.tokenId : "-"}`}
                className={`w-full h-full object-cover ${nft.isUsed && "backdrop-blur-md"}`}
              />
              <div className="absolute top-2 right-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 bg-white/90 hover:bg-white"
                    >
                      <MoreHorizontal className="h-4 w-4" color="black" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild disabled={!nft.isUsed}>
                      <Link
                        href={`/nft/${nft.educationalNFT?.id}`}
                        target="_blank"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Link Público
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild disabled={nft.isUsed}>
                      <Link href={`/admin/nfts/${nft.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </Link>
                    </DropdownMenuItem>
                    {nft.metadataUri && (
                      <DropdownMenuItem
                        onClick={() => window.open(nft.metadataUri, "_blank")}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Ver metadata
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => onDelete(nft.id)}
                      disabled={nft.isUsed}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="absolute top-2 left-2">
                <Badge className={rarityInfo.color}>
                  <span className="mr-1">{rarityInfo.icon}</span>
                  {rarityInfo.label}
                </Badge>
              </div>
              {nft.isUsed && nft.educationalNFT && (
                <div className="absolute bottom-2 left-2">
                  <Badge
                    variant="secondary"
                    className="bg-gray-800/80 text-white"
                  >
                    <Link
                      href={
                        nft.educationalNFT
                          ? getExplorerUrl(
                              nft.educationalNFT?.contractAddress,
                              nft.educationalNFT?.tokenId
                            )
                          : "#"
                      }
                      target="_blank"
                      className="flex gap-1"
                    >
                      <ChevronsLeftRightEllipsis className="h-4 w-4" />
                      View Transaction
                    </Link>
                  </Badge>
                </div>
              )}
            </div>

            <CardContent className="p-4">
              <div className="space-y-2">
                <div>
                  <h3 className="font-semibold text-md">
                    {nft.name || "No name"}
                  </h3>
                  <Link
                    href={`/admin/collections/${nft.collectionId || ""}/edit`}
                  >
                    <h3 className="text-sm mt-1 text-muted-foreground">
                      {nft.collection?.name || "No collection"}
                    </h3>
                  </Link>
                </div>
                <div className="flex items-center justify-between">
                  <Badge
                    variant={nft.educationalNFT ? "default" : "secondary"}
                    className={
                      nft.educationalNFT
                        ? "bg-gray-700 text-primary-foreground"
                        : "border-gray-50 text-gray-200"
                    }
                  >
                    {nft.educationalNFT
                      ? `NFT #${nft.educationalNFT.tokenId}`
                      : "NO MINTED"}
                  </Badge>
                  {nft.isUsed && <CheckCircle className="h-5 w-5 text-green-500" />}
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Created: {new Date(nft.createdAt).toLocaleDateString()}</p>
                  {nft.isUsed && nft.usedAt && (
                    <p>Minted: {new Date(nft.usedAt).toLocaleDateString()}</p>
                  )}
                </div>
                {nft.metadataUri && (
                  <p
                    className="text-xs text-muted-foreground truncate"
                    title={nft.metadataUri}
                  >
                    {nft.metadataUri}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
