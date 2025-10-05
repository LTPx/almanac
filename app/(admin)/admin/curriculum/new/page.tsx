// app/admin/curriculum/new/page.tsx
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
import {
  ArrowLeft,
  Save,
  GraduationCap,
  Plus,
  X,
  BookOpen,
  Info
} from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
// import { Editor } from '@tinymce/tinymce-react'
import { Checkbox } from "@/components/ui/checkbox";

// Mock data - reemplazar con datos reales
const mockUnits = [
  { id: 1, name: "Introducción a Blockchain", order: 1 },
  { id: 2, name: "Criptografía básica", order: 2 },
  { id: 3, name: "Bitcoin y su historia", order: 3 },
  { id: 4, name: "Smart Contracts", order: 4 },
  { id: 5, name: "Solidity básico", order: 5 },
  { id: 6, name: "Web3.js", order: 6 },
  { id: 7, name: "DeFi Fundamentals", order: 7 },
  { id: 8, name: "NFTs y Tokens", order: 8 }
];

const difficultyOptions = [
  {
    value: "BEGINNER",
    label: "Principiante",
    icon: "🌱",
    description: "Sin conocimientos previos requeridos"
  },
  {
    value: "INTERMEDIATE",
    label: "Intermedio",
    icon: "⚡",
    description: "Conocimientos básicos de blockchain"
  },
  {
    value: "ADVANCED",
    label: "Avanzado",
    icon: "🚀",
    description: "Experiencia en desarrollo blockchain"
  }
];

const ageRangeOptions = [
  "10-15 años",
  "16-20 años",
  "21-30 años",
  "31-40 años",
  "41+ años",
  "Todas las edades"
];

