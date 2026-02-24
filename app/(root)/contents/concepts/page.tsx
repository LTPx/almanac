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

interface CorrectAnswer {
  text: string;
  order: number;
}

interface CorrectQuestion {
  id: number;
  title: string;
  type: string;
  content: any;
  unitName: string;
  correctAnswers: CorrectAnswer[];
}

interface QuestionsByUnit {
  [unitName: string]: CorrectQuestion[];
}

function ConceptsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const curriculumId = searchParams?.get("curriculumid");
  const userIdParam = searchParams?.get("userId");
  const user = useUser();
  const userId = userIdParam || user?.id || "";
  const lang = user?.languagePreference ?? undefined;
  const { t } = useTranslation();

  const [questions, setQuestions] = useState<CorrectQuestion[]>([]);
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
        const langParam = lang ? `&lang=${lang}` : "";
        const res = await fetch(
          `/api/app/concepts?userId=${userId}&curriculumId=${curriculumId}${langParam}`
        );
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || t("conceptsPage", "errorFetching"));
        }

        setQuestions(data.questions);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConcepts();
  }, [userId, curriculumId, lang]);

  const questionsByUnit: QuestionsByUnit = questions.reduce((acc, q) => {
    if (!acc[q.unitName]) acc[q.unitName] = [];
    acc[q.unitName].push(q);
    return acc;
  }, {} as QuestionsByUnit);

  const renderCorrectAnswer = (question: CorrectQuestion) => {
    const sortedAnswers = [...question.correctAnswers].sort(
      (a, b) => a.order - b.order
    );

    switch (question.type) {
      case "ORDER_WORDS":
        return (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-green-400">
              {t("conceptsPage", "correctOrder")}
            </p>
            <div className="space-y-1">
              {sortedAnswers.map((answer, idx) => (
                <div
                  key={idx}
                  className="bg-green-500/10 border border-green-500/30 rounded-lg p-2 flex items-center gap-2"
                >
                  <span className="bg-green-500/20 text-green-400 font-bold px-2 py-1 rounded text-xs">
                    {idx + 1}
                  </span>
                  <p className="text-sm text-white">{answer.text}</p>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-green-400">
              {t("conceptsPage", "correctAnswer")}
            </p>
            {sortedAnswers.map((answer, idx) => (
              <div
                key={idx}
                className="bg-green-500/10 border border-green-500/30 rounded-lg p-3"
              >
                <p className="text-sm text-white">{answer.text}</p>
              </div>
            ))}
          </div>
        );
    }
  };

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
                {questions.length}{" "}
                {questions.length === 1
                  ? t("conceptsPage", "question")
                  : t("conceptsPage", "questions")}
              </p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {questions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">{t("conceptsPage", "noConcepts")}</p>
          </div>
        )}

        {/* Questions by Unit */}
        {Object.keys(questionsByUnit).length > 0 && (
          <div className="space-y-6">
            {Object.entries(questionsByUnit).map(([unitName, unitQuestions]) => (
              <div key={unitName}>
                <h2 className="text-xl font-bold mb-3">{unitName}</h2>
                <div className="border-2 border-neutral-600 rounded-2xl overflow-hidden">
                  <Accordion
                    type="single"
                    collapsible
                    className="w-full"
                    value={openAccordion}
                    onValueChange={setOpenAccordion}
                  >
                    {unitQuestions.map((question) => (
                      <AccordionItem
                        key={question.id}
                        value={`question-${question.id}`}
                        className="border-neutral-600 last:border-0"
                      >
                        <AccordionTrigger className="text-white text-base font-semibold px-5 py-5 hover:bg-neutral-750 hover:no-underline">
                          {question.title}
                        </AccordionTrigger>
                        <AccordionContent className="px-5 pb-5 pt-2 border-t border-neutral-700">
                          {renderCorrectAnswer(question)}
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
