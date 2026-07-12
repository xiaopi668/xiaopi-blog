import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const role = session.user.role || (await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } }))?.role;
  if (role !== "admin") {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }
  return null;
}

export async function GET() {
  const blocked = await requireAdmin();
  if (blocked) return blocked;

  const users = await prisma.user.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(
    users.map(({ password, ...user }) => ({ ...user, _count: user._count }))
  );
}

export async function POST(req: Request) {
  const blocked = await requireAdmin();
  if (blocked) return blocked;

  try {
    const body = await req.json();
    const { username, name, email, password, role } = body;

    if (!username || !password) {
      return NextResponse.json({ error: "用户名和密码不能为空" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json({ error: "用户名已存在" }, { status: 400 });
    }

    if (email) {
      const emailExists = await prisma.user.findFirst({ where: { email } });
      if (emailExists) {
        return NextResponse.json({ error: "邮箱已被使用" }, { status: 400 });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        name,
        email: email || null,
        password: hashedPassword,
        role: role ?? "editor",
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
