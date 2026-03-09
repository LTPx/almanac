"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Layers, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { LayerCategoryManager } from "@/components/admin/layer-category-manager";
import { BatchGenerator } from "@/components/admin/batch-generator";
import { NftPreview } from "@/components/admin/nft-preview";

type Collection = {
  id: string;
  name: string;
  symbol: string;
  isActive: boolean;
  _count: { nftAssets: number };
};

export default function LayersPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await fetch("/api/nft-collections");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setCollections(data);
        if (data.length > 0) {
          setSelectedCollectionId(data[0].id);
        }
      } catch {
        console.error("Error fetching collections");
      } finally {
        setLoading(false);
      }
    };
    fetchCollections();
  }, []);

  const selectedCollection = collections.find(
    (c) => c.id === selectedCollectionId
  );

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/nfts">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5" />
            <h1 className="text-2xl font-bold">Gestión de Capas NFT</h1>
          </div>
        </div>
      </div>

      {/* Collection selector */}
      {collections.length === 0 ? (
        <p className="text-muted-foreground">
          No hay colecciones. Crea una primero en la sección de NFTs.
        </p>
      ) : (
        <>
          <div className="flex items-center gap-4">
            <div className="w-80">
              <Select
                value={selectedCollectionId}
                onValueChange={setSelectedCollectionId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar colección" />
                </SelectTrigger>
                <SelectContent>
                  {collections.map((col) => (
                    <SelectItem key={col.id} value={col.id}>
                      {col.name} ({col.symbol}) — {col._count.nftAssets} assets
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedCollectionId && selectedCollection && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Categories + Traits (2/3 width) */}
              <div className="lg:col-span-2">
                <h2 className="text-lg font-semibold mb-3">
                  Categorías y Traits
                </h2>
                <LayerCategoryManager
                  collectionId={selectedCollectionId}
                />
              </div>

              {/* Preview + Batch Generator (1/3 width) */}
              <div className="space-y-6">
                <NftPreview collectionId={selectedCollectionId} />
                <BatchGenerator
                  collectionId={selectedCollectionId}
                  collectionName={selectedCollection.name}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
