import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    let streak = await prisma.streak.findFirst();
    if (!streak) {
      streak = await prisma.streak.create({
        data: {
          currentStreak: 0,
          longestStreak: 0,
        },
      });
    }
    return NextResponse.json(streak);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch streak' }, { status: 500 });
  }
}
