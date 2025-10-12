"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { Unit, Curriculum } from "@/lib/types";

export default function CurriculumUnitsPage() {
  const { curriculumId } = useParams();
  const router = useRouter();

  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [allUnits, setAllUnits] = useState<Unit[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [curriculumRes, unitsRes] = await Promise.all([
          fetch(`/api/curriculums/${curriculumId}`),
          fetch(`/api/units?search=${encodeURIComponent(searchTerm)}`)
        ]);

        if (!curriculumRes.ok || !unitsRes.ok)
          throw new Error("Error al cargar datos");

        const { curriculum } = await curriculumRes.json();
        const units = await unitsRes.json();
        setCurriculum(curriculum);
        setAllUnits(units);
      } catch (err) {
        console.error(err);
        toast.error("Error al cargar las unidades o curriculum");
      } finally {
        setLoading(false);
      }
    };
    if (searchTerm.length === 0 || searchTerm.length > 2) {
      fetchData();
    }
  }, [curriculumId, searchTerm]);

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
      const res = await fetch(`/api/curriculums/${curriculumId}/units`, {
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
              <p className="text-center text-sm text-muted-foreground">
                No se encontraron unidades.
              </p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
