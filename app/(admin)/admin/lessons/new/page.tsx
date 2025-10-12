"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, BookOpen, Star, Target, Clock } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Mock data - reemplazar con datos reales de tu API
const mockUnits = [
  { id: 1, name: "Introducción a Blockchain", lessonsCount: 7 },
  { id: 2, name: "Smart Contracts", lessonsCount: 11 },
  { id: 3, name: "DeFi Fundamentals", lessonsCount: 5 },
  { id: 4, name: "NFTs y Tokens", lessonsCount: 8 }
];

export default function CreateLessonPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    unitId: "",
    mandatory: false,
    experiencePoints: 25,
    position: 1,
    isActive: true
  });

  useEffect(() => {
    if (formData.unitId) {
      const unit = mockUnits.find((u) => u.id.toString() === formData.unitId);
      if (unit) {
        setSelectedUnit(unit);
        setFormData((prev) => ({
          ...prev,
          position: unit.lessonsCount + 1
        }));
      }
    }
  }, [formData.unitId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Creando lección:", {
        ...formData,
        unitId: parseInt(formData.unitId)
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push("/admin/lessons");
    } catch (error) {
      console.error("Error al crear lección:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    field: string,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const getXPRecommendation = (points: number) => {
    if (points < 20)
      return { text: "Lección corta", color: "bg-blue-100 text-blue-800" };
    if (points < 40)
      return { text: "Lección estándar", color: "bg-green-100 text-green-800" };
    if (points < 60)
      return {
        text: "Lección extensa",
        color: "bg-yellow-100 text-yellow-800"
      };
    return { text: "Lección avanzada", color: "bg-purple-100 text-purple-800" };
  };

  const xpRecommendation = getXPRecommendation(formData.experiencePoints);

  return (
    <div className="space-y-6 text-foreground">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/admin/lessons">
          <Button variant="ghost" size="sm" className="text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Nueva Lección</h1>
          <p className="text-muted-foreground">
            Crea una nueva lección para el curso
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
            <CardDescription>Datos principales de la lección</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Lección *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Ej: ¿Qué es un Smart Contract?"
                required
                className="bg-background text-foreground border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Describe brevemente el contenido de esta lección..."
                rows={4}
                className="bg-background text-foreground border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unitId">Unidad *</Label>
              <Select
                value={formData.unitId}
                onValueChange={(value) => handleInputChange("unitId", value)}
                required
              >
                <SelectTrigger className="bg-background text-foreground border-border">
                  <SelectValue placeholder="Selecciona una unidad" />
                </SelectTrigger>
                <SelectContent className="bg-card text-foreground border-border">
                  {mockUnits.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id.toString()}>
                      <div className="flex items-center justify-between w-full">
                        <span>{unit.name}</span>
                        <Badge variant="outline" className="ml-2">
                          {unit.lessonsCount} lecciones
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedUnit && (
                <p className="text-sm text-muted-foreground">
                  Esta lección se agregará a "{selectedUnit.name}"
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Configuración avanzada */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Configuración de la Lección</CardTitle>
            <CardDescription>
              Ajustes de gamificación y estructura
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="experiencePoints">Puntos de Experiencia</Label>
                <div className="flex items-center space-x-4">
                  <Input
                    id="experiencePoints"
                    type="number"
                    min="5"
                    max="100"
                    value={formData.experiencePoints}
                    onChange={(e) =>
                      handleInputChange(
                        "experiencePoints",
                        parseInt(e.target.value) || 25
                      )
                    }
                    className="bg-background text-foreground border-border"
                  />
                  <Badge className={xpRecommendation.color}>
                    {xpRecommendation.text}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Recomendado: 25-50 XP para lecciones estándar
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Posición en la Unidad</Label>
                <Input
                  id="position"
                  type="number"
                  min="1"
                  value={formData.position}
                  onChange={(e) =>
                    handleInputChange("position", parseInt(e.target.value) || 1)
                  }
                  className="bg-background text-foreground border-border"
                />
                {selectedUnit && (
                  <p className="text-xs text-muted-foreground">
                    Posición {formData.position} de{" "}
                    {selectedUnit.lessonsCount + 1}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="mandatory"
                  checked={formData.mandatory}
                  onCheckedChange={(checked) =>
                    handleInputChange("mandatory", checked)
                  }
                />
                <Label
                  htmlFor="mandatory"
                  className="flex items-center space-x-2"
                >
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>Lección obligatoria</span>
                </Label>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                Las lecciones obligatorias deben completarse para avanzar
              </p>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    handleInputChange("isActive", checked)
                  }
                />
                <Label htmlFor="isActive">Lección activa</Label>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                Solo las lecciones activas serán visibles para los estudiantes
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Vista previa */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Vista Previa</CardTitle>
            <CardDescription>
              Así se verá la lección para los estudiantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border-2 border-dashed border-border p-6 bg-background">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg text-foreground">
                      {formData.name || "Nombre de la lección"}
                    </h3>
                    {formData.mandatory && (
                      <Badge variant="destructive" className="text-xs">
                        <Star className="mr-1 h-3 w-3" />
                        Obligatoria
                      </Badge>
                    )}
                  </div>

                  <p className="text-muted-foreground mb-4">
                    {formData.description ||
                      "Descripción de la lección aparecerá aquí"}
                  </p>

                  <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Target className="h-4 w-4" />
                      <span>{formData.experiencePoints} XP</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        ~{Math.ceil(formData.experiencePoints / 5)} min
                      </span>
                    </div>
                    {selectedUnit && (
                      <Badge variant="outline" className="text-xs">
                        {selectedUnit.name}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    #{formData.position}
                  </div>
                  <div className="text-xs text-muted-foreground">Posición</div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <Button disabled className="w-full">
                  Comenzar Lección
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-4">
          <Link href="/admin/lessons">
            <Button variant="outline" type="button">
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isLoading || !formData.name || !formData.unitId}
          >
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Guardando..." : "Crear Lección"}
          </Button>
        </div>
      </form>

      {/* Tips y recomendaciones */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">
            💡 Tips para crear lecciones efectivas
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm space-y-2">
          <ul className="space-y-1 list-disc list-inside">
            <li>
              <strong>Nombres claros:</strong> Usa títulos descriptivos que
              indiquen qué aprenderán
            </li>
            <li>
              <strong>Progresión lógica:</strong> Ordena las lecciones de básico
              a avanzado
            </li>
            <li>
              <strong>XP balanceado:</strong> 25-35 XP para lecciones básicas,
              40-60 XP para avanzadas
            </li>
            <li>
              <strong>Lecciones obligatorias:</strong> Úsalas para conceptos
              fundamentales
            </li>
            <li>
              <strong>Descripciones útiles:</strong> Explica brevemente qué
              cubrirá la lección
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
