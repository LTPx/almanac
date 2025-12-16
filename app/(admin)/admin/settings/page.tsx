"use client";

import React, { useState } from "react";
import {
  Upload,
  Loader2,
  Trash2,
  Download,
  Edit,
  FileUp,
  FileJson
} from "lucide-react";
import { Card } from "@/components/ui/card";
import JSONEditor from "@/components/admin/JSONEditor";
import ValidationErrors from "@/components/admin/ValidationErrors";
import JSONStats from "@/components/admin/JSONStats";
import ResultMessage from "@/components/admin/ResultMessage";
import { useJSONValidation } from "@/hooks/useJSONValidation";

export default function ImportContentPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [editorMode, setEditorMode] = useState<"upload" | "editor">("upload");

  const {
    jsonData,
    jsonText,
    validationErrors,
    handleJSONChange,
    resetJSON,
    getStats,
    isValid
  } = useJSONValidation();

  const stats = getStats();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/json") {
      setFile(selectedFile);
      setResult(null);

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          handleJSONChange(text);
        } catch (error: any) {
          setResult({
            success: false,
            message: "Error al leer el archivo: " + error.message
          });
        }
      };
      reader.readAsText(selectedFile);
    } else {
      alert("Por favor selecciona un archivo JSON válido");
      if (e.target) e.target.value = "";
    }
  };

  const handleUpload = async () => {
    if (!jsonData || !isValid) {
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
        resetJSON();
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

  const loadExampleIntoEditor = () => {
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
          }
        ]
      }
    ];

    const jsonString = JSON.stringify(example, null, 2);
    handleJSONChange(jsonString);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        <Card className="rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FileJson className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold">
                  Gestión de Contenido Educativo
                </h1>
                <p className="text-muted-foreground">
                  Sube archivos JSON o edita directamente en el editor
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

          {/* Mode Selector */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setEditorMode("upload")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                editorMode === "upload"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FileUp className="w-4 h-4" />
              Subir Archivo
            </button>
            <button
              onClick={() => setEditorMode("editor")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                editorMode === "editor"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Edit className="w-4 h-4" />
              Editor JSON
            </button>
          </div>

          {/* Upload Mode */}
          {editorMode === "upload" && (
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
          )}

          {/* Editor Mode */}
          {editorMode === "editor" && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-muted-foreground">
                  Editor JSON
                </label>
                <button
                  onClick={loadExampleIntoEditor}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Cargar ejemplo
                </button>
              </div>
              <JSONEditor value={jsonText} onChange={handleJSONChange} />
            </div>
          )}

          {/* Stats */}
          {stats && validationErrors.length === 0 && (
            <JSONStats
              units={stats.units}
              lessons={stats.lessons}
              questions={stats.questions}
            />
          )}

          {/* Validation Errors */}
          <ValidationErrors errors={validationErrors} />

          {/* Result Message */}
          {result && <ResultMessage {...result} />}

          <div className="flex gap-4">
            <button
              onClick={handleUpload}
              disabled={!jsonData || !isValid || uploading}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                !jsonData || !isValid || uploading
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
