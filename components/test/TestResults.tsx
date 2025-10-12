"use client";
import { Button } from "@/components/ui/button";
import { TestResultsInterface } from "@/lib/types";
import Confetti from "react-confetti";
import { useWindowSize, useAudio } from "react-use";
import { ResultCard } from "../result-card";
import { useEffect, useState } from "react";
import Image from "next/image";

interface TestResultsProps {
  results: TestResultsInterface;
  lessonName: string;
  onReturnToLessons: () => void;
  onRetakeTest?: () => void;
  hearts?: number;
}

export function TestResults({
  results,
  // lessonName,
  onReturnToLessons,
  hearts,
  onRetakeTest
}: TestResultsProps) {
  // const percentage = Math.round(results.score);
  const isPassed = results.passed;
  const { width, height } = useWindowSize();

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

  return (
    <div className="bg-background min-h-screen lg:p-6 flex flex-col items-center justify-center">
      {isPassed && (
        <Confetti
          recycle={false}
          numberOfPieces={500}
          tweenDuration={10_000}
          width={width}
          height={height}
        />
      )}
      <div className="mx-auto flex h-full max-w-lg flex-col items-center justify-center gap-y-4 text-center lg:gap-y-8">
        <Image
          src="/finish.svg"
          alt="Finish"
          className="hidden lg:block"
          height={100}
          width={100}
        />

        <Image
          src="/finish.svg"
          alt="Finish"
          className="block lg:hidden"
          height={100}
          width={100}
        />

        <h1 className="text-lg font-bold text-white lg:text-3xl">
          Great job! <br /> You&apos;ve completed the lesson.
        </h1>
        <div className="flex w-full items-center gap-x-4">
          <ResultCard variant="points" value={results.experienceGained} />
          <ResultCard variant="hearts" value={hearts || 0} />
        </div>
      </div>

      <div className="space-y-3 pt-[200px]">
        <Button
          onClick={onReturnToLessons}
          className="
            w-full py-6 text-lg font-semibold rounded-2xl shadow-lg
            bg-[#1983DD] hover:bg-[#1666B0] text-white"
        >
          Volver a Lecciones
        </Button>

        {!isPassed && onRetakeTest && (
          <Button
            onClick={onRetakeTest}
            variant="outline"
            className="
            w-full py-6 text-lg font-semibold rounded-2xl shadow-lg
            hover:bg-gray-700"
          >
            Intentar de Nuevo
          </Button>
        )}
      </div>
      {finishAudio}
    </div>
  );
}
