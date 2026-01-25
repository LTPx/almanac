"use client";

import { useState, useEffect, useCallback } from "react";
import { Curriculum } from "@/lib/types";
import { toast } from "sonner";

interface Pagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface UseAdminCurriculumsReturn {
  curriculums: Curriculum[];
  loading: boolean;
  pagination: Pagination;
  searchTitle: string;
  setSearchTitle: (title: string) => void;
  search: (page?: number) => Promise<void>;
  goToPage: (page: number) => void;
  deleteCurriculum: (id: string) => Promise<void>;
  toggleCurriculumStatus: (id: string) => Promise<void>;
}

const PAGE_SIZE = 15;

export function useAdminCurriculums(): UseAdminCurriculumsReturn {
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTitle, setSearchTitle] = useState("");
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    pageSize: PAGE_SIZE,
    totalPages: 1
  });

  const fetchCurriculums = useCallback(
    async (page: number, search?: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: PAGE_SIZE.toString()
        });

        if (search) {
          params.append("search", search);
        }

        const response = await fetch(`/api/admin/curriculums?${params}`);
        const data = await response.json();

        if (response.ok) {
          setCurriculums(data.data);
          setPagination({
            total: data.pagination.total,
            page: data.pagination.page,
            pageSize: data.pagination.pageSize,
            totalPages: data.pagination.totalPages
          });
        } else {
          console.error("Error fetching curriculums:", data.error);
          toast.error("Error al cargar los curriculums");
        }
      } catch (error) {
        console.error("Error fetching curriculums:", error);
        toast.error("Error al cargar los curriculums");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const search = useCallback(
    async (page: number = 1) => {
      await fetchCurriculums(page, searchTitle || undefined);
    },
    [fetchCurriculums, searchTitle]
  );

  const goToPage = useCallback(
    (page: number) => {
      fetchCurriculums(page, searchTitle || undefined);
    },
    [fetchCurriculums, searchTitle]
  );

  const deleteCurriculum = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/admin/curriculums/${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
          throw new Error("Failed to delete curriculum");
        }

        setCurriculums((prev) => prev.filter((c) => c.id !== id));
        toast.success("Curriculum eliminado correctamente");
      } catch (error) {
        console.error(error);
        toast.error("No se pudo eliminar el curriculum");
        throw error;
      }
    },
    []
  );

  const toggleCurriculumStatus = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/admin/curriculums/${id}/active`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) {
        throw new Error("Failed to toggle curriculum status");
      }

      setCurriculums((prev) =>
        prev.map((curriculum) =>
          curriculum.id === id
            ? { ...curriculum, isActive: !curriculum.isActive }
            : curriculum
        )
      );
      toast.success("Estado del curriculum actualizado");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo actualizar el curriculum");
      throw error;
    }
  }, []);

  useEffect(() => {
    fetchCurriculums(1);
  }, [fetchCurriculums]);

  return {
    curriculums,
    loading,
    pagination,
    searchTitle,
    setSearchTitle,
    search,
    goToPage,
    deleteCurriculum,
    toggleCurriculumStatus
  };
}
