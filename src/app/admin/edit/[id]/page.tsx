import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { isAdmin } from "@/lib/admin";
import { getAllTags } from "@/lib/projects";
import { supabase } from "@/lib/supabase";
import type { Project } from "@/lib/types";
import AdminForm from "../../AdminForm";

export const metadata = { robots: { index: false, follow: false } };

export default async function EditProjectPage(props: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");

  const { id } = await props.params;

  const [{ data: project }, allTags] = await Promise.all([
    supabase.from("projects").select("*").eq("id", id).maybeSingle(),
    getAllTags(true),
  ]);

  if (!project) notFound();

  return (
    <div className="min-h-dvh bg-gray-50 pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/admin"
          className="text-sm text-gray-700 hover:text-sky-700 transition inline-flex items-center gap-2 mb-6"
        >
          ← Back to dashboard
        </Link>
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold mb-8">
            Edit Project: {(project as Project).title}
          </h1>
          <AdminForm initialData={project as Project} allTags={allTags} />
        </div>
      </div>
    </div>
  );
}
