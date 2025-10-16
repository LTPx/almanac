"use client";

import { useState, useEffect } from "react";

interface ProgressData {
  approvedUnits: number[];
  experiencePoints: number;
  isCompleted: boolean;
}

export function useProgress(userId: string, curriculumId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressData>({
    approvedUnits: [],
    experiencePoints: 0,
    isCompleted: false
  });

  const fetchProgress = async () => {
    if (!userId || !curriculumId) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/users/${userId}/progress?curriculumId=${curriculumId}`
      );
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Error al cargar progreso");
      }

      const data = await res.json();
      setProgress({
        approvedUnits: data.approvedUnits.map((l: any) => l.id),
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
  }, [userId, curriculumId]);

  return {
    progress,
    isLoading,
    error,
    refetch: fetchProgress
  };
}
