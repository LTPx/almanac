"use client";

import { useEffect, useState } from "react";
import LearningPath from "@/components/units-learning";
import { useUser } from "@/context/UserContext";
import { useUnits } from "@/hooks/use-units";
import { Unit } from "@/lib/types";
import CourseHeader from "@/components/course-header";

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
    <div className="HomePage">
      <CourseHeader
        units={units}
        selectedUnitId={selectedUnitId}
        onUnitChange={setSelectedUnitId}
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
