"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import { Question } from "@/lib/types"

interface TestQuestionProps {
  question: Question
  onAnswer: (questionId: number, answer: string) => void
  showResult?: boolean
  isCorrect?: boolean
  selectedAnswer?: string
}

export function TestQuestion({
  question,
  onAnswer,
  showResult = false,
  isCorrect = false,
  selectedAnswer
}: TestQuestionProps) {
  const [selected, setSelected] = useState<string>(selectedAnswer || "")
  const [hasAnswered, setHasAnswered] = useState(showResult)

  const handleAnswerSelect = (answerId: string) => {
    if (hasAnswered) return
    setSelected(answerId)
  }

  const handleSubmitAnswer = () => {
    if (!selected || hasAnswered) return
    onAnswer(question.id, selected)
    setHasAnswered(true)
  }

  const renderMultipleChoice = () => (
    <div className="space-y-3">
      {question.answers.map((answer) => {
        const isSelected = selected === answer.id.toString()
        const shouldShowCorrect = showResult && isSelected && isCorrect
        const shouldShowIncorrect = showResult && isSelected && !isCorrect

        return (
          <button
            key={answer.id}
            onClick={() => handleAnswerSelect(answer.id.toString())}
            disabled={hasAnswered}
            className={`
              w-full p-4 text-left rounded-lg border-2 transition-all
              ${
                isSelected && !showResult
                  ? "bg-blue-500 border-blue-500 text-white"
                  : ""
              }
              ${
                !isSelected && !showResult
                  ? "bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500"
                  : ""
              }
              ${
                shouldShowCorrect
                  ? "bg-green-500 border-green-500 text-white"
                  : ""
              }
              ${
                shouldShowIncorrect
                  ? "bg-red-500 border-red-500 text-white"
                  : ""
              }
              ${hasAnswered ? "cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            <span className="font-medium">{answer.text}</span>
          </button>
        )
      })}
    </div>
  )

  const renderTrueFalse = () => (
    <div className="space-y-3">
      {["Verdadero", "Falso"].map((option, index) => {
        const value = (index === 0).toString()
        const isSelected = selected === value
        const shouldShowCorrect = showResult && isSelected && isCorrect
        const shouldShowIncorrect = showResult && isSelected && !isCorrect

        return (
          <button
            key={option}
            onClick={() => handleAnswerSelect(value)}
            disabled={hasAnswered}
            className={`
              w-full p-4 text-left rounded-lg border-2 transition-all
              ${
                isSelected && !showResult
                  ? "bg-blue-500 border-blue-500 text-white"
                  : ""
              }
              ${
                !isSelected && !showResult
                  ? "bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500"
                  : ""
              }
              ${
                shouldShowCorrect
                  ? "bg-green-500 border-green-500 text-white"
                  : ""
              }
              ${
                shouldShowIncorrect
                  ? "bg-red-500 border-red-500 text-white"
                  : ""
              }
              ${hasAnswered ? "cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            <span className="font-medium">{option}</span>
          </button>
        )
      })}
    </div>
  )

  const renderFillInBlank = () => (
    <div className="space-y-4">
      <input
        type="text"
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        disabled={hasAnswered}
        placeholder="Escribe tu respuesta..."
        className="w-full p-4 rounded-lg bg-gray-800 border-2 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none disabled:opacity-50"
      />
    </div>
  )

  return (
    <div className="bg-gray-900 min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            {question.title}
          </h2>
        </div>

        <div className="mb-8">
          {question.type === "MULTIPLE_CHOICE" && renderMultipleChoice()}
          {question.type === "TRUE_FALSE" && renderTrueFalse()}
          {question.type === "FILL_IN_BLANK" && renderFillInBlank()}
        </div>

        {showResult && (
          <div className="mb-6 flex items-center gap-2">
            <CheckCircle
              className={`w-6 h-6 ${
                isCorrect ? "text-green-500" : "text-red-500"
              }`}
            />
            <span
              className={`font-medium ${
                isCorrect ? "text-green-500" : "text-red-500"
              }`}
            >
              {isCorrect ? "¡Correcto!" : "Incorrecto"}
            </span>
          </div>
        )}

        {!hasAnswered && (
          <Button
            onClick={handleSubmitAnswer}
            disabled={!selected}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {question.type === "MULTIPLE_CHOICE" ||
            question.type === "TRUE_FALSE"
              ? "Check Answer →"
              : "Enviar Respuesta"}
          </Button>
        )}

        {hasAnswered && showResult && (
          <Button
            onClick={() => {
              /* Manejar continuar */
            }}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 text-lg font-medium"
          >
            Continue
          </Button>
        )}
      </div>
    </div>
  )
}
