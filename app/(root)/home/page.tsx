"use client";

import { useEffect, useState } from "react";
import LearningPath from "@/components/units-learning";
import { useUser } from "@/context/UserContext";
import { useUnits } from "@/hooks/use-units";
import { SelectUnits } from "@/components/select-units";
import { Unit } from "@/lib/types";

export default function HomePage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  const user = useUser();
  const userId = user?.id || "";

  const { isLoading, error, fetchUnits, fetchUnitWithLessons } = useUnits();

  useEffect(() => {
    const loadUnits = async () => {
      const data = await fetchUnits();
      if (data) {
        setUnits(data);
        if (data.length > 0) {
          setSelectedUnitId(data[0].id.toString());
        }
      }
    };
    loadUnits();
  }, []);

  useEffect(() => {
    if (!selectedUnitId) return;

    const loadUnit = async () => {
      const unit = await fetchUnitWithLessons(Number(selectedUnitId));
      if (unit) setSelectedUnit(unit);
    };
    loadUnit();
  }, [selectedUnitId]);

  return (
    <div className="HomePage p-6">
      <SelectUnits
        units={units}
        selectedUnitId={selectedUnitId}
        onChange={setSelectedUnitId}
      />
      {isLoading && <div>Cargando...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!isLoading && selectedUnit && (
        <div className="h-full">
          <LearningPath unit={selectedUnit} userId={userId} />
        </div>
      )}
      {!isLoading && !selectedUnit && <div>No se encontraron datos</div>}
    </div>
  );
}
