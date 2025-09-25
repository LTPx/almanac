// app/admin/questions/new/page.tsx
"use client";

import { useState } from "react";
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
import { ArrowLeft, Save, Plus, Trash2, CheckCircle } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

const questionTypes = [
  { value: "MULTIPLE_CHOICE", label: "Opción múltiple" },
  { value: "FILL_IN_BLANK", label: "Completar espacios" },
  { value: "ORDER_WORDS", label: "Ordenar palabras" },
  { value: "TRUE_FALSE", label: "Verdadero/Falso" },
  { value: "MATCHING", label: "Emparejar" },
  { value: "DRAG_DROP", label: "Arrastrar y soltar" }
];

const mockLessons = [
  { id: 1, name: "¿Qué es Blockchain?", unitName: "Introducción a Blockchain" },
  { id: 2, name: "Historia de Bitcoin", unitName: "Introducción a Blockchain" },
  { id: 3, name: "Smart Contracts Básicos", unitName: "Smart Contracts" }
];

export default function CreateQuestionPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    type: "MULTIPLE_CHOICE",
    lessonId: "",
    order: 1,
    isActive: true
  });

  const [answers, setAnswers] = useState([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false }
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const questionData = {
        ...formData,
        content: {
          answers: formData.type === "MULTIPLE_CHOICE" ? answers : {}
        }
      };

      console.log("Creando pregunta:", questionData);

      // Simulamos una petición
      await new Promise((resolve) => setTimeout(resolve, 1000));

      router.push("/admin/questions");
    } catch (error) {
      console.error("Error al crear pregunta:", error);
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

  const handleAnswerChange = (
    index: number,
    field: "text" | "isCorrect",
    value: string | boolean
  ) => {
    setAnswers((prev) =>
      prev.map((answer, i) =>
        i === index ? { ...answer, [field]: value } : answer
      )
    );
  };

  const addAnswer = () => {
    setAnswers((prev) => [...prev, { text: "", isCorrect: false }]);
  };

  const removeAnswer = (index: number) => {
    if (answers.length > 2) {
      setAnswers((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const setCorrectAnswer = (index: number) => {
    setAnswers((prev) =>
      prev.map((answer, i) => ({
        ...answer,
        isCorrect: i === index
      }))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin/questions">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Nueva Pregunta</h1>
          <p className="text-muted-foreground">
            Crea una nueva pregunta para las lecciones
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
            <CardDescription>Datos principales de la pregunta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Pregunta *</Label>
              <Textarea
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Escribe aquí tu pregunta..."
                rows={3}
                required
                className="bg-card border-border text-foreground"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Pregunta</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleInputChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {questionTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lesson">Lección</Label>
                <Select
                  value={formData.lessonId}
                  onValueChange={(value) =>
                    handleInputChange("lessonId", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una lección" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockLessons.map((lesson) => (
                      <SelectItem key={lesson.id} value={lesson.id.toString()}>
                        {lesson.name} ({lesson.unitName})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Orden</Label>
                <Input
                  id="order"
                  type="number"
                  min="1"
                  value={formData.order}
                  onChange={(e) =>
                    handleInputChange("order", parseInt(e.target.value))
                  }
                  className="bg-card border-border text-foreground"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  handleInputChange("isActive", checked)
                }
              />
              <Label htmlFor="isActive">Pregunta activa</Label>
            </div>
          </CardContent>
        </Card>

        {/* Respuestas para opción múltiple */}
        {formData.type === "MULTIPLE_CHOICE" && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Opciones de Respuesta</CardTitle>
              <CardDescription>
                Configura las opciones de respuesta. Marca una como correcta.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {answers.map((answer, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-4 border border-border rounded-lg bg-card"
                >
                  <div className="flex-1">
                    <Input
                      placeholder={`Opción ${index + 1}`}
                      value={answer.text}
                      onChange={(e) =>
                        handleAnswerChange(index, "text", e.target.value)
                      }
                      className="bg-card border-border text-foreground"
                    />
                  </div>
                  <Button
                    type="button"
                    variant={answer.isCorrect ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCorrectAnswer(index)}
                    className={
                      answer.isCorrect ? "bg-green-600 hover:bg-green-700" : ""
                    }
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {answer.isCorrect ? "Correcta" : "Marcar correcta"}
                  </Button>
                  {answers.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeAnswer(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              {answers.length < 6 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={addAnswer}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar opción
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Configuración para completar espacios */}
        {formData.type === "FILL_IN_BLANK" && (
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Espacios en Blanco</CardTitle>
              <CardDescription>
                Usa guiones bajos (____) o corchetes [respuesta] para marcar los
                espacios en blanco.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Ejemplo:</strong> Bitcoin fue creado en el año ____
                  por ____
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  O usa: Bitcoin fue creado en el año [2008] por [Satoshi
                  Nakamoto]
                </p>
              </div>
              <div className="space-y-2">
                <Label>Respuestas correctas (separadas por coma)</Label>
                <Input placeholder="2008, Satoshi Nakamoto" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Configuración para verdadero/falso */}
        {formData.type === "TRUE_FALSE" && (
          <Card>
            <CardHeader>
              <CardTitle>Respuesta Correcta</CardTitle>
              <CardDescription>
                Selecciona la respuesta correcta para esta pregunta.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <Button type="button" variant="outline" className="flex-1 h-16">
                  Verdadero
                </Button>
                <Button type="button" variant="outline" className="flex-1 h-16">
                  Falso
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vista previa */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Vista Previa</CardTitle>
            <CardDescription>
              Así se verá la pregunta para los estudiantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-6 bg-card rounded-lg border border-border">
              <h3 className="font-semibold text-lg mb-4 text-foreground">
                {formData.title || "Tu pregunta aparecerá aquí..."}
              </h3>

              {formData.type === "MULTIPLE_CHOICE" &&
                answers.some((a) => a.text) && (
                  <div className="space-y-2">
                    {answers
                      .filter((a) => a.text)
                      .map((answer, index) => (
                        <div
                          key={index}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            answer.isCorrect
                              ? "border-green-300 bg-green-50 text-foreground"
                              : "border-border hover:bg-card text-foreground"
                          }`}
                        >
                          {answer.text}
                          {answer.isCorrect && (
                            <span className="ml-2 text-green-600 text-sm">
                              (Correcta)
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                )}
            </div>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-4">
          <Link href="/admin/questions">
            <Button variant="outline" type="button">
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isLoading || !formData.title || !formData.lessonId}
          >
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Guardando..." : "Crear Pregunta"}
          </Button>
        </div>
      </form>
    </div>
  );
}
