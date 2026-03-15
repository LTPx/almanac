// app/admin/nfts/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Filter,
  Image as ImageIcon,
  Sparkles,
  CheckCircle,
  LayoutGrid,
  Table as TableIcon
} from "lucide-react";
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
import NFTGridView from "./NFTGridView";
import NFTTableView from "./NFTTableView";

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

      {/* Vistas */}
      {viewMode === "grid" && (
        <NFTGridView
          nfts={filteredNFTs}
          searchTerm={searchTerm}
          selectedRarity={selectedRarity}
          selectedStatus={selectedStatus}
          onDelete={setDeleteNFTId}
        />
      )}

      {viewMode === "table" && (
        <NFTTableView nfts={filteredNFTs} onDelete={setDeleteNFTId} />
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
