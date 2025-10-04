// app/admin/nfts/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Eye,
  Search,
  Filter,
  Image as ImageIcon,
  Sparkles,
  CheckCircle,
  ExternalLink,
  ChevronsLeftRightEllipsis
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { NFTAsset, NFTAssetsResponse } from "@/lib/types";
import { getExplorerUrl } from "@/lib/utils";

const rarityConfig = {
  NORMAL: { label: "Normal", color: "bg-gray-100 text-gray-800", icon: "⚪" },
  RARE: { label: "Raro", color: "bg-blue-100 text-blue-800", icon: "🔵" },
  EPIC: { label: "Épico", color: "bg-purple-100 text-purple-800", icon: "🟣" },
  UNIQUE: {
    label: "Unico",
    color: "bg-yellow-100 text-yellow-800",
    icon: "⭐"
  }
};

export default function NFTsPage() {
  const [nfts, setNfts] = useState<NFTAsset[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRarity, setSelectedRarity] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [deleteNFTId, setDeleteNFTId] = useState<number | null>(null);

  const fetchNftAssets = async () => {
    const response = await fetch("/api/nft-assets");
    if (!response.ok) {
      throw new Error("Failed to fetch lessons");
    }
    return response.json();
  };

  const filteredNFTs = nfts.filter((nft) => {
    const matchesSearch =
      nft.id.toString().includes(searchTerm) ||
      nft.metadataUri?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRarity =
      selectedRarity === "all" || nft.rarity === selectedRarity;
    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "used" && nft.isUsed) ||
      (selectedStatus === "available" && !nft.isUsed);
    return matchesSearch && matchesRarity && matchesStatus;
  });

  const handleDeleteNFT = (id: number) => {
    setNfts(nfts.filter((nft) => nft.id !== id));
    setDeleteNFTId(null);
  };

  const stats = {
    total: nfts.length,
    used: nfts.filter((n) => n.isUsed).length,
    available: nfts.filter((n) => !n.isUsed).length,
    byRarity: {
      COMMON: nfts.filter((n) => n.rarity === "NORMAL").length,
      RARE: nfts.filter((n) => n.rarity === "RARE").length,
      EPIC: nfts.filter((n) => n.rarity === "EPIC").length,
      LEGENDARY: nfts.filter((n) => n.rarity === "UNIQUE").length
    }
  };

  useEffect(() => {
    const loadAssets = async () => {
      try {
        const response: NFTAssetsResponse = await fetchNftAssets();
        const { nftAssets } = response;
        setNfts(nftAssets);
      } catch (error) {
        console.error("Error loading lessons:", error);
        toast.error("Error loading lessons");
      } finally {
        // setLoading(false);
      }
    };

    loadAssets();
  }, []);

  return (
    <div className="space-y-6 bg-background text-foreground min-h-screen p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">NFT Assets</h1>
          <p className="text-muted-foreground">
            Gestiona los NFTs disponibles para recompensas
          </p>
        </div>
        <Link href="/admin/nfts/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New NFT Asset
          </Button>
        </Link>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total NFTs
                </p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <ImageIcon className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  No minted
                </p>
                <p className="text-2xl font-bold">{stats.available}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Minted
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.used}
                </p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Unicos
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.byRarity.LEGENDARY}
                </p>
              </div>
              <Sparkles className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar por ID o metadata URI..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-40s">
              <Select value={selectedRarity} onValueChange={setSelectedRarity}>
                <SelectTrigger>
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las rarezas</SelectItem>
                  <SelectItem value="NORMAL">Común</SelectItem>
                  <SelectItem value="RARE">Raro</SelectItem>
                  <SelectItem value="EPIC">Épico</SelectItem>
                  <SelectItem value="UNIQUE">Unico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-40">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="available">No Minted</SelectItem>
                  <SelectItem value="used">Minted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de NFTs */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredNFTs.map((nft) => {
          const rarityInfo =
            rarityConfig[nft.rarity as keyof typeof rarityConfig];
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
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/nfts/${nft.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalles
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
                        onClick={() => setDeleteNFTId(nft.id)}
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
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">
                      {nft.educationalNFT
                        ? `NFT #${nft.educationalNFT.tokenId}`
                        : "NO MINTED"}
                    </h3>
                    {nft.isUsed ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <></>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>
                      Created: {new Date(nft.createdAt).toLocaleDateString()}
                    </p>
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

      {filteredNFTs.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              No hay NFTs
            </h3>
            <p className="mt-2 text-muted-foreground">
              {searchTerm ||
              selectedRarity !== "all" ||
              selectedStatus !== "all"
                ? "No se encontraron NFTs con los filtros actuales."
                : "Comienza agregando tu primer NFT asset."}
            </p>
            {!searchTerm &&
              selectedRarity === "all" &&
              selectedStatus === "all" && (
                <Link href="/admin/nfts/new">
                  <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear primer NFT
                  </Button>
                </Link>
              )}
          </CardContent>
        </Card>
      )}

      {/* Dialog de confirmación para eliminar */}
      <AlertDialog
        open={deleteNFTId !== null}
        onOpenChange={() => setDeleteNFTId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el NFT asset. Esta acción no
              se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteNFTId && handleDeleteNFT(deleteNFTId)}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
