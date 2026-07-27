"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Upload" },
  { href: "/cards", label: "Records" },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-border">
      <nav className="mx-auto flex w-full max-w-3xl items-center gap-6 px-8 py-4">
        <span className="font-heading text-sm font-medium">
          Business Card Extractor
        </span>
        <div className="flex gap-4 text-sm">
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "transition-colors hover:text-foreground",
                  isActive
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
