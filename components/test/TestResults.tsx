"use client";
import { Button } from "@/components/ui/button";
import { TestResultsInterface } from "@/lib/types";
import { useAudio } from "react-use";
import { ResultCard } from "../result-card";
import { useEffect, useState } from "react";

interface TestResultsProps {
  results: TestResultsInterface;
  lessonName: string;
  onReturnToLessons: () => void;
  hearts?: number;
  isTutorialMode?: boolean;
}

export function TestResults({
  results,
  onReturnToLessons,
  isTutorialMode = false
}: TestResultsProps) {
  const isPassed = results.passed;

  const [finishAudio, , finishControls] = useAudio({
    src: "/finish.mp3",
    autoPlay: false
  });
  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    if (isPassed && !hasPlayed) {
      finishControls.play();
      setHasPlayed(true);
    }
  }, [isPassed, hasPlayed, finishControls]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const calculateSpeed = () => {
    const timeElapsed = results.timeQuizInSeconds || 0;
    const totalQuestions = results.totalQuestions;
    const averageTimePerQuestion = timeElapsed / totalQuestions;

    if (averageTimePerQuestion <= 20) {
      return "rapid";
    } else if (averageTimePerQuestion <= 40) {
      return "normal";
    } else {
      return "slow";
    }
  };

  const getAccuracyLabel = (score: number): string => {
    if (score === 100) return "Exacto";
    if (score >= 90) return "Excelente";
    if (score >= 80) return "Muy Bien";
    if (score >= 70) return "Bien";
    if (score >= 60) return "Aceptable";
    return "Mejorable";
  };

  const speed = calculateSpeed();
  const accuracyScore = Math.round(results.score);
  const accuracyLabel = getAccuracyLabel(accuracyScore);

  return (
    <div className="bg-background w-full max-w-[650px] min-h-screen lg:p-6 flex flex-col items-center justify-center">
      <div className="mx-auto flex h-full max-w-lg flex-col items-center justify-center gap-y-4 text-center lg:gap-y-8">
        <h1 className="text-lg font-bold text-[#EFFF0A] lg:text-3xl">
          {isPassed ? <>Completaste la prueba!</> : <>Completaste la prueba!</>}
        </h1>

        <div className="grid grid-cols-3 gap-3 w-full px-4">
          <ResultCard
            variant="speed"
            value={formatTime(results.timeQuizInSeconds || 0)}
            speed={speed}
          />
          <ResultCard variant="points" value={results.experienceGained} />
          <ResultCard
            variant="accuracy"
            value={accuracyScore}
            accuracyLabel={accuracyLabel}
          />
        </div>
      </div>

      <div className="pt-[200px] w-full">
        <Button
          onClick={onReturnToLessons}
          className="
              w-full py-8 text-xl font-semibold rounded-2xl shadow-lg
              bg-[#1983DD] hover:bg-[#1666B0] text-white"
        >
          {isTutorialMode
            ? "Continuar"
            : isPassed
              ? "Recibir Experiencia"
              : "Recibir Experiencia"}
        </Button>
      </div>
      {finishAudio}
    </div>
  );
}
