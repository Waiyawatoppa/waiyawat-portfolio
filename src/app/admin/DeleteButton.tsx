"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function DeleteButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {

    // 1. ถามเพื่อความแน่ใจ
    const confirmDelete = confirm(`Confirm deletion of this post? "${title}"?`);
    if (!confirmDelete) return;

    setIsDeleting(true);

    // 2. สั่งลบใน Database
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Delete Error: " + error.message);
    } else {
      alert("Deleted Successfully");
      router.refresh(); // รีเฟรชหน้าเพื่ออัปเดตรายการ
    }
    setIsDeleting(false);
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-xs font-bold text-red-400 hover:text-red-600 transition p-2 hover:bg-red-50 rounded-lg disabled:opacity-50"
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}