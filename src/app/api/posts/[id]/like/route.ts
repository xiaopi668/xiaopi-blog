import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const existing = await prisma.like.findUnique({
      where: { postId_userId: { postId: id, userId: session.user.id } },
    });

    if (existing) {
      return NextResponse.json({ error: "已点赞" }, { status: 400 });
    }

    await prisma.like.create({
      data: { postId: id, userId: session.user.id },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const { id } = await params;

    await prisma.like.deleteMany({
      where: { postId: id, userId: session.user.id },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}
