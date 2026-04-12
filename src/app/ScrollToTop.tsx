"use client";
import { useState, useEffect, useRef } from "react";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // State สำหรับคุมการเปิด/ปิดเมนูบนมือถือ
  const menuRef = useRef<HTMLDivElement>(null); // ตัวจับเวลาผู้ใช้กดพื้นที่ว่างบนหน้าจอ

  // 1. ตรวจจับการ Scroll
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
        setIsOpen(false); // ถ้าเลื่อนกลับไปบนสุด ให้รีเซ็ตปิดเมนู
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // 2. ตรวจจับการทัช/คลิก พื้นที่ว่างนอกเมนู (เพื่อปิดเมนูบนมือถือ)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    // ดักจับ Event เฉพาะตอนที่เมนูเปิดอยู่
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // 3. ฟังก์ชันเลื่อนหน้าจอ
  const scrollToSection = (sectionId: string) => {
    if (sectionId === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        const offset = 80; 
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }
    setIsOpen(false); // เลื่อนเสร็จให้ปิดเมนูเก็บอัตโนมัติ
  };

  // 🌟 4. หัวใจสำคัญ: แยกการทำงานระหว่าง Mouse กับ Touch
  const handleMainClick = () => {
    // เช็คว่าเครื่องนี้ใช้หน้าจอสัมผัส (Touch Screen) หรือไม่
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

    if (isTouchDevice) {
      if (!isOpen) {
        setIsOpen(true); // ทัชครั้งแรก: เปิดเมนูย่อย
      } else {
        scrollToSection("top"); // ทัชปุ่มเดิมซ้ำ: เลื่อนขึ้นบนสุด
      }
    } else {
      // ถ้าเป็นคอมพิวเตอร์ (ใช้เมาส์) ให้กดแล้วขึ้นบนสุดได้เลย (เพราะเมนูใช้ Hover)
      scrollToSection("top");
    }
  };

  if (!isVisible) return null;

  return (
    <div ref={menuRef} className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3 group">
      
      {/* เมนูย่อย (เพิ่มเงื่อนไข isOpen สำหรับมือถือ แต่คอมพิวเตอร์ยังใช้ group-hover) */}
      <div className={`flex flex-col items-end gap-2 transition-all duration-300 ease-out
        ${isOpen 
          ? "opacity-100 translate-y-0 pointer-events-auto" 
          : "opacity-0 translate-y-4 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto"
        }
      `}>
        <button
          onClick={() => scrollToSection("about")}
          className="px-4 py-2 bg-white text-gray-700 text-xs font-bold rounded-full shadow-lg hover:bg-pink-500 hover:text-white transition-colors border border-gray-100"
        >
          About Me
        </button>
        <button
          onClick={() => scrollToSection("tech-stack")}
          className="px-4 py-2 bg-white text-gray-700 text-xs font-bold rounded-full shadow-lg hover:bg-purple-500 hover:text-white transition-colors border border-gray-100"
        >
          Tech & Skills
        </button>
        <button
          onClick={() => scrollToSection("works")}
          className="px-4 py-2 bg-white text-gray-700 text-xs font-bold rounded-full shadow-lg hover:bg-sky-500 hover:text-white transition-colors border border-gray-100"
        >
          Selected Works
        </button>
      </div>

      {/* ปุ่มหลัก */}
      <button
        onClick={handleMainClick}
        className="p-4 bg-gray-900 text-white rounded-full shadow-lg hover:bg-sky-500 hover:scale-105 transition-all duration-300"
        aria-label="Scroll to top"
      >
        <svg className="w-5 h-5 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>

    </div>
  );
}