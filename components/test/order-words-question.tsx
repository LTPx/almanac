"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";

interface Props {
  question: any;
  hasAnswered: boolean;
  setHasAnswered: (val: boolean) => void;
  onAnswer: (questionId: number, answer: string) => void;
}

export function OrderWordsQuestion({
  question,
  hasAnswered,
  setHasAnswered,
  onAnswer
}: Props) {
  const totalSlots = question.content.words.length;

  const [slots, setSlots] = useState<(string | null)[]>(
    Array(totalSlots).fill(null)
  );

  const [availableWords, setAvailableWords] = useState<string[]>([
    ...question.content.words
  ]);

  useEffect(() => {
    setSlots(Array(totalSlots).fill(null));
    setAvailableWords([...question.content.words]);
  }, [question.id]);

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

  const handleSubmit = () => {
    onAnswer(question.id, JSON.stringify(slots));
    setHasAnswered(true);
  };

  return (
    <div className="space-y-6">
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <div className="flex gap-2 flex-wrap mb-8">
          {slots.map((word, index) => (
            <Droppable droppableId={`slot-${index}`} key={`slot-${index}`}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`
                    min-w-[90px] min-h-[50px] border-b-2 border-white flex items-center justify-center
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
                            px-3 py-2 rounded-lg bg-gray-700 text-white select-none font-medium
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
        </div>
        <Droppable droppableId="available" direction="horizontal">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`
                flex flex-wrap gap-2 p-4 border-2 rounded-lg min-h-[80px]
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
                        px-3 py-2 rounded-lg bg-gray-700 text-white select-none font-medium
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

      {!hasAnswered && (
        <Button
          onClick={handleSubmit}
          disabled={slots.some((s) => !s)}
          className="mt-6 w-full bg-[#1F941C] hover:bg-[#187515] text-white py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Check Answer →
        </Button>
      )}
    </div>
  );
}
