"use client";
import { Plus } from "lucide-react";
import { useState } from "react";
export default function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={i} className="panel">
          <button className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] text-white" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
            {it.q}<Plus size={18} className={`shrink-0 transition ${open === i ? "rotate-45" : ""}`} />
          </button>
          {open === i && <p className="px-5 pb-5 text-sm leading-relaxed text-soft">{it.a}</p>}
        </div>
      ))}
    </div>
  );
}
