"use client";

import { useState, useEffect, useRef } from "react";
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
  AlertCircle,
  Code,
  Globe,
  Sparkles,
  Loader2,
  ArrowRight,
  ArrowLeft
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  getTranslatableContentFields,
  buildTranslatedContent
} from "@/lib/question-translation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Editor from "@monaco-editor/react";

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
  translations?: { language: string; title: string; content?: any }[];
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
  translations: {
    EN: { title: string; content?: any };
    ES: { title: string; content?: any };
  };
};

type QuestionType =
  | "MULTIPLE_CHOICE"
  | "FILL_IN_BLANK"
  | "ORDER_WORDS"
  | "TRUE_FALSE";

const questionTypes = [
  { value: "MULTIPLE_CHOICE", label: "Opción múltiple" },
  { value: "FILL_IN_BLANK", label: "Completar espacios" },
  { value: "ORDER_WORDS", label: "Ordenar palabras" },
  { value: "TRUE_FALSE", label: "Verdadero/Falso" }
] as const;

export default function QuestionForm({
  initialData,
  onSubmit,
  submitting
}: QuestionFormProps) {
  const [units, setUnits] = useState<Unit[]>([]);

  const getInitialTranslation = (lang: "EN" | "ES") => {
    if (initialData?.translations) {
      const t = initialData.translations.find((t) => t.language === lang);
      return { title: t?.title || "", content: t?.content ?? undefined };
    }
    return { title: "", content: undefined };
  };

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
    ],
    translations: {
      EN:
        getInitialTranslation("EN").title || initialData?.title
          ? {
              title:
                getInitialTranslation("EN").title || initialData?.title || ""
            }
          : { title: "" },
      ES: getInitialTranslation("ES")
    }
  });

  const [translating, setTranslating] = useState<"EN" | "ES" | null>(null);

  const handleTranslate = async (from: "EN" | "ES") => {
    const to = from === "EN" ? "ES" : "EN";
    const source = formData.translations[from];

    if (!source.title.trim()) {
      toast.error(`Escribe la pregunta en ${from} antes de traducir`);
      return;
    }

    // Parse current content JSON to also translate it
    let parsedContent: any = null;
    if (jsonContent && !jsonError) {
      try {
        parsedContent = JSON.parse(jsonContent);
      } catch {}
    }

    // Build flat fields: title + content fields
    const fields: Record<string, string> = { title: source.title };
    if (parsedContent) {
      Object.assign(
        fields,
        getTranslatableContentFields(formData.type, parsedContent)
      );
    }

    setTranslating(to);
    try {
      const res = await fetch("/api/admin/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields, from, to })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al traducir");
      }

      const { translated } = await res.json();

      // Rebuild translated content from flat fields
      const translatedContent = parsedContent
        ? buildTranslatedContent(formData.type, parsedContent, translated)
        : undefined;

      setFormData((prev) => ({
        ...prev,
        translations: {
          ...prev.translations,
          [to]: {
            title: translated.title || prev.translations[to].title,
            content: translatedContent ?? prev.translations[to].content
          }
        }
      }));

      toast.success(
        `Traducción al ${to === "ES" ? "Español" : "Inglés"} completada`
      );
    } catch (err: any) {
      toast.error(err.message || "Error al traducir");
    } finally {
      setTranslating(null);
    }
  };

  const handleTranslationChange = (lang: "EN" | "ES", value: string) => {
    setFormData((prev) => ({
      ...prev,
      translations: {
        ...prev.translations,
        [lang]: { ...prev.translations[lang], title: value }
      }
    }));
  };

  const [trueFalseAnswer, setTrueFalseAnswer] = useState<boolean>(
    initialData?.content?.correctAnswer ?? true
  );

  const [jsonContent, setJsonContent] = useState<string>(() => {
    if (initialData?.content && Object.keys(initialData.content).length > 0) {
      return JSON.stringify(initialData.content, null, 2);
    }
    return "";
  });

  const [jsonError, setJsonError] = useState<string>("");
  const editorRef = useRef<any>(null);

  const isLoading = submitting;

  // Plantillas para tipos de preguntas complejas
  const contentTemplates = {
    FILL_IN_BLANK: {
      sentence: "12 + ___ = 20",
      explanation: "Para que 12 + algo = 20, necesitamos 8",
      correctAnswer: "8"
    },
    ORDER_WORDS: {
      sentence: "Cuando un valor cambia de signo también cambia de lado",
      words: [
        "Cuando",
        "un",
        "valor",
        "cambia",
        "de",
        "signo",
        "también",
        "cambia",
        "de",
        "lado"
      ],
      correctOrder: [
        "Cuando",
        "un",
        "valor",
        "cambia",
        "de",
        "signo",
        "también",
        "cambia",
        "de",
        "lado"
      ],
      explanation: "Esta es una regla fundamental del álgebra"
    }
  };

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

    // Si cambió el tipo de pregunta, cargar la plantilla correspondiente
    if (key === "type") {
      const questionType = value as QuestionType;
      if (["FILL_IN_BLANK", "ORDER_WORDS"].includes(questionType)) {
        const template =
          contentTemplates[questionType as keyof typeof contentTemplates];
        if (template) {
          setJsonContent(JSON.stringify(template, null, 2));
          setJsonError("");
        }
      }
    }
  };

  const handleJsonChange = (value: string | undefined) => {
    if (!value) {
      setJsonContent("");
      setJsonError("");
      return;
    }

    setJsonContent(value);

    try {
      JSON.parse(value);
      setJsonError("");
    } catch (error: any) {
      setJsonError("JSON inválido: " + error.message);
    }
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
    setFormData((prev) => {
      const esOptions = prev.translations.ES.content?.options;
      return {
        ...prev,
        answers: [
          ...prev.answers,
          { text: "", isCorrect: false, order: prev.answers.length }
        ],
        translations: esOptions
          ? {
              ...prev.translations,
              ES: {
                ...prev.translations.ES,
                content: { ...prev.translations.ES.content, options: [...esOptions, ""] }
              }
            }
          : prev.translations
      };
    });
  };

  const removeAnswer = (index: number) => {
    if (formData.answers.length > 2) {
      setFormData((prev) => {
        const esOptions = prev.translations.ES.content?.options;
        return {
          ...prev,
          answers: prev.answers.filter((_, i) => i !== index),
          translations: esOptions
            ? {
                ...prev.translations,
                ES: {
                  ...prev.translations.ES,
                  content: {
                    ...prev.translations.ES.content,
                    options: esOptions.filter((_: string, i: number) => i !== index)
                  }
                }
              }
            : prev.translations
        };
      });
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

  const handleESAnswerChange = (index: number, value: string) => {
    setFormData((prev) => {
      const currentOptions: string[] =
        prev.translations.ES.content?.options ||
        prev.answers.map(() => "");
      const newOptions = [...currentOptions];
      while (newOptions.length <= index) newOptions.push("");
      newOptions[index] = value;
      return {
        ...prev,
        translations: {
          ...prev.translations,
          ES: {
            ...prev.translations.ES,
            content: { ...prev.translations.ES.content, options: newOptions }
          }
        }
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!formData.translations.EN.title.trim()) {
      toast.error("La pregunta en inglés es requerida");
      return;
    }

    if (!formData.translations.ES.title.trim()) {
      toast.error("La pregunta en español es requerida");
      return;
    }

    // Sincronizar title principal con EN
    formData.title = formData.translations.EN.title;

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
    } else if (["FILL_IN_BLANK", "ORDER_WORDS"].includes(formData.type)) {
      // Para tipos complejos, parsear el JSON del content
      if (!jsonContent.trim()) {
        toast.error("Debes proporcionar el contenido en formato JSON");
        return;
      }

      if (jsonError) {
        toast.error(
          "El JSON tiene errores. Por favor corrígelos antes de guardar"
        );
        return;
      }

      try {
        const parsedContent = JSON.parse(jsonContent);
        formData.content = parsedContent;
        formData.answers = [];
      } catch (error: any) {
        toast.error("Error al parsear JSON: " + error.message);
        return;
      }
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
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Información Básica
          </CardTitle>
          <CardDescription>
            Escribe la pregunta en ambos idiomas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
                  disabled={
                    translating !== null ||
                    !formData.translations.EN.title.trim()
                  }
                  onClick={() => handleTranslate("EN")}
                >
                  {translating === "ES" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  {translating === "ES"
                    ? "Traduciendo..."
                    : "Traducir a Español"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title-en">Question (English) *</Label>
                <Textarea
                  id="title-en"
                  value={formData.translations.EN.title}
                  onChange={(e) =>
                    handleTranslationChange("EN", e.target.value)
                  }
                  placeholder="Write the question here..."
                  rows={3}
                  className="bg-background border-border text-foreground"
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
                  disabled={
                    translating !== null ||
                    !formData.translations.ES.title.trim()
                  }
                  onClick={() => handleTranslate("ES")}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  {translating === "EN" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  {translating === "EN"
                    ? "Traduciendo..."
                    : "Traducir a Inglés"}
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title-es">Pregunta (Español) *</Label>
                <Textarea
                  id="title-es"
                  value={formData.translations.ES.title}
                  onChange={(e) =>
                    handleTranslationChange("ES", e.target.value)
                  }
                  placeholder="Escribe aquí tu pregunta..."
                  rows={3}
                  className="bg-background border-border text-foreground"
                />
              </div>
            </TabsContent>
          </Tabs>

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
              Configura las opciones de respuesta en ambos idiomas. Marca una como correcta.
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

            <Tabs defaultValue="EN" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="EN">🇺🇸 English (EN)</TabsTrigger>
                <TabsTrigger value="ES">🇪🇸 Español (ES)</TabsTrigger>
              </TabsList>

              <TabsContent value="EN" className="space-y-3 mt-4">
                {formData.answers.map((answer, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-4 border border-border rounded-lg bg-background"
                  >
                    <div className="flex-1">
                      <Input
                        placeholder={`Option ${index + 1}`}
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
              </TabsContent>

              <TabsContent value="ES" className="space-y-3 mt-4">
                {formData.answers.map((answer, index) => {
                  const esText =
                    formData.translations.ES.content?.options?.[index] ?? "";
                  return (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-4 border border-border rounded-lg bg-background"
                    >
                      <div className="flex-1 space-y-1">
                        <Input
                          placeholder={`Opción ${index + 1}`}
                          value={esText}
                          onChange={(e) =>
                            handleESAnswerChange(index, e.target.value)
                          }
                          className="bg-background border-border text-foreground"
                        />
                        {answer.text && (
                          <p className="text-xs text-muted-foreground pl-1">
                            EN: {answer.text}
                          </p>
                        )}
                      </div>
                      {answer.isCorrect && (
                        <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium shrink-0">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Correcta
                        </span>
                      )}
                    </div>
                  );
                })}
              </TabsContent>
            </Tabs>

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

      {/* Configuración para tipos complejos (ORDER_WORDS, MATCHING, DRAG_DROP) */}
      {["FILL_IN_BLANK", "ORDER_WORDS"].includes(formData.type) && (
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Configuración de Contenido (JSON)
                </CardTitle>
                <CardDescription>
                  Edita el contenido de la pregunta en formato JSON
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {jsonError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{jsonError}</AlertDescription>
              </Alert>
            )}

            <div className="border border-border rounded-lg overflow-hidden">
              <Editor
                height="400px"
                defaultLanguage="json"
                value={jsonContent}
                onChange={handleJsonChange}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  formatOnPaste: true,
                  formatOnType: true
                }}
                onMount={(editor) => {
                  editorRef.current = editor;
                }}
              />
            </div>

            {formData.type === "FILL_IN_BLANK" && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200 font-semibold mb-2">
                  Ejemplo de estructura:
                </p>
                <pre className="text-xs text-blue-700 dark:text-blue-300 overflow-x-auto">
                  {`{
  "sentence": "12 + ___ = 20",
  "explanation": "Para que 12 + algo = 20, necesitamos 8",
  "correctAnswer": "8"
}
                  `}
                </pre>
              </div>
            )}

            {formData.type === "ORDER_WORDS" && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200 font-semibold mb-2">
                  Ejemplo de estructura:
                </p>
                <pre className="text-xs text-blue-700 dark:text-blue-300 overflow-x-auto">
                  {`{
  "sentence": "Frase completa que el usuario debe ordenar",
  "words": ["Frase", "completa", "que", "el", "usuario", "debe", "ordenar"],
  "correctOrder": ["Frase", "completa", "que", "el", "usuario", "debe", "ordenar"],
  "explanation": "Explicación de la respuesta"
}`}
                </pre>
              </div>
            )}
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
              {formData.translations.EN.title ||
                "Tu pregunta aparecerá aquí..."}
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
            {["FILL_IN_BLANK", "ORDER_WORDS"].includes(formData.type) &&
              jsonContent &&
              !jsonError && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground mb-2">
                    Vista previa del contenido JSON:
                  </p>
                  <div className="bg-muted border border-border rounded-lg p-4 max-h-60 overflow-y-auto">
                    <pre className="text-xs text-foreground">{jsonContent}</pre>
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
        <Button
          type="submit"
          disabled={
            isLoading ||
            !formData.translations.EN.title ||
            !formData.translations.ES.title ||
            !formData.unitId
          }
        >
          <Save className="mr-2 h-4 w-4" />
          {isLoading
            ? "Guardando..."
            : initialData
              ? "Actualizar"
              : "Crear Pregunta"}
        </Button>
      </div>
    </form>
  );
}
