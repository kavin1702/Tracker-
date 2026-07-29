import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: learningPathId } = await params;
    const { title } = await req.json();

    if (!title) {
      return NextResponse.json({ error: 'Topic title is required' }, { status: 400 });
    }

    // Get the current max order
    const lastTopic = await prisma.topic.findFirst({
      where: { learningPathId },
      orderBy: { order: 'desc' },
    });

    const nextOrder = lastTopic ? lastTopic.order + 1 : 0;

    const topic = await prisma.topic.create({
      data: {
        learningPathId,
        title,
        order: nextOrder,
      },
    });

    return NextResponse.json(topic, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create topic' }, { status: 500 });
  }
}
