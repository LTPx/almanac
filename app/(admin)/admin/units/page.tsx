// app/admin/units/page.tsx
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
  BookOpen,
  // Users,
  MoreHorizontal,
  Eye,
  ToggleLeft,
  ToggleRight
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
import { Unit } from "@/lib/types";

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [deleteUnitId, setDeleteUnitId] = useState<number | null>(null);

  const fetchUnits = async () => {
    const response = await fetch("/api/units");
    if (!response.ok) {
      throw new Error("Failed to fetch units");
    }
    return response.json();
  };

  const handleDeleteUnit = (id: number) => {
    setUnits(units.filter((unit) => unit.id !== id));
    setDeleteUnitId(null);
  };

  const toggleUnitStatus = (id: number) => {
    setUnits(
      units.map((unit) =>
        unit.id === id ? { ...unit, isActive: !unit.isActive } : unit
      )
    );
  };

  useEffect(() => {
    const loadUnits = async () => {
      try {
        const unitsData = await fetchUnits();
        setUnits(unitsData);
      } catch (error) {
        console.error("Error loading units:", error);
        toast.error("No se pudieron cargar las unidades");
      } finally {
        // setLoading(false);
      }
    };

    loadUnits();
  }, []);

  return (
    <div className="space-y-6 bg-background text-foreground min-h-screen p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Unidades</h1>
          <p className="text-muted-foreground">
            Gestiona las unidades del curso
          </p>
        </div>
        <Link href="/admin/units/new">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Unidad
          </Button>
        </Link>
      </div>

      {/* Lista de unidades */}
      <div className="grid gap-6">
        {units.map((unit) => (
          <Card
            key={unit.id}
            className="bg-card text-card-foreground border border-border"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <span>{unit.name}</span>
                      <Badge
                        variant={unit.isActive ? "default" : "secondary"}
                        className={
                          unit.isActive
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {unit.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-1 text-muted-foreground">
                      {unit.description}
                    </CardDescription>
                  </div>
                </div>

                {/* Dropdown acciones */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-card text-card-foreground border border-border"
                  >
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/units/${unit.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalles
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/units/${unit.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleUnitStatus(unit.id)}>
                      {unit.isActive ? (
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
                      className="text-destructive"
                      onClick={() => setDeleteUnitId(unit.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent>
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{unit._count.lessons} lecciones</span>
                </div>
                <div>
                  <span>Orden: {unit.order}</span>
                </div>
                <div>
                  <span>
                    Creado: {new Date(unit.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/admin/units/${unit.id}/lessons`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border text-foreground hover:bg-primary/10"
                  >
                    Ver lecciones
                  </Button>
                </Link>
                <Link href={`/admin/units/${unit.id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border text-foreground hover:bg-primary/10"
                  >
                    Path de aprendizaje
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Confirmar eliminación */}
      <AlertDialog
        open={deleteUnitId !== null}
        onOpenChange={() => setDeleteUnitId(null)}
      >
        <AlertDialogContent className="bg-card text-card-foreground border border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Esta acción eliminará permanentemente la unidad y todas sus
              lecciones asociadas. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground hover:bg-muted/10">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteUnitId && handleDeleteUnit(deleteUnitId)}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
