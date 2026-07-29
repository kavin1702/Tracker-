import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const path = await prisma.learningPath.findUnique({
      where: { id },
      include: {
        topics: {
          orderBy: {
            order: 'asc',
          },
        },
        logs: {
          orderBy: {
            loggedAt: 'desc',
          },
          include: {
            topic: true,
          },
        },
      },
    });

    if (!path) {
      return NextResponse.json({ error: 'Learning path not found' }, { status: 404 });
    }

    return NextResponse.json(path);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch path' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { title, description, status } = await req.json();

    const path = await prisma.learningPath.update({
      where: { id },
      data: {
        title,
        description,
        status,
      },
    });

    return NextResponse.json(path);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update path' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.learningPath.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete path' }, { status: 500 });
  }
}
