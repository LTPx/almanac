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
  setSelected,
  hasAnswered,
  showResult,
  isCorrect
}: Props) {
  const totalSlots = question.content.correctOrder.length;

  const [slots, setSlots] = useState<(string | null)[]>(
    Array(totalSlots).fill(null)
  );

  const [availableWords, setAvailableWords] = useState<string[]>([
    ...question.content.words
  ]);

  useEffect(() => {
    setSlots(Array(totalSlots).fill(null));
    setAvailableWords([...question.content.words]);
  }, [question.content.words, totalSlots]);

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

  const shouldShowCorrect = showResult && isCorrect;
  const shouldShowIncorrect = showResult && !isCorrect;

  // const slotStyles = shouldShowCorrect
  //   ? "bg-[#1A1A1A] border-[#32C781] shadow-[0_0_20px_rgba(50,199,129,0.4)]"
  //   : shouldShowIncorrect
  //     ? "bg-[#1A1A1A] border-[#FFB040] shadow-[0_0_20px_rgba(255,176,64,0.4)]"
  //     : "bg-[#1A1A1A] border-[rgba(255,255,255,0.1)]";

  return (
    <div className="space-y-4 sm:space-y-6">
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <motion.div
          animate={
            shouldShowIncorrect
              ? { x: [-8, 8, -6, 6, -4, 4, 0], scale: 1 }
              : shouldShowCorrect
                ? { scale: [1, 1.05, 1] }
                : {}
          }
          transition={{ duration: 0.4 }}
          className="flex gap-1.5 sm:gap-2 flex-wrap mb-6 sm:mb-8"
        >
          {slots.map((word, index) => (
            <Droppable droppableId={`slot-${index}`} key={`slot-${index}`}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`
                    min-w-[70px] sm:min-w-[90px] min-h-[40px] sm:min-h-[50px] 
                    flex items-center justify-center transition-all
                    font-serif text-sm sm:text-base
                    ${shouldShowCorrect ? "border-b-2 border-[#32C781]" : ""}
                    ${shouldShowIncorrect ? "border-b-2 border-[#FFB040]" : ""}
                    ${!showResult ? "border-b-2 border-white" : ""}
                    ${snapshot.isDraggingOver && !hasAnswered ? "border-b-2 border-[#1983DD] bg-[#1983DD]/10" : ""}
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
                            px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl text-[#E0E0E0] 
                            select-none font-medium font-serif text-xs sm:text-sm
                            ${snapshot.isDragging ? "scale-110 opacity-80" : ""}
                            ${hasAnswered ? "cursor-not-allowed" : "cursor-grab active:cursor-grabbing"}
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
                flex flex-wrap gap-1.5 sm:gap-2 p-3 sm:p-4 border-2 rounded-2xl 
                min-h-[60px] sm:min-h-[80px] transition-all
                bg-[#1A1A1A] border-[rgba(255,255,255,0.1)]
                ${snapshot.isDraggingOver && !hasAnswered ? "border-[#1983DD] bg-[#1983DD]/5 shadow-[0_0_15px_rgba(25,131,221,0.2)]" : ""}
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
                        px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-[#1A1A1A] 
                        border border-[rgba(255,255,255,0.2)] text-[#E0E0E0]
                        select-none font-medium font-serif text-xs sm:text-sm
                        transition-all
                        ${!hasAnswered ? "hover:border-[#1983DD] hover:bg-[#1983DD]/10" : ""}
                        ${snapshot.isDragging ? "scale-110 border-[#1983DD] shadow-lg opacity-80" : ""}
                        ${hasAnswered ? "cursor-not-allowed opacity-60" : "cursor-grab active:cursor-grabbing"}
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
