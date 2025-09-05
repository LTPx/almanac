"use client";
import { Trophy, Target, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TestResultsInterface } from "@/lib/types";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { ResultCard } from "../result-card";

interface TestResultsProps {
  results: TestResultsInterface;
  lessonName: string;
  onReturnToLessons: () => void;
  onRetakeTest?: () => void;
}

export function TestResults({
  results,
  lessonName,
  onReturnToLessons,
  onRetakeTest
}: TestResultsProps) {
  const percentage = Math.round(results.score);
  const isPassed = results.passed;
  const { width, height } = useWindowSize();

  return (
    <div className="bg-gray-900 min-h-screen p-6 flex items-center justify-center">
      {isPassed && (
        <Confetti
          recycle={false}
          numberOfPieces={500}
          tweenDuration={10_000}
          width={width}
          height={height}
        />
      )}
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full text-center">
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
            // <div className="bg-orange-500/20 border border-orange-500 rounded-lg p-4">
            //   <div className="flex items-center justify-center gap-2 text-orange-400">
            //     <Award className="w-5 h-5" />
            //     <span className="font-medium">
            //       +{results.experienceGained} XP ganados
            //     </span>
            //   </div>
            // </div>
          )}
        </div>

        <div className="space-y-3">
          <Button
            onClick={onReturnToLessons}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          >
            Volver a Lecciones
          </Button>

          {!isPassed && onRetakeTest && (
            <Button
              onClick={onRetakeTest}
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Intentar de Nuevo
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
