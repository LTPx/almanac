"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  MoreHorizontal,
  Edit,
  Trash2,
  BookOpen,
  ToggleLeft,
  ToggleRight,
  GraduationCap,
  Search,
  Route
} from "lucide-react";
import { Curriculum } from "@/lib/types";

const difficultyConfig = {
  BEGINNER: {
    label: "Principiante",
    variant: "default" as const,
    className: "bg-green-100 text-green-800"
  },
  INTERMEDIATE: {
    label: "Intermedio",
    variant: "default" as const,
    className: "bg-yellow-100 text-yellow-800"
  },
  ADVANCED: {
    label: "Avanzado",
    variant: "default" as const,
    className: "bg-red-100 text-red-800"
  }
};

interface CurriculumsTableProps {
  curriculums: Curriculum[];
  loading: boolean;
  onDelete: (id: string) => Promise<void>;
  onToggleStatus: (id: string) => Promise<void>;
}

export function CurriculumsTable({
  curriculums,
  loading,
  onDelete,
  onToggleStatus
}: CurriculumsTableProps) {
  const router = useRouter();
  const [deleteCurriculumId, setDeleteCurriculumId] = useState<string | null>(
    null
  );

  const handleDelete = async () => {
    if (deleteCurriculumId) {
      await onDelete(deleteCurriculumId);
      setDeleteCurriculumId(null);
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titulo</TableHead>
              <TableHead className="text-center">Dificultad</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-center">Audiencia</TableHead>
              <TableHead className="text-center">Unidades</TableHead>
              <TableHead className="text-center">Actualizado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : curriculums.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <GraduationCap className="w-8 h-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No se encontraron curriculums
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              curriculums.map((curriculum) => {
                const difficultyInfo = difficultyConfig[curriculum.difficulty];

                return (
                  <TableRow key={curriculum.id}>
                    <TableCell className="font-medium">
                      {curriculum.title}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={difficultyInfo.className}>
                        {difficultyInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={curriculum.isActive ? "default" : "secondary"}
                      >
                        {curriculum.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {curriculum.audienceAgeRange || "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="gap-1">
                        <BookOpen className="w-3 h-3" />
                        {curriculum.units?.length || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {new Date(curriculum.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(
                                `/admin/curriculums/${curriculum.id}/edit`
                              )
                            }
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(
                                `/admin/curriculums/${curriculum.id}/units`
                              )
                            }
                          >
                            <BookOpen className="mr-2 h-4 w-4" />
                            Gestionar unidades
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(
                                `/admin/curriculums/${curriculum.id}/learning-path`
                              )
                            }
                          >
                            <Route className="mr-2 h-4 w-4" />
                            Path de aprendizaje
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(
                                `/admin/curriculums/${curriculum.id}/final-test`
                              )
                            }
                          >
                            <GraduationCap className="mr-2 h-4 w-4" />
                            Test Final
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onToggleStatus(curriculum.id)}
                          >
                            {curriculum.isActive ? (
                              <>
                                <ToggleLeft className="mr-2 h-4 w-4" />
                                Desactivar
                              </>
                            ) : (
                              <>
                                <ToggleRight className="mr-2 h-4 w-4" />
                                Activar
                              </>
                            )}
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
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

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
              onClick={handleDelete}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
