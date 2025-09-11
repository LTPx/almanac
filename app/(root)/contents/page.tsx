"use client";

import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { useUnits } from "@/hooks/use-units";
import { Lesson, Unit } from "@/lib/types";

function Contents() {
  const { fetchUnits, isLoading } = useUnits();
  const [units, setUnits] = useState<Unit[]>([]);

  useEffect(() => {
    const loadUnits = async () => {
      const data = await fetchUnits();
      if (data) setUnits(data);
    };
    loadUnits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-10 text-gray-400">
        Cargando unidades...
      </div>
    );
  }

  return (
    <div className="ContentsPage p-6 max-w-2xl mx-auto">
      {units.map((unit) => (
        <div key={unit.id} className="mb-8">
          <h2 className="text-xl font-semibold mb-3">{unit.name}</h2>
          <Accordion type="single" collapsible className="w-full">
            {unit.lessons?.map((lesson: Lesson) => (
              <AccordionItem key={lesson.id} value={`lesson-${lesson.id}`}>
                <AccordionTrigger className="text-white text-lg">
                  {lesson.name}
                </AccordionTrigger>
                <AccordionContent className="text-gray-300">
                  {lesson.description || "Sin descripción disponible."}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ))}
    </div>
  );
}

export default Contents;
