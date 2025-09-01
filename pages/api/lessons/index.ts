import { prisma } from '../../../lib/prisma';

export default async function handle(req, res) {
  if (req.method === 'GET') {
    const lessons = await prisma.lesson.findMany();
    res.json(lessons);
  } else if (req.method === 'POST') {
    const { name, unitId, mandatory, experiencePoints, order } = req.body;
    try {
      const newLesson = await prisma.lesson.create({
        data: {
          name,
          unit: { connect: { id: parseInt(unitId) } },
          mandatory,
          experiencePoints,
          order,
        },
      });
      res.status(201).json(newLesson);
    } catch (error) {
      console.error("Error creating lesson:", error);
      res.status(500).json({ error: "Failed to create lesson" });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
