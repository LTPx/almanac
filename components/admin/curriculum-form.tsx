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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Curriculum } from "@/lib/types";
import Link from "next/link";
import { Save, Globe } from "lucide-react";

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
  translations: {
    EN: { title: string };
    ES: { title: string };
  };
};

export default function CurriculumForm({
  initialData,
  onSubmit,
  submitting,
  buttonText
}: CurriculumFormProps) {
  // Helper para obtener traducción inicial
  const getInitialTranslation = (lang: "EN" | "ES") => {
    if (initialData?.translations) {
      const translation = (initialData.translations as any[]).find(
        (t: any) => t.language === lang
      );
      return translation?.title || "";
    }
    return "";
  };

  const [formData, setFormData] = useState<CurriculumInput>({
    title: initialData?.title || "",
    difficulty: initialData?.difficulty || "BEGINNER",
    audienceAgeRange: initialData?.audienceAgeRange || "",
    translations: {
      EN: { title: getInitialTranslation("EN") || initialData?.title || "" },
      ES: { title: getInitialTranslation("ES") }
    }
  });

  const handleChange = (key: keyof CurriculumInput, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleTranslationChange = (
    lang: "EN" | "ES",
    field: "title",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      translations: {
        ...prev.translations,
        [lang]: {
          ...prev.translations[lang],
          [field]: value
        }
      }
    }));
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Traducciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="EN" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="EN">🇺🇸 English (EN)</TabsTrigger>
              <TabsTrigger value="ES">🇪🇸 Español (ES)</TabsTrigger>
            </TabsList>
            <TabsContent value="EN" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title-en">Título en Inglés*</Label>
                <Input
                  id="title-en"
                  value={formData.translations.EN.title}
                  onChange={(e) =>
                    handleTranslationChange("EN", "title", e.target.value)
                  }
                  placeholder="Enter English title..."
                  required
                />
              </div>
            </TabsContent>
            <TabsContent value="ES" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title-es">Título en Español*</Label>
                <Input
                  id="title-es"
                  value={formData.translations.ES.title}
                  onChange={(e) =>
                    handleTranslationChange("ES", "title", e.target.value)
                  }
                  placeholder="Ingresa título en español..."
                  required
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Link href="/admin/curriculums">
          <Button variant="outline" type="button">
            Cancelar
          </Button>
        </Link>
        <Button
          type="submit"
          disabled={
            submitting ||
            !formData.translations.EN.title ||
            !formData.translations.ES.title
          }
        >
          <Save className="mr-2 h-4 w-4" />
          {submitting ? "Guardando..." : buttonText || "Crear Curriculum"}
        </Button>
      </div>
    </form>
  );
}
