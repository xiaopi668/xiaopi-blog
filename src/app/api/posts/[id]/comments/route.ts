import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const comments = await prisma.comment.findMany({
    where: { postId: id },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(comments);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { content, guestName } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: "评论不能为空" }, { status: 400 });
    }

    const session = await auth();
    let userId: string;

    if (session?.user?.id) {
      userId = session.user.id;
    } else if (guestName?.trim()) {
      const guest = await prisma.user.upsert({
        where: { username: "__guest__" },
        update: { name: guestName.trim() },
        create: { username: "__guest__", name: guestName.trim(), password: "", role: "guest" },
      });
      userId = guest.id;
    } else {
      return NextResponse.json({ error: "请提供昵称或登录" }, { status: 401 });
    }

    const comment = await prisma.comment.create({
      data: { content: content.trim(), postId: id, userId },
      include: { user: { select: { id: true, name: true } } },
    });

    return NextResponse.json(comment);
  } catch {
    return NextResponse.json({ error: "评论失败" }, { status: 500 });
  }
}
