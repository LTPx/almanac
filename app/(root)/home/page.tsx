"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@/context/UserContext";
import { Curriculum } from "@/lib/types";
import CourseHeader from "@/components/course-header";
import { useGamification } from "@/hooks/useGamification";
import { useCurriculums } from "@/hooks/use-curriculums";
import LearningPath from "@/components/units-learning";
import { useCurriculumStore } from "@/store/useCurriculumStore";

export default function HomePage() {
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [selectedCurriculum, setSelectedCurriculum] =
    useState<Curriculum | null>(null);
  const { selectedCurriculumId, setSelectedCurriculumId } =
    useCurriculumStore();

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
        setCurriculums(data);
        // Si no hay curriculum seleccionado, seleccionar el primero
        if (data.length > 0 && !selectedCurriculumId) {
          setSelectedCurriculumId(data[0].id.toString());
        }
      }
    };
    loadUnits();
  }, [fetchCurriculums, selectedCurriculumId, setSelectedCurriculumId]);

  useEffect(() => {
    if (!selectedCurriculumId) return;

    const loadUnit = async () => {
      const unit = await fetchCurriculumWithUnits(selectedCurriculumId);
      if (unit) setSelectedCurriculum(unit);
    };
    loadUnit();
  }, [selectedCurriculumId, fetchCurriculumWithUnits]);

  const handleTestComplete = useCallback(async () => {
    await refetchGamification();
  }, [refetchGamification]);

  const handleCurriculumChange = (curriculumId: string) => {
    setSelectedCurriculumId(curriculumId);
  };

  return (
    <div className="HomePage">
      <CourseHeader
        curriculums={curriculums}
        selectedCurriculumId={selectedCurriculumId}
        onUnitChange={handleCurriculumChange}
        lives={gamification?.hearts ?? 0}
        zaps={gamification?.zapTokens ?? 0}
      />
      {isLoading && <div>Cargando...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!isLoading && selectedCurriculum && (
        <div className="h-full">
          <LearningPath
            hearts={gamification?.hearts ?? 0}
            curriculum={selectedCurriculum}
            userId={userId}
            onTestComplete={handleTestComplete}
          />
        </div>
      )}
      {!isLoading && !selectedCurriculum && <div>No se encontraron datos</div>}
    </div>
  );
}
