"use client";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Project {
  id: string;
  created_at: string;
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

export default function ProjectModal(props: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(props.params);
  const slug = resolvedParams.id; 
  
  const router = useRouter();
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProject() {
      if (!slug) return;
      
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("slug", slug)
        .single();

      if (!error) {
        setProject(data);
      }
      setLoading(false);
    }
    fetchProject();
  }, [slug]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 md:p-10">
      <div className="absolute inset-0" onClick={() => router.back()} />
      
      <div className="relative bg-white w-full max-w-4xl h-full rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        
        <div className="px-8 py-5 border-b border-gray-50 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-900 transition text-sm font-medium font-sans">
            Close (ESC)
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-gray-400 font-sans italic">Connecting to Database...</div>
          ) : project ? (
            <>
              <div className="w-full aspect-[21/9] bg-gray-100 overflow-hidden">
                <img 
                  src={project.cover_url || "https://via.placeholder.com/1200x600"} 
                  className="w-full h-full object-cover" 
                  alt={project.title}
                />
              </div>

              <article className="max-w-2xl mx-auto px-8 md:px-0 py-12">
                <header className="mb-10 border-b border-gray-100 pb-8">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-[10px] font-bold bg-sky-100 text-sky-600 px-3 py-1 rounded-full uppercase tracking-widest">
                      {project.category}
                    </span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-gray-900 leading-tight font-sans">
                    {project.title}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-400 font-sans">
                    <span>{project.created_at ? new Date(project.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''}</span>
                    <span>•</span>
                    <span>Case Study</span>
                  </div>
                </header>

                <div className="font-lora text-lg text-gray-700 space-y-8 leading-relaxed">
                  <p className="font-sans font-semibold text-xl text-gray-900 italic border-l-4 border-gray-200 pl-6">
                    {project.description}
                  </p>
                  
                  <div className="whitespace-pre-wrap leading-loose">
                    {project.content || "No detailed content yet."}
                  </div>

                  {/* โซนปุ่มกดทั้งหมด */}
                  <div className="pt-10 flex flex-wrap items-center gap-4 font-sans">
                    
                    {/* ฟังก์ชันเล็กๆ เช็คว่ามี http นำหน้าหรือยัง หรือต้องเติมให้ */}
                    {project.github_url && (
                      <a href={project.github_url.startsWith('http') ? project.github_url : `https://${project.github_url}`} target="_blank" rel="noopener noreferrer" className="px-6 py-2 border border-gray-200 rounded-full hover:bg-gray-50 transition text-sm font-bold">
                        GitHub Repository
                      </a>
                    )}

                    {project.live_url && (
                      <a href={project.live_url.startsWith('http') ? project.live_url : `https://${project.live_url}`} target="_blank" rel="noopener noreferrer" className="px-6 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition text-sm font-bold shadow-lg">
                        Link
                      </a>
                    )}

                    {project.pdf_url && (
                      <a href={project.pdf_url.startsWith('http') ? project.pdf_url : `https://${project.pdf_url}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white border-2 border-gray-900 rounded-full hover:bg-transparent hover:text-gray-900 transition-all text-sm font-bold shadow-lg group">
                        <svg className="w-4 h-4 text-white group-hover:text-gray-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Read More
                      </a>
                    )}
                  </div>

                </div>
              </article>
            </>
          ) : (
            <div className="p-20 text-center font-sans text-gray-500">Project details not found.</div>
          )}
        </div>
      </div>
    </div>
  );
}