export default function CreateCurriculumPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    audienceAgeRange: "",
    difficulty: "BEGINNER",
    selectedUnits: [] as number[]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/curriculum", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: formData.title,
          audienceAgeRange: formData.audienceAgeRange || null,
          difficulty: formData.difficulty,
          unitIds: formData.selectedUnits,
          metadata: {
            description: formData.description,
            createdBy: "admin" // Obtener del usuario logueado
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al crear curriculum");
      }

      const data = await response.json();
      console.log("Curriculum creado:", data.curriculum);

      router.push("/admin/curriculum");
    } catch (error: any) {
      console.error("Error al crear curriculum:", error);
      alert(error.message || "Error al crear el curriculum");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUnitToggle = (unitId: number) => {
    setFormData((prev) => ({
      ...prev,
      selectedUnits: prev.selectedUnits.includes(unitId)
        ? prev.selectedUnits.filter((id) => id !== unitId)
        : [...prev.selectedUnits, unitId]
    }));
  };

  const selectedDifficulty = difficultyOptions.find(
    (d) => d.value === formData.difficulty
  );
  const selectedUnitsDetails = mockUnits.filter((u) =>
    formData.selectedUnits.includes(u.id)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin/curriculum">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nuevo Curriculum</h1>
          <p className="text-gray-600">Crea un nuevo curriculum educativo</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
            <CardDescription>Datos principales del curriculum</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Título del Curriculum *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Ej: Introducción a Blockchain para Principiantes"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <div className="border rounded-md">
                {/* <Editor
                  apiKey="your-tinymce-api-key-here"
                  value={formData.description}
                  onEditorChange={(content: any) => handleInputChange('description', content)}
                  init={{
                    height: 250,
                    menubar: false,
                    plugins: [
                      'advlist', 'autolink', 'lists', 'link', 'charmap',
                      'anchor', 'searchreplace', 'code',
                      'insertdatetime', 'table', 'help', 'wordcount'
                    ],
                    toolbar: 'undo redo | blocks | ' +
                      'bold italic underline | bullist numlist | ' +
                      'removeformat | help',
                    content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 14px; line-height: 1.6; }',
                    placeholder: 'Describe el contenido y objetivos de este curriculum...',
                    branding: false,
                  }}
                /> */}
              </div>
              <p className="text-xs text-gray-500">
                Descripción detallada del curriculum, objetivos de aprendizaje y
                requisitos previos
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="difficulty">Nivel de Dificultad *</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) =>
                    handleInputChange("difficulty", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {difficultyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center space-x-2">
                          <span>{option.icon}</span>
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedDifficulty && (
                  <p className="text-sm text-gray-600">
                    {selectedDifficulty.description}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="audienceAgeRange">
                  Rango de Edad (Opcional)
                </Label>
                <Select
                  value={formData.audienceAgeRange}
                  onValueChange={(value) =>
                    handleInputChange("audienceAgeRange", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rango" />
                  </SelectTrigger>
                  <SelectContent>
                    {ageRangeOptions.map((range) => (
                      <SelectItem key={range} value={range}>
                        {range}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Público objetivo recomendado para este curriculum
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selección de unidades */}
        <Card>
          <CardHeader>
            <CardTitle>Unidades del Curriculum</CardTitle>
            <CardDescription>
              Selecciona las unidades que formarán parte de este curriculum
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Orden de las unidades</p>
                <p className="mt-1">
                  Las unidades se mostrarán en el orden seleccionado. Puedes
                  reordenarlas después de crear el curriculum.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {mockUnits.map((unit) => (
                <div
                  key={unit.id}
                  className={`flex items-center space-x-3 p-4 border-2 rounded-lg transition-all cursor-pointer hover:bg-gray-50 ${
                    formData.selectedUnits.includes(unit.id)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200"
                  }`}
                  onClick={() => handleUnitToggle(unit.id)}
                >
                  <Checkbox
                    checked={formData.selectedUnits.includes(unit.id)}
                    onCheckedChange={() => handleUnitToggle(unit.id)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{unit.name}</span>
                    </div>
                  </div>
                  {formData.selectedUnits.includes(unit.id) && (
                    <Badge variant="secondary">
                      Posición: {formData.selectedUnits.indexOf(unit.id) + 1}
                    </Badge>
                  )}
                </div>
              ))}
            </div>

            {formData.selectedUnits.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-2">No has seleccionado ninguna unidad</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vista previa */}
        <Card>
          <CardHeader>
            <CardTitle>Vista Previa</CardTitle>
            <CardDescription>Así se verá el curriculum</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 bg-gray-50">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <GraduationCap className="h-6 w-6 text-blue-600" />
                    <h3 className="text-xl font-semibold">
                      {formData.title || "Título del curriculum"}
                    </h3>
                  </div>
                  {selectedDifficulty && (
                    <Badge
                      className={
                        selectedDifficulty.value === "BEGINNER"
                          ? "bg-green-100 text-green-800"
                          : selectedDifficulty.value === "INTERMEDIATE"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }
                    >
                      <span className="mr-1">{selectedDifficulty.icon}</span>
                      {selectedDifficulty.label}
                    </Badge>
                  )}
                </div>
              </div>

              {formData.description && (
                <div
                  className="prose prose-sm max-w-none mb-4"
                  dangerouslySetInnerHTML={{ __html: formData.description }}
                />
              )}

              {formData.audienceAgeRange && (
                <p className="text-sm text-gray-600 mb-4">
                  👥 Dirigido a: {formData.audienceAgeRange}
                </p>
              )}

              {selectedUnitsDetails.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    📚 {selectedUnitsDetails.length} unidades incluidas:
                  </p>
                  <div className="space-y-2">
                    {selectedUnitsDetails.map((unit, index) => (
                      <div
                        key={unit.id}
                        className="flex items-center space-x-2 text-sm"
                      >
                        <Badge variant="outline" className="text-xs">
                          {index + 1}
                        </Badge>
                        <span>{unit.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedUnitsDetails.length === 0 && (
                <div className="text-center py-6 text-gray-400">
                  <p className="text-sm">
                    Selecciona unidades para ver la vista previa
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-4">
          <Link href="/admin/curriculum">
            <Button variant="outline" type="button">
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={
              isLoading ||
              !formData.title ||
              formData.selectedUnits.length === 0
            }
          >
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Creando..." : "Crear Curriculum"}
          </Button>
        </div>
      </form>

      {/* Información adicional */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">
            💡 Tips para crear curriculums efectivos
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 text-sm space-y-2">
          <ul className="space-y-2">
            <li>
              <strong>Título claro:</strong> Usa un título descriptivo que
              indique el nivel y tema principal
            </li>
            <li>
              <strong>Progresión lógica:</strong> Ordena las unidades de lo más
              básico a lo más avanzado
            </li>
            <li>
              <strong>Nivel apropiado:</strong> Asegúrate que el nivel de
              dificultad coincida con las unidades seleccionadas
            </li>
            <li>
              <strong>Descripción completa:</strong> Explica claramente los
              objetivos de aprendizaje y requisitos previos
            </li>
            <li>
              <strong>Público objetivo:</strong> Define el rango de edad para
              facilitar la búsqueda
            </li>
            <li>
              <strong>Cantidad de unidades:</strong> Un curriculum efectivo
              tiene entre 3-8 unidades
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Ejemplos de curriculums */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Ejemplos de Estructura</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg bg-green-50 border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <Badge className="bg-green-100 text-green-800">
                  🌱 Principiante
                </Badge>
              </div>
              <h4 className="font-semibold mb-2">Blockchain Básico</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• ¿Qué es Blockchain?</li>
                <li>• Criptografía básica</li>
                <li>• Bitcoin y su historia</li>
                <li>• Transacciones simples</li>
              </ul>
              <p className="text-xs text-gray-600 mt-2">
                3-4 unidades | 16-25 años
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
              <div className="flex items-center space-x-2 mb-2">
                <Badge className="bg-yellow-100 text-yellow-800">
                  ⚡ Intermedio
                </Badge>
              </div>
              <h4 className="font-semibold mb-2">Desarrollo Smart Contracts</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Introducción a Solidity</li>
                <li>• Variables y tipos de datos</li>
                <li>• Funciones y modificadores</li>
                <li>• Testing y deployment</li>
                <li>• Web3.js básico</li>
              </ul>
              <p className="text-xs text-gray-600 mt-2">
                5-6 unidades | 18-35 años
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-red-50 border-red-200">
              <div className="flex items-center space-x-2 mb-2">
                <Badge className="bg-red-100 text-red-800">🚀 Avanzado</Badge>
              </div>
              <h4 className="font-semibold mb-2">DeFi Architecture</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• AMMs y liquidity pools</li>
                <li>• Lending protocols</li>
                <li>• Yield farming strategies</li>
                <li>• Security best practices</li>
                <li>• Advanced patterns</li>
              </ul>
              <p className="text-xs text-gray-600 mt-2">
                5-8 unidades | 22+ años
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
