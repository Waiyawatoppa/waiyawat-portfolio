import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminForm from "../../AdminForm";
import Link from "next/link";

export default async function EditProjectPage(props: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await props.params;

  if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
    redirect("/");
  }

  // ดึงข้อมูลโปรเจกต์จาก ID
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (!project) {
    return <div className="p-20 text-center">Project not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-6 font-sans">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin" className="text-sm text-gray-400 hover:text-sky-500 transition flex items-center gap-2 mb-6">
          ← Back to Dashboard
        </Link>
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold mb-8">Edit Project: {project.title}</h1>
          {/* ส่งข้อมูลเก่าไปให้ฟอร์ม */}
          <AdminForm initialData={project} />
        </div>
      </div>
    </div>
  );
}