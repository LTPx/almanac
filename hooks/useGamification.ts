"use client";

import { useState, useEffect } from "react";

interface GamificationData {
  hearts: number;
  maxHearts: number;
  zapTokens: number;
  totalCurriculumsCompleted: number;
  unitTokens: any[];
  needsHeartReset: boolean;
  canPurchaseHeart: boolean;
}

export function useGamification(userId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gamification, setGamification] = useState<GamificationData>({
    hearts: 0,
    maxHearts: 0,
    zapTokens: 0,
    totalCurriculumsCompleted: 0,
    unitTokens: [],
    needsHeartReset: false,
    canPurchaseHeart: false
  });

  const fetchGamification = async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/users/${userId}/gamification`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Error al cargar gamificación");
      }

      const data = await res.json();
      setGamification({
        hearts: data.hearts ?? 0,
        maxHearts: data.maxHearts ?? 0,
        zapTokens: data.zapTokens ?? 0,
        totalCurriculumsCompleted: data.totalCurriculumsCompleted ?? 0,
        unitTokens: data.unitTokens ?? [],
        needsHeartReset: data.needsHeartReset ?? false,
        canPurchaseHeart: data.canPurchaseHeart ?? false
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGamification();
  }, [userId]);

  return {
    gamification,
    isLoading,
    error,
    refetch: fetchGamification
  };
}
