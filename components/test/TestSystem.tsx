"use client";
import {useState, useEffect} from "react";
import {LessonCard} from "./LessonCard";
import {TestQuestion} from "./TestQuestion";
import {TestResults} from "./TestResults";
import {useTest} from "@/hooks/useTest";

import type {
	TestData,
	Question,
	TestResultsInterface as TestResultsType,
} from "@/lib/types";

interface TestSystemProps {
	userId: string;
	initialLessons: {
		id: number;
		name: string;
		description: string | null;
		experiencePoints: number;
	}[];
}

type TestState = "lessons" | "testing" | "results";

export function TestSystem({userId, initialLessons}: TestSystemProps) {
	const [state, setState] = useState<TestState>("lessons");
	const [currentTest, setCurrentTest] = useState<TestData | null>(null);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [answers, setAnswers] = useState<{
		[questionId: number]: {answer: string; isCorrect: boolean};
	}>({});
	const [results, setResults] = useState<TestResultsType | null>(null);
	const [questionStartTime, setQuestionStartTime] = useState<number>(
		Date.now()
	);

	const {isLoading, error, startTest, submitAnswer, completeTest} = useTest();

	const handleStartTest = async (lessonId: number) => {
		const testData = await startTest(userId, lessonId);
		if (testData) {
			setCurrentTest(testData);
			setCurrentQuestionIndex(0);
			setAnswers({});
			setQuestionStartTime(Date.now());
			setState("testing");
		}
	};

	const handleAnswer = async (questionId: number, answer: string) => {
		if (!currentTest) return;

		const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
		const result = await submitAnswer(
			currentTest.testAttemptId,
			questionId,
			answer,
			timeSpent
		);

		if (result) {
			setAnswers((prev) => ({
				...prev,
				[questionId]: {answer, isCorrect: result.isCorrect},
			}));

			// Mostrar resultado por 2 segundos, luego continuar
			setTimeout(() => {
				if (currentQuestionIndex < currentTest.questions.length - 1) {
					setCurrentQuestionIndex((prev) => prev + 1);
					setQuestionStartTime(Date.now());
				} else {
					handleCompleteTest();
				}
			}, 2000);
		}
	};

	const handleCompleteTest = async () => {
		if (!currentTest) return;

		const testResults = await completeTest(currentTest.testAttemptId);
		if (testResults) {
			setResults(testResults);
			setState("results");
		}
	};

	const handleReturnToLessons = () => {
		setState("lessons");
		setCurrentTest(null);
		setResults(null);
		setCurrentQuestionIndex(0);
		setAnswers({});
	};

	const handleRetakeTest = () => {
		if (currentTest) {
			handleStartTest(currentTest.lesson.id);
		}
	};

	if (error) {
		return (
			<div className="bg-gray-900 min-h-screen p-6 flex items-center justify-center">
				<div className="bg-red-500/20 border border-red-500 rounded-lg p-6 max-w-md w-full text-center">
					<h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
					<p className="text-gray-300">{error}</p>
					<button
						onClick={handleReturnToLessons}
						className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
					>
						Volver
					</button>
				</div>
			</div>
		);
	}

	if (state === "lessons") {
		return (
			<div className="bg-gray-900 min-h-screen p-6">
				<div className="max-w-4xl mx-auto">
					<div className="mb-8">
						<div className="flex items-center gap-3 mb-4">
							<div className="p-2 bg-blue-500 rounded-lg">
								<svg
									className="w-6 h-6 text-white"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
									/>
								</svg>
							</div>
							<h1 className="text-3xl font-bold text-white">
								Lecciones de Matemáticas Básicas
							</h1>
						</div>
						<p className="text-gray-300 text-lg">
							Progresa a través de las lecciones para dominar esta unidad
						</p>
					</div>

					<div className="space-y-6">
						{initialLessons.map((lesson) => (
							<LessonCard
								key={lesson.id}
								lesson={lesson}
								onStartTest={handleStartTest}
								isLoading={isLoading}
							/>
						))}
					</div>
				</div>
			</div>
		);
	}

	if (state === "testing" && currentTest) {
		const currentQuestion = currentTest.questions[currentQuestionIndex];
		const questionAnswer = answers[currentQuestion.id];

		return (
			<>
				{/* Progress bar */}
				<div className="bg-gray-800 p-4">
					<div className="max-w-2xl mx-auto">
						<div className="flex justify-between items-center mb-2">
							<span className="text-gray-300 text-sm">
								Pregunta {currentQuestionIndex + 1} de{" "}
								{currentTest.totalQuestions}
							</span>
							<span className="text-gray-300 text-sm">
								{currentTest.lesson.name}
							</span>
						</div>
						<div className="w-full bg-gray-700 rounded-full h-2">
							<div
								className="bg-blue-500 h-2 rounded-full transition-all duration-300"
								style={{
									width: `${
										((currentQuestionIndex + 1) / currentTest.totalQuestions) *
										100
									}%`,
								}}
							/>
						</div>
					</div>
				</div>

				<TestQuestion
					question={currentQuestion}
					onAnswer={handleAnswer}
					showResult={!!questionAnswer}
					isCorrect={questionAnswer?.isCorrect}
					selectedAnswer={questionAnswer?.answer}
				/>
			</>
		);
	}

	if (state === "results" && results && currentTest) {
		return (
			<TestResults
				results={results}
				lessonName={currentTest.lesson.name}
				onReturnToLessons={handleReturnToLessons}
				onRetakeTest={results.passed ? undefined : handleRetakeTest}
			/>
		);
	}

	return null;
}
