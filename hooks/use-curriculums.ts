"use client";

import { Curriculum } from "@/lib/types";
import { useState, useCallback } from "react";

export function useCurriculums() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCurriculums = useCallback(async (): Promise<
    Curriculum[] | null
  > => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/curriculums");
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Error al cargar curriculums");
      }
      return await res.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCurriculumWithUnits = useCallback(
    async (curriculumId: string): Promise<Curriculum | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const unitRes = await fetch(`/api/curriculums/${curriculumId}`);
        if (!unitRes.ok) throw new Error("Error al cargar curriculums");
        const unitData = await unitRes.json();

        const unitsRes = await fetch(`/api/curriculums/${curriculumId}/units`);
        if (!unitsRes.ok) throw new Error("Error al cargar units");
        const unitsData = await unitsRes.json();

        return { ...unitData, units: unitsData };
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    isLoading,
    error,
    fetchCurriculums,
    fetchCurriculumWithUnits
  };
}
