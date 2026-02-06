"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge, Save, Star, Globe } from "lucide-react";
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
  translations: {
    EN: { name: string; description: string };
    ES: { name: string; description: string };
  };
};

export default function UnitForm({
  initialData,
  onSubmit,
  submitting,
  buttonText
}: UnitFormProps) {
  // Helper para obtener traducción inicial
  const getInitialTranslation = (lang: "EN" | "ES") => {
    if (initialData?.translations) {
      const translation = (initialData.translations as any[]).find(
        (t: any) => t.language === lang
      );
      return {
        name: translation?.name || "",
        description: translation?.description || ""
      };
    }
    return { name: "", description: "" };
  };

  const [formData, setFormData] = useState<UnitInput>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    order: initialData?.order || 1,
    isActive: !!initialData?.isActive,
    experiencePoints: initialData?.experiencePoints || 25,
    mandatory: initialData?.mandatory || false,
    position: initialData?.position || 1,
    translations: {
      EN:
        getInitialTranslation("EN").name || initialData?.name
          ? {
              name: getInitialTranslation("EN").name || initialData?.name || "",
              description:
                getInitialTranslation("EN").description ||
                initialData?.description ||
                ""
            }
          : { name: "", description: "" },
      ES: getInitialTranslation("ES")
    }
  });

  const isLoading = submitting;

  const handleChange = (
    key: keyof UnitInput,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleTranslationChange = (
    lang: "EN" | "ES",
    field: "name" | "description",
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Información de la Unidad
          </CardTitle>
          <CardDescription>
            Completa la información en ambos idiomas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="EN" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="EN">🇺🇸 English (EN)</TabsTrigger>
              <TabsTrigger value="ES">🇪🇸 Español (ES)</TabsTrigger>
            </TabsList>
            <TabsContent value="EN" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name-en">Unit Name (English)*</Label>
                <Input
                  id="name-en"
                  value={formData.translations.EN.name}
                  onChange={(e) =>
                    handleTranslationChange("EN", "name", e.target.value)
                  }
                  placeholder="Ex: Introduction to Blockchain"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description-en">Description (English)</Label>
                <Textarea
                  id="description-en"
                  value={formData.translations.EN.description}
                  onChange={(e) =>
                    handleTranslationChange("EN", "description", e.target.value)
                  }
                  placeholder="Briefly describe the unit content..."
                  rows={4}
                />
              </div>
            </TabsContent>
            <TabsContent value="ES" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name-es">Nombre de la Unidad (Español)*</Label>
                <Input
                  id="name-es"
                  value={formData.translations.ES.name}
                  onChange={(e) =>
                    handleTranslationChange("ES", "name", e.target.value)
                  }
                  placeholder="Ej: Introducción a Blockchain"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description-es">Descripción (Español)</Label>
                <Textarea
                  id="description-es"
                  value={formData.translations.ES.description}
                  onChange={(e) =>
                    handleTranslationChange("ES", "description", e.target.value)
                  }
                  placeholder="Describe brevemente el contenido de esta unidad..."
                  rows={4}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

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
              <Label htmlFor="experiencePoints">
                Puntos de Experiencia Maximo (XP)
              </Label>
              <div className="flex items-center space-x-4">
                <Input
                  id="experiencePoints"
                  type="number"
                  min="5"
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
        <Button
          type="submit"
          disabled={
            isLoading ||
            !formData.translations.EN.name ||
            !formData.translations.ES.name
          }
        >
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? "Guardando..." : buttonText || "Crear Unidad"}
        </Button>
      </div>
    </form>
  );
}
