import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET() {
  const media = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(media);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const role = session.user.role || (await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } }))?.role;
  if (role !== "admin") return NextResponse.json({ error: "无权限" }, { status: 403 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "未选择文件" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `${Date.now()}-${file.name}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);

    const media = await prisma.media.create({
      data: {
        filename: file.name,
        url: `/uploads/${filename}`,
        mimeType: file.type,
        size: file.size,
        uploadedId: session.user.id,
      },
    });

    return NextResponse.json(media);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "上传失败" }, { status: 500 });
  }
}
