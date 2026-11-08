import type { Category, Currency } from "./types";

const formatters = new Map<string, Intl.NumberFormat>();

export function money(value: number, currency: Currency = "TRY", opts?: { sign?: boolean }) {
  const key = `${currency}-${opts?.sign ? "s" : ""}`;
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      signDisplay: opts?.sign ? "exceptZero" : "auto",
    });
    formatters.set(key, f);
  }
  return f.format(value);
}

export function compactMoney(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function dateLong(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function dateShort(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", { day: "2-digit", month: "short" });
}

export function dateTime(iso: string) {
  return new Date(iso).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeOnly(iso: string) {
  return new Date(iso).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

export function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Bugün";
  if (d.toDateString() === yesterday.toDateString()) return "Dün";
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "long" });
}

export function maskCard(number: string, visible = false) {
  const clean = number.replace(/\s/g, "");
  if (visible) return clean.replace(/(.{4})/g, "$1 ").trim();
  return `•••• •••• •••• ${clean.slice(-4)}`;
}

export const categoryMeta: Record<Category, { label: string; color: string }> = {
  maas: { label: "Maaş", color: "#10b981" },
  market: { label: "Market", color: "#6366f1" },
  fatura: { label: "Fatura", color: "#f59e0b" },
  restoran: { label: "Yeme-İçme", color: "#ef4444" },
  ulasim: { label: "Ulaşım", color: "#0ea5e9" },
  eglence: { label: "Eğlence", color: "#a855f7" },
  alisveris: { label: "Alışveriş", color: "#ec4899" },
  saglik: { label: "Sağlık", color: "#14b8a6" },
  transfer: { label: "Transfer", color: "#64748b" },
  kart: { label: "Kart Ödemesi", color: "#8b5cf6" },
  diger: { label: "Diğer", color: "#94a3b8" },
};

export const channelLabel = {
  kart: "Kart ile",
  havale: "Havale",
  eft: "EFT",
  fast: "FAST",
  otomatik: "Otomatik ödeme",
  sube: "Şube",
} as const;

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function makeRef() {
  return `NB${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}
