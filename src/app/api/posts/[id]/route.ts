import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      tags: { include: { tag: true } },
      author: { select: { name: true } },
    },
  });
  if (!post) return NextResponse.json({ error: "文章不存在" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const role = session.user.role || (await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } }))?.role;
  if (role !== "admin" && role !== "editor") return NextResponse.json({ error: "无权限" }, { status: 403 });

  try {
    const { id } = await params;

    if (role === "editor") {
      const post = await prisma.post.findUnique({ where: { id }, select: { authorId: true } });
      if (!post || post.authorId !== session.user.id) {
        return NextResponse.json({ error: "只能编辑自己的文章" }, { status: 403 });
      }
    }

    const body = await req.json();
    const { title, slug, excerpt, content, coverImage, published, tags } = body;

    if (slug) {
      const existing = await prisma.post.findUnique({ where: { slug } });
      if (existing && existing.id !== id) {
        return NextResponse.json({ error: "该 slug 已被使用" }, { status: 400 });
      }
    }

    const data: Record<string, unknown> = {};
    if (title !== undefined) data.title = title;
    if (slug !== undefined) data.slug = slug;
    if (excerpt !== undefined) data.excerpt = excerpt;
    if (content !== undefined) data.content = content;
    if (coverImage !== undefined) data.coverImage = coverImage;
    if (published !== undefined) data.published = published;

    if (tags !== undefined) {
      await prisma.postTag.deleteMany({ where: { postId: id } });
      data.tags = {
        create: await Promise.all(
          (tags as string[]).map(async (name: string) => {
            const tag = await prisma.tag.upsert({
              where: { name },
              update: {},
              create: {
                name,
                slug: name
                  .toLowerCase()
                  .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
                  .replace(/(^-|-$)/g, ""),
              },
            });
            return { tagId: tag.id };
          })
        ),
      };
    }

    const post = await prisma.post.update({
      where: { id },
      data,
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const role = session.user.role || (await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } }))?.role;
  if (role !== "admin" && role !== "editor") {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  try {
    const { id } = await params;

    if (role === "editor") {
      const post = await prisma.post.findUnique({ where: { id }, select: { authorId: true } });
      if (!post || post.authorId !== session.user.id) {
        return NextResponse.json({ error: "只能删除自己的文章" }, { status: 403 });
      }
    }

    await prisma.postTag.deleteMany({ where: { postId: id } });
    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
