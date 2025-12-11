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
import {
  Save,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle
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
import { Unit } from "@/lib/types";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface QuestionFormProps {
  initialData?: QuestionData | null;
  onSubmit: (data: QuestionInput) => Promise<void>;
  submitting?: boolean;
}

export type QuestionData = {
  id?: number;
  title: string;
  type: QuestionType;
  unitId: number;
  order: number;
  isActive: boolean;
  content: any;
  answers?: AnswerData[];
};

export type AnswerData = {
  id?: number;
  text: string;
  isCorrect: boolean;
  order: number;
};

export type QuestionInput = {
  title: string;
  type: QuestionType;
  unitId: number;
  order: number;
  isActive: boolean;
  content: any;
  answers: AnswerData[];
};

type QuestionType =
  | "MULTIPLE_CHOICE"
  | "FILL_IN_BLANK"
  | "ORDER_WORDS"
  | "TRUE_FALSE"
  | "MATCHING"
  | "DRAG_DROP";

const questionTypes = [
  { value: "MULTIPLE_CHOICE", label: "Opción múltiple" },
  { value: "FILL_IN_BLANK", label: "Completar espacios" },
  { value: "ORDER_WORDS", label: "Ordenar palabras" },
  { value: "TRUE_FALSE", label: "Verdadero/Falso" },
  { value: "MATCHING", label: "Emparejar" },
  { value: "DRAG_DROP", label: "Arrastrar y soltar" }
] as const;

export default function QuestionForm({
  initialData,
  onSubmit,
  submitting
}: QuestionFormProps) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [formData, setFormData] = useState<QuestionInput>({
    title: initialData?.title || "",
    type: initialData?.type || "MULTIPLE_CHOICE",
    unitId: initialData?.unitId || 0,
    order: initialData?.order || 1,
    isActive: initialData?.isActive ?? true,
    content: initialData?.content || {},
    answers: initialData?.answers || [
      { text: "", isCorrect: false, order: 0 },
      { text: "", isCorrect: false, order: 1 },
      { text: "", isCorrect: false, order: 2 },
      { text: "", isCorrect: false, order: 3 }
    ]
  });

  const [trueFalseAnswer, setTrueFalseAnswer] = useState<boolean>(
    initialData?.content?.correctAnswer ?? true
  );

  const [fillInBlankAnswers, setFillInBlankAnswers] = useState<string>(
    initialData?.content?.correctAnswers?.join(", ") || ""
  );

  const isLoading = submitting;

  const fetchUnits = async () => {
    const response = await fetch("/api/admin/units");
    if (!response.ok) {
      throw new Error("Failed to fetch units");
    }
    const data = await response.json();
    return data.data || [];
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

  const handleInputChange = (
    key: keyof QuestionInput,
    value: string | number | boolean | any
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleAnswerChange = (
    index: number,
    field: "text" | "isCorrect",
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      answers: prev.answers.map((answer, i) =>
        i === index ? { ...answer, [field]: value } : answer
      )
    }));
  };

  const addAnswer = () => {
    setFormData((prev) => ({
      ...prev,
      answers: [
        ...prev.answers,
        { text: "", isCorrect: false, order: prev.answers.length }
      ]
    }));
  };

  const removeAnswer = (index: number) => {
    if (formData.answers.length > 2) {
      setFormData((prev) => ({
        ...prev,
        answers: prev.answers.filter((_, i) => i !== index)
      }));
    }
  };

  const setCorrectAnswer = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      answers: prev.answers.map((answer, i) => ({
        ...answer,
        isCorrect: i === index
      }))
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!formData.title.trim()) {
      toast.error("El título de la pregunta es requerido");
      return;
    }

    if (!formData.unitId) {
      toast.error("Debes seleccionar una unidad");
      return;
    }

    // Validar según el tipo de pregunta
    if (formData.type === "MULTIPLE_CHOICE") {
      const hasCorrectAnswer = formData.answers.some((a) => a.isCorrect);
      const allAnswersHaveText = formData.answers.every((a) => a.text.trim());

      if (!hasCorrectAnswer) {
        toast.error("Debes marcar una respuesta como correcta");
        return;
      }

      if (!allAnswersHaveText) {
        toast.error("Todas las opciones deben tener texto");
        return;
      }

      // Actualizar content con las respuestas
      formData.content = {
        ...formData.content,
        type: "MULTIPLE_CHOICE"
      };
    } else if (formData.type === "TRUE_FALSE") {
      formData.content = {
        correctAnswer: trueFalseAnswer
      };
      formData.answers = [
        { text: "Verdadero", isCorrect: trueFalseAnswer, order: 0 },
        { text: "Falso", isCorrect: !trueFalseAnswer, order: 1 }
      ];
    } else if (formData.type === "FILL_IN_BLANK") {
      const correctAnswers = fillInBlankAnswers
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a);

      if (correctAnswers.length === 0) {
        toast.error("Debes proporcionar al menos una respuesta correcta");
        return;
      }

      formData.content = {
        correctAnswers,
        caseSensitive: false
      };
      formData.answers = [];
    }

    // Actualizar el orden de las respuestas
    const answersWithOrder = formData.answers.map((answer, index) => ({
      ...answer,
      order: index
    }));

    await onSubmit({
      ...formData,
      answers: answersWithOrder
    });
  };

  const hasCorrectAnswer = formData.answers.some((a) => a.isCorrect);

  return (
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
              className="bg-background border-border text-foreground"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Pregunta *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  handleInputChange("type", value as QuestionType)
                }
              >
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {questionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unidad *</Label>
              <Select
                value={formData.unitId.toString()}
                onValueChange={(value) =>
                  handleInputChange("unitId", parseInt(value))
                }
              >
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Selecciona una unidad" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id.toString()}>
                      <div className="flex items-center gap-2">
                        <span>{unit.name}</span>
                        {unit._count && (
                          <Badge variant="outline" className="text-xs">
                            {unit._count.questions || 0} preguntas
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Orden *</Label>
              <Input
                id="order"
                type="number"
                min="1"
                value={formData.order}
                onChange={(e) =>
                  handleInputChange("order", parseInt(e.target.value) || 1)
                }
                className="bg-background border-border text-foreground"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleInputChange("isActive", checked)}
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
            {!hasCorrectAnswer && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Debes marcar una respuesta como correcta antes de guardar
                </AlertDescription>
              </Alert>
            )}

            {formData.answers.map((answer, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 p-4 border border-border rounded-lg bg-background"
              >
                <div className="flex-1">
                  <Input
                    placeholder={`Opción ${index + 1}`}
                    value={answer.text}
                    onChange={(e) =>
                      handleAnswerChange(index, "text", e.target.value)
                    }
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <Button
                  type="button"
                  variant={answer.isCorrect ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCorrectAnswer(index)}
                  className={
                    answer.isCorrect
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : ""
                  }
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {answer.isCorrect ? "Correcta" : "Marcar"}
                </Button>
                {formData.answers.length > 2 && (
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

            {formData.answers.length < 6 && (
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
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Configuración de Espacios en Blanco</CardTitle>
            <CardDescription>
              Usa guiones bajos (____) o corchetes [respuesta] para marcar los
              espacios en blanco en la pregunta principal.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Ejemplo:</strong> Bitcoin fue creado en el año ____ por
                ____
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                O usa: Bitcoin fue creado en el año [2008] por [Satoshi
                Nakamoto]
              </p>
            </div>
            <div className="space-y-2">
              <Label>Respuestas correctas (separadas por coma) *</Label>
              <Input
                placeholder="2008, Satoshi Nakamoto"
                value={fillInBlankAnswers}
                onChange={(e) => setFillInBlankAnswers(e.target.value)}
                className="bg-background border-border text-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Las respuestas deben estar en el orden en que aparecen los
                espacios en blanco
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuración para verdadero/falso */}
      {formData.type === "TRUE_FALSE" && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Respuesta Correcta</CardTitle>
            <CardDescription>
              Selecciona la respuesta correcta para esta pregunta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Button
                type="button"
                variant={trueFalseAnswer ? "default" : "outline"}
                className={`flex-1 h-16 ${
                  trueFalseAnswer
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : ""
                }`}
                onClick={() => setTrueFalseAnswer(true)}
              >
                {trueFalseAnswer && <CheckCircle className="mr-2 h-5 w-5" />}
                Verdadero
              </Button>
              <Button
                type="button"
                variant={!trueFalseAnswer ? "default" : "outline"}
                className={`flex-1 h-16 ${
                  !trueFalseAnswer
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : ""
                }`}
                onClick={() => setTrueFalseAnswer(false)}
              >
                {!trueFalseAnswer && <CheckCircle className="mr-2 h-5 w-5" />}
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
          <div className="p-6 bg-muted rounded-lg border border-border">
            <h3 className="font-semibold text-lg mb-4 text-foreground">
              {formData.title || "Tu pregunta aparecerá aquí..."}
            </h3>

            {formData.type === "MULTIPLE_CHOICE" &&
              formData.answers.some((a) => a.text) && (
                <div className="space-y-2">
                  {formData.answers
                    .filter((a) => a.text)
                    .map((answer, index) => (
                      <div
                        key={index}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          answer.isCorrect
                            ? "border-green-500 bg-green-50 dark:bg-green-950 text-foreground"
                            : "border-border hover:bg-muted text-foreground"
                        }`}
                      >
                        {answer.text}
                        {answer.isCorrect && (
                          <span className="ml-2 text-green-600 dark:text-green-400 text-sm font-semibold">
                            (Correcta)
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              )}

            {formData.type === "TRUE_FALSE" && (
              <div className="space-y-2">
                <div
                  className={`p-3 border rounded-lg ${
                    trueFalseAnswer
                      ? "border-green-500 bg-green-50 dark:bg-green-950"
                      : "border-border"
                  }`}
                >
                  Verdadero
                  {trueFalseAnswer && (
                    <span className="ml-2 text-green-600 dark:text-green-400 text-sm font-semibold">
                      (Correcta)
                    </span>
                  )}
                </div>
                <div
                  className={`p-3 border rounded-lg ${
                    !trueFalseAnswer
                      ? "border-green-500 bg-green-50 dark:bg-green-950"
                      : "border-border"
                  }`}
                >
                  Falso
                  {!trueFalseAnswer && (
                    <span className="ml-2 text-green-600 dark:text-green-400 text-sm font-semibold">
                      (Correcta)
                    </span>
                  )}
                </div>
              </div>
            )}

            {formData.type === "FILL_IN_BLANK" && fillInBlankAnswers && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Respuestas correctas:
                </p>
                <div className="flex flex-wrap gap-2">
                  {fillInBlankAnswers
                    .split(",")
                    .map((answer, index) => (
                      <Badge key={index} variant="secondary">
                        {answer.trim()}
                      </Badge>
                    ))}
                </div>
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
        <Button type="submit" disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? "Guardando..." : initialData ? "Actualizar" : "Crear Pregunta"}
        </Button>
      </div>
    </form>
  );
}
