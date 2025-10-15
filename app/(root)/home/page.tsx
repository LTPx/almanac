"use client";

import { useEffect, useState, useCallback } from "react";
import LearningPath from "@/components/units-learning";
import { useUser } from "@/context/UserContext";
import { Unit } from "@/lib/types";
import CourseHeader from "@/components/course-header";
import { useGamification } from "@/hooks/useGamification";
import { useCurriculums } from "@/hooks/use-curriculums";

export default function HomePage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const user = useUser();
  const userId = user?.id || "";
  const { isLoading, error, fetchCurriculums, fetchCurriculumWithUnits } =
    useCurriculums();
  const { gamification, refetch: refetchGamification } =
    useGamification(userId);

  useEffect(() => {
    const loadUnits = async () => {
      const data = await fetchCurriculums();
      if (data) {
        setUnits(data);
        if (data.length > 0) {
          setSelectedUnitId(data[0].id.toString());
        }
      }
    };
    loadUnits();
  }, [fetchCurriculums]);

  useEffect(() => {
    if (!selectedUnitId) return;

    const loadUnit = async () => {
      const unit = await fetchCurriculumWithUnits(Number(selectedUnitId));
      if (unit) setSelectedUnit(unit);
    };
    loadUnit();
  }, [selectedUnitId, fetchCurriculumWithUnits]);

  const handleTestComplete = useCallback(async () => {
    await refetchGamification();
  }, [refetchGamification]);

  return (
    <div className="HomePage">
      <CourseHeader
        units={units}
        selectedUnitId={selectedUnitId}
        onUnitChange={setSelectedUnitId}
        lives={gamification?.hearts ?? 0}
        zaps={gamification?.zapTokens ?? 0}
      />
      {isLoading && <div>Cargando...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!isLoading && selectedUnit && (
        <div className="h-full">
          <LearningPath
            hearts={gamification?.hearts ?? 0}
            unit={selectedUnit}
            userId={userId}
            onTestComplete={handleTestComplete}
          />
        </div>
      )}
      {!isLoading && !selectedUnit && <div>No se encontraron datos</div>}
    </div>
  );
}
