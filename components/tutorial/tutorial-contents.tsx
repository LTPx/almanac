"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, ArrowLeft, BookOpen, Loader2, ArrowRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { FormattedTextDisplay } from "@/components/formatted-text-display";
import { useCurriculums } from "@/hooks/use-curriculums";
import { useCurriculumStore } from "@/store/useCurriculumStore";
import { useUser } from "@/context/UserContext";
import { Lesson, Unit, Curriculum } from "@/lib/types";
import { Button } from "../ui/button";

interface TutorialContentsProps {
  onClose: () => void;
  onBack: () => void;
  targetUnitId?: number;
}

export function TutorialContentsDemo({
  onClose,
  onBack,
  targetUnitId
}: TutorialContentsProps) {
  const user = useUser();
  const userId = user?.id || "";
  const { selectedCurriculumId } = useCurriculumStore();
  const { fetchCurriculumWithUnitsUserMetrics, isLoading } = useCurriculums();

  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [openAccordion, setOpenAccordion] = useState<string>("");

  useEffect(() => {
    const loadCurriculumUnits = async () => {
      if (!selectedCurriculumId) return;

      const data = await fetchCurriculumWithUnitsUserMetrics(
        selectedCurriculumId,
        userId
      );

      if (data) {
        const { curriculum, units } = data;
        setCurriculum(curriculum);
        setUnits(units);

        if (targetUnitId) {
          const targetUnit = units?.find((u: Unit) => u.id === targetUnitId);
          if (
            targetUnit &&
            targetUnit.lessons &&
            targetUnit.lessons.length > 0
          ) {
            const firstLesson = targetUnit.lessons[0];
            setOpenAccordion(`lesson-${firstLesson.id}`);
          }
        } else if (units[0]?.lessons?.[0]) {
          setOpenAccordion(`lesson-${units[0].lessons[0].id}`);
        }
      }
    };

    loadCurriculumUnits();
  }, [
    selectedCurriculumId,
    userId,
    targetUnitId,
    fetchCurriculumWithUnitsUserMetrics
  ]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-neutral-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
          <p className="text-white text-lg">Cargando contenidos...</p>
        </div>
      </div>
    );
  }

  if (!curriculum || !units.length) {
    return (
      <div className="fixed inset-0 z-[9999] bg-neutral-900 flex items-center justify-center">
        <p className="text-gray-400 text-lg">No se encontraron contenidos</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[650px] inset-0 z-[9999] bg-neutral-900 flex flex-col overflow-hidden">
      <div className="px-4 py-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-white hover:text-gray-300 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-white text-lg font-bold">Contenidos</h1>
        <Button
          onClick={onClose}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          Continuar Tutorial
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-[0px] bg-purple-600/20 border-2 border-purple-500/50 rounded-2xl p-4 mb-4"
      >
        <div className="flex items-start gap-4 max-w-4xl mx-auto">
          <div className="bg-white/20 rounded-full p-3 backdrop-blur-sm">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-2">Explora el Contenido</h2>
            <p className="text-white/90 text-sm leading-relaxed">
              Aquí puedes revisar todas las explicaciones detalladas de cada
              lección. Haz clic en cualquier tema para ver su contenido
              completo. ¡Estudia a tu propio ritmo!
            </p>
          </div>
        </div>
      </motion.div>
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[22px] font-bold text-white mb-6"
          >
            Temas
          </motion.h1>

          {units.map((unit: Unit, unitIndex) => (
            <motion.div
              key={unit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: unitIndex * 0.1 }}
              id={`unit-${unit.id}`}
              className="mb-6 scroll-mt-20"
            >
              <h2 className="text-xl font-bold text-white mb-3">{unit.name}</h2>
              <div className="border-2 border-neutral-600 rounded-2xl overflow-hidden">
                <Accordion
                  type="single"
                  collapsible
                  className="w-full"
                  value={openAccordion}
                  onValueChange={setOpenAccordion}
                >
                  {unit.lessons?.map((lesson: Lesson) => (
                    <AccordionItem
                      key={lesson.id}
                      value={`lesson-${lesson.id}`}
                      className="border-neutral-600 last:border-0"
                    >
                      <AccordionTrigger className="text-white text-base font-semibold px-5 py-5 hover:bg-neutral-750 hover:no-underline">
                        {lesson.name}
                      </AccordionTrigger>
                      <AccordionContent className="px-5 pb-5 pt-2 border-t border-neutral-700">
                        <FormattedTextDisplay text={lesson.description} />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </motion.div>
          ))}
          <div className="h-20" />
        </div>
      </div>
    </div>
  );
}
