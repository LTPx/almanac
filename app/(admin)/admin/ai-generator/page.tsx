"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Upload,
  Loader2,
  Download,
  RefreshCw,
  BookOpen
} from "lucide-react";
import { Card } from "@/components/ui/card";
import JSONEditor from "@/components/admin/JSONEditor";
import ValidationErrors from "@/components/admin/ValidationErrors";
import JSONStats from "@/components/admin/JSONStats";
import ResultMessage from "@/components/admin/ResultMessage";
import { useJSONValidation } from "@/hooks/useJSONValidation";
import curriculum from "@/lib/curriculum.json";

interface GenerationParams {
  track: string;
  phase: string;
  unit: string;
  topic: string;
  model: string;
}

export default function AIGeneratorPage() {
  const [params, setParams] = useState<GenerationParams>({
    track: "",
    phase: "",
    unit: "",
    topic: "",
    model: "gpt-4o"
  });
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [generationMetadata, setGenerationMetadata] = useState<any>(null);

  const {
    jsonData,
    jsonText,
    validationErrors,
    handleJSONChange,
    setJSON,
    resetJSON,
    getStats,
    isValid
  } = useJSONValidation();

  const stats = getStats();

  const handleGenerate = async () => {
    if (!params.track || !params.phase || !params.unit || !params.topic) {
      alert("Por favor completa todos los campos");
      return;
    }

    setGenerating(true);
    setResult(null);
    resetJSON();

    try {
      const response = await fetch("/api/admin/ai-content-generator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(params)
      });

      const data = await response.json();

      if (response.ok) {
        setJSON(data.content);
        setGenerationMetadata(data.metadata);
        setResult({
          success: true,
          message: "Contenido generado exitosamente con IA"
        });
      } else {
        setResult({
          success: false,
          message: data.error || "Error al generar contenido",
          details: data.details
        });
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: "Error de conexión: " + error.message
      });
    } finally {
      setGenerating(false);
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
          message: "Contenido subido exitosamente a la base de datos",
          stats: data.stats
        });
        resetJSON();
        setGenerationMetadata(null);
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

  const downloadJSON = () => {
    if (!jsonData) return;

    const blob = new Blob([jsonText], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${params.unit.toLowerCase().replace(/\s+/g, "-")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadFromCurriculum = (item: any) => {
    setParams({
      track: item.track,
      phase: item.phase,
      unit: item.unit,
      topic: item.topic,
      model: params.model
    });
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <Card className="rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <div>
              <h1 className="text-2xl font-bold">
                Generador de Contenido con IA
              </h1>
              <p className="text-muted-foreground">
                Genera contenido educativo usando inteligencia artificial
              </p>
            </div>
          </div>

          {/* Parameters Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Track</label>
              <input
                type="text"
                value={params.track}
                onChange={(e) => setParams({ ...params, track: e.target.value })}
                placeholder="e.g., Foundations, Physics, Biology"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phase</label>
              <input
                type="text"
                value={params.phase}
                onChange={(e) => setParams({ ...params, phase: e.target.value })}
                placeholder="e.g., Phase 1, Phase 2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Unit Name</label>
              <input
                type="text"
                value={params.unit}
                onChange={(e) => setParams({ ...params, unit: e.target.value })}
                placeholder="e.g., Introduction to Causality"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Topic / Concept Focus
              </label>
              <input
                type="text"
                value={params.topic}
                onChange={(e) => setParams({ ...params, topic: e.target.value })}
                placeholder="e.g., What is Causality?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                AI Model
              </label>
              <select
                value={params.model}
                onChange={(e) => setParams({ ...params, model: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="gpt-4o">GPT-4o (Recommended)</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                <option value="gpt-4">GPT-4</option>
              </select>
            </div>
          </div>

          {/* Quick Load from Curriculum */}
          <div className="mb-6">
            <details className="border border-gray-300 rounded-lg p-4">
              <summary className="cursor-pointer font-medium flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Cargar desde Curriculum (Quick Select)
              </summary>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {curriculum.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => loadFromCurriculum(item)}
                    className="text-left px-3 py-2 border border-gray-200 rounded hover:bg-purple-50 hover:border-purple-300 transition-colors"
                  >
                    <div className="font-medium text-sm">{item.unit}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.track} - {item.phase}
                    </div>
                  </button>
                ))}
              </div>
            </details>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={generating}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 mb-6 ${
              generating
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-purple-600 text-white hover:bg-purple-700"
            }`}
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generando contenido con IA...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generar Contenido
              </>
            )}
          </button>

          {/* Metadata */}
          {generationMetadata && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-purple-900 mb-2">
                Información de Generación
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-purple-700">Modelo:</span>{" "}
                  <span className="font-medium">{generationMetadata.model}</span>
                </div>
                <div>
                  <span className="text-purple-700">Tokens:</span>{" "}
                  <span className="font-medium">
                    {generationMetadata.tokensUsed}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-purple-700">Topic:</span>{" "}
                  <span className="font-medium">{generationMetadata.topic}</span>
                </div>
              </div>
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

          {/* JSON Editor */}
          {jsonText && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">
                  JSON Generado (Editable)
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={downloadJSON}
                    className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    Descargar JSON
                  </button>
                  <button
                    onClick={resetJSON}
                    className="text-xs text-gray-600 hover:text-gray-700 font-medium flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Limpiar
                  </button>
                </div>
              </div>
              <JSONEditor value={jsonText} onChange={handleJSONChange} />
            </div>
          )}

          {/* Upload Button */}
          {jsonData && (
            <button
              onClick={handleUpload}
              disabled={!isValid || uploading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                !isValid || uploading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Subiendo a la base de datos...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Subir a la Base de Datos
                </>
              )}
            </button>
          )}

          {/* Info Box */}
          <div className="mt-6 p-4 rounded-lg bg-gray-50">
            <h3 className="font-semibold mb-2 text-sm">Cómo usar:</h3>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Completa los parámetros (Track, Phase, Unit, Topic)</li>
              <li>Haz clic en "Generar Contenido" para usar IA</li>
              <li>Revisa y edita el JSON generado si es necesario</li>
              <li>Una vez validado, haz clic en "Subir a la Base de Datos"</li>
            </ol>
          </div>
        </Card>
      </div>
    </div>
  );
}
