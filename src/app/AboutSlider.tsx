"use client";

import { useEffect, useState } from "react";

import type { Slide } from "@/lib/types";
import CoverImage from "./_components/CoverImage";

const INTERVAL_MS = 4000;

export default function AboutSlider({
  initialSlides,
}: {
  initialSlides: Pick<Slide, "id" | "image_url">[];
}) {
  const slides = initialSlides ?? [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // Derived rather than corrected in an effect: if the slide list shrinks, a
  // stale index would otherwise render every slide at opacity-0.
  const activeIndex = currentIndex >= slides.length ? 0 : currentIndex;

  const autoplay = slides.length > 1 && !paused && !reducedMotion;

  useEffect(() => {
    if (!autoplay) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [autoplay, slides.length]);

  if (slides.length === 0) {
    return (
      <div className="relative w-full aspect-square md:aspect-[4/5] rounded-3xl overflow-hidden shadow-lg bg-gray-100 border border-gray-100">
        <CoverImage
          src={null}
          alt="Portrait placeholder"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-square md:aspect-[4/5] rounded-3xl overflow-hidden shadow-lg bg-gray-100 border border-gray-100">
      {slides.map((slide, index) => (
        <div
          key={slide.id ?? index}
          aria-hidden={index !== activeIndex}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out motion-reduce:transition-none ${
            index === activeIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <CoverImage
            src={slide.image_url}
            alt={`Waiyawat Aphiraktanon, photo ${index + 1} of ${slides.length}`}
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={index === 0}
          />
        </div>
      ))}

      {slides.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-2 z-10">
          {slides.map((slide, index) => (
            <button
              key={slide.id ?? index}
              type="button"
              onClick={() => setCurrentIndex(index)}
              aria-label={`Show photo ${index + 1} of ${slides.length}`}
              aria-current={index === activeIndex}
              className={`h-2 rounded-full transition-all duration-300 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                index === activeIndex
                  ? "bg-white w-6"
                  : "bg-white/60 hover:bg-white/90 w-2"
              }`}
            />
          ))}

          {!reducedMotion && (
            <button
              type="button"
              onClick={() => setPaused((prev) => !prev)}
              aria-label={paused ? "Resume slideshow" : "Pause slideshow"}
              className="ml-2 rounded-full bg-black/45 text-white text-[0.7rem] font-bold px-2 py-1 hover:bg-black/65 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {paused ? "Play" : "Pause"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
