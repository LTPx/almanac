"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { Unit } from "@/lib/types";

interface UnitSelectorProps {
  selectedUnits: Unit[];
  onChange: (units: Unit[]) => void;
}

export default function UnitSelector({
  selectedUnits,
  onChange
}: UnitSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [availableUnits, setAvailableUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUnits = async (query: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/units?search=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Error al cargar unidades");
      const data = await res.json();
      setAvailableUnits(data.units);
    } catch {
      toast.error("No se pudieron cargar las unidades");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits("");
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    fetchUnits(term);
  };

  const toggleUnit = (unit: Unit) => {
    const isSelected = selectedUnits.some((u) => u.id === unit.id);
    if (isSelected) {
      onChange(selectedUnits.filter((u) => u.id !== unit.id));
    } else {
      onChange([...selectedUnits, unit]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Unidades del Curriculum</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Unidades seleccionadas */}
        <div className="flex flex-wrap gap-2">
          {selectedUnits.map((unit) => (
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
          ))}
          {selectedUnits.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No hay unidades seleccionadas
            </p>
          )}
        </div>

        {/* Buscador */}
        <div className="space-y-2">
          <Input
            placeholder="Buscar unidades..."
            value={searchTerm}
            onChange={handleSearch}
          />

          <ScrollArea className="h-48 border rounded-md p-2">
            {loading ? (
              <p className="text-center text-sm text-muted-foreground">
                Cargando...
              </p>
            ) : availableUnits.length > 0 ? (
              <div className="space-y-1">
                {availableUnits.map((unit) => {
                  const isSelected = selectedUnits.some(
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
        </div>
      </CardContent>
    </Card>
  );
}
