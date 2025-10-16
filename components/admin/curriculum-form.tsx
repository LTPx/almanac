"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Curriculum } from "@/lib/types";
import Link from "next/link";
import { Save } from "lucide-react";

interface CurriculumFormProps {
  initialData?: Curriculum | null;
  onSubmit: (data: CurriculumInput) => Promise<void>;
  submitting?: boolean;
  buttonText?: string;
}

export type CurriculumInput = {
  title: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  audienceAgeRange?: string;
};

export default function CurriculumForm({
  initialData,
  onSubmit,
  submitting,
  buttonText
}: CurriculumFormProps) {
  const [formData, setFormData] = useState<CurriculumInput>({
    title: initialData?.title || "",
    difficulty: initialData?.difficulty || "BEGINNER",
    audienceAgeRange: initialData?.audienceAgeRange || ""
  });

  const handleChange = (key: keyof CurriculumInput, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información del Curriculum</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título*</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Nivel de dificultad*</Label>
            <Select
              value={formData.difficulty}
              onValueChange={(value) =>
                handleChange(
                  "difficulty",
                  value as CurriculumInput["difficulty"]
                )
              }
            >
              <SelectTrigger id="difficulty">
                <SelectValue placeholder="Selecciona nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BEGINNER">Principiante</SelectItem>
                <SelectItem value="INTERMEDIATE">Intermedio</SelectItem>
                <SelectItem value="ADVANCED">Avanzado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="audienceAgeRange">
              Rango de edad años (opcional)
            </Label>
            <Input
              id="audienceAgeRange"
              value={formData.audienceAgeRange || ""}
              onChange={(e) => handleChange("audienceAgeRange", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Link href="/admin/curriculums">
          <Button variant="outline" type="button">
            Cancelar
          </Button>
        </Link>
        <Button type="submit" disabled={submitting || !formData.title}>
          <Save className="mr-2 h-4 w-4" />
          {submitting ? "Saving..." : buttonText || "Crear Curriculum"}
        </Button>
      </div>
    </form>
  );
}
