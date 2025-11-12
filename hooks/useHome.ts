"use client";

import { HomeAppResponse } from "@/lib/types";
import { useState } from "react";

export function useHome() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getHomeData = async (
    curriculumId: string,
    userId: string
  ): Promise<HomeAppResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/app/home?curriculumId=${curriculumId}&userId=${userId}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error get home data");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    getHomeData
  };
}
