"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Layers, Image } from "lucide-react";

interface NFTCollection {
  id: string;
  name: string;
  symbol: string;
  description: string | null;
  contractAddress: string;
  chainId: number;
  isActive: boolean;
  maxSupply: number | null;
  defaultRoyaltyBps: number | null;
  createdAt: string;
  _count: {
    nftAssets: number;
    educationalNFTs: number;
  };
}

export default function NFTCollectionsPage() {
  const router = useRouter();
  const [collections, setCollections] = useState<NFTCollection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const response = await fetch("/api/admin/nft-collections");
      const data = await response.json();
      setCollections(data);
    } catch (error) {
      console.error("Error fetching collections:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta colección?")) return;

    try {
      const response = await fetch(`/api/admin/nft-collections/${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        fetchCollections();
      } else {
        const data = await response.json();
        alert(data.error || "Error al eliminar");
      }
    } catch (error) {
      console.error("Error deleting collection:", error);
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">NFT Collections</h1>
          <p className="text-muted-foreground">
            Gestiona las colecciones de NFTs
          </p>
        </div>
        <Button onClick={() => router.push("/admin/nfts/collections/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Colección
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead>Contrato</TableHead>
              <TableHead>Chain</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">
                <Image className="inline h-4 w-4 mr-1" />
                Assets
              </TableHead>
              <TableHead className="text-right">
                <Layers className="inline h-4 w-4 mr-1" />
                NFTs Minted
              </TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {collections.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-muted-foreground"
                >
                  No hay colecciones creadas
                </TableCell>
              </TableRow>
            ) : (
              collections.map((collection) => (
                <TableRow key={collection.id}>
                  <TableCell className="font-medium">
                    {collection.name}
                  </TableCell>
                  <TableCell>{collection.symbol}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                      {truncateAddress(collection.contractAddress)}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {collection.chainId === 80002
                        ? "Amoy"
                        : collection.chainId}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {collection.isActive ? (
                      <Badge variant="default">Activo</Badge>
                    ) : (
                      <Badge variant="secondary">Inactivo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {collection._count.nftAssets}
                  </TableCell>
                  <TableCell className="text-right">
                    {collection._count.educationalNFTs}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          router.push(
                            `/admin/nfts/collections/${collection.id}/edit`
                          )
                        }
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(collection.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
