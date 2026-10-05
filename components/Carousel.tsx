"use client";
import { ChevronRight } from "lucide-react";
import { useRef } from "react";

export default function Carousel({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div className="relative">
      <div ref={ref} className="no-scrollbar flex snap-x gap-4 overflow-x-auto scroll-smooth pb-1">{children}</div>
      <button aria-label="Ver más" onClick={() => ref.current?.scrollBy({ left: ref.current.clientWidth * 0.8, behavior: "smooth" })}
        className="absolute right-[-10px] top-[38%] hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-black shadow-lg md:grid"><ChevronRight size={18} /></button>
    </div>
  );
}
