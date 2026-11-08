"use client";

import { Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/format";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2 font-bold tracking-tight", className)}>
      <span className="relative grid size-8 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 via-violet-600 to-indigo-800 text-white shadow-md shadow-indigo-500/30">
        <svg viewBox="0 0 24 24" className="size-4.5" fill="none" aria-hidden>
          <path d="M5 19V5l14 14V5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="text-[17px]">
        Nova<span className="text-primary">Bank</span>
      </span>
    </Link>
  );
}

const THEME_EVENT = "nova-theme-change";

function subscribe(cb: () => void) {
  window.addEventListener(THEME_EVENT, cb);
  return () => window.removeEventListener(THEME_EVENT, cb);
}

export function ThemeToggle({ className }: { className?: string }) {
  const dark = useSyncExternalStore(
    subscribe,
    () => document.documentElement.classList.contains("dark"),
    () => false,
  );

  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("nova-theme", next ? "dark" : "light");
    } catch {}
    window.dispatchEvent(new Event(THEME_EVENT));
  };

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Açık temaya geç" : "Koyu temaya geç"}
      className={cn("grid size-9 place-items-center rounded-xl text-muted transition hover:bg-surface-2 hover:text-fg", className)}
    >
      {dark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
    </button>
  );
}
