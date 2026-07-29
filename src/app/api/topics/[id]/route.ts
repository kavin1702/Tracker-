import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { title, isCompleted, order } = await req.json();

    const topic = await prisma.topic.update({
      where: { id },
      data: {
        title,
        isCompleted,
        order,
      },
    });

    return NextResponse.json(topic);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update topic' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.topic.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete topic' }, { status: 500 });
  }
}
