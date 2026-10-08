import Link from "next/link";
import { BRAND } from "@/lib/brand";
import LogoMark from "./LogoMark";
export default function Logo({ big = false }: { big?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2 text-white" aria-label={`${BRAND.name}, inicio`}>
      <LogoMark size={big ? 38 : 28} />
      <span className={`${big ? "text-[26px]" : "text-xl"} font-bold tracking-tight text-[#ecd5a3]`}>{BRAND.name}</span>
    </Link>
  );
}
