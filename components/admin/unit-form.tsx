"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge, Save, Star } from "lucide-react";
import Link from "next/link";
import { Unit } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "../ui/card";

interface UnitFormProps {
  initialData?: Unit | null;
  onSubmit: (data: UnitInput) => Promise<void>;
  submitting?: boolean;
  buttonText?: string;
}

export type UnitInput = {
  name: string;
  description: string;
  order: number;
  isActive: boolean;
  mandatory: boolean;
  experiencePoints: number;
  curriculumId?: number;
  position: number;
};

export default function UnitForm({
  initialData,
  onSubmit,
  submitting,
  buttonText
}: UnitFormProps) {
  const [formData, setFormData] = useState<UnitInput>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    order: initialData?.order || 1,
    isActive: !!initialData?.isActive,
    experiencePoints: initialData?.experiencePoints || 25,
    mandatory: initialData?.mandatory || false,
    position: initialData?.position || 1
  });

  const isLoading = submitting;

  const handleChange = (
    key: keyof UnitInput,
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre de la Unidad *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Ej: Introducción a Blockchain"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Describe brevemente el contenido de esta unidad..."
          rows={4}
        />
      </div>

      {/* Configuración avanzada */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Configuración de la Unidad</CardTitle>
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
                    handleChange(
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
              <Label htmlFor="position">
                Posición en el path de aprendizaje
              </Label>
              <Input
                id="position"
                type="number"
                min="1"
                value={formData.position}
                onChange={(e) =>
                  handleChange("position", parseInt(e.target.value) || 1)
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
                  handleChange("mandatory", checked)
                }
              />
              <Label
                htmlFor="mandatory"
                className="flex items-center space-x-2"
              >
                <Star className="h-4 w-4 text-yellow-500" />
                <span>Unidad obligatoria</span>
              </Label>
            </div>
            <p className="text-sm text-muted-foreground ml-6">
              Las unidades obligatorias deben completarse para avanzar
            </p>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleChange("isActive", checked)}
              />
              <Label htmlFor="isActive">Unidad activa</Label>
            </div>
            <p className="text-sm text-muted-foreground ml-6">
              Solo las unidades activas serán visibles para los estudiantes
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Link href="/admin/units">
          <Button variant="outline" type="button">
            Cancelar
          </Button>
        </Link>
        <Button type="submit" disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? "Guardando..." : buttonText || "Crear Unidad"}
        </Button>
      </div>
    </form>
  );
}
