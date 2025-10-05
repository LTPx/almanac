"use client";

import { useState, useCallback, useMemo } from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  DragEndEvent,
  DragOverlay,
  closestCenter,
  DragStartEvent
} from "@dnd-kit/core";
import React from "react";
import { Lesson } from "@prisma/client";

type LessonGrid = { id: string; lessonId: number; label: string };
type CellId = string;
type LessonId = string;
type Assignments = Record<CellId, LessonId | null>;

const Draggable = React.memo(function Draggable({
  id,
  label,
  isMandatory = false, // <-- nuevo prop
  isDragOverlay = false
}: {
  id: string;
  label: string;
  isMandatory?: boolean;
  isDragOverlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id });

  const bgColor = isMandatory
    ? "bg-green-600 text-white"
    : "bg-[#1983DD] text-white";

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
      className={`px-3 py-2 rounded-lg shadow-md cursor-grab active:cursor-grabbing 
        text-sm font-medium transition-all duration-200 hover:shadow-lg select-none 
        ${bgColor} ${isDragOverlay ? "rotate-3 scale-105" : ""} ${
          isDragging && !isDragOverlay ? "cursor-grabbing" : ""
        }`}
    >
      {label}
    </div>
  );
});

const Droppable = React.memo(function Droppable({
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
          transition-all duration-200 min-h-[400px] max-h-[550px]
          ${isOver ? "border-primary bg-primary/10 shadow-lg" : "border-border bg-background hover:border-primary"}`}
      >
        <div className="text-sm font-medium text-foreground mb-3">
          Lecciones Disponibles
        </div>
        <div className="flex flex-col gap-3 overflow-y-auto max-h-[480px] pr-1">
          {children}
        </div>
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
            ? "border-primary bg-primary/20 shadow-lg scale-105"
            : "border-border bg-card hover:border-primary hover:shadow-md"
        }`}
    >
      {children}
    </div>
  );
});

function HeaderStatus({
  assignedCount,
  availableCount,
  total
}: {
  assignedCount: number;
  availableCount: number;
  total: number;
}) {
  return (
    <div className="flex gap-6 text-sm">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-primary rounded-full"></div>
        <span className="text-foreground">
          Asignadas: <strong>{assignedCount}</strong>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-muted rounded-full"></div>
        <span className="text-foreground">
          Disponibles: <strong>{availableCount}</strong>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
        <span className="text-foreground">
          Total: <strong>{total}</strong>
        </span>
      </div>
    </div>
  );
}

function useAssignments(
  initialLessons: LessonGrid[],
  initialPositions: { lessonId: number; position: number }[]
) {
  const [assignments, setAssignments] = useState<Assignments>(() => {
    const grid: Assignments = Object.fromEntries(
      Array.from({ length: 12 * 5 }).map((_, i) => [`cell-${i}`, null])
    );
    initialPositions.forEach((pos) => {
      grid[`cell-${pos.position}`] = `lesson-${pos.lessonId}`;
    });
    return grid;
  });

  const [availableLessons, setAvailableLessons] = useState<LessonGrid[]>(() => {
    const assignedIds = initialPositions.map((p) => `lesson-${p.lessonId}`);
    return initialLessons.filter((l) => !assignedIds.includes(l.id));
  });

  const moveLesson = useCallback(
    (lessonKey: string, overId: string) => {
      setAssignments((prev) => {
        const updated = { ...prev };
        const sourceCell = Object.keys(updated).find(
          (k) => updated[k] === lessonKey
        );

        if (overId === "panel") {
          if (sourceCell) updated[sourceCell] = null;
          return updated;
        }

        const targetLesson = updated[overId];
        if (sourceCell) updated[sourceCell] = targetLesson ?? null;
        updated[overId] = lessonKey;

        return updated;
      });

      if (overId === "panel") {
        const lesson = initialLessons.find((l) => l.id === lessonKey);
        if (lesson && !availableLessons.find((l) => l.id === lessonKey)) {
          setAvailableLessons((prev) => [...prev, lesson]);
        }
      } else {
        setAvailableLessons((prev) => prev.filter((l) => l.id !== lessonKey));
      }
    },
    [availableLessons, initialLessons]
  );

  const clearAll = useCallback(() => {
    const allAssignedLessons = Object.values(assignments)
      .filter(Boolean)
      .map((lessonKey) => initialLessons.find((l) => l.id === lessonKey))
      .filter(Boolean) as LessonGrid[];

    setAvailableLessons((prev) => [...prev, ...allAssignedLessons]);
    setAssignments((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((key) => (updated[key] = null));
      return updated;
    });
  }, [assignments, initialLessons]);

  return {
    assignments,
    availableLessons,
    moveLesson,
    clearAll,
    setAssignments
  };
}

