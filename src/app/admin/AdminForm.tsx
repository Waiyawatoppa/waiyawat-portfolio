"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// นิยาม Type สำหรับข้อมูลโปรเจกต์
interface Project {
  id?: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  cover_url: string;
  category: string;
  github_url?: string;
  live_url?: string;
  pdf_url?: string; 
}

export default function AdminForm({ initialData }: { initialData?: Project }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // เช็คว่าเป็นโหมดแก้ไขหรือไม่
  const isEdit = !!initialData?.id;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const imageFile = formData.get("image_file") as File;
    let finalCoverUrl = formData.get("cover_url") as string || initialData?.cover_url || "";

    // 1. จัดการรูปภาพ (ถ้ามีการเลือกไฟล์ใหม่)
    if (imageFile && imageFile.size > 0) {
      setUploading(true);
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(filePath, imageFile);

      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('project-images').getPublicUrl(filePath);
        finalCoverUrl = urlData.publicUrl;
      }
      setUploading(false);
    }

    // 2. เตรียมข้อมูลสำหรับส่งไป Supabase
    const projectData = {
      title: formData.get("title") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string,
      content: formData.get("content") as string,
      cover_url: finalCoverUrl,
      category: formData.get("category") as string,
      github_url: formData.get("github_url") as string,
      live_url: formData.get("live_url") as string,
      pdf_url: formData.get("pdf_url") as string, 
    };

    // 3. เลือกระหว่าง INSERT หรือ UPDATE
    let result;
    if (isEdit) {
      result = await supabase
        .from("projects")
        .update(projectData)
        .eq("id", initialData.id);
    } else {
      result = await supabase
        .from("projects")
        .insert([projectData]);
    }

    if (result.error) {
      alert("Error: " + result.error.message);
    } else {
      alert(isEdit ? "อัปเดตข้อมูลสำเร็จ!" : "เพิ่มโปรเจกต์สำเร็จ!");
      if (isEdit) {
        router.push("/admin"); // แก้เสร็จให้กลับหน้า Admin
      } else {
        (e.target as HTMLFormElement).reset();
      }
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase text-gray-400">Title</label>
        <input name="title" defaultValue={initialData?.title} required className="p-3 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-sky-500" />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase text-gray-400">Slug</label>
        <input name="slug" defaultValue={initialData?.slug} required className="p-3 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-sky-500" />
      </div>
      <div className="flex flex-col gap-2 md:col-span-2">
        <label className="text-xs font-bold uppercase text-gray-400">Short Description</label>
        <input name="description" defaultValue={initialData?.description} required className="p-3 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-sky-500" />
      </div>
      <div className="flex flex-col gap-2 md:col-span-2">
        <label className="text-xs font-bold uppercase text-gray-400">Full Content</label>
        <textarea name="content" defaultValue={initialData?.content} rows={8} required className="p-3 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-sky-500" />
      </div>
      
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase text-gray-400">Change Cover Image</label>
        <input type="file" name="image_file" accept="image/*" className="text-xs" />
        {initialData?.cover_url && <p className="text-[10px] text-gray-400 italic">มีรูปเดิมอยู่แล้ว หากไม่เลือกใหม่จะใช้รูปเดิม</p>}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase text-gray-400">Category</label>
        <select name="category" defaultValue={initialData?.category} className="p-3 bg-gray-50 rounded-xl border-none outline-none">
          <option value="Tech + Biz">Tech + Biz</option>
          <option value="Business">Business</option>
          <option value="Technology & Engineering">Technology & Engineering</option>
          <option value="Leader">Leader</option>
        </select>
      </div>

      {/* ช่องกรอก URL เพิ่มเติม (เป็น Optional ไม่บังคับกรอก) */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase text-gray-400">GitHub URL (Optional)</label>
        <input name="github_url" defaultValue={initialData?.github_url} placeholder="https://github.com/..." className="p-3 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-sky-500" />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase text-gray-400">Live Website URL (Optional)</label>
        <input name="live_url" defaultValue={initialData?.live_url} placeholder="https://..." className="p-3 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-sky-500" />
      </div>

      <div className="flex flex-col gap-2 md:col-span-2">
        <label className="text-xs font-bold uppercase text-gray-400">PDF / Google Drive URL (Optional)</label>
        <input name="pdf_url" defaultValue={initialData?.pdf_url} placeholder="https://drive.google.com/file/d/..." className="p-3 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-pink-500" />
      </div>

      <button 
        type="submit" 
        disabled={loading || uploading}
        className={`md:col-span-2 py-4 rounded-2xl font-bold transition text-white mt-4 ${isEdit ? 'bg-sky-600 hover:bg-sky-700' : 'bg-gray-900 hover:bg-black'}`}
      >
        {loading ? "Processing..." : (isEdit ? "Update Project" : "Publish Project")}
      </button>
    </form>
  );
}