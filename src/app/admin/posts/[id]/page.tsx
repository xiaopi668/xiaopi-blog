import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PostForm } from "@/components/admin/post-form";

async function getPost(id: string) {
  return prisma.post.findUnique({
    where: { id },
    include: {
      tags: { include: { tag: true } },
    },
  });
}

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">编辑文章</h1>
      <PostForm post={post} />
    </div>
  );
}
