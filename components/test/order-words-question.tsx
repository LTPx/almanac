"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { motion } from "framer-motion";

interface Props {
  question: any;
  selected: string;
  setSelected: (val: string) => void;
  hasAnswered: boolean;
  showResult: boolean;
  isCorrect: boolean;
}

export function OrderWordsQuestion({
  question,
  // selected,
  setSelected,
  hasAnswered,
  showResult,
  isCorrect
}: Props) {
  const totalSlots = question.content.words.length;

  const [slots, setSlots] = useState<(string | null)[]>(
    Array(totalSlots).fill(null)
  );

  const [availableWords, setAvailableWords] = useState<string[]>([
    ...question.content.words
  ]);

  // Reset cuando cambia la pregunta
  useEffect(() => {
    setSlots(Array(totalSlots).fill(null));
    setAvailableWords([...question.content.words]);
  }, [question.content.words, totalSlots]);

  // Pasamos lo que arma el usuario como "selected"
  useEffect(() => {
    setSelected(JSON.stringify(slots));
  }, [slots, setSelected]);

  const handleOnDragEnd = (result: any) => {
    if (!result.destination || hasAnswered) return;

    const { source, destination } = result;

    if (
      source.droppableId === "available" &&
      destination.droppableId === "available"
    ) {
      const newAvailable = Array.from(availableWords);
      const [moved] = newAvailable.splice(source.index, 1);
      newAvailable.splice(destination.index, 0, moved);
      setAvailableWords(newAvailable);
    }

    if (
      source.droppableId === "available" &&
      destination.droppableId.startsWith("slot")
    ) {
      const newAvailable = Array.from(availableWords);
      const [moved] = newAvailable.splice(source.index, 1);
      const slotIndex = parseInt(destination.droppableId.split("-")[1]);
      const newSlots = Array.from(slots);

      if (newSlots[slotIndex]) newAvailable.push(newSlots[slotIndex]!);
      newSlots[slotIndex] = moved;
      setSlots(newSlots);
      setAvailableWords(newAvailable);
    }

    if (
      source.droppableId.startsWith("slot") &&
      destination.droppableId === "available"
    ) {
      const slotIndex = parseInt(source.droppableId.split("-")[1]);
      const newSlots = Array.from(slots);
      const newAvailable = Array.from(availableWords);
      if (newSlots[slotIndex]) {
        newAvailable.splice(destination.index, 0, newSlots[slotIndex]!);
        newSlots[slotIndex] = null;
      }
      setSlots(newSlots);
      setAvailableWords(newAvailable);
    }

    if (
      source.droppableId.startsWith("slot") &&
      destination.droppableId.startsWith("slot")
    ) {
      const sourceIndex = parseInt(source.droppableId.split("-")[1]);
      const destIndex = parseInt(destination.droppableId.split("-")[1]);
      const newSlots = Array.from(slots);
      [newSlots[sourceIndex], newSlots[destIndex]] = [
        newSlots[destIndex],
        newSlots[sourceIndex]
      ];
      setSlots(newSlots);
    }
  };

  const slotFeedback =
    showResult && isCorrect
      ? "bg-[#32C781] border-[#32C781] text-white"
      : showResult && !isCorrect
        ? "bg-red-500 border-red-500 text-white"
        : "border-b-2 border-white";

  return (
    <div className="space-y-6">
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <motion.div
          animate={
            showResult && !isCorrect ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}
          }
          transition={{ duration: 0.4 }}
          className="flex gap-2 flex-wrap mb-8"
        >
          {slots.map((word, index) => (
            <Droppable droppableId={`slot-${index}`} key={`slot-${index}`}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`
                    min-w-[90px] min-h-[50px] flex items-center justify-center rounded-lg transition-all
                    ${slotFeedback}
                    ${snapshot.isDraggingOver ? "border-blue-400 bg-blue-500/10" : ""}
                  `}
                >
                  {word && (
                    <Draggable
                      draggableId={`slot-${index}-${word}`}
                      index={0}
                      isDragDisabled={hasAnswered}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`
                            px-3 py-2 rounded-2xl text-white select-none font-medium shadow-md
                            ${snapshot.isDragging ? "scale-110 shadow-lg" : ""}
                          `}
                        >
                          {word}
                        </div>
                      )}
                    </Draggable>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </motion.div>

        <Droppable droppableId="available" direction="horizontal">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`
                flex flex-wrap gap-2 p-4 border-2 rounded-2xl min-h-[80px]
                ${snapshot.isDraggingOver ? "" : ""}
              `}
            >
              {availableWords.map((word, index) => (
                <Draggable
                  draggableId={`available-${word}-${index}`}
                  index={index}
                  key={`available-${word}-${index}`}
                  isDragDisabled={hasAnswered}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`
                        px-3 py-2 rounded-2xl text-white select-none font-medium shadow-md
                        ${snapshot.isDragging ? "scale-110 shadow-lg" : ""}
                      `}
                    >
                      {word}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
