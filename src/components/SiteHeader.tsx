"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useHydrated } from "@/lib/hooks";
import { useDoseStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Challenges" },
  { href: "/journal", label: "Journal" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const nickname = useDoseStore((s) => s.session?.nickname);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-1.5 font-bold tracking-tight">
          <span className="flex gap-0.5" aria-hidden>
            <span className="size-2 rounded-full bg-amber-500" />
            <span className="size-2 rounded-full bg-rose-500" />
            <span className="size-2 rounded-full bg-teal-500" />
            <span className="size-2 rounded-full bg-violet-500" />
          </span>
          DOSE
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-2.5 py-1.5 transition-colors hover:bg-muted",
                pathname === item.href ? "font-medium text-foreground" : "text-muted-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
          {hydrated && nickname && (
            <span className="ml-1 hidden rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground min-[400px]:inline">
              {nickname}
            </span>
          )}
        </nav>
      </div>
    </header>
  );
}
