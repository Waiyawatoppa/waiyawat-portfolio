"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

interface AboutSlide {
  id?: string;
  image_url: string;
}

export default function AboutSlider({ initialSlides }: { initialSlides: AboutSlide[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // ใช้รูป Default ถ้า Database ว่างเปล่า
  const slides = initialSlides && initialSlides.length > 0 
    ? initialSlides 
    : [{ image_url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200" }];

  useEffect(() => {
    // ถ้ามีรูปเดียว ไม่ต้องรัน Timer เลื่อนสไลด์
    if (slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 4000);

    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative w-full aspect-square md:aspect-[4/5] rounded-3xl overflow-hidden group shadow-lg bg-gray-100 border border-gray-100">
      {slides.map((slide, index) => (
        <div
          key={slide.id || index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={slide.image_url}
            alt={`About Waiyawat ${index + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={index === 0} // LCP Optimization
          />
        </div>
      ))}

      {slides.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? "bg-white w-6" : "bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}