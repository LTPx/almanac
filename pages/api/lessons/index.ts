import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

export default async function handle(req, res) {
  if (req.method === 'GET') {
    const lessons = await prisma.lesson.findMany();
    res.json(lessons);
  } else if (req.method === 'POST') {
    const { name, unitId } = req.body;
    const newLesson = await prisma.lesson.create({
      data: {
        name,
        unit: { connect: { id: parseInt(unitId) } },
      },
    });
    res.status(201).json(newLesson);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
