// app/admin/questions/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Edit,
  Trash2,
  HelpCircle,
  MoreHorizontal,
  Eye,
  Search,
  Filter,
  CheckCircle,
  List,
  Move,
  ToggleLeft,
  ToggleRight,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";
import { Question } from "@/lib/types";

const questionTypeLabels = {
  MULTIPLE_CHOICE: "Opción múltiple",
  FILL_IN_BLANK: "Completar espacios",
  ORDER_WORDS: "Ordenar palabras",
  TRUE_FALSE: "Verdadero/Falso",
  MATCHING: "Emparejar",
  DRAG_DROP: "Arrastrar y soltar"
};

const questionTypeIcons = {
  MULTIPLE_CHOICE: CheckCircle,
  FILL_IN_BLANK: Edit,
  ORDER_WORDS: List,
  TRUE_FALSE: ToggleLeft,
  MATCHING: Move,
  DRAG_DROP: Move
};

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const pageSize = 10;

  const fetchQuestions = async (page: number, search = "", type = "all") => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      search
    });

    if (type && type !== "all") {
      params.append("type", type);
    }

    const response = await fetch(`/api/questions?${params}`);
    if (!response.ok) {
      throw new Error("Failed to fetch questions");
    }
    return response.json();
  };

  const getTypeIcon = (type: string) => {
    const Icon =
      questionTypeIcons[type as keyof typeof questionTypeIcons] || HelpCircle;
    return Icon;
  };

  // Debounce para el término de búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      // Resetear a página 1 cuando cambia el término de búsqueda
      if (searchTerm !== debouncedSearchTerm) {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, debouncedSearchTerm]);

  // Cargar preguntas cuando cambia la página, búsqueda o tipo
  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      try {
        const result = await fetchQuestions(currentPage, debouncedSearchTerm, selectedType);
        setQuestions(result.data);
        setTotalPages(result.pagination.totalPages);
        setTotal(result.pagination.total);
      } catch (error) {
        console.error("Error loading questions:", error);
        toast.error("Error loading questions");
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [currentPage, debouncedSearchTerm, selectedType]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Preguntas</h1>
          <p className="text-muted-foreground">
            Gestiona las preguntas de las lecciones
          </p>
        </div>
        <Link href="/admin/questions/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Pregunta
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar preguntas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Todos los tipos" />
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="text-sm text-muted-foreground">
        Mostrando{" "}
        {loading ? "..." : `${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, total)} de ${total}`}{" "}
        preguntas
      </div>

      {/* Lista de preguntas */}
      <div className="grid gap-4">
        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Cargando preguntas...
              </p>
            </CardContent>
          </Card>
        ) : questions.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="text-center py-8 text-muted-foreground">
              <HelpCircle className="mx-auto h-12 w-12" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                No hay preguntas
              </h3>
              <p className="mt-2">
                {searchTerm || selectedType !== "all"
                  ? "No se encontraron preguntas con los filtros actuales."
                  : "Comienza creando tu primera pregunta."}
              </p>
              {!searchTerm && selectedType === "all" && (
                <Link href="/admin/questions/new">
                  <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear primera pregunta
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          questions.map((question) => {
          const TypeIcon = getTypeIcon(question.type);

          return (
            <Card key={question.id} className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <TypeIcon className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-lg text-foreground">
                        {question.title}
                      </CardTitle>
                      <Badge
                        variant={question.isActive ? "default" : "secondary"}
                      >
                        {question.isActive ? "Activa" : "Inactiva"}
                      </Badge>
                    </div>
                    <CardDescription className="mt-2">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {question.unit.name}
                        </span>
                        <span className="px-2 py-1 bg-card border border-border rounded text-xs">
                          {
                            questionTypeLabels[
                              question.type as keyof typeof questionTypeLabels
                            ]
                          }
                        </span>
                        {/* <span>{question.answersCount} respuestas</span> */}
                        <span>Orden: {question.order}</span>
                      </div>
                    </CardDescription>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/questions/${question.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalles
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/questions/${question.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        {question.isActive ? (
                          <>
                            <ToggleRight className="mr-2 h-4 w-4" />
                            Desactivar
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="mr-2 h-4 w-4" />
                            Activar
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
            </Card>
          );
        })
        )}
      </div>

      {/* Paginación */}
      {!loading && questions.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      // Mostrar primeras 2, últimas 2, y páginas alrededor de la actual
                      return (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      );
                    })
                    .map((page, index, array) => {
                      // Mostrar "..." si hay gap
                      const showEllipsisBefore =
                        index > 0 && page - array[index - 1] > 1;

                      return (
                        <div key={page} className="flex items-center">
                          {showEllipsisBefore && (
                            <span className="px-2 text-muted-foreground">
                              ...
                            </span>
                          )}
                          <Button
                            variant={
                              currentPage === page ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="min-w-[40px]"
                          >
                            {page}
                          </Button>
                        </div>
                      );
                    })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
