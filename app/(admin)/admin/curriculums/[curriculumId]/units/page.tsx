"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Check, X, Loader2, ChevronDown } from "lucide-react";
import { Unit, Curriculum } from "@/lib/types";

export default function CurriculumUnitsPage() {
  const { curriculumId } = useParams();
  const router = useRouter();

  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [allUnits, setAllUnits] = useState<Unit[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 15;

  // Cargar curriculum solo una vez al montar
  useEffect(() => {
    const fetchCurriculum = async () => {
      try {
        setLoading(true);
        const curriculumRes = await fetch(`/api/admin/curriculums/${curriculumId}`);

        if (!curriculumRes.ok) throw new Error("Error al cargar curriculum");

        const curriculum = await curriculumRes.json();
        setCurriculum(curriculum);
      } catch (err) {
        console.error(err);
        toast.error("Error al cargar el curriculum");
      } finally {
        setLoading(false);
      }
    };

    fetchCurriculum();
  }, [curriculumId]);

  // Cargar unidades cuando cambia el término de búsqueda (con debounce)
  useEffect(() => {
    // Debounce: esperar 500ms después de que el usuario deje de escribir
    const timeoutId = setTimeout(() => {
      const fetchUnits = async () => {
        if (searchTerm.length === 0 || searchTerm.length > 2) {
          // Resetear unidades y página cuando cambia el término de búsqueda
          setAllUnits([]);
          setCurrentPage(1);
          await loadUnits(1, searchTerm, true);
        }
      };

      fetchUnits();
    }, 500);

    // Limpiar timeout si el usuario sigue escribiendo
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const loadUnits = async (page: number, search: string, reset: boolean = false) => {
    try {
      const unitsRes = await fetch(
        `/api/admin/units?search=${encodeURIComponent(search)}&page=${page}&pageSize=${pageSize}`
      );

      if (!unitsRes.ok) throw new Error("Error al cargar unidades");

      const unitsData = await unitsRes.json();
      const newUnits = unitsData.data || [];

      setAllUnits((prev) => reset ? newUnits : [...prev, ...newUnits]);
      setHasMore(unitsData.pagination.page < unitsData.pagination.totalPages);
    } catch (err) {
      console.error(err);
      toast.error("Error al cargar unidades");
    }
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    const nextPage = currentPage + 1;
    await loadUnits(nextPage, searchTerm, false);
    setCurrentPage(nextPage);
    setLoadingMore(false);
  };

  const toggleUnit = (unit: Unit) => {
    if (!curriculum) return;
    const alreadySelected = curriculum.units.some((u) => u.id === unit.id);

    const updatedUnits = alreadySelected
      ? curriculum.units.filter((u) => u.id !== unit.id)
      : [...curriculum.units, unit];

    setCurriculum({ ...curriculum, units: updatedUnits });
  };

  const handleSave = async () => {
    if (!curriculum) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/curriculums/${curriculumId}/units`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unitIds: curriculum.units.map((u) => u.id) })
      });

      if (!res.ok) throw new Error("Error al guardar cambios");

      toast.success("Unidades actualizadas correctamente");
      router.push(`/admin/curriculums`);
    } catch {
      toast.error("No se pudieron guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (!curriculum) return <p>No se encontró el curriculum</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Gestionar unidades - {curriculum.title}
        </h1>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Unidades seleccionadas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {curriculum.units.length > 0 ? (
            curriculum.units.map((unit) => (
              <Badge
                key={unit.id}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {unit.name}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-red-600"
                  onClick={() => toggleUnit(unit)}
                />
              </Badge>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No hay unidades seleccionadas.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Buscar y agregar unidades</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input
            placeholder="Buscar unidades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="space-y-2">
            <ScrollArea className="h-64 border rounded-md p-2">
              {allUnits.length > 0 ? (
                <div className="space-y-1">
                  {allUnits.map((unit) => {
                    const isSelected = curriculum.units.some(
                      (u) => u.id === unit.id
                    );
                    return (
                      <Button
                        key={unit.id}
                        variant={isSelected ? "secondary" : "ghost"}
                        className="w-full justify-between"
                        onClick={() => toggleUnit(unit)}
                      >
                        <span>{unit.name}</span>
                        {isSelected && <Check className="h-4 w-4" />}
                      </Button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground py-8">
                  No se encontraron unidades.
                </p>
              )}
            </ScrollArea>

            {/* Botón cargar más */}
            {hasMore && allUnits.length > 0 && (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cargando más unidades...
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-2 h-4 w-4" />
                    Cargar más unidades
                  </>
                )}
              </Button>
            )}

            {/* Indicador de total */}
            {allUnits.length > 0 && (
              <p className="text-xs text-center text-muted-foreground">
                {allUnits.length} unidades cargadas
                {!hasMore && " (todas)"}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
