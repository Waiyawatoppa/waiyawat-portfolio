import Link from "next/link";
import { redirect } from "next/navigation";

import { auth, signOut } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { supabase } from "@/lib/supabase";
import type { Slide, TimelineEntry } from "@/lib/types";
import AdminForm from "./AdminForm";
import ProjectList, { type ProjectRow } from "./ProjectList";
import SlideManager from "./SlideManager";
import TimelineManager from "./TimelineManager";

export const metadata = { robots: { index: false, follow: false } };

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  const session = await auth();

  const [{ data: projects }, { data: slides }, { data: timeline }] =
    await Promise.all([
      supabase
        .from("projects")
        .select("id, title, slug, category, published, created_at")
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

  const projectRows = (projects ?? []) as ProjectRow[];

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

        <ProjectList projects={projectRows} />

      </div>
    </div>
  );
}
