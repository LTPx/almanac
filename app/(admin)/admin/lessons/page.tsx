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
  Star
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

const mockLessons = [
  {
    id: 1,
    name: "¿Qué es Blockchain?",
    description: "Introducción a los conceptos básicos de blockchain",
    unitId: 1,
    unitName: "Introducción a Blockchain",
    mandatory: true,
    experiencePoints: 25,
    position: 1,
    questionsCount: 5,
    isActive: true,
    createdAt: "2024-01-15"
  },
  {
    id: 2,
    name: "Historia de Bitcoin",
    description: "El origen y evolución de Bitcoin",
    unitId: 1,
    unitName: "Introducción a Blockchain",
    mandatory: true,
    experiencePoints: 30,
    position: 2,
    questionsCount: 8,
    isActive: true,
    createdAt: "2024-01-16"
  },
  {
    id: 3,
    name: "Smart Contracts Básicos",
    description: "Fundamentos de los contratos inteligentes",
    unitId: 2,
    unitName: "Smart Contracts",
    mandatory: false,
    experiencePoints: 50,
    position: 1,
    questionsCount: 12,
    isActive: true,
    createdAt: "2024-01-20"
  }
];

const mockUnits = [
  { id: 1, name: "Introducción a Blockchain" },
  { id: 2, name: "Smart Contracts" },
  { id: 3, name: "DeFi Fundamentals" }
];

export default function LessonsPage() {
  // const [lessons, setLessons] = useState(mockLessons);
  const lessons = mockLessons;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<string>("all");

  const filteredLessons = lessons.filter((lesson) => {
    const matchesSearch =
      lesson.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUnit =
      selectedUnit === "all" || lesson.unitId.toString() === selectedUnit;
    return matchesSearch && matchesUnit;
  });

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
        <Link href="/admin/lessons/new">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Lección
          </Button>
        </Link>
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
                  {mockUnits.map((unit) => (
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

      {/* Lista de lecciones */}
      <div className="grid gap-4">
        {filteredLessons.map((lesson) => (
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
                  <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {lesson.unitName}
                    </span>
                    <div className="flex items-center space-x-1">
                      <HelpCircle className="h-4 w-4" />
                      <span>{lesson.questionsCount} preguntas</span>
                    </div>
                    <span>{lesson.experiencePoints} XP</span>
                    <span>Posición: {lesson.position}</span>
                  </div>
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
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
          </Card>
        ))}

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
      </div>
    </div>
  );
}
