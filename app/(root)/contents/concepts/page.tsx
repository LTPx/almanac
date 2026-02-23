"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { BookOpen, Loader2, ArrowLeft, AlertTriangle } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useTranslation } from "@/hooks/useTranslation";
import { FormattedTextDisplay } from "@/components/formatted-text-display";

interface Lesson {
  id: number;
  name: string;
  description: string | null;
}

interface LearnedUnit {
  id: number;
  name: string;
  lessons: Lesson[];
}

function ConceptsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const curriculumId = searchParams?.get("curriculumid");
  const userIdParam = searchParams?.get("userId");
  const user = useUser();
  const userId = userIdParam || user?.id || "";
  const { t } = useTranslation();

  const [units, setUnits] = useState<LearnedUnit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openAccordion, setOpenAccordion] = useState<string>("");

  useEffect(() => {
    const fetchConcepts = async () => {
      if (!userId || !curriculumId) {
        setError(t("conceptsPage", "missingParams"));
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/app/concepts?userId=${userId}&curriculumId=${curriculumId}`
        );
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || t("conceptsPage", "errorFetching"));
        }

        setUnits(data.units);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConcepts();
  }, [userId, curriculumId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-6 pb-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() =>
              router.push(`/contents?curriculumid=${curriculumId}`)
            }
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            {t("conceptsPage", "backToContents")}
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {t("conceptsPage", "yourConcepts")}
              </h1>
              <p className="text-sm text-gray-400">
                {units.length}{" "}
                {units.length === 1
                  ? t("conceptsPage", "unit")
                  : t("conceptsPage", "units")}
              </p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {units.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">{t("conceptsPage", "noConcepts")}</p>
          </div>
        )}

        {/* Units with lessons */}
        {units.length > 0 && (
          <div className="space-y-6">
            {units.map((unit) => (
              <div key={unit.id}>
                <h2 className="text-xl font-bold mb-3">{unit.name}</h2>
                <div className="border-2 border-neutral-600 rounded-2xl overflow-hidden">
                  <Accordion
                    type="single"
                    collapsible
                    className="w-full"
                    value={openAccordion}
                    onValueChange={setOpenAccordion}
                  >
                    {unit.lessons.map((lesson) => (
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
          </div>
        )}
      </div>
    </div>
  );
}

export default ConceptsPage;
