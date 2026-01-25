"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { useAdminQuestions } from "@/hooks/useAdminQuestions";
import { QuestionsTable } from "@/components/admin/questions-table";

const questionTypeLabels: Record<string, string> = {
  MULTIPLE_CHOICE: "Opción múltiple",
  FILL_IN_BLANK: "Completar espacios",
  ORDER_WORDS: "Ordenar palabras",
  TRUE_FALSE: "Verdadero/Falso",
  MATCHING: "Emparejar",
  DRAG_DROP: "Arrastrar y soltar"
};

export default function QuestionsPage() {
  const {
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
  } = useAdminQuestions();

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Preguntas</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona las preguntas de las lecciones
          </p>
        </div>
        <div className="flex gap-3">
          <Select
            value={questionType}
            onValueChange={(value) => {
              setQuestionType(value === "all" ? "" : value);
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {Object.entries(questionTypeLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="text"
            placeholder="Buscar por título..."
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search(1)}
            className="w-64"
          />
          <Button
            onClick={() => search(1)}
            disabled={loading}
            variant="outline"
            className="gap-2"
          >
            <Search className="w-4 h-4" />
            Buscar
          </Button>
          <Link href="/admin/questions/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nueva Pregunta
            </Button>
          </Link>
        </div>
      </div>

      {/* Questions Table */}
      <QuestionsTable
        questions={questions}
        loading={loading}
        onDelete={deleteQuestion}
        onToggleStatus={toggleQuestionStatus}
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Mostrando {questions.length} de {pagination.total} preguntas
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(pagination.page - 1)}
              disabled={pagination.page === 1 || loading}
            >
              Anterior
            </Button>
            <span className="text-sm">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages || loading}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
