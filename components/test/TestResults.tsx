"use client";
import { Trophy, Target } from "lucide-react";
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
  lessonName,
  onReturnToLessons,
  hearts,
  onRetakeTest
}: TestResultsProps) {
  const percentage = Math.round(results.score);
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

      {/* <div className="rounded-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          {isPassed ? (
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-white" />
            </div>
          ) : (
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-white" />
            </div>
          )}

          <h2 className="text-2xl font-bold text-white mb-2">
            {isPassed ? "¡Felicitaciones!" : "No alcanzaste el puntaje mínimo"}
          </h2>

          <p className="text-gray-300">{lessonName}</p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-3xl font-bold text-white mb-1">
              {percentage}%
            </div>
            <div className="text-gray-300 text-sm">Puntaje obtenido</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-xl font-bold text-green-400 mb-1">
                {results.correctAnswers}
              </div>
              <div className="text-gray-300 text-sm">Correctas</div>
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-xl font-bold text-red-400 mb-1">
                {results.totalQuestions - results.correctAnswers}
              </div>
              <div className="text-gray-300 text-sm">Incorrectas</div>
            </div>
          </div>

          {isPassed && results.experienceGained > 0 && (
            <div className="flex w-full items-center gap-x-4">
              <ResultCard variant="points" value={results.experienceGained} />
              <ResultCard variant="hearts" value={5} />
            </div>
          )}
        </div>

      </div> */}
    </div>
  );
}
