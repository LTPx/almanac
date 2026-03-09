"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shuffle, ImageOff } from "lucide-react";
import { LayerCategory, LayerTrait } from "@/lib/types";

interface SelectedTrait {
  category: string;
  trait: LayerTrait;
}

function pickWeightedTrait(traits: LayerTrait[]): LayerTrait | null {
  if (traits.length === 0) return null;
  const total = traits.reduce((s, t) => s + t.weight, 0);
  if (total === 0) return traits[Math.floor(Math.random() * traits.length)];
  let r = Math.random() * total;
  for (const trait of traits) {
    r -= trait.weight;
    if (r <= 0) return trait;
  }
  return traits[traits.length - 1];
}

function randomizeCombination(categories: LayerCategory[]): SelectedTrait[] {
  const sorted = [...categories].sort((a, b) => a.order - b.order);
  const result: SelectedTrait[] = [];

  for (const cat of sorted) {
    const validTraits = cat.traits.filter(
      (t) => !t.imageUrl.startsWith("placeholder://")
    );
    if (validTraits.length === 0) continue;

    // Skip optional categories with ~30% probability
    if (!cat.isRequired && Math.random() < 0.3) continue;

    const trait = pickWeightedTrait(validTraits);
    if (trait) {
      result.push({ category: cat.name, trait });
    }
  }

  return result;
}

interface NftPreviewProps {
  collectionId: string;
}

export function NftPreview({ collectionId }: NftPreviewProps) {
  const [categories, setCategories] = useState<LayerCategory[]>([]);
  const [combination, setCombination] = useState<SelectedTrait[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAndRandomize = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/admin/layer-categories?collectionId=${collectionId}`
      );
      if (!res.ok) throw new Error();
      const data: LayerCategory[] = await res.json();
      setCategories(data);
      setCombination(randomizeCombination(data));
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [collectionId]);

  useEffect(() => {
    setLoading(true);
    fetchAndRandomize();
  }, [fetchAndRandomize]);

  const handleRandomize = () => {
    setCombination(randomizeCombination(categories));
  };

  const hasImages = combination.length > 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Preview Aleatorio</CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRandomize}
            disabled={loading || categories.length === 0}
            className="h-8 gap-1.5"
          >
            <Shuffle className="w-3.5 h-3.5" />
            Mezclar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Canvas */}
        <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-muted border">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
              Cargando...
            </div>
          ) : !hasImages ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <ImageOff className="w-8 h-8" />
              <span className="text-xs text-center px-4">
                Sube imágenes a los traits para ver el preview
              </span>
            </div>
          ) : (
            combination.map(({ trait }, i) => (
              <img
                key={trait.id}
                src={trait.imageUrl}
                alt={trait.name}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ zIndex: i + 1 }}
              />
            ))
          )}
        </div>

        {/* Trait list */}
        {hasImages && (
          <div className="space-y-1">
            {combination.map(({ category, trait }) => (
              <div
                key={trait.id}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-muted-foreground">{category}</span>
                <span className="font-medium truncate max-w-[60%] text-right">
                  {trait.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
