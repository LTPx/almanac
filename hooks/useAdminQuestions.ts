"use client";

import { useState, useEffect, useCallback } from "react";
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
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTitle, setSearchTitle] = useState("");
  const [questionType, setQuestionType] = useState("");
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
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

  const search = useCallback(
    async (page: number = 1) => {
      await fetchQuestions(
        page,
        searchTitle || undefined,
        questionType || undefined
      );
    },
    [fetchQuestions, searchTitle, questionType]
  );

  const goToPage = useCallback(
    (page: number) => {
      fetchQuestions(page, searchTitle || undefined, questionType || undefined);
    },
    [fetchQuestions, searchTitle, questionType]
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
    fetchQuestions(1);
  }, [fetchQuestions]);

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
