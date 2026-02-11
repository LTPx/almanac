"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { Switch } from "@/components/ui/switch";
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
import { MoreHorizontal, Edit, Trash2, BookOpen } from "lucide-react";
import { LessonAdmin } from "@/lib/types";

interface LessonsTableProps {
  lessons: LessonAdmin[];
  loading: boolean;
  onDelete: (id: number) => Promise<void>;
  onToggleStatus: (id: number) => void;
}

export function LessonsTable({
  lessons,
  loading,
  onDelete,
  onToggleStatus
}: LessonsTableProps) {
  const router = useRouter();
  const [deleteLessonId, setDeleteLessonId] = useState<number | null>(null);

  const handleDelete = async () => {
    if (deleteLessonId) {
      await onDelete(deleteLessonId);
      setDeleteLessonId(null);
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Unidad</TableHead>
              <TableHead className="text-center">Idiomas</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : lessons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <BookOpen className="w-8 h-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No se encontraron lecciones
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              lessons.map((lesson) => (
                <TableRow key={lesson.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/admin/lessons/${lesson.id}/edit`}
                      className="hover:underline"
                    >
                      {lesson.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {lesson.unit?.name || "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {(["EN", "ES"] as const).map((lang) => {
                        const has = lesson.translations?.some((t) => t.language === lang);
                        const flag = lang === "EN" ? "🇺🇸" : "🇪🇸";
                        return (
                          <span
                            key={lang}
                            title={lang}
                            className={`text-base leading-none ${has ? "opacity-100" : "opacity-25"}`}
                          >
                            {flag}
                          </span>
                        );
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={lesson.isActive}
                      onCheckedChange={() => onToggleStatus(lesson.id)}
                    />
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
                            router.push(`/admin/lessons/${lesson.id}/edit`)
                          }
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={deleteLessonId !== null}
        onOpenChange={() => setDeleteLessonId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la lección y todas sus
              preguntas asociadas.
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
