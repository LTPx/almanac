"use client";
import { Button } from "@/components/ui/button";
import { TestResultsInterface } from "@/lib/types";
import Confetti from "react-confetti";
import { useWindowSize, useAudio } from "react-use";
import { ResultCard } from "../result-card";
import { useEffect, useState } from "react";
import Image from "next/image";
import { XCircle } from "lucide-react";

interface TestResultsProps {
  results: TestResultsInterface;
  lessonName: string;
  onReturnToLessons: () => void;
  onRetakeTest?: () => void;
  hearts?: number;
}

export function TestResults({
  results,
  onReturnToLessons,
  // hearts,
  onRetakeTest
}: TestResultsProps) {
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

  const speed = calculateSpeed();

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
        {isPassed ? (
          <Image
            src="/finish.svg"
            alt="Finish"
            className="hidden lg:block"
            height={100}
            width={100}
          />
        ) : (
          <XCircle className="hidden lg:block text-red-500" size={70} />
        )}

        <Image
          src="/finish.svg"
          alt="Finish"
          className="block lg:hidden"
          height={100}
          width={100}
        />

        <h1 className="text-lg font-bold text-white lg:text-3xl">
          {isPassed ? (
            <>
              Great job! <br /> You&apos;ve completed the lesson.
            </>
          ) : (
            <>
              Almost there! <br /> Try again to pass this lesson.
            </>
          )}
        </h1>

        <div className="grid grid-cols-3 gap-3 w-full px-4">
          <ResultCard
            variant="speed"
            value={formatTime(results.timeQuizInSeconds || 0)}
            speed={speed}
          />
          <ResultCard variant="points" value={results.experienceGained} />
          <ResultCard variant="accuracy" value={Math.round(results.score)} />
        </div>
      </div>

      <div className="space-y-3 pt-[200px]">
        <Button
          onClick={onReturnToLessons}
          className="
            w-full py-6 text-lg font-semibold rounded-2xl shadow-lg
            bg-[#1983DD] hover:bg-[#1666B0] text-white"
        >
          {isPassed ? "Volver a Lecciones" : "Volver"}
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
