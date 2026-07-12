import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { username, password, name } = await req.json();

    if (!username?.trim() || !password?.trim()) {
      return NextResponse.json({ error: "用户名和密码不能为空" }, { status: 400 });
    }
    if (username.length < 3 || username.length > 20) {
      return NextResponse.json({ error: "用户名长度需在 3-20 个字符之间" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "密码长度至少 6 个字符" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { username: username.trim() } });
    if (existing) {
      return NextResponse.json({ error: "用户名已存在" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        username: username.trim(),
        name: name?.trim() || username.trim(),
        password: hashedPassword,
        role: "user",
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "注册失败" }, { status: 500 });
  }
}
