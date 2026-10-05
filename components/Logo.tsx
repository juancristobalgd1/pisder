import Link from "next/link";
import { BRAND } from "@/lib/brand";
export default function Logo({ big = false }: { big?: boolean }) {
  const s = big ? 34 : 24;
  return (
    <Link href="/" className="flex items-center gap-2 text-white" aria-label={`${BRAND.name}, inicio`}>
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M3 11.2 12 3.5l9 7.7V20.5a.9.9 0 0 1-.9.9h-5.4v-6.2H9.3v6.2H3.9a.9.9 0 0 1-.9-.9v-9.3Z" fill="#fff" />
        <circle cx="12" cy="11" r="1.6" fill="#161616" />
      </svg>
      <span className={`${big ? "text-[26px]" : "text-xl"} font-bold tracking-tight text-[#f0d9ff]`}>{BRAND.name}</span>
    </Link>
  );
}
