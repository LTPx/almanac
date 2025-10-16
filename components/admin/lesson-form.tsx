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
import { Save } from "lucide-react";
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
