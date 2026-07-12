import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const role = session.user.role || (await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } }))?.role;
  if (role !== "admin") {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    if (user.role === "admin") {
      const adminCount = await prisma.user.count({ where: { role: "admin" } });
      if (adminCount <= 1) {
        return NextResponse.json({ error: "至少保留一名管理员" }, { status: 400 });
      }
    }

    await prisma.postTag.deleteMany({ where: { post: { authorId: id } } });
    await prisma.post.deleteMany({ where: { authorId: id } });
    await prisma.media.deleteMany({ where: { uploadedId: id } });
    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
