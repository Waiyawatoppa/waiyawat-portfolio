import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminForm from "./AdminForm"; 
import DeleteButton from "./DeleteButton";
import Link from 'next/link';
import SlideManager from "./SlideManager";

export default async function AdminPage() {
  const session = await auth();

  // Security Check: ถ้ายังไม่ Login หรือ Email ไม่ตรงกับที่ตั้งไว้ ให้กลับหน้าแรก
  if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
    redirect("/");
  }

  // ดึงข้อมูลโปรเจกต์ที่มีอยู่มาโชว์
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold font-sans tracking-tight">Admin Dashboard</h1>
            <p className="text-gray-500 font-sans">Hello Waiyawat, Manage your Business & Tech Portfolio</p>
          </div>
          <div className="flex flex-col items-end gap-2 text-right text-xs font-mono text-gray-400">
            <span>Logged in as: {session.user?.email}</span>
            <Link href="/" className="text-sky-500 hover:text-sky-600 transition font-sans underline">
              ← Back to Home
            </Link>
          </div>
        </header>

        {/* ส่วนที่ 1: ฟอร์มเพิ่มโปรเจกต์ใหม่ */}
        <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-10">
          <h2 className="text-xl font-bold mb-6 font-sans">Add New Project</h2>
          <AdminForm />
        </section>

        {/* ส่วนที่ 2: ระบบจัดการรูป Slider */}
        <section className="mb-10">
          <SlideManager />
        </section>

        {/* ส่วนที่ 3: รายการโปรเจกต์ที่มีอยู่ */}
        <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6 font-sans">Existing Projects</h2>
          <div className="space-y-4">
            {projects?.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-4 border rounded-2xl hover:bg-gray-50 transition">
                <div>
                  <p className="font-bold">{p.title}</p>
                  <p className="text-xs text-gray-400">slug: {p.slug}</p>
                </div>
                
                {/* จัดกลุ่ม Category และปุ่มให้อยู่ฝั่งขวาด้วยกัน */}
                <div className="flex items-center gap-4">
                  <span className="text-[10px] bg-gray-100 px-2 py-1 rounded-full uppercase font-bold">{p.category}</span>
                  <div className="flex items-center gap-2">
                    <Link 
                      href={`/admin/edit/${p.id}`}
                      className="text-xs font-bold text-gray-400 hover:text-sky-500 transition p-2 hover:bg-sky-50 rounded-lg"
                    >
                      Edit
                    </Link>
                    <DeleteButton id={p.id} title={p.title} />
                  </div>
                </div>
                
              </div>
            ))}
            
            {(!projects || projects.length === 0) && (
              <div className="text-center py-10 text-gray-400 text-sm">
                ยังไม่มีโปรเจกต์ในระบบ
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}