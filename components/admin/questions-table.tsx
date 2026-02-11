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
import { Badge } from "@/components/ui/badge";
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
import { MoreHorizontal, Edit, Trash2, HelpCircle } from "lucide-react";
import { Question } from "@/lib/types";

const questionTypeLabels: Record<string, string> = {
  MULTIPLE_CHOICE: "Opción múltiple",
  FILL_IN_BLANK: "Completar espacios",
  ORDER_WORDS: "Ordenar palabras",
  TRUE_FALSE: "Verdadero/Falso"
};

interface QuestionsTableProps {
  questions: Question[];
  loading: boolean;
  onDelete: (id: number) => Promise<void>;
  onToggleStatus: (id: number) => void;
}

export function QuestionsTable({
  questions,
  loading,
  onDelete,
  onToggleStatus
}: QuestionsTableProps) {
  const router = useRouter();
  const [deleteQuestionId, setDeleteQuestionId] = useState<number | null>(null);

  const handleDelete = async () => {
    if (deleteQuestionId) {
      await onDelete(deleteQuestionId);
      setDeleteQuestionId(null);
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Unidad</TableHead>
              <TableHead className="text-center">Idiomas</TableHead>
              <TableHead className="text-center">Tipo</TableHead>
              <TableHead className="text-center">Estado</TableHead>
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
            ) : questions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <HelpCircle className="w-8 h-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No se encontraron preguntas
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              questions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/admin/questions/${question.id}/edit`}
                      className="hover:underline"
                    >
                      {question.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {question.unit?.name || "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className={question.translations?.some(t => t.language === "EN") ? "opacity-100" : "opacity-25"}>🇺🇸</span>
                      <span className={question.translations?.some(t => t.language === "ES") ? "opacity-100" : "opacity-25"}>🇪🇸</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">
                      {questionTypeLabels[question.type] || question.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={question.isActive}
                      onCheckedChange={() => onToggleStatus(question.id)}
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
                            router.push(`/admin/questions/${question.id}/edit`)
                          }
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => setDeleteQuestionId(question.id)}
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
        open={deleteQuestionId !== null}
        onOpenChange={() => setDeleteQuestionId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la pregunta y todas sus
              respuestas asociadas.
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
