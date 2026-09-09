import Link from "next/link";
import { redirect } from "next/navigation";

import { auth, signOut } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { supabase } from "@/lib/supabase";
import type { Project, Slide, TimelineEntry } from "@/lib/types";
import AdminForm from "./AdminForm";
import ConfirmDelete from "./ConfirmDelete";
import SlideManager from "./SlideManager";
import TimelineManager from "./TimelineManager";
import { deleteProject } from "./actions";

export const metadata = { robots: { index: false, follow: false } };

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  const session = await auth();

  const [{ data: projects }, { data: slides }, { data: timeline }] =
    await Promise.all([
      supabase
        .from("projects")
        .select("id, title, slug, category")
        .order("created_at", { ascending: false }),
      supabase
        .from("about_slides")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("timeline_entries")
        .select("*")
        .order("sort_order", { ascending: false })
        .order("created_at", { ascending: false }),
    ]);

  const projectRows = (projects ?? []) as Pick<
    Project,
    "id" | "title" | "slug" | "category"
  >[];

  return (
    <div className="min-h-dvh bg-gray-50 pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 flex flex-wrap justify-between items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-gray-700">
              Manage your business and tech portfolio.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 text-right text-xs text-gray-700">
            <span>Signed in as {session?.user?.email}</span>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-sky-700 hover:text-sky-900 transition underline"
              >
                ← Back to site
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button className="font-bold text-red-700 hover:text-red-900 transition">
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </header>

        <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-10">
          <h2 className="text-xl font-bold mb-6">Add New Project</h2>
          <AdminForm />
        </section>

        <section className="mb-10">
          <SlideManager slides={(slides ?? []) as Slide[]} />
        </section>

        <section className="mb-10">
          <TimelineManager entries={(timeline ?? []) as TimelineEntry[]} />
        </section>

        <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6">Existing Projects</h2>
          <ul className="space-y-4 list-none p-0">
            {projectRows.map((project) => (
              <li
                key={project.id}
                className="flex flex-wrap items-center justify-between gap-4 p-4 border border-gray-200 rounded-2xl"
              >
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 truncate">
                    {project.title}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    /project/{project.slug}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full uppercase font-bold tracking-wide">
                    {project.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/edit/${project.id}`}
                      className="text-xs font-bold text-gray-700 hover:text-sky-700 transition p-2 hover:bg-sky-50 rounded-lg"
                    >
                      Edit
                      <span className="sr-only"> {project.title}</span>
                    </Link>
                    <ConfirmDelete
                      action={deleteProject}
                      fields={{ id: project.id }}
                      itemLabel={project.title}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {projectRows.length === 0 && (
            <p className="text-center py-10 text-gray-600 text-sm">
              No projects yet. Add your first one above.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
