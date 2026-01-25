"use client";

import { useState, useEffect, useCallback } from "react";
import { Unit, Curriculum } from "@/lib/types";
import { toast } from "sonner";

interface Pagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface UseAdminUnitsReturn {
  units: Unit[];
  loading: boolean;
  pagination: Pagination;
  searchName: string;
  setSearchName: (name: string) => void;
  curriculumId: string;
  setCurriculumId: (id: string) => void;
  curriculums: Curriculum[];
  search: (page?: number) => Promise<void>;
  goToPage: (page: number) => void;
  deleteUnit: (id: number, removeLessons: boolean) => Promise<void>;
  toggleUnitStatus: (id: number) => void;
}

const PAGE_SIZE = 15;

export function useAdminUnits(): UseAdminUnitsReturn {
  const [units, setUnits] = useState<Unit[]>([]);
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [curriculumId, setCurriculumId] = useState("");
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    pageSize: PAGE_SIZE,
    totalPages: 1
  });

  const fetchCurriculums = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/curriculums?pageSize=100");
      const data = await response.json();
      if (response.ok) {
        setCurriculums(data.data);
      }
    } catch (error) {
      console.error("Error fetching curriculums:", error);
    }
  }, []);

  const fetchUnits = useCallback(
    async (page: number, search?: string, curriculum?: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: PAGE_SIZE.toString()
        });

        if (search) {
          params.append("search", search);
        }

        if (curriculum) {
          params.append("curriculumId", curriculum);
        }

        const response = await fetch(`/api/admin/units?${params}`);
        const data = await response.json();

        if (response.ok) {
          setUnits(data.data);
          setPagination({
            total: data.pagination.total,
            page: data.pagination.page,
            pageSize: data.pagination.pageSize,
            totalPages: data.pagination.totalPages
          });
        } else {
          console.error("Error fetching units:", data.error);
          toast.error("Error al cargar las unidades");
        }
      } catch (error) {
        console.error("Error fetching units:", error);
        toast.error("Error al cargar las unidades");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const search = useCallback(
    async (page: number = 1) => {
      await fetchUnits(
        page,
        searchName || undefined,
        curriculumId || undefined
      );
    },
    [fetchUnits, searchName, curriculumId]
  );

  const goToPage = useCallback(
    (page: number) => {
      fetchUnits(page, searchName || undefined, curriculumId || undefined);
    },
    [fetchUnits, searchName, curriculumId]
  );

  const deleteUnit = useCallback(
    async (id: number, removeLessons: boolean) => {
      try {
        const response = await fetch(`/api/units/${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ removeLessons })
        });

        if (!response.ok) {
          throw new Error("Failed to delete unit");
        }

        setUnits((prev) => prev.filter((u) => u.id !== id));
        toast.success("Unidad eliminada correctamente");
      } catch (error) {
        console.error(error);
        toast.error("No se pudo eliminar la unidad");
        throw error;
      }
    },
    []
  );

  const toggleUnitStatus = useCallback((id: number) => {
    setUnits((prev) =>
      prev.map((unit) =>
        unit.id === id ? { ...unit, isActive: !unit.isActive } : unit
      )
    );
  }, []);

  useEffect(() => {
    fetchCurriculums();
    fetchUnits(1);
  }, [fetchCurriculums, fetchUnits]);

  return {
    units,
    loading,
    pagination,
    searchName,
    setSearchName,
    curriculumId,
    setCurriculumId,
    curriculums,
    search,
    goToPage,
    deleteUnit,
    toggleUnitStatus
  };
}
