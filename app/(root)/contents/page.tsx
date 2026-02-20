"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import { Lock, RotateCcw, Play } from "lucide-react";
import { TestSystem } from "@/components/test/TestSystem";
import { useHome } from "@/hooks/useHome";
import SubscriptionModal from "@/components/subscription-modal";
import { useSubscriptionModal } from "@/hooks/useSubscriptionModal";
import { useTranslation } from "@/hooks/useTranslation";

function ContentsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const unitIdParam = searchParams?.get("unit");
  const curriculumIdParam = searchParams?.get("curriculumid");
  const user = useUser();
  const userId = user?.id || "";
  const isPremium = user?.isPremium || false;
  const { selectedCurriculumId, setSelectedCurriculumId } =
    useCurriculumStore();
  const { isLoading, fetchCurriculumWithUnitsUserMetrics } = useCurriculums();
  const { gamification, refetch: refetchGamification } = useHome(userId);
  const { t } = useTranslation();

  const [unitStates, setUnitStates] = useState<Record<string, string>>({});

  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [stats, setStats] = useState<{ totalAnswerErrors: number } | null>(
    null
  );
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
  const hasScrolledRef = useRef(false);

  useEffect(() => {
    if (curriculumIdParam && curriculumIdParam !== selectedCurriculumId) {
      setSelectedCurriculumId(curriculumIdParam);
    }
  }, [curriculumIdParam, selectedCurriculumId, setSelectedCurriculumId]);

  useEffect(() => {
    const loadCurriculumUnits = async () => {
      if (!selectedCurriculumId) return;

      try {
        const data = await fetchCurriculumWithUnitsUserMetrics(
          selectedCurriculumId,
          userId
        );

        if (!data) return;

        const { curriculum, units, stats } = data;
        setCurriculum(curriculum);
        setUnits(units);
        setStats(stats);

        const params = new URLSearchParams();
        params.set("curriculumid", selectedCurriculumId);
        if (unitIdParam) {
          params.set("unit", unitIdParam);
        }
        router.replace(`/contents?${params.toString()}`, { scroll: false });

        if (unitIdParam && !hasScrolledRef.current) {
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
                element.scrollIntoView({
                  behavior: "auto",
                  block: "start"
                });
                hasScrolledRef.current = true;
              }
            }, 300);
          }
        }
      } catch (error) {
        console.error("Error loading curriculum units:", error);
      }
    };

    loadCurriculumUnits();
  }, [
    selectedCurriculumId,
    fetchCurriculumWithUnitsUserMetrics,
    unitIdParam,
    userId,
    router
  ]);

  useEffect(() => {
    if (!userId || !selectedCurriculumId) return;
    fetch(`/api/users/${userId}/progress?curriculumId=${selectedCurriculumId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.unitStates) setUnitStates(data.unitStates);
      })
      .catch((err) => console.error("Error fetching progress:", err));
  }, [userId, selectedCurriculumId]);

  const getUnitState = (unitId: number) => {
    const state = unitStates[String(unitId)];
    if (!state) return null;
    return { state };
  };

  const isUnitOpen = (unit: Unit) => {
    return unit.lessons?.some(
      (lesson) => openAccordion === `lesson-${lesson.id}`
    );
  };

  const renderActionButton = (unitId: number, unitName: string) => {
    const lessonState = getUnitState(unitId);
    const hearts = gamification?.hearts ?? 0;

    if (!lessonState) {
      return (
        <button
          disabled
          className="px-3 py-1.5 rounded-md text-xs font-semibold bg-neutral-800 text-gray-400 cursor-not-allowed flex items-center gap-1.5 border border-neutral-700"
        >
          <Lock className="w-3 h-3" />
          {t("contents", "noData")}
        </button>
      );
    }

    switch (lessonState.state) {
      case "completed":
        return (
          <button
            onClick={() => setActiveTest({ unitId, unitName })}
            className="px-3 py-1.5 rounded-md text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-white transition-colors flex items-center gap-1.5 border border-neutral-600"
          >
            <RotateCcw className="w-3 h-3" />
            {t("contents", "retry")}
          </button>
        );
      case "available":
        return (
          <button
            onClick={() => setActiveTest({ unitId, unitName })}
            disabled={hearts === 0}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 border ${
              hearts === 0
                ? "bg-neutral-800 text-gray-400 cursor-not-allowed border-neutral-700"
                : "bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-600"
            }`}
          >
            <Play className="w-3 h-3" />
            {hearts === 0 ? t("contents", "noHearts") : t("contents", "start")}
          </button>
        );
      case "locked":
        return (
          <button
            disabled
            className="px-3 py-1.5 rounded-md text-xs font-semibold bg-neutral-800 text-gray-400 cursor-not-allowed flex items-center gap-1.5 border border-neutral-700"
          >
            <Lock className="w-3 h-3" />
            {t("contents", "locked")}
          </button>
        );
      default:
        return null;
    }
  };

  const handleCloseTest = () => {
    setActiveTest(null);
    refetchGamification();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center">
        <div className="text-gray-400 text-lg">{t("contents", "loadingUnits")}</div>
      </div>
    );
  }

  if (!selectedCurriculumId || !curriculum) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center">
        <div className="text-gray-400 text-lg">
          {t("contents", "noCurriculum")}
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
            curriculumId={selectedCurriculumId}
            onClose={handleCloseTest}
            isReviewMode={activeTest.isReview}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-6 pb-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">{curriculum.title}</h1>
        <h2 className="text-[22px] font-bold mb-6">{t("contents", "topics")}</h2>
        {units.map((unit: Unit) => (
          <div
            key={unit.id}
            id={`unit-${unit.id}`}
            className="mb-6 scroll-mt-20"
          >
            <div className="flex items-center justify-between mb-3 gap-3">
              <h2 className="text-xl font-bold">{unit.name}</h2>
              {isUnitOpen(unit) && renderActionButton(unit.id, unit.name)}
            </div>
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
          <h2 className="text-[22px] font-bold mb-4">{t("contents", "yourHistory")}</h2>
          <div className="border-2 border-neutral-600 rounded-2xl p-5 mb-4 flex items-center justify-between">
            <span className="text-lg font-semibold">{t("contents", "concepts")}</span>
            <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              +25
            </span>
          </div>
          <button
            onClick={() =>
              stats?.totalAnswerErrors &&
              router.push(
                `/contents/errors?curriculumid=${selectedCurriculumId}&userId=${userId}`
              )
            }
            disabled={!stats?.totalAnswerErrors}
            className={`w-full border-2 border-neutral-600 rounded-2xl p-5 mb-6 flex items-center justify-between ${
              stats?.totalAnswerErrors
                ? "hover:border-neutral-400 transition-colors cursor-pointer"
                : "cursor-default"
            }`}
          >
            <span className="text-lg font-semibold">{t("contents", "errors")}</span>
            <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              {stats?.totalAnswerErrors}
            </span>
          </button>
          <div className="relative">
            <h3 className="text-lg font-semibold mb-[100px]">
              {t("contents", "reviewRecentErrors")}
            </h3>

            <button
              onClick={() => {
                if (!isPremium) {
                  openSubscriptionModal();
                } else {
                  setActiveTest({
                    unitId: 0,
                    unitName: "Repaso",
                    isReview: true
                  });
                }
              }}
              disabled={!stats?.totalAnswerErrors}
              className={`w-full font-bold text-base py-4 rounded-xl transition-colors ${
                stats?.totalAnswerErrors
                  ? "bg-white text-neutral-900 hover:bg-gray-100"
                  : "bg-neutral-700 text-gray-400 cursor-not-allowed"
              }`}
            >
              {t("contents", "startReview")}
            </button>

            {!isPremium && (
              <div className="absolute -top-2 right-0 w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg italic">
                  PLUS
                </span>
              </div>
            )}
          </div>
        </div>
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

export default ContentsPage;
