"use client";

import OrderLearningPath from "@/components/admin/order-learning-path";
import { Lesson } from "@/lib/types";
import { useEffect, useState, useCallback } from "react";

type LoadingState = "loading" | "success" | "error" | "empty";

export default function UnitPage(nextParams: { params: { id: string } }) {
  const {
    params: { id }
  } = nextParams;

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonPositions, setLessonPositions] = useState<
    { lessonId: number; position: number }[]
  >([]);
  const [loadingState, setLoadingState] = useState<LoadingState>("loading");
  const [error, setError] = useState<string | null>(null);

  const fetchLessons = useCallback(async () => {
    setLoadingState("loading");
    setError(null);

    try {
      const [lessonsRes, positionsRes] = await Promise.all([
        fetch(`/api/units/${id}/lessons`),
        fetch(`/api/units/${id}/lessons/positions`)
      ]);

      if (!lessonsRes.ok || !positionsRes.ok) {
        throw new Error(
          `Error en la API: ${lessonsRes.status} / ${positionsRes.status}`
        );
      }

      const [lessonsData, positionsData] = await Promise.all([
        lessonsRes.json() as Promise<Lesson[]>,
        positionsRes.json() as Promise<{ lessonId: number; position: number }[]>
      ]);

      setLessons(lessonsData);
      setLessonPositions(positionsData);

      setLoadingState(lessonsData.length === 0 ? "empty" : "success");
    } catch (error) {
      console.error("Error fetching lessons:", error);
      setError(error instanceof Error ? error.message : "Error desconocido");
      setLessons([]);
      setLessonPositions([]);
      setLoadingState("error");
    }
  }, [id]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  const renderContent = () => {
    switch (loadingState) {
      case "loading":
        return (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <p className="text-muted-foreground font-medium">
                Cargando lecciones...
              </p>
            </div>
          </div>
        );

      case "error":
        return (
          <div className="flex items-center justify-center py-12">
            <div className="max-w-md text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-destructive/20 rounded-full flex items-center justify-center">
                <span className="text-destructive text-2xl">⚠️</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Error al cargar las lecciones
              </h3>
              <p className="text-muted-foreground mb-4">
                {error || "Ocurrió un error inesperado"}
              </p>
              <button
                onClick={fetchLessons}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200 font-medium"
              >
                Intentar nuevamente
              </button>
            </div>
          </div>
        );

      case "empty":
        return (
          <div className="flex items-center justify-center py-12">
            <div className="max-w-md text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted/20 rounded-full flex items-center justify-center">
                <span className="text-muted-foreground text-2xl">📚</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No hay lecciones disponibles
              </h3>
              <p className="text-muted-foreground mb-4">
                Esta unidad no tiene lecciones configuradas todavía.
              </p>
              <button
                onClick={fetchLessons}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200 font-medium"
              >
                Actualizar
              </button>
            </div>
          </div>
        );

      case "success":
        return (
          <OrderLearningPath
            lessons={lessons as any}
            unitId={Number(id)}
            initialPositions={lessonPositions}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold text-foreground">Unidad {id}</h1>
            {loadingState === "success" && (
              <span className="px-3 py-1 bg-primary/20 text-primary-foreground text-sm font-medium rounded-full">
                {lessons.length} lección{lessons.length !== 1 ? "es" : ""}
              </span>
            )}
          </div>
          <p className="text-muted-foreground">
            Organiza las lecciones arrastrándolas desde el panel lateral hacia
            el grid de posiciones.
          </p>
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
