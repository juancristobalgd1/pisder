import Link from "next/link";
export default function SectionHeader({ eyebrow, title, href, more = "Ver más" }: { eyebrow?: string; title: string; href?: string; more?: string }) {
  return (
    <div className="mb-4 flex flex-col gap-1 md:mb-5 md:flex-row md:items-end md:justify-between">
      <div>{eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}<h2 className="h-section">{title}</h2></div>
      {href && <Link href={href} className="text-[13px] text-soft hover:text-white">{more} →</Link>}
    </div>
  );
}
