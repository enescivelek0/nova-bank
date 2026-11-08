"use client";

import {
  ArrowLeftRight,
  CreditCard,
  History,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Timer,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Logo, ThemeToggle } from "@/components/brand";
import { Skeleton } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { cn, dateTime } from "@/lib/format";
import { bank, useBank } from "@/lib/store";

const nav = [
  { href: "/panel", label: "Özet", icon: LayoutDashboard },
  { href: "/panel/hesaplar", label: "Hesaplar", icon: Wallet },
  { href: "/panel/transfer", label: "Para Gönder", icon: ArrowLeftRight },
  { href: "/panel/kartlar", label: "Kartlar", icon: CreditCard },
  { href: "/panel/hareketler", label: "Hareketler", icon: History },
];

const SESSION_SECONDS = 5 * 60;

export function PanelShell({ children }: { children: ReactNode }) {
  const state = useBank();
  const router = useRouter();
  const pathname = usePathname();
  const loggedIn = state?.session.loggedIn;

  useEffect(() => {
    if (state && !loggedIn) router.replace("/giris");
  }, [state, loggedIn, router]);

  // Sayfa segmentini her zaman render et (veri yokken sayfalar null döner);
  // böylece prerender sırasında segment düşürülmez.
  if (!state || !loggedIn)
    return (
      <>
        <ShellSkeleton />
        <div hidden>{children}</div>
      </>
    );

  const initials = state.customer.name
    .split(" ")
    .map((p) => p[0])
    .join("");

  return (
    <div className="min-h-dvh lg:pl-64">
      {/* Masaüstü kenar çubuğu */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-surface lg:flex">
        <div className="px-5 py-5">
          <Logo href="/panel" />
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = href === "/panel" ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active ? "bg-primary-soft text-primary" : "text-muted hover:bg-surface-2 hover:text-fg",
                )}
              >
                <Icon className="size-[18px]" /> {label}
              </Link>
            );
          })}
        </nav>
        <div className="m-3 rounded-2xl border border-line bg-surface-2 p-3.5 text-xs">
          <p className="flex items-center gap-1.5 font-semibold">
            <ShieldCheck className="size-4 text-success" /> Güvenlik hatırlatması
          </p>
          <p className="mt-1 leading-relaxed text-muted">
            Nova Bank sizden asla telefon, SMS veya e-posta ile şifre ya da doğrulama kodu istemez.
          </p>
        </div>
      </aside>

      {/* Üst bar */}
      <header className="sticky top-0 z-20 border-b border-line bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="lg:hidden">
            <Logo href="/panel" />
          </div>
          <div className="hidden min-w-0 lg:block">
            <p className="truncate text-sm font-semibold">Merhaba, {state.customer.name.split(" ")[0]} 👋</p>
            {state.session.lastLoginAt && (
              <p className="text-xs text-muted">Son giriş: {dateTime(state.session.lastLoginAt)}</p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <SessionTimer />
            <ThemeToggle />
            <div className="ml-1 hidden items-center gap-2.5 rounded-xl py-1 pr-1 pl-3 sm:flex">
              <div className="text-right leading-tight">
                <p className="text-xs font-semibold">{state.customer.name}</p>
                <p className="text-[11px] text-muted">No: {state.customer.customerNo}</p>
              </div>
              <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">
                {initials}
              </span>
            </div>
            <button
              onClick={() => {
                bank.logout();
                router.replace("/giris");
              }}
              className="grid size-9 place-items-center rounded-xl text-muted transition hover:bg-danger-soft hover:text-danger"
              aria-label="Güvenli çıkış"
              title="Güvenli çıkış"
            >
              <LogOut className="size-[18px]" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-5 pb-28 sm:px-6 lg:pb-10">{children}</main>

      {/* Mobil alt menü */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = href === "/panel" ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition",
                  active ? "text-primary" : "text-muted",
                )}
              >
                <span className={cn("grid h-7 w-12 place-items-center rounded-full transition", active && "bg-primary-soft")}>
                  <Icon className="size-[18px]" />
                </span>
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function SessionTimer() {
  const router = useRouter();
  const toast = useToast();
  const deadline = useRef(0);
  const [left, setLeft] = useState(SESSION_SECONDS);

  const bump = useCallback(() => {
    deadline.current = Date.now() + SESSION_SECONDS * 1000;
  }, []);

  useEffect(() => {
    bump();
    const events = ["pointerdown", "keydown", "scroll", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, bump, { passive: true }));
    const id = setInterval(() => {
      const remaining = Math.max(0, Math.round((deadline.current - Date.now()) / 1000));
      setLeft(remaining);
      if (remaining === 0) {
        clearInterval(id);
        bank.logout();
        toast({ kind: "info", title: "Oturum sonlandı", message: "Güvenliğiniz için hareketsizlik nedeniyle çıkış yapıldı." });
        router.replace("/giris");
      }
    }, 1000);
    return () => {
      clearInterval(id);
      events.forEach((e) => window.removeEventListener(e, bump));
    };
  }, [bump, router, toast]);

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  return (
    <span
      title="Oturum süresi (hareketsizlik)"
      className={cn(
        "mr-1 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold tabular",
        left <= 60 ? "bg-danger-soft text-danger" : "bg-surface-2 text-muted",
      )}
    >
      <Timer className="size-3.5" /> {mm}:{ss}
    </span>
  );
}

function ShellSkeleton() {
  return (
    <div className="min-h-dvh lg:pl-64">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-surface p-5 lg:block">
        <Skeleton className="h-8 w-32" />
        <div className="mt-8 space-y-2">
          {nav.map((n) => (
            <Skeleton key={n.href} className="h-10" />
          ))}
        </div>
      </aside>
      <div className="mx-auto max-w-6xl space-y-4 px-4 pt-20 sm:px-6">
        <Skeleton className="h-40" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-72" />
      </div>
    </div>
  );
}
