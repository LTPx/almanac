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
  BookOpen,
  HelpCircle,
  MoreHorizontal,
  Eye,
  Search,
  Filter,
  Star,
  Layout,
  List
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

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

import { toast } from "sonner";
import { LessonAdmin } from "@/lib/types";

type GroupedLessons = {
  [key: string]: {
    unitName: string;
    unitId: number;
    lessons: LessonAdmin[];
  };
};

export default function LessonsPage() {
  const [lessons, setLessons] = useState<LessonAdmin[]>([]);
  const [units, setUnits] = useState<{ id: number; name: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<string>("all");
  const [deleteLessonId, setDeleteLessonId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grouped">("grouped");

  const fetchLessons = async () => {
    const response = await fetch("/api/lessons");
    if (!response.ok) {
      throw new Error("Failed to fetch lessons");
    }
    return response.json();
  };

  const fetchUnits = async () => {
    const response = await fetch("/api/units");
    if (!response.ok) {
      throw new Error("Failed to fetch units");
    }
    return response.json();
  };

  const filteredLessons = lessons.filter((lesson) => {
    const matchesSearch =
      lesson.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUnit =
      selectedUnit === "all" || lesson.unitId.toString() === selectedUnit;
    return matchesSearch && matchesUnit;
  });

  // Agrupar lecciones por unidad
  const groupedLessons: GroupedLessons = filteredLessons.reduce(
    (acc, lesson) => {
      const key = lesson.unitId.toString();
      if (!acc[key]) {
        acc[key] = {
          unitName: lesson.unit.name,
          unitId: lesson.unitId,
          lessons: []
        };
      }
      acc[key].lessons.push(lesson);
      return acc;
    },
    {} as GroupedLessons
  );

  const deleteLesson = async (unitId: number) => {
    const response = await fetch(`/api/lessons/${unitId}`, {
      method: "DELETE"
    });
    if (!response.ok) {
      throw new Error("Failed to delete unit");
    }
    return response.json();
  };

  const handleDeleteLesson = async (id: number) => {
    try {
      await deleteLesson(id);
      setLessons(lessons.filter((lesson) => lesson.id !== id));
      setDeleteLessonId(null);
      toast.success("Leccion eliminada correctamente");
    } catch (error) {
      console.log(error);
      toast.error("No se pudo eliminar la leccion");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [lessonsData, unitsData] = await Promise.all([
          fetchLessons(),
          fetchUnits()
        ]);
        setLessons(lessonsData);
        setUnits(unitsData);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Error al cargar los datos");
      }
    };

    loadData();
  }, []);

  const renderLessonCard = (lesson: LessonAdmin) => (
    <Card key={lesson.id} className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-lg text-foreground">
                {lesson.name}
              </CardTitle>
              {lesson.mandatory && (
                <Badge
                  variant="destructive"
                  className="text-xs flex items-center"
                >
                  <Star className="mr-1 h-3 w-3" />
                  Obligatoria
                </Badge>
              )}
              <Badge variant={lesson.isActive ? "default" : "secondary"}>
                {lesson.isActive ? "Activa" : "Inactiva"}
              </Badge>
            </div>
            <CardDescription className="mt-1 text-muted-foreground">
              {lesson.description}
            </CardDescription>
            {viewMode === "list" && (
              <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  {lesson.unit.name}
                </span>
              </div>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-card border-border text-foreground"
            >
              <DropdownMenuItem asChild>
                <Link href={`/admin/lessons/${lesson.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalles
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/admin/lessons/${lesson.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/admin/lessons/${lesson.id}/questions`}>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Gestionar preguntas
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => setDeleteLessonId(lesson.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Lecciones</h1>
          <p className="text-muted-foreground">
            Gestiona las lecciones del curso
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            onClick={() => setViewMode("list")}
            className={
              viewMode === "list"
                ? "bg-slate-700 text-primary-foreground"
                : "border-border"
            }
          >
            <List className="mr-2 h-4 w-4" />
            Lista
          </Button>
          <Button
            variant={viewMode === "grouped" ? "default" : "outline"}
            onClick={() => setViewMode("grouped")}
            className={
              viewMode === "grouped"
                ? "bg-slate-700 text-primary-foreground"
                : "border-border"
            }
          >
            <Layout className="mr-2 h-4 w-4" />
            Por Unidad
          </Button>
          <Link href="/admin/lessons/new">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Lección
            </Button>
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar lecciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background text-foreground border-border"
              />
            </div>
            <div className="w-48">
              <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                <SelectTrigger className="bg-background text-foreground border-border">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Todas las unidades" />
                </SelectTrigger>
                <SelectContent className="bg-card text-foreground border-border">
                  <SelectItem value="all">Todas las unidades</SelectItem>
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id.toString()}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vista de lista */}
      {viewMode === "list" && (
        <div className="grid gap-4">
          {filteredLessons.map((lesson) => renderLessonCard(lesson))}
        </div>
      )}

      {/* Vista agrupada por unidad */}
      {viewMode === "grouped" && (
        <div className="space-y-8">
          {Object.entries(groupedLessons).map(([key, group]) => (
            <div key={key} className="space-y-4">
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-semibold">{group.unitName}</h2>
                <Badge variant="outline" className="text-sm">
                  {group.lessons.length}{" "}
                  {group.lessons.length === 1 ? "lección" : "lecciones"}
                </Badge>
              </div>
              <div className="grid gap-4">
                {group.lessons.map((lesson) => renderLessonCard(lesson))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sin resultados */}
      {filteredLessons.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="text-center py-8 text-muted-foreground">
            <BookOpen className="mx-auto h-12 w-12" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              No hay lecciones
            </h3>
            <p className="mt-2">
              {searchTerm || selectedUnit !== "all"
                ? "No se encontraron lecciones con los filtros actuales."
                : "Comienza creando tu primera lección."}
            </p>
            {!searchTerm && selectedUnit === "all" && (
              <Link href="/admin/lessons/new">
                <Button className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear primera lección
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {/* Confirmar eliminación */}
      <AlertDialog
        open={deleteLessonId !== null}
        onOpenChange={() => setDeleteLessonId(null)}
      >
        <AlertDialogContent className="bg-card text-card-foreground border border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Esta acción eliminará permanentemente la lección.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground hover:bg-muted/10">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                deleteLessonId && handleDeleteLesson(deleteLessonId)
              }
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
