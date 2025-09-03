"use client";

import {TestData, TestResultsInterface} from "@/lib/types";
import {useState} from "react";

export function useTest() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const startTest = async (
		userId: string,
		lessonId: number
	): Promise<TestData | null> => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch("/api/test/start", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({userId, lessonId}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Error al iniciar el test");
			}

			const data = await response.json();
			return data;
		} catch (err) {
			setError(err instanceof Error ? err.message : "Error desconocido");
			return null;
		} finally {
			setIsLoading(false);
		}
	};

	const submitAnswer = async (
		testAttemptId: number,
		questionId: number,
		userAnswer: string,
		timeSpent?: number
	) => {
		try {
			const response = await fetch("/api/test/submit-answer", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					testAttemptId,
					questionId,
					userAnswer,
					timeSpent,
				}),
			});

			const data = await response.json();
			return data;
		} catch (err) {
			console.error("Error al enviar respuesta:", err);
			return null;
		}
	};

	const completeTest = async (
		testAttemptId: number
	): Promise<TestResultsInterface | null> => {
		setIsLoading(true);

		try {
			const response = await fetch("/api/test/complete", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({testAttemptId}),
			});

			const data = await response.json();
			return data.results;
		} catch (err) {
			console.error("Error al completar test:", err);
			return null;
		} finally {
			setIsLoading(false);
		}
	};

	return {
		isLoading,
		error,
		startTest,
		submitAnswer,
		completeTest,
	};
}
