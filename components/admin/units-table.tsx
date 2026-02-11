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
import { Checkbox } from "@/components/ui/checkbox";
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
  HelpCircle
} from "lucide-react";
import { Unit } from "@/lib/types";

interface UnitsTableProps {
  units: Unit[];
  loading: boolean;
  onDelete: (id: number, removeLessons: boolean) => Promise<void>;
  onToggleStatus: (id: number) => void;
}

export function UnitsTable({
  units,
  loading,
  onDelete,
  onToggleStatus
}: UnitsTableProps) {
  const router = useRouter();
  const [deleteUnitId, setDeleteUnitId] = useState<number | null>(null);
  const [removeLessons, setRemoveLessons] = useState<boolean>(true);

  const handleDelete = async () => {
    if (deleteUnitId) {
      await onDelete(deleteUnitId, removeLessons);
      setDeleteUnitId(null);
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Curriculum</TableHead>
              <TableHead className="text-center">Idiomas</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-center">Obligatoria</TableHead>
              <TableHead className="text-center">Lecciones</TableHead>
              <TableHead className="text-center">Preguntas</TableHead>
              <TableHead className="text-center">XP</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : units.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <BookOpen className="w-8 h-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No se encontraron unidades
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              units.map((unit) => (
                <TableRow key={unit.id}>
                  <TableCell className="font-medium">
                      <Link
                        href={`/admin/units/${unit.id}/edit`}
                        className="hover:underline"
                      >
                        {unit.name}
                      </Link>
                    </TableCell>
                  <TableCell className="text-muted-foreground">
                    {unit.curriculum?.title || "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {(["EN", "ES"] as const).map((lang) => {
                        const has = unit.translations?.some((t) => t.language === lang);
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
                      checked={unit.isActive}
                      onCheckedChange={() => onToggleStatus(unit.id)}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={unit.mandatory ? "default" : "secondary"}
                      className={unit.mandatory ? "bg-yellow-500" : ""}
                    >
                      {unit.mandatory ? "Sí" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Link
                      href={`/admin/units/${unit.id}/lessons`}
                      className="inline-flex"
                    >
                      <Badge
                        variant="outline"
                        className="gap-1 cursor-pointer hover:bg-accent"
                      >
                        <BookOpen className="w-3 h-3" />
                        {unit._count?.lessons || 0}
                      </Badge>
                    </Link>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="gap-1">
                      <HelpCircle className="w-3 h-3" />
                      {unit._count?.questions || 0}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-primary">
                    {unit.experiencePoints}
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
                            router.push(`/admin/units/${unit.id}/edit`)
                          }
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/admin/units/${unit.id}/lessons`)
                          }
                        >
                          <BookOpen className="mr-2 h-4 w-4" />
                          Ver lecciones
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => setDeleteUnitId(unit.id)}
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
        open={deleteUnitId !== null}
        onOpenChange={() => setDeleteUnitId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la unidad. Puedes elegir si
              también deseas eliminar sus lecciones asociadas.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex items-center space-x-2 py-4">
            <Checkbox
              id="removeLessons"
              checked={removeLessons}
              onCheckedChange={(checked) => setRemoveLessons(checked === true)}
            />
            <label
              htmlFor="removeLessons"
              className="text-sm text-muted-foreground"
            >
              Eliminar también las lecciones asociadas
            </label>
          </div>

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
