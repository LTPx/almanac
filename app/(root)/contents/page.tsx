"use client";

import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { useCurriculums } from "@/hooks/use-curriculums";
import { Lesson, Unit, Curriculum } from "@/lib/types";
import { FormattedTextDisplay } from "@/components/formatted-text-display";
import { useCurriculumStore } from "@/store/useCurriculumStore";

function Contents() {
  const { selectedCurriculumId } = useCurriculumStore();
  const { fetchCurriculumWithUnits, isLoading } = useCurriculums();
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);

  useEffect(() => {
    const loadCurriculumUnits = async () => {
      if (!selectedCurriculumId) return;

      const data = await fetchCurriculumWithUnits(selectedCurriculumId);
      if (data) {
        setCurriculum(data);
      }
    };

    loadCurriculumUnits();
  }, [selectedCurriculumId, fetchCurriculumWithUnits]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center">
        <div className="text-gray-400 text-lg">Cargando unidades...</div>
      </div>
    );
  }

  if (!selectedCurriculumId || !curriculum) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center">
        <div className="text-gray-400 text-lg">
          No se ha seleccionado un curriculum
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-6 pb-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-[22px] font-bold mb-6">Temas</h1>

        {curriculum.units?.map((unit: Unit) => (
          <div key={unit.id} className="mb-6">
            <h2 className="text-xl font-bold mb-3">{unit.name}</h2>

            <div className="border-2 border-neutral-600 rounded-2xl overflow-hidden">
              <Accordion type="single" collapsible className="w-full">
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
          </div>
        ))}

        <div className="mt-8">
          <h2 className="text-[22px] font-bold mb-4">Tu Historia</h2>
          <div className="border-2 border-neutral-600 rounded-2xl p-5 mb-4 flex items-center justify-between">
            <span className="text-lg font-semibold">Conceptos</span>
            <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              +25
            </span>
          </div>
          <div className="border-2 border-neutral-600 rounded-2xl p-5 mb-6 flex items-center justify-between">
            <span className="text-lg font-semibold">Errores</span>
            <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              +25
            </span>
          </div>
          <div className="relative">
            <h3 className="text-lg font-semibold mb-[100px]">
              Repasa tus errores recientes
            </h3>

            <button className="w-full bg-white text-neutral-900 font-bold text-base py-4 rounded-xl hover:bg-gray-100 transition-colors">
              EMPEZAR MI REPASO
            </button>
            <div className="absolute -top-2 right-0 w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg italic">PLUS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contents;
