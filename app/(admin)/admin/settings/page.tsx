"use client";

import React, { useState } from "react";
import {
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileJson,
  Loader2,
  Trash2,
  Download
} from "lucide-react";
import { Card } from "@/components/ui/card";

export default function AdminSettingsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jsonData, setJsonData] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateJSON = (data: any): string[] => {
    const errors: string[] = [];

    if (!Array.isArray(data)) {
      errors.push("El JSON debe ser un array de unidades");
      return errors;
    }

    data.forEach((unit: any, unitIndex: number) => {
      // Validar campos de la unidad
      if (!unit.name) errors.push(`Unidad ${unitIndex + 1}: Falta el nombre`);
      if (!unit.description)
        errors.push(`Unidad ${unitIndex + 1}: Falta la descripción`);
      if (typeof unit.order !== "number")
        errors.push(`Unidad ${unitIndex + 1}: El orden debe ser un número`);
      if (typeof unit.experiencePoints !== "number")
        errors.push(
          `Unidad ${unitIndex + 1}: experiencePoints debe ser un número`
        );

      if (!Array.isArray(unit.lessons)) {
        errors.push(
          `Unidad ${unitIndex + 1}: Debe tener un array de lecciones`
        );
      } else {
        unit.lessons.forEach((lesson: any, lessonIndex: number) => {
          if (!lesson.name)
            errors.push(
              `Unidad ${unitIndex + 1}, Lección ${lessonIndex + 1}: Falta el nombre`
            );
          if (!lesson.description)
            errors.push(
              `Unidad ${unitIndex + 1}, Lección ${lessonIndex + 1}: Falta la descripción`
            );
          if (typeof lesson.position !== "number")
            errors.push(
              `Unidad ${unitIndex + 1}, Lección ${lessonIndex + 1}: position debe ser un número`
            );
        });
      }

      if (!Array.isArray(unit.questions)) {
        errors.push(
          `Unidad ${unitIndex + 1}: Debe tener un array de preguntas`
        );
      } else {
        unit.questions.forEach((q: any, qIndex: number) => {
          const validTypes = [
            "MULTIPLE_CHOICE",
            "FILL_IN_BLANK",
            "TRUE_FALSE",
            "ORDER_WORDS",
            "MATCHING",
            "DRAG_DROP"
          ];
          if (!validTypes.includes(q.type)) {
            errors.push(
              `Unidad ${unitIndex + 1}, Pregunta ${qIndex + 1}: Tipo inválido (debe ser ${validTypes.join(", ")})`
            );
          }
          if (!q.title)
            errors.push(
              `Unidad ${unitIndex + 1}, Pregunta ${qIndex + 1}: Falta el título`
            );
          if (!q.content)
            errors.push(
              `Unidad ${unitIndex + 1}, Pregunta ${qIndex + 1}: Falta el contenido`
            );
          if (typeof q.order !== "number")
            errors.push(
              `Unidad ${unitIndex + 1}, Pregunta ${qIndex + 1}: order debe ser un número`
            );

          // Validar respuestas según el tipo de pregunta
          if (q.type === "MULTIPLE_CHOICE" || q.type === "TRUE_FALSE") {
            if (!Array.isArray(q.answers) || q.answers.length === 0) {
              errors.push(
                `Unidad ${unitIndex + 1}, Pregunta ${qIndex + 1}: Debe tener respuestas`
              );
            } else {
              q.answers.forEach((answer: any, aIndex: number) => {
                if (!answer.text)
                  errors.push(
                    `Unidad ${unitIndex + 1}, Pregunta ${qIndex + 1}, Respuesta ${aIndex + 1}: Falta el texto`
                  );
                if (typeof answer.isCorrect !== "boolean")
                  errors.push(
                    `Unidad ${unitIndex + 1}, Pregunta ${qIndex + 1}, Respuesta ${aIndex + 1}: isCorrect debe ser booleano`
                  );
              });
            }
          }
        });
      }
    });

    return errors;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/json") {
      setFile(selectedFile);
      setResult(null);
      setValidationErrors([]);

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          setJsonData(json);
          const errors = validateJSON(json);
          setValidationErrors(errors);
        } catch (error: any) {
          setValidationErrors(["Error al parsear JSON: " + error.message]);
          setJsonData(null);
        }
      };
      reader.readAsText(selectedFile);
    } else {
      alert("Por favor selecciona un archivo JSON válido");
      if (e.target) e.target.value = "";
    }
  };

  const handleUpload = async () => {
    if (!jsonData || validationErrors.length > 0) {
      return;
    }

    setUploading(true);
    setResult(null);

    try {
      const response = await fetch("/api/admin/upload-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(jsonData)
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: "Contenido subido exitosamente",
          stats: data.stats
        });
        setFile(null);
        setJsonData(null);
        const fileInput = document.getElementById(
          "file-input"
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        setResult({
          success: false,
          message: data.error || "Error al subir el contenido",
          details: data.details
        });
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: "Error de conexión: " + error.message
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAll = async () => {
    if (
      !confirm(
        "¿Estás seguro de que quieres eliminar TODO el contenido? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    setDeleting(true);
    setResult(null);

    try {
      const response = await fetch("/api/admin/upload-content", {
        method: "DELETE"
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: "Todo el contenido ha sido eliminado"
        });
      } else {
        setResult({
          success: false,
          message: data.error || "Error al eliminar el contenido"
        });
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: "Error de conexión: " + error.message
      });
    } finally {
      setDeleting(false);
    }
  };

  const downloadExampleJSON = () => {
    const example = [
      {
        name: "Unidad de Ejemplo",
        description: "Esta es una unidad de ejemplo",
        order: 1,
        experiencePoints: 25,
        lessons: [
          {
            name: "Lección de Ejemplo",
            description: "Esta es una lección de ejemplo",
            position: 1
          }
        ],
        questions: [
          {
            type: "MULTIPLE_CHOICE",
            title: "¿Cuál es el resultado de 5 + 4?",
            order: 1,
            content: {
              options: ["7", "8", "9", "10"],
              correctAnswer: "9",
              explanation: "La suma de 5 + 4 = 9"
            },
            answers: [
              { text: "7", isCorrect: false, order: 1 },
              { text: "8", isCorrect: false, order: 2 },
              { text: "9", isCorrect: true, order: 3 },
              { text: "10", isCorrect: false, order: 4 }
            ]
          },
          {
            type: "TRUE_FALSE",
            title: "¿5 + 5 es igual a 10?",
            order: 2,
            content: {
              correctAnswer: true,
              explanation: "Efectivamente, 5 + 5 = 10"
            },
            answers: [
              { text: "Verdadero", isCorrect: true, order: 1 },
              { text: "Falso", isCorrect: false, order: 2 }
            ]
          },
          {
            type: "FILL_IN_BLANK",
            title: "Completa: 12 + ___ = 20",
            order: 3,
            content: {
              sentence: "12 + ___ = 20",
              correctAnswer: "8",
              explanation: "Para que 12 + algo = 20, necesitamos 8"
            },
            answers: [{ text: "8", isCorrect: true, order: 1 }]
          }
        ]
      }
    ];

    const blob = new Blob([JSON.stringify(example, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ejemplo-contenido.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStats = () => {
    if (!jsonData) return null;

    const units = jsonData.length;
    const lessons = jsonData.reduce(
      (acc: number, u: any) => acc + (u.lessons?.length || 0),
      0
    );
    const questions = jsonData.reduce(
      (acc: number, u: any) => acc + (u.questions?.length || 0),
      0
    );

    return { units, lessons, questions };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card className="rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FileJson className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold">
                  Gestión de Contenido Educativo
                </h1>
                <p className="text-muted-foreground">
                  Sube archivos JSON con unidades, lecciones y preguntas
                </p>
              </div>
            </div>
            <button
              onClick={downloadExampleJSON}
              className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Descargar Ejemplo
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Seleccionar archivo JSON
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <input
                id="file-input"
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="file-input"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="w-12 h-12 text-gray-400 mb-3" />
                <span className="text-sm font-medium text-muted-foreground">
                  {file ? file.name : "Haz clic para seleccionar un archivo"}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  JSON únicamente
                </span>
              </label>
            </div>
          </div>

          {stats && validationErrors.length === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">
                Resumen del contenido
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.units}
                  </div>
                  <div className="text-sm text-blue-700">Unidades</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.lessons}
                  </div>
                  <div className="text-sm text-blue-700">Lecciones</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.questions}
                  </div>
                  <div className="text-sm text-blue-700">Preguntas</div>
                </div>
              </div>
            </div>
          )}

          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 mb-2">
                    Errores de validación
                  </h3>
                  <ul className="space-y-1 text-sm text-red-700 max-h-60 overflow-y-auto">
                    {validationErrors.map((error, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-red-500">•</span>
                        <span>{error}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div
              className={`border rounded-lg p-4 mb-6 ${
                result.success
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-start gap-2">
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3
                    className={`font-semibold mb-1 ${
                      result.success ? "text-green-900" : "text-red-900"
                    }`}
                  >
                    {result.success ? "¡Éxito!" : "Error"}
                  </h3>
                  <p
                    className={`text-sm ${
                      result.success ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {result.message}
                  </p>
                  {result.stats && (
                    <div className="mt-2 text-sm text-green-700">
                      Creados: {result.stats.units} unidades,{" "}
                      {result.stats.lessons} lecciones, {result.stats.questions}{" "}
                      preguntas
                    </div>
                  )}
                  {result.details && Array.isArray(result.details) && (
                    <div className="mt-2">
                      <ul className="text-sm text-red-700 space-y-1">
                        {result.details
                          .slice(0, 5)
                          .map((detail: any, idx: number) => (
                            <li key={idx}>
                              • {detail.path}: {detail.message}
                            </li>
                          ))}
                        {result.details.length > 5 && (
                          <li className="text-red-600">
                            ... y {result.details.length - 5} errores más
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleUpload}
              disabled={!jsonData || validationErrors.length > 0 || uploading}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                !jsonData || validationErrors.length > 0 || uploading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Subiendo contenido...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Subir contenido
                </>
              )}
            </button>

            <button
              onClick={handleDeleteAll}
              disabled={deleting}
              className={`py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                deleting
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              {deleting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  Eliminar Todo
                </>
              )}
            </button>
          </div>

          <div className="mt-6 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 text-sm">
              Tipos de preguntas soportados:
            </h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>
                <strong>MULTIPLE_CHOICE:</strong> Pregunta con múltiples
                opciones
              </li>
              <li>
                <strong>FILL_IN_BLANK:</strong> Completar el espacio en blanco
              </li>
              <li>
                <strong>TRUE_FALSE:</strong> Verdadero o Falso
              </li>
              <li>
                <strong>ORDER_WORDS:</strong> Ordenar palabras en la secuencia
                correcta
              </li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
