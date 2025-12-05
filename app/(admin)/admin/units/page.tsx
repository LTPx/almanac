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
  MoreHorizontal,
  Eye,
  ToggleLeft,
  ToggleRight,
  HelpCircle,
  Star,
  Layout,
  List,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Unit } from "@/lib/types";

type GroupedUnits = {
  [key: string]: {
    curriculumTitle: string;
    curriculumId: string;
    units: Unit[];
  };
};

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [deleteUnitId, setDeleteUnitId] = useState<number | null>(null);
  const [removeLessons, setRemoveLessons] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<"list" | "grouped">("grouped");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const pageSize = 15;

  const fetchUnits = async (page: number) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString()
    });

    const response = await fetch(`/api/admin/units?${params}`);
    if (!response.ok) {
      throw new Error("Failed to fetch units");
    }
    return response.json();
  };

  const deleteUnit = async (unitId: number, removeLessons: boolean) => {
    const response = await fetch(`/api/units/${unitId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ removeLessons })
    });
    if (!response.ok) {
      throw new Error("Failed to delete unit");
    }
    return response.json();
  };

  const handleDeleteUnit = async (id: number) => {
    try {
      await deleteUnit(id, removeLessons);
      setUnits(units.filter((unit) => unit.id !== id));
      setDeleteUnitId(null);
      toast.success("Unidad eliminada correctamente");
    } catch (error) {
      console.log(error);
      toast.error("No se pudo eliminar la unidad");
    }
  };

  const toggleUnitStatus = (id: number) => {
    setUnits(
      units.map((unit) =>
        unit.id === id ? { ...unit, isActive: !unit.isActive } : unit
      )
    );
  };

  // Agrupar unidades por currículum
  const groupedUnits: GroupedUnits = units.reduce((acc, unit) => {
    const key = unit.curriculumId || "sin-curriculum";
    if (!acc[key]) {
      acc[key] = {
        curriculumTitle: unit.curriculum?.title || "Sin Currículum",
        curriculumId: unit.curriculumId || "",
        units: []
      };
    }
    acc[key].units.push(unit);
    return acc;
  }, {} as GroupedUnits);

  useEffect(() => {
    const loadUnits = async () => {
      setLoading(true);
      try {
        const result = await fetchUnits(currentPage);
        setUnits(result.data);
        setTotalPages(result.pagination.totalPages);
        setTotal(result.pagination.total);
      } catch (error) {
        console.error("Error loading units:", error);
        toast.error("No se pudieron cargar las unidades");
      } finally {
        setLoading(false);
      }
    };

    loadUnits();
  }, [currentPage]);

  const renderUnitCard = (unit: Unit) => (
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
                      : "bg-gray-200 text-gray-900"
                  }
                >
                  {unit.isActive ? "Activo" : "Inactivo"}
                </Badge>
                <Badge
                  variant={unit.mandatory ? "default" : "secondary"}
                  className={
                    unit.isActive
                      ? "bg-gray-700 text-primary-foreground"
                      : "border-gray-50 text-gray-200"
                  }
                >
                  {unit.mandatory && (
                    <Star className="h-4 w-4 text-yellow-500" />
                  )}
                  {unit.mandatory ? "Obligatoria" : "No obligatoria"}
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
          <div className="flex items-center space-x-1">
            <HelpCircle className="h-4 w-4" />
            <span>{unit._count.questions} preguntas</span>
          </div>
          <span>{unit.experiencePoints} XP</span>
          <span>Posición: {unit.position}</span>
          <div>
            <span>Creado: {new Date(unit.createdAt).toLocaleDateString()}</span>
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
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 bg-background text-foreground min-h-screen p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Unidades</h1>
          <p className="text-muted-foreground">
            Gestiona las unidades del curso
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            onClick={() => setViewMode("list")}
            className={
              viewMode === "list"
                ? "bg-slate-700 hover:bg-slate:800 text-primary-foreground"
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
                ? "bg-slate-700 hover:bg-slate:800 text-primary-foreground"
                : "border-border"
            }
          >
            <Layout className="mr-2 h-4 w-4" />
            Por Currículum
          </Button>
          <Link href="/admin/units/new">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Unidad
            </Button>
          </Link>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="text-sm text-muted-foreground">
        Mostrando{" "}
        {loading
          ? "..."
          : `${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, total)} de ${total}`}{" "}
        unidades
      </div>

      {/* Vista de lista */}
      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Cargando unidades...
            </p>
          </CardContent>
        </Card>
      ) : viewMode === "list" ? (
        <div className="grid gap-6">
          {units.map((unit) => renderUnitCard(unit))}
        </div>
      ) : null}

      {/* Vista agrupada por currículum */}
      {!loading && viewMode === "grouped" && (
        <div className="space-y-8">
          {Object.entries(groupedUnits).map(([key, group]) => (
            <div key={key} className="space-y-4">
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-semibold">
                  {group.curriculumTitle}
                </h2>
                <Badge variant="outline" className="text-sm">
                  {group.units.length}{" "}
                  {group.units.length === 1 ? "unidad" : "unidades"}
                </Badge>
              </div>
              <div className="grid gap-6">
                {group.units.map((unit) => renderUnitCard(unit))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      {!loading && units.length > 0 && (
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
                      return (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      );
                    })
                    .map((page, index, array) => {
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

      {/* Confirmar eliminación */}
      <AlertDialog
        open={deleteUnitId !== null}
        onOpenChange={() => setDeleteUnitId(null)}
      >
        <AlertDialogContent className="bg-card text-card-foreground border border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
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
