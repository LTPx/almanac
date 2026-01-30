"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Loader2, ArrowRight, X } from "lucide-react";
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
    <div className="w-full max-w-[650px] mx-auto inset-0 z-[9999] bg-neutral-900 flex flex-col overflow-hidden h-screen">
      {/* Header Responsivo */}
      <div className="flex-shrink-0 px-4 md:px-6 py-3 md:py-4 border-b border-neutral-800 bg-neutral-900">
        {/* Layout Mobile */}
        <div className="flex md:hidden flex-col gap-3">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Atrás</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <h1 className="text-white text-lg font-bold">Contenidos</h1>
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
            >
              Continuar
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Layout Desktop */}
        <div className="hidden md:flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Atrás</span>
          </button>

          <h1 className="absolute left-1/2 -translate-x-1/2 text-white text-xl font-bold">
            Contenidos
          </h1>

          <button
            onClick={onClose}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            Continuar
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-shrink-0 mx-4 md:mx-6 mt-4 md:mt-6 bg-purple-600/20 border border-purple-500/50 rounded-xl p-3 md:p-4"
      >
        <div className="flex items-start gap-2 md:gap-3">
          <div className="bg-purple-500/30 rounded-lg p-1.5 md:p-2 backdrop-blur-sm flex-shrink-0">
            <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-purple-300" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-semibold text-sm md:text-base mb-1">
              Explora el Contenido
            </h2>
            <p className="text-white/80 text-xs md:text-sm leading-relaxed">
              Revisa las explicaciones detalladas de cada lección. Haz clic en
              cualquier tema para ver su contenido completo.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 min-h-0">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-base md:text-lg font-bold text-white mb-3 md:mb-4"
          >
            Temas
          </motion.h2>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">
            {curriculum.title}
          </h2>

          {units.map((unit: Unit, unitIndex) => (
            <motion.div
              key={unit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: unitIndex * 0.1 }}
              id={`unit-${unit.id}`}
              className="mb-4 md:mb-6 scroll-mt-20"
            >
              <h3 className="text-sm md:text-base font-semibold text-white mb-2 md:mb-3">
                {unit.name}
              </h3>
              <div className="border-2 border-neutral-700 rounded-xl overflow-hidden">
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
                      className="border-neutral-700 last:border-0"
                    >
                      <AccordionTrigger className="text-white text-xs md:text-sm font-medium px-3 md:px-4 py-3 md:py-4 hover:bg-neutral-800/50 hover:no-underline transition-colors text-left">
                        {lesson.name}
                      </AccordionTrigger>
                      <AccordionContent className="px-3 md:px-4 pb-3 md:pb-4 pt-2 border-t border-neutral-800 bg-neutral-900/50">
                        <div className="text-xs md:text-sm">
                          <FormattedTextDisplay text={lesson.description} />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </motion.div>
          ))}
          <div className="h-16 md:h-20" />
        </div>
      </div>
    </div>
  );
}
