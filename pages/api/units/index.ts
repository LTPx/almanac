import { prisma } from '../../../lib/prisma';

export default async function handle(req, res) {
  if (req.method === 'GET') {
    const units = await prisma.unit.findMany();
    res.json(units);
  } else if (req.method === 'POST') {
    const { name } = req.body;
    const newUnit = await prisma.unit.create({
      data: { name },
    });
    res.status(201).json(newUnit);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
