"use client";

import { useState, useEffect } from "react";
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
import { Save, Star } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Lesson, Unit } from "@/lib/types";
import { toast } from "sonner";

interface LessonFormProps {
  initialData?: Lesson | null;
  onSubmit: (data: LessonInput) => Promise<void>;
  submitting?: boolean;
}

export type LessonInput = {
  name: string;
  description: string;
  mandatory: boolean;
  experiencePoints: number;
  position: number;
  isActive: boolean;
  unitId: number;
};

export default function LessonForm({
  initialData,
  onSubmit,
  submitting
}: LessonFormProps) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [formData, setFormData] = useState<LessonInput>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    mandatory: initialData?.mandatory || false,
    experiencePoints: initialData?.experiencePoints || 25,
    position: initialData?.position || 1,
    isActive: initialData?.isActive || true,
    unitId: initialData?.unitId || 1
  });

  const fetchUnits = async () => {
    const response = await fetch("/api/units");
    if (!response.ok) {
      throw new Error("Failed to fetch units");
    }
    return response.json();
  };

  const isLoading = submitting;

  const handleInputChange = (
    key: keyof LessonInput,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
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

  useEffect(() => {
    const loadUnits = async () => {
      try {
        const unitsData = await fetchUnits();
        setUnits(unitsData);
      } catch (error) {
        console.error("Error loading units:", error);
        toast.error("No se pudieron cargar las unidades");
      }
    };

    loadUnits();
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe brevemente el contenido de esta lección..."
              rows={4}
              className="bg-background text-foreground border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unitId">Unidad *</Label>
            <Select
              value={`${formData.unitId}`}
              onValueChange={(value) => handleInputChange("unitId", value)}
              required
            >
              <SelectTrigger className="bg-background text-foreground border-border">
                <SelectValue placeholder="Selecciona una unidad" />
              </SelectTrigger>
              <SelectContent className="bg-card text-foreground border-border">
                {units.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id.toString()}>
                    <div className="flex items-center justify-between w-full">
                      <span>{unit.name}</span>
                      <Badge variant="outline" className="ml-2">
                        {unit._count.lessons} lecciones
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          {isLoading ? "Guardando..." : "Guardar Lección"}
        </Button>
      </div>
    </form>
  );
}
