import { PostForm } from "@/components/admin/post-form";

export default function NewPostPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">写文章</h1>
      <PostForm />
    </div>
  );
}
