"use client";

import { HomeAppResponse } from "@/lib/types";
import { useEffect, useState } from "react";

export function useHome(userId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [homeData, setHomeData] = useState<HomeAppResponse | null>(null);

  const getHomeData = async (): Promise<HomeAppResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/app/home?&userId=${userId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error get home data");
      }

      const data = await response.json();
      setHomeData(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getHomeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return {
    isLoading,
    error,
    homeData,
    isPremium: homeData?.isPremium || false,
    gamification: homeData?.gamification || null,
    refetch: getHomeData
  };
}
