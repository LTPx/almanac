// app/admin/curriculums/page.tsx
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
import {
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  BookOpen,
  Users,
  GraduationCap
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
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
import { Curriculum } from "@/lib/types";

const difficultyConfig = {
  BEGINNER: {
    label: "Principiante",
    color: "bg-green-100 text-green-800",
    icon: "🌱"
  },
  INTERMEDIATE: {
    label: "Intermedio",
    color: "bg-yellow-100 text-yellow-800",
    icon: "⚡"
  },
  ADVANCED: {
    label: "Avanzado",
    color: "bg-red-100 text-red-800",
    icon: "🚀"
  }
};

export default function CurriculumPage() {
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [deleteCurriculumId, setDeleteCurriculumId] = useState<string | null>(
    null
  );

  const handleDeleteCurriculum = (id: string) => {
    setCurriculums(curriculums.filter((c) => c.id !== id));
    setDeleteCurriculumId(null);
  };

  const fetchCurriculums = async () => {
    const response = await fetch("/api/curriculums");
    if (!response.ok) {
      throw new Error("Failed to fetch units");
    }
    return response.json();
  };

  useEffect(() => {
    const loadUnits = async () => {
      try {
        const response = await fetchCurriculums();
        const { curriculums } = response;
        setCurriculums(curriculums);
      } catch (error) {
        console.error("Error loading units:", error);
        toast.error("No se pudieron cargar los curriculums");
      } finally {
        // setLoading(false);
      }
    };

    loadUnits();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Curriculums</h1>
          <p className="text-muted-foreground">
            Gestiona los currículums educativos
          </p>
        </div>
        <Link href="/admin/curriculums/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Curriculum
          </Button>
        </Link>
      </div>

      {/* Lista de curriculums */}
      <div className="grid gap-6">
        {curriculums.map((curriculum) => {
          const difficultyInfo =
            difficultyConfig[
              curriculum.difficulty as keyof typeof difficultyConfig
            ];

          return (
            <Card
              key={curriculum.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <CardTitle className="text-xl">
                        {curriculum.title}
                      </CardTitle>
                      <Badge className={difficultyInfo.color}>
                        <span className="mr-1">{difficultyInfo.icon}</span>
                        {difficultyInfo.label}
                      </Badge>
                    </div>

                    <CardDescription className="space-y-2">
                      <div className="flex items-center space-x-4 text-sm">
                        {curriculum.audienceAgeRange && (
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{curriculum.audienceAgeRange}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{curriculum.units.length} unidades</span>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Actualizado:{" "}
                        {new Date(curriculum.updatedAt).toLocaleDateString()}
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
                        <Link href={`/admin/curriculums/${curriculum.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/admin/curriculums/${curriculum.id}/units`}
                        >
                          <BookOpen className="mr-2 h-4 w-4" />
                          Gestionar unidades
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => setDeleteCurriculumId(curriculum.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Unidades incluidas:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {curriculum.units.map((unit, index) => (
                        <Badge
                          key={unit.id}
                          variant="outline"
                          className="text-xs"
                        >
                          {index + 1}. {unit.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {curriculums.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold">No hay curriculums</h3>
            <Link href="/admin/curriculums/new">
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Crear primer curriculum
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Dialog de confirmación para eliminar */}
      <AlertDialog
        open={deleteCurriculumId !== null}
        onOpenChange={() => setDeleteCurriculumId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el curriculum y desvinculará
              todas sus unidades. Las unidades no se eliminarán, solo la
              relación con este curriculum.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() =>
                deleteCurriculumId && handleDeleteCurriculum(deleteCurriculumId)
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
