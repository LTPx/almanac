"use client";

import { useState } from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  DragEndEvent
} from "@dnd-kit/core";

import { Lesson } from "@prisma/client";

type LessonGrid = { id: string; lessonId: number; label: string };

// === Draggable ===
function Draggable({ id, label }: { id: string; label: string }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: transform
          ? `translate(${transform.x}px, ${transform.y}px)`
          : undefined
      }}
      className="px-3 py-2 bg-green-500 text-white rounded-lg shadow cursor-pointer text-sm"
    >
      {label}
    </div>
  );
}

// === Droppable ===
function Droppable({
  id,
  children
}: {
  id: string;
  children?: React.ReactNode;
}) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`w-16 h-16 flex items-center justify-center rounded-lg border-2 text-xs
      ${isOver ? "border-yellow-400 bg-yellow-100" : "border-gray-500 bg-transparent"}`}
    >
      {children}
    </div>
  );
}

export default function LearningGrid({
  lessons,
  unitId
}: {
  lessons: Lesson[];
  unitId: number;
}) {
  // usar el ID real de la lección (Prisma)
  const initialLessons: LessonGrid[] = lessons.map((lesson) => ({
    id: `lesson-${lesson.id}`, // ID único para drag & drop
    lessonId: lesson.id,
    label: lesson.name
  }));

  const [availableLessons, setAvailableLessons] =
    useState<LessonGrid[]>(initialLessons);

  const [assignments, setAssignments] = useState<Record<string, string | null>>(
    Object.fromEntries(
      Array.from({ length: 12 * 5 }).map((_, i) => [`cell-${i}`, null])
    )
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const lessonKey = active.id as string;

    // Soltar en panel
    if (over.id === "panel") {
      setAssignments((prev) => {
        const updated = { ...prev };
        for (const key of Object.keys(updated)) {
          if (updated[key] === lessonKey) {
            updated[key] = null;
          }
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

        // liberar celda previa de esa lesson
        for (const key of Object.keys(updated)) {
          if (updated[key] === lessonKey) updated[key] = null;
        }

        updated[over.id] = lessonKey;
        return updated;
      });

      setAvailableLessons((prev) => prev.filter((u) => u.id !== lessonKey));
    }
  };

  // === Guardar path en el backend ===
  const handleSave = async () => {
    // Convertir assignments → arreglo [{lessonId, position}]
    const payload = Object.entries(assignments)
      .filter(([, lessonKey]) => lessonKey !== null)
      .map(([cellId, lessonKey]) => {
        const position = parseInt(cellId.replace("cell-", ""), 10);
        const lesson = initialLessons.find((l) => l.id === lessonKey);
        return { lessonId: lesson!.lessonId, position };
      });

    console.log("payload to save:", payload);

    const res = await fetch(`/api/units/${unitId}/lessons/sort`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      alert("✅ Path guardado correctamente!");
    } else {
      alert("❌ Error al guardar el path");
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-4">
        <div className="flex gap-6">
          {/* Panel lateral */}
          <Droppable id="panel">
            <div className="flex flex-col gap-2">
              {availableLessons.map((u) => (
                <Draggable key={u.id} id={u.id} label={u.label} />
              ))}
            </div>
          </Droppable>

          {/* Grid 12x5 */}
          <div className="grid grid-cols-5 gap-2">
            {Object.keys(assignments).map((cellId) => {
              const lessonKey = assignments[cellId];
              const lesson = initialLessons.find((u) => u.id === lessonKey);

              return (
                <Droppable key={cellId} id={cellId}>
                  {lesson && <Draggable id={lesson.id} label={lesson.label} />}
                </Droppable>
              );
            })}
          </div>
        </div>

        {/* Botón Guardar */}
        <button
          onClick={handleSave}
          className="self-start px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
        >
          Guardar Path
        </button>
      </div>
    </DndContext>
  );
}
