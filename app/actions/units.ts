'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

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
