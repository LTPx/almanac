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
import { Unit } from "@/lib/types";

type UnitGrid = { id: string; unitId: number; label: string };
type CellId = string;
type UnitId = string;
type Assignments = Record<CellId, UnitId | null>;

const Draggable = React.memo(function Draggable({
  id,
  label,
  isMandatory = false,
  isDragOverlay = false
}: {
  id: string;
  label: string;
  isMandatory?: boolean;
  isDragOverlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id });
  const [showTooltip, setShowTooltip] = useState(false);
  const textRef = React.useRef<HTMLDivElement>(null);
  const [isTextTruncated, setIsTextTruncated] = useState(false);

  React.useEffect(() => {
    if (textRef.current) {
      const isTruncated =
        textRef.current.scrollHeight > textRef.current.clientHeight;
      setIsTextTruncated(isTruncated);
    }
  }, [label]);

  const bgColor = isMandatory
    ? "bg-green-600 text-white"
    : "bg-[#1983DD] text-white";

  return (
    <div className="relative">
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
        onMouseEnter={() => isTextTruncated && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`px-2.5 py-2 rounded-lg shadow-md cursor-grab active:cursor-grabbing 
          font-medium transition-all duration-200 hover:shadow-lg select-none 
          ${bgColor} ${isDragOverlay ? "rotate-3 scale-105" : ""} ${
            isDragging && !isDragOverlay ? "cursor-grabbing" : ""
          } w-full h-full flex items-center justify-center overflow-hidden`}
      >
        <div
          ref={textRef}
          className="text-xs leading-snug text-center line-clamp-4 w-full break-words"
        >
          {label}
        </div>
      </div>

      {showTooltip && isTextTruncated && !isDragging && (
        <div
          className="absolute z-[100] px-4 py-3 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-xl 
          bottom-full left-1/2 transform -translate-x-1/2 mb-3 whitespace-normal min-w-[180px] max-w-[280px]
          animate-in fade-in slide-in-from-bottom-1 duration-200"
        >
          <div className="text-center leading-relaxed">{label}</div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2">
            <div className="border-[6px] border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
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
        className={`w-[280px] p-4 rounded-xl border-2 border-dashed
          transition-all duration-200 min-h-[400px] max-h-[550px]
          ${isOver ? "border-primary bg-primary/10 shadow-lg" : "border-border bg-background hover:border-primary"}`}
      >
        <div className="text-sm font-medium text-foreground mb-3">
          Unidades Disponibles
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
  initialUnits: UnitGrid[],
  initialPositions: { unitId: number; position: number }[]
) {
  const [assignments, setAssignments] = useState<Assignments>(() => {
    const grid: Assignments = Object.fromEntries(
      Array.from({ length: 12 * 5 }).map((_, i) => [`cell-${i}`, null])
    );
    initialPositions.forEach((pos) => {
      grid[`cell-${pos.position}`] = `lesson-${pos.unitId}`;
    });
    return grid;
  });

  const [availableLessons, setAvailableLessons] = useState<UnitGrid[]>(() => {
    const assignedIds = initialPositions.map((p) => `lesson-${p.unitId}`);
    return initialUnits.filter((l) => !assignedIds.includes(l.id));
  });

  const moveLesson = useCallback(
    (lessonKey: string, overId: string) => {
      const sourceCell = Object.keys(assignments).find(
        (k) => assignments[k] === lessonKey
      );

      setAssignments((prev) => {
        const updated = { ...prev };

        if (overId === "panel") {
          if (sourceCell) updated[sourceCell] = null;
          return updated;
        }

        const targetLesson = updated[overId];

        if (sourceCell) {
          updated[sourceCell] = targetLesson ?? null;
          updated[overId] = lessonKey;
        } else {
          updated[overId] = lessonKey;
        }

        return updated;
      });

      setAvailableLessons((prev) => {
        let newAvailable = [...prev];

        if (overId === "panel") {
          const lesson = initialUnits.find((l) => l.id === lessonKey);
          if (lesson && !newAvailable.find((l) => l.id === lessonKey)) {
            newAvailable.push(lesson);
          }
        } else {
          newAvailable = newAvailable.filter((l) => l.id !== lessonKey);

          if (!sourceCell && assignments[overId]) {
            const targetLesson = assignments[overId];
            const targetLessonObj = initialUnits.find(
              (l) => l.id === targetLesson
            );
            if (
              targetLessonObj &&
              !newAvailable.find((l) => l.id === targetLesson)
            ) {
              newAvailable.push(targetLessonObj);
            }
          }
        }

        return newAvailable;
      });
    },
    [assignments, initialUnits]
  );

  const clearAll = useCallback(() => {
    const allAssignedLessons = Object.values(assignments)
      .filter(Boolean)
      .map((lessonKey) => initialUnits.find((l) => l.id === lessonKey))
      .filter(Boolean) as UnitGrid[];

    setAvailableLessons((prev) => [...prev, ...allAssignedLessons]);
    setAssignments((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((key) => (updated[key] = null));
      return updated;
    });
  }, [assignments, initialUnits]);

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
  initialUnits: UnitGrid[],
  curriculumId: string
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
          const lesson = initialUnits.find((l) => l.id === lessonKey);
          return { unitId: lesson!.unitId, position };
        });

      const res = await fetch(`/api/curriculums/${curriculumId}/units/sort`, {
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
  }, [assignments, initialUnits, curriculumId]);

  return { isSaving, saveStatus, handleSave };
}

export default function OrderLearningPath({
  units,
  curriculumId,
  initialPositions = []
}: {
  units: Unit[];
  curriculumId: string;
  initialPositions?: { unitId: number; position: number }[];
}) {
  const initialUnits: UnitGrid[] = useMemo(
    () =>
      units.map((l) => ({
        id: `lesson-${l.id}`,
        unitId: l.id,
        label: l.name
      })),
    [units]
  );

  const { assignments, availableLessons, moveLesson, clearAll } =
    useAssignments(initialUnits, initialPositions);
  const { isSaving, saveStatus, handleSave } = useSavePath(
    assignments,
    initialUnits,
    curriculumId
  );

  const [activeId, setActiveId] = useState<string | null>(null);

  const lessonMap = useMemo(
    () => new Map(initialUnits.map((l) => [l.id, l])),
    [initialUnits]
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
        <div className="flex items-center justify-between bg-background p-4 rounded-xl border border-border">
          <HeaderStatus
            assignedCount={assignedCount}
            availableCount={availableLessons.length}
            total={units.length}
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
                const unitData = units.find((l) => l.id === u.unitId);
                return (
                  <Draggable
                    key={u.id}
                    id={u.id}
                    label={u.label}
                    isMandatory={unitData?.mandatory}
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
                            units.find((l) => l.id === lesson.unitId)?.mandatory
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

      <DragOverlay>
        {draggedLesson && (
          <Draggable
            id={draggedLesson.id}
            label={draggedLesson.label}
            isDragOverlay
            isMandatory={
              units.find((l) => l.id === draggedLesson.unitId)?.mandatory
            }
          />
        )}
      </DragOverlay>

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
