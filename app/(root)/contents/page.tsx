"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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
import { useUser } from "@/context/UserContext";

function Contents() {
  const searchParams = useSearchParams();
  const unitIdParam = searchParams?.get("unit");
  const user = useUser();
  const userId = user?.id || "";
  const { selectedCurriculumId } = useCurriculumStore();
  const {
    fetchCurriculumWithUnits,
    isLoading,
    fetchCurriculumWithUnitsUserMetrics
  } = useCurriculums();
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [stats, setStats] = useState<{ totalAnswerErrors: number } | null>(
    null
  );
  const [openAccordion, setOpenAccordion] = useState<string>("");

  useEffect(() => {
    const loadCurriculumUnits = async () => {
      if (!selectedCurriculumId) return;

      const data = await fetchCurriculumWithUnitsUserMetrics(
        selectedCurriculumId,
        userId
      );

      if (data) {
        const { curriculum, units, stats } = data;
        setCurriculum(curriculum);
        setUnits(units);
        setStats(stats);
        if (unitIdParam) {
          const unitId = parseInt(unitIdParam);
          const targetUnit = data.units?.find((u: Unit) => u.id === unitId);

          if (
            targetUnit &&
            targetUnit.lessons &&
            targetUnit.lessons.length > 0
          ) {
            const firstLesson = targetUnit.lessons[0];
            setOpenAccordion(`lesson-${firstLesson.id}`);
            setTimeout(() => {
              const element = document.getElementById(`unit-${unitId}`);
              if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }, 100);
          }
        }
      }
    };

    loadCurriculumUnits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCurriculumId, fetchCurriculumWithUnits, unitIdParam]);

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
        {units.map((unit: Unit) => (
          <div
            key={unit.id}
            id={`unit-${unit.id}`}
            className="mb-6 scroll-mt-20"
          >
            <h2 className="text-xl font-bold mb-3">{unit.name}</h2>
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
              {stats?.totalAnswerErrors}
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
