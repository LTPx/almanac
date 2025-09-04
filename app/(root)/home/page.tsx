"use client";

import { useEffect, useState } from "react";
import LearningPath from "@/components/units-learning";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/context/UserContext";

// Tipos
type Lesson = {
  id: number;
  name: string;
  description?: string | null;
  position: number;
  unitId: number;
};

type Unit = {
  id: number;
  name: string;
  description: string | null;
  order: number;
  isActive: boolean;
  _count: {
    lessons: number;
  };
  lessons?: Lesson[];
};

export default function HomePage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(true);

  const user = useUser();
  const userId = user?.id || "";

  // Fetch de todas las unidades (sin lecciones)
  const fetchUnits = async () => {
    const res = await fetch("/api/units");
    if (!res.ok) throw new Error("Error al cargar unidades");
    return res.json();
  };

  // Fetch de una unidad + sus lecciones
  const fetchUnitWithLessons = async (unitId: number) => {
    const unitRes = await fetch(`/api/units/${unitId}`);
    if (!unitRes.ok) throw new Error("Error al cargar unidad");
    const unitData = await unitRes.json();

    const lessonsRes = await fetch(`/api/units/${unitId}/lessons`);
    if (!lessonsRes.ok) throw new Error("Error al cargar lecciones");
    const lessonsData = await lessonsRes.json();

    return { ...unitData, lessons: lessonsData };
  };

  // Cargar lista de unidades al montar
  useEffect(() => {
    const loadUnits = async () => {
      try {
        const data = await fetchUnits();
        setUnits(data);
        if (data.length > 0) {
          setSelectedUnitId(data[0].id.toString()); // selecciona la primera por defecto
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadUnits();
  }, []);

  // Cargar lecciones de la unidad seleccionada
  useEffect(() => {
    if (!selectedUnitId) return;
    const loadUnit = async () => {
      try {
        setLoading(true);
        const unit = await fetchUnitWithLessons(Number(selectedUnitId));
        setSelectedUnit(unit);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadUnit();
  }, [selectedUnitId]);

  return (
    <div className="HomePage p-6">
      {/* Select de unidades */}
      <div className="mb-6 max-w-md">
        <Select value={selectedUnitId} onValueChange={setSelectedUnitId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona una unidad..." />
          </SelectTrigger>
          <SelectContent>
            {units.map((unit) => (
              <SelectItem key={unit.id} value={unit.id.toString()}>
                <div className="flex items-center justify-between w-full">
                  <span>{unit.name}</span>
                  <Badge variant="secondary" className="ml-2">
                    {unit._count.lessons} lecciones
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Path de la unidad seleccionada */}
      {loading && <div>Cargando...</div>}
      {!loading && selectedUnit && (
        <div className="h-full">
          <LearningPath unit={selectedUnit} userId={userId} />
        </div>
      )}
      {!loading && !selectedUnit && <div>No se encontraron datos</div>}
    </div>
  );
}
