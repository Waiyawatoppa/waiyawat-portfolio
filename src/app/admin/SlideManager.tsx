"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

interface AboutSlide {
  id: string;
  image_url: string;
  created_at?: string;
}

export default function SlideManager() {
  const [slides, setSlides] = useState<AboutSlide[]>([]);
  const [uploading, setUploading] = useState(false);

  const fetchSlides = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("about_slides")
        .select("*")
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      if (data) setSlides(data);
    } catch (err) {
      console.error("Error fetching slides:", err);
    }
  }, []);

  useEffect(() => { 
    fetchSlides(); 
  }, [fetchSlides]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    
    try {
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('about-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('about-images')
        .getPublicUrl(fileName);
        
      const { error: dbError } = await supabase
        .from("about_slides")
        .insert([{ image_url: urlData.publicUrl }]);
        
      if (dbError) throw dbError;

      await fetchSlides();
      
    } catch (err) {
      if (err instanceof Error) {
        alert("อัปโหลดไม่สำเร็จ: " + err.message);
      } else {
        alert("อัปโหลดไม่สำเร็จ: เกิดข้อผิดพลาดที่ไม่รู้จัก");
      }
    } finally {
      setUploading(false);
      e.target.value = ''; 
    }
  }

  async function handleDelete(id: string, url: string) {
    if (!confirm("ลบรูปนี้ใช่ไหม?")) return;
    
    try {
      const filePath = url.split('/').pop();
      if (filePath) {
        await supabase.storage.from('about-images').remove([filePath]);
      }
      
      const { error } = await supabase.from("about_slides").delete().eq("id", id);
      if (error) throw error;
      
      await fetchSlides();
      
    } catch (err) {
      if (err instanceof Error) {
        alert("ลบไม่สำเร็จ: " + err.message);
      } else {
        alert("ลบไม่สำเร็จ: เกิดข้อผิดพลาดที่ไม่รู้จัก");
      }
    }
  }

  return (
    <div className="space-y-6 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 font-sans">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-700">Manage About Slider</h3>
        <label className="cursor-pointer bg-sky-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-sky-600 transition">
          {uploading ? "Uploading..." : "+ Add Slide"}
          <input type="file" accept="image/*" hidden onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {slides.map((s) => (
          <div key={s.id} className="relative aspect-square rounded-xl overflow-hidden group border border-gray-200">
            <Image 
              src={s.image_url} 
              alt="Slide image" 
              fill 
              className="object-cover group-hover:scale-105 transition duration-500" 
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            <button 
              onClick={() => handleDelete(s.id, s.image_url)}
              className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center font-bold text-xs"
            >
              Delete
            </button>
          </div>
        ))}
        {slides.length === 0 && !uploading && (
           <div className="col-span-full py-10 text-center text-sm text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
             ยังไม่มีรูปภาพในสไลด์ อัปโหลดเลย!
           </div>
        )}
      </div>
    </div>
  );
}