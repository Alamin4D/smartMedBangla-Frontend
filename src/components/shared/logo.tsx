import Link from "next/link";
import { Pill } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2 font-semibold tracking-tight", className)} aria-label="SmartMed home">
      <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <Pill className="size-5" aria-hidden />
      </span>
      <span className="text-lg">
        Smart<span className="text-primary">Med</span>
      </span>
    </Link>
  );
}
