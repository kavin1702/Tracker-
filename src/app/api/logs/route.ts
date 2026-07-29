import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pathId = searchParams.get('pathId');

    const logs = await prisma.log.findMany({
      where: pathId ? { learningPathId: pathId } : undefined,
      include: {
        learningPath: {
          select: {
            title: true,
          },
        },
        topic: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        loggedAt: 'desc',
      },
    });

    return NextResponse.json(logs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch logs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { learningPathId, topicId, durationMins, notes, loggedAt } = await req.json();

    if (!learningPathId || !durationMins) {
      return NextResponse.json({ error: 'Learning path and duration are required' }, { status: 400 });
    }

    const parsedLoggedAt = loggedAt ? new Date(loggedAt) : new Date();

    const log = await prisma.log.create({
      data: {
        learningPathId,
        topicId: topicId || null,
        durationMins: parseInt(durationMins, 10),
        notes,
        loggedAt: parsedLoggedAt,
      },
    });

    // Update streak logic
    let streak = await prisma.streak.findFirst();
    if (!streak) {
      streak = await prisma.streak.create({
        data: {
          currentStreak: 1,
          longestStreak: 1,
          lastLoggedAt: parsedLoggedAt,
        },
      });
    } else {
      const now = parsedLoggedAt;
      const lastLogged = streak.lastLoggedAt ? new Date(streak.lastLoggedAt) : null;

      if (!lastLogged) {
        await prisma.streak.update({
          where: { id: streak.id },
          data: {
            currentStreak: 1,
            longestStreak: Math.max(1, streak.longestStreak),
            lastLoggedAt: now,
          },
        });
      } else {
        const isSameDay = (d1: Date, d2: Date) => {
          return d1.getFullYear() === d2.getFullYear() &&
                 d1.getMonth() === d2.getMonth() &&
                 d1.getDate() === d2.getDate();
        };

        const isYesterday = (d1: Date, d2: Date) => {
          const temp = new Date(d1);
          temp.setDate(temp.getDate() - 1);
          return isSameDay(temp, d2);
        };

        if (isSameDay(now, lastLogged)) {
          // Already logged today, keep streak the same, but update timestamp to newest log
          await prisma.streak.update({
            where: { id: streak.id },
            data: {
              lastLoggedAt: now,
            },
          });
        } else if (isYesterday(now, lastLogged)) {
          // Logged yesterday, increment streak
          const nextStreak = streak.currentStreak + 1;
          await prisma.streak.update({
            where: { id: streak.id },
            data: {
              currentStreak: nextStreak,
              longestStreak: Math.max(nextStreak, streak.longestStreak),
              lastLoggedAt: now,
            },
          });
        } else if (now > lastLogged) {
          // Gap of more than 1 day, reset streak to 1
          await prisma.streak.update({
            where: { id: streak.id },
            data: {
              currentStreak: 1,
              longestStreak: Math.max(1, streak.longestStreak),
              lastLoggedAt: now,
            },
          });
        }
      }
    }

    return NextResponse.json(log, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create log' }, { status: 500 });
  }
}
