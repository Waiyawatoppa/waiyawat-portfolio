import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { auth, signIn, signOut } from "@/auth";
import ProjectGrid from "./ProjectGrid";
import { SocialIcon } from 'react-social-icons';
import AboutSlider from "./AboutSlider";
import TechStack from "./TechStack";
import Image from "next/image";

export default async function Home() {
  const session = await auth(); // ดึงข้อมูลการ Login
  
  // ดึงข้อมูลจาก Supabase
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  const { data: slides } = await supabase.from('about_slides').select('*').order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching projects:", error);
  }

  return (
    <main className="bg-white min-h-screen">
      {/* Navigation */}
      <nav className="fixed w-full z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="font-bold text-xl tracking-tight uppercase font-sans">
            Waiya<span className="text-sky-500">wat.</span>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="hidden md:flex space-x-8 text-sm font-medium text-gray-600">
              <a href="#" className="hover:text-sky-500 transition">CV / Resume</a>
              <a href="#" className="hover:text-sky-500 transition">My Journey</a>
            </div>

            {/* Auth Section ใน Navbar */}
            <div className="flex items-center gap-4 border-l pl-8 border-gray-200">
              {session ? (
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Admin Session</span>
                    <span className="text-xs text-gray-600">{session.user?.email}</span>
                  </div>
                  <form action={async () => { "use server"; await signOut(); }}>
                    <button className="text-xs font-bold text-red-500 hover:text-red-700 transition">Logout</button>
                  </form>
                  {/* ปุ่มไปหน้า Admin */}
                  <Link href="/admin" className="bg-gray-900 text-white px-4 py-2 rounded-full text-xs font-medium">Dashboard</Link>
                </div>
              ) : (
                <form action={async () => { "use server"; await signIn("google"); }}>
                  <button className="text-xs font-bold text-gray-500 hover:text-sky-500 transition uppercase tracking-widest">
                    Login
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight font-sans leading-tight">
            Bridging <span className="bg-gradient-to-r from-sky-500 to-pink-500 bg-clip-text text-transparent font-extrabold">Business Strategy</span> <br />
            with Technology.
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed font-sans">
            Waiyawat Aphiraktanon, CS Student @ Kasetsart University. Focused on building tech solutions for positive social impact.
          </p>
          <div className="flex justify-center space-x-4">
            <div className="h-1 w-20 bg-sky-500 rounded-full" />
            <div className="h-1 w-20 bg-pink-500 rounded-full" />
          </div>
        </div>
      </section>

      {/* ส่วนที่เพิ่มใหม่: About Me Section */}
      <section id="about" className="max-w-6xl mx-auto px-6 py-16 mb-10 border-t border-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* คอลัมน์ซ้าย: รูปภาพสไลด์ */}
          <div className="w-full">
            <AboutSlider initialSlides={slides || []} />
          </div>

          {/* คอลัมน์ขวา: เรื่องราว (Story) */}
        <div className="font-sans">
          <h2 className="text-xs uppercase tracking-[0.3em] font-bold text-gray-400 mb-4">
            About Me
          </h2>
          <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight">
            Technology Creating <span className="text-sky-500">Positive Impact</span> for <span className="text-pink-500">Business and Society</span>.
          </h3>
          
          <div className="space-y-5 text-gray-700 leading-relaxed text-base">
            <p>
              Hi, I’m <span className="font-medium text-gray-900">Waiyawat</span>, a Computer Science student at Kasetsart University. With a deep passion for Engineering, Technology, and Social Enterprise, I have dedicated my journey since childhood to exploring how innovation can transform the world.
            </p>
            <p>
              I am committed to continuous self-improvement, balancing my expertise across Technology, Engineering, and Business. I believe that I can be a <span className="font-semibold text-gray-900">&quot;key piece of the puzzle&quot;</span> for modern enterprises, driving them forward with stability and sustainability through the integration of advanced technology and strategic management.
            </p>
            <p>
              Thank you for visiting my profile. I look forward to the possibility of collaborating with you in the future.
            </p>
            <p className="font-bold text-gray-900 pt-2">
              Waiyawat Aphiraktanon
            </p>
          </div>

            <div className="mt-10 flex gap-4">
              <Link href="/#" target="_blank" className="px-8 py-3 bg-gray-900 text-white rounded-full text-sm font-bold hover:bg-sky-600 transition shadow-lg hover:shadow-sky-500/30">
                View Resume
              </Link>
            </div>
          </div>

        </div>
      </section>
      {/* จบส่วน About Me */}
      
      {/* Tech Stack Slider */}
      <TechStack />

      {/* Project Grid */}
      <section id="works" className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-xs uppercase tracking-[0.3em] font-bold text-gray-300 mb-12 text-center font-sans">
          Selected Works
        </h2>

        {/* เรียกใช้ Component ตัวใหม่ */}
        <ProjectGrid projects={projects || []} />
        
      </section>

      {/* Footer */}
      <footer className="py-20 text-center border-t border-gray-50 flex flex-col items-center space-y-8">

        <div className="flex flex-col items-center gap-2">
            <div className="relative w-9 h-9 opacity-40 hover:opacity-100 hover:scale-110 transition-all duration-300 grayscale hover:grayscale-0">
              <Image 
                src="/favicon.ico" 
                alt="Logo" 
                fill
                className="object-contain"
                sizes="36px"
              />
            </div>
            <p className="text-gray-400 text-sm">© 2026 Waiyawat Aphiraktanon.</p>
          </div>

          {/* Social Icons */}
          <div className="flex justify-center items-center gap-6">
            <SocialIcon 
              url="https://github.com/waiyawatoppa" 
              target="_blank" 
              fgColor="#ffffff"
              style={{ height: 32, width: 32 }} 
            />
            <SocialIcon 
              url="https://linkedin.com/" 
              target="_blank" 
              fgColor="#ffffff"
              style={{ height: 32, width: 32 }} 
            />
            <SocialIcon 
              network="email" 
              url="#" 
              target="_blank" 
              fgColor="#ffffff"
              style={{ height: 32, width: 32 }} 
            />
          </div>
      </footer>
    </main>
  );
}