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
import { Label } from "@/components/ui/label";
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

type Curriculum = {
  id: string;
  title: string;
};

export default function LayersPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("");
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [colRes, curRes] = await Promise.all([
          fetch("/api/nft-collections"),
          fetch("/api/admin/curriculums")
        ]);

        if (colRes.ok) {
          const data = await colRes.json();
          setCollections(data);
          if (data.length > 0) {
            setSelectedCollectionId(data[0].id);
          }
        }

        if (curRes.ok) {
          const response = await curRes.json();
          // Handle both array and object with items
          const items = Array.isArray(response)
            ? response
            : response.data || response;

          setCurriculums(items);
        }
      } catch {
        console.error("Error fetching data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
              <Label className="text-xs text-muted-foreground mb-1 block">
                Colección
              </Label>
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

            <div className="w-80">
              <Label className="text-xs text-muted-foreground mb-1 block">
                Curriculum (para preview y generación)
              </Label>
              <Select
                value={selectedCurriculumId}
                onValueChange={setSelectedCurriculumId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos (aleatorio)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos (aleatorio)</SelectItem>
                  {curriculums.map((cur) => (
                    <SelectItem key={cur.id} value={cur.id}>
                      {cur.title}
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
                <LayerCategoryManager collectionId={selectedCollectionId} />
              </div>

              {/* Preview + Batch Generator (1/3 width) */}
              <div className="space-y-6">
                <NftPreview
                  collectionId={selectedCollectionId}
                  curriculumId={
                    selectedCurriculumId && selectedCurriculumId !== "all"
                      ? selectedCurriculumId
                      : undefined
                  }
                />
                <BatchGenerator
                  collectionId={selectedCollectionId}
                  collectionName={selectedCollection.name}
                  curriculumId={
                    selectedCurriculumId && selectedCurriculumId !== "all"
                      ? selectedCurriculumId
                      : undefined
                  }
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
