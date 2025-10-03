"use client";

import { Unit } from "@/lib/types";
import { useState, useCallback } from "react";

export function useUnits() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUnits = useCallback(async (): Promise<Unit[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/units");
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Error al cargar unidades");
      }
      return await res.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUnitWithLessons = useCallback(
    async (unitId: number): Promise<Unit | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const unitRes = await fetch(`/api/units/${unitId}`);
        if (!unitRes.ok) throw new Error("Error al cargar unidad");
        const unitData = await unitRes.json();

        const lessonsRes = await fetch(`/api/units/${unitId}/lessons`);
        if (!lessonsRes.ok) throw new Error("Error al cargar lecciones");
        const lessonsData = await lessonsRes.json();

        return { ...unitData, lessons: lessonsData };
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
    fetchUnits,
    fetchUnitWithLessons
  };
}
