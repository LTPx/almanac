"use client";

import { useState, useEffect } from "react";

interface ProgressData {
  approvedLessons: number[];
  experiencePoints: number;
  isCompleted: boolean;
}

export function useProgress(userId: string, unitId: number) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressData>({
    approvedLessons: [],
    experiencePoints: 0,
    isCompleted: false
  });

  const fetchProgress = async () => {
    if (!userId || !unitId) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/users/${userId}/progress?unitId=${unitId}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Error al cargar progreso");
      }

      const data = await res.json();
      setProgress({
        approvedLessons: data.approvedLessons.map((l: any) => l.id),
        experiencePoints: data.experiencePoints || 0,
        isCompleted: data.isCompleted || false
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [userId, unitId]);

  return {
    progress,
    isLoading,
    error,
    refetch: fetchProgress
  };
}
