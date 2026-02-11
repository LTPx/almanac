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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Globe, Sparkles, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
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
  translations: {
    EN: { name: string; description: string };
    ES: { name: string; description: string };
  };
};

export default function LessonForm({
  initialData,
  onSubmit,
  submitting
}: LessonFormProps) {
  const [units, setUnits] = useState<Unit[]>([]);

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

  const [formData, setFormData] = useState<LessonInput>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    position: initialData?.position || 1,
    isActive: initialData?.isActive || true,
    unitId: initialData?.unitId || 1,
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

  const fetchUnits = async () => {
    const response = await fetch("/api/units");
    if (!response.ok) {
      throw new Error("Failed to fetch units");
    }
    return response.json();
  };

  const [translating, setTranslating] = useState<"EN" | "ES" | null>(null);
  const isLoading = submitting;

  const handleTranslate = async (from: "EN" | "ES") => {
    const to = from === "EN" ? "ES" : "EN";
    const source = formData.translations[from];

    if (!source.name.trim()) {
      toast.error(`Escribe al menos el nombre en ${from} antes de traducir`);
      return;
    }

    setTranslating(to);
    try {
      const res = await fetch("/api/admin/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: { name: source.name, description: source.description },
          from,
          to
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al traducir");
      }

      const { translated } = await res.json();

      setFormData((prev) => ({
        ...prev,
        translations: {
          ...prev.translations,
          [to]: {
            name: translated.name || prev.translations[to].name,
            description: translated.description ?? prev.translations[to].description
          }
        }
      }));

      toast.success(`Traducción al ${to === "ES" ? "Español" : "Inglés"} completada`);
    } catch (err: any) {
      toast.error(err.message || "Error al traducir");
    } finally {
      setTranslating(null);
    }
  };

  const handleInputChange = (
    key: keyof LessonInput,
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
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Información de la Lección
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
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={translating !== null || !formData.translations.EN.name.trim()}
                  onClick={() => handleTranslate("EN")}
                >
                  {translating === "ES" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  {translating === "ES" ? "Traduciendo..." : "Traducir a Español"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name-en">Lesson Name (English)*</Label>
                <Input
                  id="name-en"
                  value={formData.translations.EN.name}
                  onChange={(e) =>
                    handleTranslationChange("EN", "name", e.target.value)
                  }
                  placeholder="Ex: What is a Smart Contract?"
                  required
                  className="bg-background text-foreground border-border"
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
                  placeholder="Briefly describe the lesson content..."
                  rows={4}
                  className="bg-background text-foreground border-border"
                />
              </div>
            </TabsContent>
            <TabsContent value="ES" className="space-y-4 mt-4">
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={translating !== null || !formData.translations.ES.name.trim()}
                  onClick={() => handleTranslate("ES")}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  {translating === "EN" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  {translating === "EN" ? "Traduciendo..." : "Traducir a Inglés"}
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name-es">
                  Nombre de la Lección (Español)*
                </Label>
                <Input
                  id="name-es"
                  value={formData.translations.ES.name}
                  onChange={(e) =>
                    handleTranslationChange("ES", "name", e.target.value)
                  }
                  placeholder="Ej: ¿Qué es un Smart Contract?"
                  required
                  className="bg-background text-foreground border-border"
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
                  placeholder="Describe brevemente el contenido de esta lección..."
                  rows={4}
                  className="bg-background text-foreground border-border"
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Configuración</CardTitle>
          <CardDescription>Unidad y configuración adicional</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

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
          disabled={
            isLoading ||
            !formData.translations.EN.name ||
            !formData.translations.ES.name ||
            !formData.unitId
          }
        >
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? "Guardando..." : "Guardar Lección"}
        </Button>
      </div>
    </form>
  );
}