function useSavePath(
  assignments: Assignments,
  initialLessons: LessonGrid[],
  unitId: number
) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setSaveStatus("idle");

    try {
      const payload = Object.entries(assignments)
        .filter(([, lessonKey]) => lessonKey !== null)
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

      if (!res.ok) throw new Error("Error en la respuesta del servidor");

      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      console.error(error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 5000);
    } finally {
      setIsSaving(false);
    }
  }, [assignments, initialLessons, unitId]);

  return { isSaving, saveStatus, handleSave };
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
  const initialLessons: LessonGrid[] = useMemo(
    () =>
      lessons.map((l) => ({
        id: `lesson-${l.id}`,
        lessonId: l.id,
        label: l.name
      })),
    [lessons]
  );

  const { assignments, availableLessons, moveLesson, clearAll } =
    useAssignments(initialLessons, initialPositions);
  const { isSaving, saveStatus, handleSave } = useSavePath(
    assignments,
    initialLessons,
    unitId
  );

  const [activeId, setActiveId] = useState<string | null>(null);

  const lessonMap = useMemo(
    () => new Map(initialLessons.map((l) => [l.id, l])),
    [initialLessons]
  );
  const draggedLesson = activeId ? lessonMap.get(activeId) : null;

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over) return;
      moveLesson(String(active.id), String(over.id));
    },
    [moveLesson]
  );

  const assignedCount = Object.values(assignments).filter(Boolean).length;

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCenter}
    >
      <div className="flex flex-col gap-6">
        {/* Header Status */}
        <div className="flex items-center justify-between bg-background p-4 rounded-xl border border-border">
          <HeaderStatus
            assignedCount={assignedCount}
            availableCount={availableLessons.length}
            total={lessons.length}
          />
          <button
            onClick={clearAll}
            disabled={assignedCount === 0}
            className="cursor-pointer px-4 py-2 text-sm font-medium text-foreground border rounded-lg 
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200 flex items-center gap-2"
          >
            Limpiar Todo
          </button>
        </div>

        {/* Panel lateral y grid */}
        <div className="flex gap-6 h-full">
          <div className="sticky top-20 self-start">
            <Droppable id="panel" isPanel>
              {availableLessons.length === 0 && (
                <div
                  className="text-sm text-muted-foreground text-center py-8 px-4 border-2 border-dashed 
                   rounded-lg"
                >
                  <div className="mb-2">📚</div>
                  Todas las lecciones están asignadas
                </div>
              )}
              {availableLessons.map((u) => {
                const lessonData = lessons.find((l) => l.id === u.lessonId);
                return (
                  <Draggable
                    key={u.id}
                    id={u.id}
                    label={u.label}
                    isMandatory={lessonData?.mandatory}
                  />
                );
              })}
            </Droppable>
          </div>

          <div className="flex-1 pb-[50px]">
            <div className="grid grid-cols-5 gap-3 p-4 bg-background rounded-xl border border-border">
              {Object.keys(assignments).map((cellId, index) => {
                const lessonKey = assignments[cellId];
                const lesson = lessonMap.get(lessonKey!);

                return (
                  <div key={cellId} className="relative">
                    <div
                      className="absolute -top-2 -left-2 w-5 h-5 bg-muted text-foreground 
                        text-xs rounded-full flex items-center justify-center font-medium z-10"
                    >
                      {index}
                    </div>
                    <Droppable id={cellId}>
                      {lesson && (
                        <Draggable
                          id={lesson.id}
                          label={lesson.label}
                          isMandatory={
                            lessons.find((l) => l.id === lesson.lessonId)
                              ?.mandatory
                          }
                        />
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Save Button */}
      <div className="fixed bottom-0 left-0 w-full bg-black/10 backdrop-blur-sm z-10 border-t border-border shadow-md">
        <div className="max-w-7xl mx-auto flex justify-end px-6 py-4">
          <button
            onClick={handleSave}
            disabled={isSaving || assignedCount === 0}
            className={`px-6 py-3 rounded-xl shadow-md font-medium transition-all duration-200
              ${
                isSaving || assignedCount === 0
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg"
              }`}
          >
            {isSaving ? "Guardando..." : "Guardar Path"}
          </button>
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {draggedLesson && (
          <Draggable
            id={draggedLesson.id}
            label={draggedLesson.label}
            isDragOverlay
            isMandatory={
              lessons.find((l) => l.id === draggedLesson.lessonId)?.mandatory
            }
          />
        )}
      </DragOverlay>

      {/* Save notifications */}
      {["success", "error"].map((status) => (
        <div
          key={status}
          className={`fixed bottom-5 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500
            ${saveStatus === status ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
        >
          <div
            className={`${
              status === "success" ? "bg-green-600" : "bg-red-600"
            } text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2`}
          >
            <span className="font-medium">
              {status === "success"
                ? "✓ Path guardado correctamente"
                : "✕ Error al guardar el path"}
            </span>
          </div>
        </div>
      ))}
    </DndContext>
  );
}
