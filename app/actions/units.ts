'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function createUnit(formData: FormData) {
  const name = formData.get('name') as string;

  if (!name) {
    return { error: 'Name is required' };
  }

  try {
    await prisma.unit.create({
      data: {
        name,
      },
    });
    revalidatePath('/admin/units');
    return { success: 'Unit created successfully' };
  } catch (error) {
    return { error: 'Failed to create unit' };
  }
}
