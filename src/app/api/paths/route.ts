import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const paths = await prisma.learningPath.findMany({
      include: {
        topics: {
          orderBy: {
            order: 'asc',
          },
        },
        _count: {
          select: {
            logs: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(paths);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch paths' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, description, topics } = await req.json();
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const path = await prisma.learningPath.create({
      data: {
        title,
        description,
        topics: topics && topics.length > 0 ? {
          create: topics.map((topicTitle: string, index: number) => ({
            title: topicTitle,
            order: index,
          })),
        } : undefined,
      },
      include: {
        topics: true,
      },
    });

    return NextResponse.json(path, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create path' }, { status: 500 });
  }
}
