"use client";

export default function TechStack() {
  const skills = [
    "Next.js",
    "Tailwind CSS",
    "Microcontroller",
    "C/C++",
    "JAVA",
    "Business Intelligence",
    "Python",
    "Figma",
    "DaVinci Resolve",
    "Git",
  ];

  return (
    <div id="tech-stack" className="py-10">
      <h2 className="text-xs uppercase tracking-[0.3em] font-bold text-gray-300 mb-10 text-center font-sans">
        Tech Stack And Skills
      </h2>

      <section className="w-full group overflow-hidden bg-white py-10 border-y border-gray-50 flex items-center [mask-image:_linear-gradient(to_right,transparent_0,_black_100px,_black_calc(100%-100px),transparent_100%)]">
        <div className="flex w-max">
          
          {/* กล่อง 1 */}
          <div className="flex w-1/2 justify-around animate-infinite-scroll">
            {skills.map((skill, index) => (
              <div key={index} className="flex items-center space-x-8 px-8">
                <span className="text-sm md:text-base font-bold text-gray-400 uppercase tracking-widest hover:text-sky-500 transition-colors duration-300 cursor-default font-sans">
                  {skill}
                </span>
                <span className="text-sky-200 text-xs">✦</span>
              </div>
            ))}
          </div>
          
          {/* กล่อง 2 */}
          <div className="flex w-1/2 justify-around animate-infinite-scroll" aria-hidden="true">
            {skills.map((skill, index) => (
              <div key={`dup-${index}`} className="flex items-center space-x-8 px-8">
                <span className="text-sm md:text-base font-bold text-gray-400 uppercase tracking-widest hover:text-sky-500 transition-colors duration-300 cursor-default font-sans">
                  {skill}
                </span>
                <span className="text-sky-200 text-xs">✦</span>
              </div>
            ))}
          </div>

        </div>
      </section>
    </div>
  );
}