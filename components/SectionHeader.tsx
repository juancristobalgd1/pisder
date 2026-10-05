import Link from "next/link";
export default function SectionHeader({ eyebrow, title, href, more = "Ver más" }: { eyebrow?: string; title: string; href?: string; more?: string }) {
  return (
    <div className="mb-5 flex items-end justify-between">
      <div>{eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}<h2 className="h-section">{title}</h2></div>
      {href && <Link href={href} className="text-sm text-soft hover:text-white">{more} →</Link>}
    </div>
  );
}
