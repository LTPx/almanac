"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Question } from "@/lib/types";
import { toast } from "sonner";

interface Pagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface UseAdminQuestionsReturn {
  questions: Question[];
  loading: boolean;
  pagination: Pagination;
  searchTitle: string;
  setSearchTitle: (title: string) => void;
  questionType: string;
  setQuestionType: (type: string) => void;
  search: (page?: number) => Promise<void>;
  goToPage: (page: number) => void;
  deleteQuestion: (id: number) => Promise<void>;
  toggleQuestionStatus: (id: number) => void;
}

const PAGE_SIZE = 15;

export function useAdminQuestions(): UseAdminQuestionsReturn {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTitle, setSearchTitle] = useState(searchParams.get("search") ?? "");
  const [questionType, setQuestionType] = useState(searchParams.get("type") ?? "");
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: Number(searchParams.get("page")) || 1,
    pageSize: PAGE_SIZE,
    totalPages: 1
  });

  const fetchQuestions = useCallback(
    async (page: number, search?: string, type?: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: PAGE_SIZE.toString()
        });

        if (search) {
          params.append("search", search);
        }

        if (type) {
          params.append("type", type);
        }

        const response = await fetch(`/api/questions?${params}`);
        const data = await response.json();

        if (response.ok) {
          setQuestions(data.data);
          setPagination({
            total: data.pagination.total,
            page: data.pagination.page,
            pageSize: data.pagination.pageSize,
            totalPages: data.pagination.totalPages
          });
        } else {
          console.error("Error fetching questions:", data.error);
          toast.error("Error al cargar las preguntas");
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
        toast.error("Error al cargar las preguntas");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateUrl = useCallback(
    (page: number, title: string, type: string) => {
      const params = new URLSearchParams();
      if (title) params.set("search", title);
      if (type) params.set("type", type);
      if (page > 1) params.set("page", page.toString());
      const query = params.toString();
      router.replace(query ? `?${query}` : "?", { scroll: false });
    },
    [router]
  );

  const search = useCallback(
    async (page: number = 1) => {
      updateUrl(page, searchTitle, questionType);
      await fetchQuestions(
        page,
        searchTitle || undefined,
        questionType || undefined
      );
    },
    [fetchQuestions, searchTitle, questionType, updateUrl]
  );

  const goToPage = useCallback(
    (page: number) => {
      updateUrl(page, searchTitle, questionType);
      fetchQuestions(page, searchTitle || undefined, questionType || undefined);
    },
    [fetchQuestions, searchTitle, questionType, updateUrl]
  );

  const deleteQuestion = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/admin/questions/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Failed to delete question");
      }

      setQuestions((prev) => prev.filter((q) => q.id !== id));
      toast.success("Pregunta eliminada correctamente");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo eliminar la pregunta");
      throw error;
    }
  }, []);

  const toggleQuestionStatus = useCallback((id: number) => {
    setQuestions((prev) =>
      prev.map((question) =>
        question.id === id
          ? { ...question, isActive: !question.isActive }
          : question
      )
    );
  }, []);

  useEffect(() => {
    const initialPage = Number(searchParams.get("page")) || 1;
    const initialSearch = searchParams.get("search") ?? undefined;
    const initialType = searchParams.get("type") ?? undefined;
    fetchQuestions(initialPage, initialSearch, initialType);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    questions,
    loading,
    pagination,
    searchTitle,
    setSearchTitle,
    questionType,
    setQuestionType,
    search,
    goToPage,
    deleteQuestion,
    toggleQuestionStatus
  };
}
