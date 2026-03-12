"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, AlertTriangle, Info } from "lucide-react";
import { toast } from "sonner";
import { BatchGenerationResult } from "@/lib/types";

interface BatchGeneratorProps {
  collectionId: string;
  collectionName: string;
  curriculumId?: string;
}

export function BatchGenerator({
  collectionId,
  collectionName,
  curriculumId
}: BatchGeneratorProps) {
  const [count, setCount] = useState("10");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<BatchGenerationResult | null>(null);
  const [maxCombinations, setMaxCombinations] = useState<number | null>(null);

  const calcMaxCombinations = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/admin/layer-categories?collectionId=${collectionId}`
      );
      if (!res.ok) return;
      const categories = await res.json();
      if (!categories.length) {
        setMaxCombinations(0);
        return;
      }

      const max = categories.reduce(
        (product: number, cat: { traits: { curriculumId: string | null }[] }) => {
          let available = cat.traits;
          if (curriculumId) {
            const hasCurriculumTraits = cat.traits.some(
              (t) => t.curriculumId !== null
            );
            if (hasCurriculumTraits) {
              const matching = cat.traits.filter(
                (t) => t.curriculumId === curriculumId
              );
              available =
                matching.length > 0
                  ? matching
                  : cat.traits.filter((t) => t.curriculumId === null);
            }
          }
          return product * (available.length || 1);
        },
        1
      );
      setMaxCombinations(max);
    } catch {
      setMaxCombinations(null);
    }
  }, [collectionId, curriculumId]);

  useEffect(() => {
    calcMaxCombinations();
  }, [calcMaxCombinations]);

  const handleGenerate = async () => {
    const quantity = parseInt(count);
    if (!quantity || quantity < 1) {
      toast.error("Ingresa una cantidad válida");
      return;
    }

    setGenerating(true);
    setResult(null);

    try {
      const res = await fetch("/api/admin/generate-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collectionId,
          count: quantity,
          ...(curriculumId && { curriculumId })
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al generar batch");
      }

      setResult(data);

      if (data.errors.length === 0) {
        toast.success(`${data.generated} imágenes generadas exitosamente`);
      } else {
        toast.warning(
          `${data.generated}/${data.total} generadas, ${data.errors.length} errores`
        );
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al generar batch"
      );
    } finally {
      setGenerating(false);
    }
  };

  const rarityColors: Record<string, string> = {
    NORMAL: "bg-gray-100 text-gray-800",
    RARE: "bg-blue-100 text-blue-800",
    EPIC: "bg-purple-100 text-purple-800",
    UNIQUE: "bg-yellow-100 text-yellow-800"
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Generador Batch
        </CardTitle>
        <CardDescription>
          Genera imágenes combinando capas aleatoriamente para &quot;
          {collectionName}&quot;
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end gap-3">
          <div className="flex-1 max-w-[200px]">
            <Label>Cantidad</Label>
            <Input
              type="number"
              min="1"
              max="10000"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              disabled={generating}
            />
          </div>
          <Button
            onClick={handleGenerate}
            disabled={generating || !count || parseInt(count) < 1}
          >
            {generating ? (
              <>Generando...</>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generar Batch
              </>
            )}
          </Button>
        </div>

        {maxCombinations !== null && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Info className="w-3.5 h-3.5" />
            <span>
              Máximo de combinaciones únicas:{" "}
              <strong className="text-foreground">
                {maxCombinations.toLocaleString()}
              </strong>
            </span>
          </div>
        )}

        {generating && (
          <div className="space-y-2">
            <Progress className="h-2" />
            <p className="text-sm text-muted-foreground">
              Generando imágenes... esto puede tomar unos minutos.
            </p>
          </div>
        )}

        {result && (
          <div className="space-y-3 border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Resultado</h4>
              <Badge variant={result.errors.length > 0 ? "destructive" : "default"}>
                {result.generated}/{result.total} generadas
              </Badge>
            </div>

            {/* Rarity breakdown */}
            <div className="flex gap-2 flex-wrap">
              {Object.entries(result.byRarity).map(([rarity, count]) => (
                <Badge
                  key={rarity}
                  className={rarityColors[rarity] || ""}
                  variant="outline"
                >
                  {rarity}: {count}
                </Badge>
              ))}
            </div>

            {/* Errors */}
            {result.errors.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertTriangle className="w-4 h-4" />
                  {result.errors.length} errores
                </div>
                <div className="max-h-32 overflow-y-auto text-xs text-muted-foreground space-y-0.5">
                  {result.errors.map((err, i) => (
                    <p key={i}>{err}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
