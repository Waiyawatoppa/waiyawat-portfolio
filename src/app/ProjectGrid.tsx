"use client"
import { useState } from "react";
import Link from 'next/link';
import Image from "next/image";

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  cover_url: string;
}

const CATEGORIES = ["All", "Tech + Biz" , "Business", "Technology & Engineering", "Leader"];

export default function ProjectGrid({ projects }: { projects: Project[] }) {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredProjects = activeCategory === "All" 
    ? projects 
    : projects.filter((p) => p.category?.toLowerCase() === activeCategory.toLowerCase());

  // ฟังก์ชันสำหรับจัดการสี Label ตามหมวดหมู่
  const getCategoryColor = (category: string) => {
    const cat = category?.toLowerCase() || "";
    if (cat === "tech + biz") return "bg-sky-500 text-white";
    if (cat === "business") return "bg-pink-500 text-white";
    if (cat === "technology & engineering") return "bg-orange-500 text-white";
    if (cat === "leader") return "bg-emerald-500 text-white";
    return "bg-gray-800 text-white"; // สี Default เผื่อมีหมวดหมู่ใหม่ในอนาคต
  };

  return (
    <div className="w-full">
      {/* 1. ส่วนเมนู Filter */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
              activeCategory === cat
                ? "bg-gray-900 text-white shadow-md scale-105" 
                : "bg-gray-100 text-gray-500 hover:bg-gray-200" 
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 2. ส่วนแสดงผลการ์ดผลงาน */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {filteredProjects?.map((p, index) => (
          <Link 
            key={p.id} 
            href={`/project/${p.slug}`} 
            className="group transition-all duration-500 overflow-hidden bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 animate-in fade-in zoom-in duration-500"
          >
            <div className="aspect-[16/10] overflow-hidden bg-gray-50 relative">
              <Image 
                src={p.cover_url || "https://via.placeholder.com/1200x800"} 
                alt={p.title} 
                fill 
                className="object-cover group-hover:scale-110 transition duration-700 ease-in-out" 
                sizes="(max-width: 768px) 100vw, 50vw" 
                priority={index < 2}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
            </div>
            <div className="p-10">
              {/* เรียกใช้ฟังก์ชันสี */}
              <span className={`text-[10px] font-black px-4 py-1.5 rounded-full mb-6 inline-block tracking-widest uppercase shadow-sm ${getCategoryColor(p.category)}`}>
                {p.category || "Project"}
              </span>
              <h3 className="text-3xl font-bold mb-3 tracking-tight text-gray-900 font-sans group-hover:text-sky-600 transition-colors">
                {p.title}
              </h3>
              <p className="text-gray-500 text-base mb-8 leading-relaxed font-sans line-clamp-2">
                {p.description}
              </p>
              <div className="text-gray-900 text-sm font-bold flex items-center gap-2 group-hover:gap-4 transition-all">
                View Project <span className="text-lg">→</span>
              </div>
            </div>
          </Link>
        ))}

        {filteredProjects?.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-100 rounded-3xl">
            <p className="text-gray-400 font-sans italic text-lg">No projects found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}