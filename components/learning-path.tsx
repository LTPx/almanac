"use client";

import { useState } from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  DragEndEvent
} from "@dnd-kit/core";

type Unit = { id: string; label: string };

const initialUnits: Unit[] = [
  { id: "u1", label: "Álgebra" },
  { id: "u2", label: "Geometría" },
  { id: "u3", label: "Cálculo" }
];

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

export default function LearningGrid() {
  // Panel lateral: unidades libres
  const [availableUnits, setAvailableUnits] = useState<Unit[]>(initialUnits);

  // Grid: asignaciones celda → unidadId
  const [assignments, setAssignments] = useState<Record<string, string | null>>(
    Object.fromEntries(
      Array.from({ length: 12 * 5 }).map((_, i) => [`cell-${i}`, null])
    )
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const unitId = active.id as string;

    // Caso 1: soltar en panel lateral → devolver unidad
    if (over.id === "panel") {
      setAssignments((prev) => {
        const updated = { ...prev };
        for (const key of Object.keys(updated)) {
          if (updated[key] === unitId) {
            updated[key] = null;
          }
        }
        return updated;
      });

      if (!availableUnits.find((u) => u.id === unitId)) {
        const unit = initialUnits.find((u) => u.id === unitId);
        if (unit) setAvailableUnits((prev) => [...prev, unit]);
      }
      return;
    }

    // Caso 2: soltar en una celda del grid
    if (over.id.toString().startsWith("cell-")) {
      setAssignments((prev) => {
        const updated = { ...prev };

        // Liberar cualquier celda previa de esa unidad
        for (const key of Object.keys(updated)) {
          if (updated[key] === unitId) updated[key] = null;
        }

        // Asignar a la nueva celda
        updated[over.id] = unitId;
        return updated;
      });

      // Sacar del panel si estaba allí
      setAvailableUnits((prev) => prev.filter((u) => u.id !== unitId));
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex gap-6">
        {/* Panel lateral de unidades disponibles */}
        <Droppable id="panel">
          <div className="flex flex-col gap-2">
            {availableUnits.map((u) => (
              <Draggable key={u.id} id={u.id} label={u.label} />
            ))}
          </div>
        </Droppable>

        {/* Grid 12x5 */}
        <div className="grid grid-cols-5 gap-2">
          {Object.keys(assignments).map((cellId) => {
            const unitId = assignments[cellId];
            const unit = initialUnits.find((u) => u.id === unitId);

            return (
              <Droppable key={cellId} id={cellId}>
                {unit && <Draggable id={unit.id} label={unit.label} />}
              </Droppable>
            );
          })}
        </div>
      </div>
    </DndContext>
  );
}
