"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { AlertTriangle, Loader2, ArrowLeft } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useTranslation } from "@/hooks/useTranslation";
import SubscriptionModal from "@/components/subscription-modal";
import { useSubscriptionModal } from "@/hooks/useSubscriptionModal";
import { TestSystem } from "@/components/test/TestSystem";
import { useHome } from "@/hooks/useHome";

interface CorrectAnswer {
  text: string;
  order: number;
}

interface FailedQuestion {
  id: number;
  title: string;
  type: string;
  content: any;
  unitName: string;
  correctAnswers: CorrectAnswer[];
}

interface QuestionsByUnit {
  [unitName: string]: FailedQuestion[];
}

function ErrorsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const curriculumId = searchParams?.get("curriculumid");
  const userIdParam = searchParams?.get("userId");
  const user = useUser();
  const userId = userIdParam || user?.id || "";
  const isPremium = user?.isPremium || false;
  const lang = user?.languagePreference ?? undefined;
  const { t } = useTranslation();
  const { gamification, refetch: refetchGamification } = useHome(userId);

  const [questions, setQuestions] = useState<FailedQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openAccordion, setOpenAccordion] = useState<string>("");
  const [activeTest, setActiveTest] = useState<{
    unitId: number;
    unitName: string;
    isReview?: boolean;
  } | null>(null);
  const {
    showModal: showSubscriptionModal,
    isLoading: isSubscribing,
    openModal: openSubscriptionModal,
    closeModal: closeSubscriptionModal,
    handleSubscribe
  } = useSubscriptionModal(userId);

  useEffect(() => {
    const fetchErrors = async () => {
      if (!userId || !curriculumId) {
        setError(t("errorsPage", "missingParams"));
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/app/errors?userId=${userId}&curriculumId=${curriculumId}`
        );
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || t("errorsPage", "errorFetching"));
        }

        setQuestions(data.questions);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchErrors();
  }, [userId, curriculumId]);

  const questionsByUnit: QuestionsByUnit = questions.reduce((acc, q) => {
    if (!acc[q.unitName]) acc[q.unitName] = [];
    acc[q.unitName].push(q);
    return acc;
  }, {} as QuestionsByUnit);

  const renderCorrectAnswer = (question: FailedQuestion) => {
    const sortedAnswers = [...question.correctAnswers].sort(
      (a, b) => a.order - b.order
    );

    switch (question.type) {
      case "MULTIPLE_CHOICE":
      case "TRUE_FALSE":
        return (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-green-400">
              {t("errorsPage", "correctAnswer")}
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

      case "FILL_IN_BLANK":
        return (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-green-400">
              {t("errorsPage", "correctAnswer")}
            </p>
            {sortedAnswers.map((answer, idx) => (
              <div
                key={idx}
                className="bg-green-500/10 border border-green-500/30 rounded-lg p-3"
              >
                <p className="text-sm text-white font-mono">{answer.text}</p>
              </div>
            ))}
          </div>
        );

      case "ORDER_WORDS":
        return (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-green-400">
              {t("errorsPage", "correctOrder")}
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
              {t("errorsPage", "correctAnswer")}
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

  const handleCloseTest = () => {
    setActiveTest(null);
    refetchGamification();
    router.push(`/contents?curriculumid=${curriculumId}`);
  };

  const handleStartReview = () => {
    if (!isPremium) {
      openSubscriptionModal();
    } else {
      setActiveTest({ unitId: 0, unitName: "Repaso", isReview: true });
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

  if (activeTest) {
    return (
      <div className="fixed inset-0 z-[100] flex justify-center items-start bg-black/50">
        <div className="w-full max-w-[650px] bg-white shadow-xl overflow-hidden">
          <TestSystem
            hearts={gamification?.hearts ?? 0}
            userId={userId}
            unitId={activeTest.unitId}
            curriculumId={curriculumId || ""}
            onClose={handleCloseTest}
            isReviewMode={activeTest.isReview}
            lang={lang}
          />
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
            {t("errorsPage", "backToContents")}
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{t("errorsPage", "yourErrors")}</h1>
              <p className="text-sm text-gray-400">
                {questions.length}{" "}
                {questions.length === 1
                  ? t("errorsPage", "question")
                  : t("errorsPage", "questions")}
              </p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {questions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">{t("errorsPage", "noErrors")}</p>
          </div>
        )}

        {/* Questions by Unit */}
        {Object.keys(questionsByUnit).length > 0 && (
          <>
            <div className="space-y-6 mb-8">
              {Object.entries(questionsByUnit).map(
                ([unitName, unitQuestions]) => (
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
                )
              )}
            </div>

            {/* Start Review Button */}
            <div className="border-t-2 border-neutral-600 pt-6">
              <button
                onClick={handleStartReview}
                className="w-full font-bold text-base py-4 rounded-xl bg-white text-neutral-900 hover:bg-gray-100 transition-colors"
              >
                {t("errorsPage", "startReview")}
              </button>
            </div>
          </>
        )}
      </div>

      <SubscriptionModal
        open={showSubscriptionModal}
        onClose={closeSubscriptionModal}
        onConfirm={handleSubscribe}
        hasUsedTrial={false}
        isLoading={isSubscribing}
      />
    </div>
  );
}

export default ErrorsPage;
