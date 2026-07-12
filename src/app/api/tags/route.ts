import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const tags = await prisma.tag.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { posts: { _count: "desc" } },
  });
  return NextResponse.json(tags);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const role = session.user.role || (await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } }))?.role;
  if (role !== "admin") return NextResponse.json({ error: "无权限" }, { status: 403 });
  try {
    const body = await req.json();
    const { name } = body;

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const existing = await prisma.tag.findUnique({ where: { name } });
    if (existing) {
      return NextResponse.json({ error: "标签已存在" }, { status: 400 });
    }

    const tag = await prisma.tag.create({ data: { name, slug } });
    return NextResponse.json(tag);
  } catch {
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
