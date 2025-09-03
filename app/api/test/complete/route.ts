import {NextRequest, NextResponse} from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
	try {
		const {testAttemptId} = await request.json();

		if (!testAttemptId) {
			return NextResponse.json(
				{error: "testAttemptId es requerido"},
				{status: 400}
			);
		}

		// Obtener el intento con todas sus respuestas
		const testAttempt = await prisma.testAttempt.findFirst({
			where: {id: testAttemptId},
			include: {
				answers: true,
				lesson: true,
			},
		});

		if (!testAttempt) {
			return NextResponse.json(
				{error: "Intento de test no encontrado"},
				{status: 404}
			);
		}

		if (testAttempt.isCompleted) {
			return NextResponse.json(
				{error: "El test ya ha sido completado"},
				{status: 400}
			);
		}

		// Calcular resultados
		const correctAnswers = testAttempt.answers.filter(
			(answer) => answer.isCorrect
		).length;
		const score = (correctAnswers / testAttempt.totalQuestions) * 100;

		// Actualizar el intento de test
		const updatedTestAttempt = await prisma.testAttempt.update({
			where: {id: testAttemptId},
			data: {
				correctAnswers,
				score,
				isCompleted: true,
				completedAt: new Date(),
			},
		});

		// Si el score es >= 70, marcar la lección como completada y otorgar puntos de experiencia
		const passScore = 70;
		if (score >= passScore) {
			// Verificar si ya existe progreso para esta lección
			const existingProgress = await prisma.userProgress.findFirst({
				where: {
					userId: testAttempt.userId,
					lessonId: testAttempt.lessonId,
				},
			});

			if (!existingProgress || !existingProgress.isCompleted) {
				await prisma.userProgress.upsert({
					where: {
						userId_lessonId: {
							userId: testAttempt.userId,
							lessonId: testAttempt.lessonId,
						},
					},
					update: {
						isCompleted: true,
						experiencePoints: testAttempt.lesson.experiencePoints,
						completedAt: new Date(),
					},
					create: {
						userId: testAttempt.userId,
						lessonId: testAttempt.lessonId,
						isCompleted: true,
						experiencePoints: testAttempt.lesson.experiencePoints,
						completedAt: new Date(),
					},
				});

				// Actualizar racha del usuario
				await prisma.userStreak.upsert({
					where: {userId: testAttempt.userId},
					update: {
						currentStreak: {increment: 1},
						lastActivity: new Date(),
					},
					create: {
						userId: testAttempt.userId,
						currentStreak: 1,
						longestStreak: 1,
						lastActivity: new Date(),
					},
				});

				// Actualizar la racha más larga si es necesario
				const userStreak = await prisma.userStreak.findUnique({
					where: {userId: testAttempt.userId},
				});

				if (userStreak && userStreak.currentStreak > userStreak.longestStreak) {
					await prisma.userStreak.update({
						where: {userId: testAttempt.userId},
						data: {longestStreak: userStreak.currentStreak},
					});
				}
			}
		}

		return NextResponse.json({
			success: true,
			results: {
				score,
				correctAnswers,
				totalQuestions: testAttempt.totalQuestions,
				passed: score >= passScore,
				experienceGained:
					score >= passScore ? testAttempt.lesson.experiencePoints : 0,
			},
		});
	} catch (error) {
		console.error("Error al completar test:", error);
		return NextResponse.json(
			{error: "Error interno del servidor"},
			{status: 500}
		);
	}
}
