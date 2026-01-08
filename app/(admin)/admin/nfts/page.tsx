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
  ChevronsLeftRightEllipsis,
  LayoutGrid,
  Table as TableIcon
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
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

interface Collection {
  id: string;
  name: string;
  description?: string;
}

export default function NFTsPage() {
  const [nfts, setNfts] = useState<NFTAsset[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRarity, setSelectedRarity] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCollection, setSelectedCollection] = useState<string>("all");
  const [deleteNFTId, setDeleteNFTId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [loading, setLoading] = useState(false);

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalNFTs, setTotalNFTs] = useState(0);
  const limit = 20;

  const fetchNftAssets = async (page: number = 1) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    if (selectedRarity !== "all") {
      params.append("rarity", selectedRarity);
    }

    if (selectedStatus !== "all") {
      params.append("isUsed", selectedStatus === "used" ? "true" : "false");
    }

    if (selectedCollection !== "all") {
      params.append("collectionId", selectedCollection);
    }

    const response = await fetch(`/api/nft-assets?${params}`);
    if (!response.ok) {
      throw new Error("Failed to fetch NFT assets");
    }
    return response.json();
  };

  const fetchCollections = async () => {
    try {
      const response = await fetch("/api/collections");
      if (!response.ok) {
        throw new Error("Failed to fetch collections");
      }
      const data = await response.json();
      setCollections(data.collections);
    } catch (error) {
      console.error("Error loading collections:", error);
      toast.error("Error loading collections");
    }
  };

  // Filtrar por búsqueda local (nombre y metadata)
  const filteredNFTs = nfts.filter((nft) => {
    if (!searchTerm) return true;
    const matchesSearch =
      nft.id.toString().includes(searchTerm) ||
      nft.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nft.metadataUri?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleDeleteNFT = async (assetId: number) => {
    try {
      const response = await fetch(`/api/nft-assets/${assetId}`, {
        method: "DELETE"
      });

      if (response.ok) {
        toast.success("NFT eliminado exitosamente");
        loadNFTs(currentPage);
      } else {
        toast.error("Error al eliminar NFT");
      }
    } catch (error) {
      console.error("Error al eliminar NFT:", error);
      toast.error("Error al eliminar NFT");
    } finally {
      setDeleteNFTId(null);
    }
  };

  const [stats, setStats] = useState({
    total: 0,
    used: 0,
    available: 0,
    byRarity: {
      COMMON: 0,
      RARE: 0,
      EPIC: 0,
      LEGENDARY: 0
    }
  });

  const loadNFTs = async (page: number = 1) => {
    setLoading(true);
    try {
      const response: NFTAssetsResponse = await fetchNftAssets(page);
      const { nftAssets, pagination } = response;
      setNfts(nftAssets);
      setCurrentPage(pagination.page);
      setTotalPages(pagination.totalPages);
      setTotalNFTs(pagination.total);

      // Calcular stats
      const statsData = {
        total: pagination.total,
        used: nftAssets.filter((n) => n.isUsed).length,
        available: nftAssets.filter((n) => !n.isUsed).length,
        byRarity: {
          COMMON: nftAssets.filter((n) => n.rarity === "NORMAL").length,
          RARE: nftAssets.filter((n) => n.rarity === "RARE").length,
          EPIC: nftAssets.filter((n) => n.rarity === "EPIC").length,
          LEGENDARY: nftAssets.filter((n) => n.rarity === "UNIQUE").length
        }
      };
      setStats(statsData);
    } catch (error) {
      console.error("Error loading NFT assets:", error);
      toast.error("Error loading NFT assets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    loadNFTs(1);
  }, [selectedRarity, selectedStatus, selectedCollection]);

  return (
    <div className="space-y-6 bg-background text-foreground min-h-screen p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">NFT</h1>
          <p className="text-muted-foreground">
            Gestiona los NFTs disponibles para recompensas
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-1 border rounded-md p-1">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="gap-2"
            >
              <LayoutGrid className="w-4 h-4" />
              Grid
            </Button>
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="gap-2"
            >
              <TableIcon className="w-4 h-4" />
              Tabla
            </Button>
          </div>
          <Link href="/admin/collections/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New NFT Collection
            </Button>
          </Link>
          <Link href="/admin/nfts/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New NFT Asset
            </Button>
          </Link>
        </div>
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
            <div className="w-48">
              <Select
                value={selectedCollection}
                onValueChange={setSelectedCollection}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Colección" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las colecciones</SelectItem>
                  {collections.map((collection) => (
                    <SelectItem key={collection.id} value={collection.id}>
                      {collection.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vista de Grid */}
      {viewMode === "grid" && (
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
                            onClick={() =>
                              window.open(nft.metadataUri, "_blank")
                            }
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
                        <p>
                          Minted: {new Date(nft.usedAt).toLocaleDateString()}
                        </p>
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
      )}

      {/* Vista de Tabla */}
      {viewMode === "table" && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vista</TableHead>
                <TableHead>NFT Asset</TableHead>
                <TableHead>Colección</TableHead>
                <TableHead className="text-center">Rareza</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-center">Token ID</TableHead>
                <TableHead className="text-center">Creado</TableHead>
                <TableHead className="text-center">Minted</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNFTs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        No se encontraron NFTs
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredNFTs.map((nft) => {
                  const rarityInfo =
                    rarityConfig[nft.rarity as keyof typeof rarityConfig];
                  return (
                    <TableRow key={nft.id}>
                      <TableCell>
                        <div className="w-16 h-16 relative rounded overflow-hidden">
                          <img
                            src={nft.imageUrl}
                            alt={`NFT #${nft.educationalNFT ? nft.educationalNFT.tokenId : "-"}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>
                          <p className="font-semibold">
                            {nft.name || "No name"}
                          </p>
                          {nft.metadataUri && (
                            <p className="text-xs text-muted-foreground truncate max-w-xs">
                              {nft.metadataUri}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/collections/${nft.collectionId || ""}/edit`}
                          className="text-sm text-muted-foreground hover:underline"
                        >
                          {nft.collection?.name || "No collection"}
                        </Link>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={rarityInfo.color}>
                          <span className="mr-1">{rarityInfo.icon}</span>
                          {rarityInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {nft.isUsed ? (
                          <Badge
                            variant="default"
                            className="gap-1 bg-green-600"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Minted
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            Disponible
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {nft.educationalNFT ? (
                          <Link
                            href={getExplorerUrl(
                              nft.educationalNFT.contractAddress,
                              nft.educationalNFT.tokenId
                            )}
                            target="_blank"
                            className="text-blue-600 hover:underline"
                          >
                            #{nft.educationalNFT.tokenId}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">
                        {new Date(nft.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">
                        {nft.isUsed && nft.usedAt
                          ? new Date(nft.usedAt).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          {nft.isUsed && (
                            <Button variant="ghost" size="sm" asChild>
                              <Link
                                href={`/nft/${nft.educationalNFT?.id}`}
                                target="_blank"
                                className="gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                Ver
                              </Link>
                            </Button>
                          )}
                          {!nft.isUsed && (
                            <Button variant="ghost" size="sm" asChild>
                              <Link
                                href={`/admin/nfts/${nft.id}/edit`}
                                className="gap-2"
                              >
                                <Edit className="w-4 h-4" />
                                Editar
                              </Link>
                            </Button>
                          )}
                          {nft.metadataUri && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                window.open(nft.metadataUri, "_blank")
                              }
                              className="gap-2"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Metadata
                            </Button>
                          )}
                          {!nft.isUsed && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteNFTId(nft.id)}
                              className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              Eliminar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {viewMode === "grid" && filteredNFTs.length === 0 && (
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

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Mostrando {filteredNFTs.length} de {totalNFTs} NFTs
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadNFTs(currentPage - 1)}
              disabled={currentPage === 1 || loading}
            >
              Anterior
            </Button>
            <span className="text-sm">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadNFTs(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
            >
              Siguiente
            </Button>
          </div>
        </div>
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
