"use client"

import { Clock, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LessonCardProps {
  lesson: {
    id: number
    name: string
    description: string | null
    experiencePoints: number
    totalQuestions?: number
  }
  onStartTest: (lessonId: number) => void
  isLoading?: boolean
}

export function LessonCard({
  lesson,
  onStartTest,
  isLoading,
}: LessonCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-gray-400" />
            <h3 className="text-xl font-semibold text-white">{lesson.name}</h3>
          </div>

          <p className="text-gray-300 mb-4">{lesson.description}</p>

          <div className="flex items-center gap-4 text-sm text-gray-400">
            {lesson.totalQuestions && (
              <span>{lesson.totalQuestions} preguntas</span>
            )}
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4" />
              <span>+{lesson.experiencePoints} XP</span>
            </div>
          </div>
        </div>

        <Button
          onClick={() => onStartTest(lesson.id)}
          disabled={isLoading}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2"
        >
          {isLoading ? "Cargando..." : "Comenzar"}
        </Button>
      </div>
    </div>
  )
}
