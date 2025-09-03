"use client"

import { useState } from "react"
import {
  DndContext,
  useDraggable,
  useDroppable,
  DragEndEvent
} from "@dnd-kit/core"

type Unit = { id: string; label: string }

const units: Unit[] = [
  { id: "u1", label: "Álgebra" },
  { id: "u2", label: "Geometría" }
]

// === Draggable ===
function Draggable({ unit }: { unit: Unit }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: unit.id
  })

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
      {unit.label}
    </div>
  )
}

// === Droppable ===
function Droppable({
  id,
  children
}: {
  id: string
  children?: React.ReactNode
}) {
  const { isOver, setNodeRef } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={`w-16 h-16 flex items-center justify-center rounded-lg border-2 text-xs
      ${
        isOver
          ? "border-yellow-400 bg-yellow-100"
          : "border-gray-500 bg-transparent"
      }`}
    >
      {children}
    </div>
  )
}

// === MAIN COMPONENT ===
export default function LearningGrid() {
  // asignaciones: celda → unidad
  const [assignments, setAssignments] = useState<Record<string, string | null>>(
    Object.fromEntries(
      Array.from({ length: 12 * 5 }).map((_, i) => [`cell-${i}`, null])
    )
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over) {
      //@ts-ignore
      setAssignments((prev) => ({
        ...prev,
        [over.id]: active.id
      }))
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex gap-6">
        {/* Panel lateral con unidades */}
        <div className="flex flex-col gap-2">
          {units.map((u) => (
            <Draggable key={u.id} unit={u} />
          ))}
        </div>

        {/* Grid 12x5 */}
        <div className="grid grid-cols-5 gap-2">
          {Object.keys(assignments).map((cellId) => (
            <Droppable key={cellId} id={cellId}>
              {assignments[cellId] && (
                <div className="bg-blue-500 text-white px-2 py-1 rounded">
                  {units.find((u) => u.id === assignments[cellId])?.label}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </div>
    </DndContext>
  )
}
