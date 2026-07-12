import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const posts = await prisma.post.findMany({
    include: {
      tags: { include: { tag: true } },
      author: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(posts);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const role = session.user.role || (await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } }))?.role;
  if (role !== "admin" && role !== "editor") return NextResponse.json({ error: "无权限" }, { status: 403 });

  try {
    const body = await req.json();
    const { title, slug, excerpt, content, coverImage, published, tags } = body;

    const existingSlug = await prisma.post.findUnique({ where: { slug } });
    if (existingSlug) {
      return NextResponse.json({ error: "该 slug 已被使用" }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        coverImage,
        published,
        authorId: session.user.id,
        tags: {
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
        },
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
