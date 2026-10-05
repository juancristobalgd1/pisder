import Link from "next/link";
import { BRAND } from "@/lib/brand";
export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-white">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-8.5Z" fill="url(#g)" />
        <defs><linearGradient id="g" x1="0" y1="0" x2="24" y2="24"><stop stopColor="#e3b5ff"/><stop offset="1" stopColor="#a855f7"/></linearGradient></defs>
      </svg>
      <span className="text-lg font-semibold tracking-tight">{BRAND.name}</span>
    </Link>
  );
}
