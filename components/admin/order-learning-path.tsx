"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  DragEndEvent,
  DragOverlay,
  closestCenter
} from "@dnd-kit/core";
import { Lesson } from "@prisma/client";

type LessonGrid = { id: string; lessonId: number; label: string };

// === Draggable ===
function Draggable({
  id,
  label,
  isDragOverlay = false
}: {
  id: string;
  label: string;
  isDragOverlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id });
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    title: string;
    description?: string;
  } | null>(null);

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: transform
          ? `translate(${transform.x}px, ${transform.y}px)`
          : undefined,
        opacity: isDragging && !isDragOverlay ? 0.5 : 1
      }}
      className={`px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 
        text-white rounded-lg shadow-md cursor-grab active:cursor-grabbing 
        text-sm font-medium transition-all duration-200 hover:shadow-lg 
        hover:from-green-600 hover:to-green-700 select-none
        ${isDragOverlay ? "rotate-3 scale-105" : ""}
        ${isDragging && !isDragOverlay ? "cursor-grabbing" : ""}`}
    >
      {label}
    </div>
  );
}

// === Droppable ===
function Droppable({
  id,
  children,
  isPanel = false
}: {
  id: string;
  children?: React.ReactNode;
  isPanel?: boolean;
}) {
  const { isOver, setNodeRef } = useDroppable({ id });

  if (isPanel) {
    return (
      <div
        ref={setNodeRef}
        className={`min-w-[200px] p-4 rounded-xl border-2 border-dashed
          transition-all duration-200 min-h-[400px]
          ${
            isOver
              ? "border-blue-400 bg-blue-50 shadow-lg"
              : "border-gray-300 bg-gray-50 hover:border-gray-400"
          }`}
      >
        <div className="text-sm font-medium text-gray-700 mb-3">
          Lecciones Disponibles
        </div>
        <div className="flex flex-col gap-3">{children}</div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      className={`w-20 h-20 flex items-center justify-center rounded-xl 
        border-2 text-xs transition-all duration-200
        ${
          isOver
            ? "border-blue-400 bg-blue-100 shadow-lg scale-105"
            : "border-gray-300 bg-white hover:border-gray-400 hover:shadow-md"
        }`}
    >
      {children}
    </div>
  );
}

export default function OrderLearningPath({
  lessons,
  unitId,
  initialPositions = []
}: {
  lessons: Lesson[];
  unitId: number;
  initialPositions?: { lessonId: number; position: number }[];
}) {
  // Estados
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [activeId, setActiveId] = useState<string | null>(null);

  // Mapear lecciones a formato Drag & Drop
  const initialLessons: LessonGrid[] = lessons.map((lesson) => ({
    id: `lesson-${lesson.id}`,
    lessonId: lesson.id,
    label: lesson.name
  }));

  // Filtrar lecciones ya asignadas
  const [availableLessons, setAvailableLessons] = useState<LessonGrid[]>(() => {
    const assignedIds = initialPositions.map((p) => `lesson-${p.lessonId}`);
    return initialLessons.filter((l) => !assignedIds.includes(l.id));
  });

  // Inicializar grid con posiciones previas
  const [assignments, setAssignments] = useState<Record<string, string | null>>(
    () => {
      const grid: Record<string, string | null> = Object.fromEntries(
        Array.from({ length: 12 * 5 }).map((_, i) => [`cell-${i}`, null])
      );

      initialPositions.forEach((pos) => {
        const lessonKey = `lesson-${pos.lessonId}`;
        grid[`cell-${pos.position}`] = lessonKey;
      });

      return grid;
    }
  );

  // Manejar inicio del drag
  const handleDragStart = useCallback((event: { active: { id: string } }) => {
    setActiveId(event.active.id);
  }, []);

  // Manejar fin del drag
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over) return;

      const lessonKey = active.id as string;

      // Soltar en panel lateral
      if (over.id === "panel") {
        setAssignments((prev) => {
          const updated = { ...prev };
          for (const key of Object.keys(updated)) {
            if (updated[key] === lessonKey) updated[key] = null;
          }
          return updated;
        });

        if (!availableLessons.find((u) => u.id === lessonKey)) {
          const lesson = initialLessons.find((u) => u.id === lessonKey);
          if (lesson) setAvailableLessons((prev) => [...prev, lesson]);
        }
        return;
      }

      // Soltar en celda
      if (over.id.toString().startsWith("cell-")) {
        setAssignments((prev) => {
          const updated = { ...prev };

          // Si hay una lección en la celda de destino, intercambiarlas
          const existingLessonInTarget = updated[over.id as string];
          const sourceCell = Object.entries(updated).find(
            ([_, value]) => value === lessonKey
          )?.[0];

          if (existingLessonInTarget && sourceCell) {
            // Intercambio
            updated[sourceCell] = existingLessonInTarget;
          } else if (sourceCell) {
            // Mover desde otra celda
            updated[sourceCell] = null;
          }

          // Si había una lección en el destino y venía del panel, regresarla al panel
          if (existingLessonInTarget && !sourceCell) {
            const existingLesson = initialLessons.find(
              (l) => l.id === existingLessonInTarget
            );
            if (existingLesson) {
              setAvailableLessons((prev) => [...prev, existingLesson]);
            }
          }

          updated[over.id as string] = lessonKey;
          return updated;
        });

        setAvailableLessons((prev) => prev.filter((u) => u.id !== lessonKey));
      }
    },
    [availableLessons, initialLessons]
  );

  // Obtener la lección que se está arrastrando
  const draggedLesson = activeId
    ? initialLessons.find((l) => l.id === activeId)
    : null;

  // Guardar path en backend con mejor manejo de errores
  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus("idle");

    try {
      const payload = Object.entries(assignments)
        .filter(([_, lessonKey]) => lessonKey !== null)
        .map(([cellId, lessonKey]) => {
          const position = parseInt(cellId.replace("cell-", ""), 10);
          const lesson = initialLessons.find((l) => l.id === lessonKey);
          return { lessonId: lesson!.lessonId, position };
        });

      const res = await fetch(`/api/units/${unitId}/lessons/sort`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        throw new Error("Error en la respuesta del servidor");
      }
    } catch (error) {
      console.error("Error saving learning path:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  // Limpiar todo el grid
  const handleClearAll = useCallback(() => {
    if (confirm("¿Estás seguro de que quieres limpiar todo el grid?")) {
      const allAssignedLessons = Object.values(assignments)
        .filter(Boolean)
        .map((lessonKey) => initialLessons.find((l) => l.id === lessonKey))
        .filter(Boolean) as LessonGrid[];

      setAvailableLessons((prev) => [...prev, ...allAssignedLessons]);
      setAssignments((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((key) => {
          updated[key] = null;
        });
        return updated;
      });
    }
  }, [assignments, initialLessons]);

  // Contadores para estadísticas
  const assignedCount = Object.values(assignments).filter(Boolean).length;
  const totalLessons = lessons.length;

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCenter}
    >
      <div className="flex flex-col gap-6">
        {/* Header con estadísticas */}
        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-black">
                Asignadas: <strong>{assignedCount}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span className="text-black">
                Disponibles: <strong>{availableLessons.length}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-black">
                Total: <strong>{totalLessons}</strong>
              </span>
            </div>
          </div>

          <button
            onClick={handleClearAll}
            disabled={assignedCount === 0}
            className="px-3 py-1 text-xs text-gray-600 border border-gray-300 
              rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200"
          >
            Limpiar Todo
          </button>
        </div>

        <div className="flex gap-6">
          {/* Panel lateral */}
          <Droppable id="panel" isPanel>
            {availableLessons.length === 0 && (
              <div className="text-xs text-gray-500 text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                Todas las lecciones están asignadas
              </div>
            )}
            {availableLessons.map((u) => (
              <Draggable key={u.id} id={u.id} label={u.label} />
            ))}
          </Droppable>

          <div className="flex-1">
            <div className="grid grid-cols-5 gap-3 p-4 bg-gray-50 rounded-xl">
              {Object.keys(assignments).map((cellId, index) => {
                const lessonKey = assignments[cellId];
                const lesson = initialLessons.find((u) => u.id === lessonKey);

                return (
                  <div key={cellId} className="relative">
                    {/* Número de posición */}
                    <div
                      className="absolute -top-2 -left-2 w-5 h-5 bg-gray-400 text-white 
                      text-xs rounded-full flex items-center justify-center font-medium z-10"
                    >
                      {index}
                    </div>
                    <Droppable id={cellId}>
                      {lesson && (
                        <Draggable id={lesson.id} label={lesson.label} />
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Controles */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={isSaving || assignedCount === 0}
            className={`px-6 py-3 rounded-xl shadow-md font-medium transition-all duration-200
              ${
                isSaving || assignedCount === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-lg"
              }`}
          >
            {isSaving ? "Guardando..." : "Guardar Path"}
          </button>

          {/* Status de guardado */}
          {saveStatus === "success" && (
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              Path guardado correctamente
            </div>
          )}
          {saveStatus === "error" && (
            <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
              <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✕</span>
              </div>
              Error al guardar el path
            </div>
          )}
        </div>
      </div>

      <DragOverlay>
        {draggedLesson ? (
          <Draggable
            id={draggedLesson.id}
            label={draggedLesson.label}
            isDragOverlay
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
