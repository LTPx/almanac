"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LessonAdmin, Unit } from "@/lib/types";
import { toast } from "sonner";

interface Pagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface UseAdminLessonsReturn {
  lessons: LessonAdmin[];
  loading: boolean;
  pagination: Pagination;
  searchName: string;
  setSearchName: (name: string) => void;
  unitId: string;
  setUnitId: (id: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
  units: Unit[];
  search: (page?: number) => Promise<void>;
  goToPage: (page: number) => void;
  deleteLesson: (id: number) => Promise<void>;
  toggleLessonStatus: (id: number) => void;
}

const PAGE_SIZE = 15;

export function useAdminLessons(): UseAdminLessonsReturn {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [lessons, setLessons] = useState<LessonAdmin[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchName, setSearchName] = useState(searchParams.get("search") ?? "");
  const [unitId, setUnitId] = useState(searchParams.get("unitId") ?? "");
  const [language, setLanguage] = useState(searchParams.get("language") ?? "");
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: Number(searchParams.get("page")) || 1,
    pageSize: PAGE_SIZE,
    totalPages: 1
  });

  const fetchUnits = useCallback(async () => {
    try {
      const response = await fetch("/api/units");
      const data = await response.json();
      if (response.ok) {
        setUnits(data);
      }
    } catch (error) {
      console.error("Error fetching units:", error);
    }
  }, []);

  const fetchLessons = useCallback(
    async (page: number, search?: string, unit?: string, lang?: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: PAGE_SIZE.toString()
        });

        if (search) {
          params.append("search", search);
        }

        if (unit) {
          params.append("unitId", unit);
        }

        if (lang) {
          params.append("language", lang);
        }

        const response = await fetch(`/api/lessons?${params}`);
        const data = await response.json();

        if (response.ok) {
          setLessons(data.data);
          setPagination({
            total: data.pagination.total,
            page: data.pagination.page,
            pageSize: data.pagination.pageSize,
            totalPages: data.pagination.totalPages
          });
        } else {
          console.error("Error fetching lessons:", data.error);
          toast.error("Error al cargar las lecciones");
        }
      } catch (error) {
        console.error("Error fetching lessons:", error);
        toast.error("Error al cargar las lecciones");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateUrl = useCallback(
    (page: number, name: string, unit: string, lang: string) => {
      const params = new URLSearchParams();
      if (name) params.set("search", name);
      if (unit) params.set("unitId", unit);
      if (lang) params.set("language", lang);
      if (page > 1) params.set("page", page.toString());
      const query = params.toString();
      router.replace(query ? `?${query}` : "?", { scroll: false });
    },
    [router]
  );

  const search = useCallback(
    async (page: number = 1) => {
      updateUrl(page, searchName, unitId, language);
      await fetchLessons(page, searchName || undefined, unitId || undefined, language || undefined);
    },
    [fetchLessons, searchName, unitId, language, updateUrl]
  );

  const goToPage = useCallback(
    (page: number) => {
      updateUrl(page, searchName, unitId, language);
      fetchLessons(page, searchName || undefined, unitId || undefined, language || undefined);
    },
    [fetchLessons, searchName, unitId, language, updateUrl]
  );

  const deleteLesson = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/lessons/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Failed to delete lesson");
      }

      setLessons((prev) => prev.filter((l) => l.id !== id));
      toast.success("Lección eliminada correctamente");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo eliminar la lección");
      throw error;
    }
  }, []);

  const toggleLessonStatus = useCallback((id: number) => {
    setLessons((prev) =>
      prev.map((lesson) =>
        lesson.id === id ? { ...lesson, isActive: !lesson.isActive } : lesson
      )
    );
  }, []);

  useEffect(() => {
    const initialPage = Number(searchParams.get("page")) || 1;
    const initialSearch = searchParams.get("search") ?? undefined;
    const initialUnit = searchParams.get("unitId") ?? undefined;
    const initialLanguage = searchParams.get("language") ?? undefined;
    fetchUnits();
    fetchLessons(initialPage, initialSearch, initialUnit, initialLanguage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    lessons,
    loading,
    pagination,
    searchName,
    setSearchName,
    unitId,
    setUnitId,
    language,
    setLanguage,
    units,
    search,
    goToPage,
    deleteLesson,
    toggleLessonStatus
  };
}
