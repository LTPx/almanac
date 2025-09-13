// app/admin/units/page.tsx
"use client";

import { useState } from "react";
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
  Users,
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

// Mock data - reemplazar con datos reales de tu API
const mockUnits = [
  {
    id: 1,
    name: "Introducción a Blockchain",
    description: "Conceptos básicos de la tecnología blockchain",
    lessonsCount: 8,
    studentsCount: 124,
    isActive: true,
    order: 1,
    createdAt: "2024-01-15"
  },
  {
    id: 2,
    name: "Smart Contracts",
    description: "Desarrollo y despliegue de contratos inteligentes",
    lessonsCount: 12,
    studentsCount: 89,
    isActive: true,
    order: 2,
    createdAt: "2024-01-20"
  },
  {
    id: 3,
    name: "DeFi Fundamentals",
    description: "Finanzas descentralizadas y protocolos DeFi",
    lessonsCount: 6,
    studentsCount: 67,
    isActive: false,
    order: 3,
    createdAt: "2024-02-01"
  }
];

export default function UnitsPage() {
  const [units, setUnits] = useState(mockUnits);
  const [deleteUnitId, setDeleteUnitId] = useState<number | null>(null);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Unidades</h1>
          <p className="text-gray-600">Gestiona las unidades del curso</p>
        </div>
        <Link href="/admin/units/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Unidad
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        {units.map((unit) => (
          <Card key={unit.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <span>{unit.name}</span>
                      <Badge variant={unit.isActive ? "default" : "secondary"}>
                        {unit.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {unit.description}
                    </CardDescription>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
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
                      className="text-red-600"
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
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{unit.lessonsCount} lecciones</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>{unit.studentsCount} estudiantes</span>
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

              <div className="mt-4 flex space-x-2">
                <Link href={`/admin/units/${unit.id}/lessons`}>
                  <Button variant="outline" size="sm">
                    Ver lecciones
                  </Button>
                </Link>
                <Link href={`/admin/units/${unit.id}/progress`}>
                  <Button variant="outline" size="sm">
                    Ver progreso
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog
        open={deleteUnitId !== null}
        onOpenChange={() => setDeleteUnitId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la unidad y todas sus
              lecciones asociadas. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
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
