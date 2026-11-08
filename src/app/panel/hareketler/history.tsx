"use client";

import { Download, Search, SearchX, X } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { TransactionDetail } from "@/components/transaction-detail";
import { TransactionRow } from "@/components/transaction-row";
import { Button, Card, EmptyState, inputClass } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { categoryMeta, cn, dayLabel, money, timeOnly } from "@/lib/format";
import { useBank } from "@/lib/store";
import type { Category, Transaction } from "@/lib/types";

const periods = [
  { v: 7, label: "7 gün" },
  { v: 30, label: "30 gün" },
  { v: 90, label: "3 ay" },
  { v: 0, label: "Tümü" },
];

const PAGE = 30;

export function History() {
  const s = useBank();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [accountId, setAccountId] = useState("acc-main");
  const [direction, setDirection] = useState<"all" | "in" | "out">("all");
  const [category, setCategory] = useState<Category | "all">("all");
  const [period, setPeriod] = useState(30);
  const [limit, setLimit] = useState(PAGE);
  const [selected, setSelected] = useState<Transaction | null>(null);
  const q = useDeferredValue(query.trim().toLocaleLowerCase("tr-TR"));
  // Tarih aralığı, oturumun açıldığı ana göre hesaplanır (render sırasında Date.now() kullanılmaz)
  const sessionStart = s?.session.loginAt;

  const filtered = useMemo(() => {
    if (!s) return [];
    const anchor = sessionStart ? new Date(sessionStart).getTime() : 0;
    const since = period && anchor ? anchor - period * 86_400_000 : 0;
    return s.transactions.filter((t) => {
      if (t.accountId !== accountId) return false;
      if (since && new Date(t.date).getTime() < since) return false;
      if (direction === "in" && t.amount < 0) return false;
      if (direction === "out" && t.amount > 0) return false;
      if (category !== "all" && t.category !== category) return false;
      if (q) {
        const hay = `${t.title} ${t.description ?? ""} ${t.counterparty ?? ""} ${t.reference}`.toLocaleLowerCase("tr-TR");
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [s, accountId, period, direction, category, q, sessionStart]);

  if (!s) return null;
  const account = s.accounts.find((a) => a.id === accountId)!;
  const totals = filtered.reduce(
    (acc, t) => {
      if (t.amount > 0) acc.in += t.amount;
      else acc.out -= t.amount;
      return acc;
    },
    { in: 0, out: 0 },
  );

  const visible = filtered.slice(0, limit);
  const groups = visible.reduce<Array<{ day: string; items: Transaction[] }>>((acc, t) => {
    const day = new Date(t.date).toDateString();
    const last = acc[acc.length - 1];
    if (last?.day === day) last.items.push(t);
    else acc.push({ day, items: [t] });
    return acc;
  }, []);

  const usedCategories = [...new Set(s.transactions.filter((t) => t.accountId === accountId).map((t) => t.category))];

  const exportCsv = () => {
    const header = ["Tarih", "Saat", "Açıklama", "Kategori", "Tutar", "Bakiye", "Referans"];
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const rows = filtered.map((t) =>
      [
        new Date(t.date).toLocaleDateString("tr-TR"),
        timeOnly(t.date),
        t.title + (t.description ? ` - ${t.description}` : ""),
        categoryMeta[t.category].label,
        t.amount.toFixed(2).replace(".", ","),
        t.balanceAfter?.toFixed(2).replace(".", ",") ?? "",
        t.reference,
      ]
        .map((v) => esc(String(v)))
        .join(";"),
    );
    const blob = new Blob(["﻿" + [header.join(";"), ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nova-bank-hareketler-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ kind: "success", title: "CSV indirildi", message: `${filtered.length} işlem dışa aktarıldı.` });
  };

  const hasFilters = query || direction !== "all" || category !== "all";

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Hesap Hareketleri</h1>
          <p className="mt-1 text-sm text-muted">{filtered.length} işlem listeleniyor</p>
        </div>
        <Button variant="secondary" onClick={exportCsv} disabled={!filtered.length}>
          <Download className="size-4" /> CSV indir
        </Button>
      </div>

      <Card className="space-y-3">
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setLimit(PAGE);
              }}
              placeholder="İşlem, alıcı veya referans ara"
              className={cn(inputClass, "pl-10")}
              aria-label="İşlemlerde ara"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded-lg p-1.5 text-muted hover:bg-surface-2"
                aria-label="Aramayı temizle"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <select
            value={accountId}
            onChange={(e) => {
              setAccountId(e.target.value);
              setCategory("all");
              setLimit(PAGE);
            }}
            className={inputClass}
            aria-label="Hesap seç"
          >
            {s.accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            value={String(period)}
            onChange={(v) => {
              setPeriod(Number(v));
              setLimit(PAGE);
            }}
            options={periods.map((p) => ({ value: String(p.v), label: p.label }))}
          />
          <Segmented
            value={direction}
            onChange={(v) => setDirection(v as typeof direction)}
            options={[
              { value: "all", label: "Tümü" },
              { value: "in", label: "Gelen" },
              { value: "out", label: "Giden" },
            ]}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category | "all")}
            className="h-9 rounded-xl border border-line bg-surface px-3 text-xs font-semibold outline-none focus:border-primary"
            aria-label="Kategori"
          >
            <option value="all">Tüm kategoriler</option>
            {usedCategories.map((c) => (
              <option key={c} value={c}>
                {categoryMeta[c].label}
              </option>
            ))}
          </select>
          {hasFilters && (
            <button
              onClick={() => {
                setQuery("");
                setDirection("all");
                setCategory("all");
              }}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Filtreleri temizle
            </button>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Total label="Gelen" value={money(totals.in, account.currency)} className="text-success" />
        <Total label="Giden" value={money(totals.out, account.currency)} />
        <Total
          label="Net"
          value={money(totals.in - totals.out, account.currency, { sign: true })}
          className={totals.in - totals.out >= 0 ? "text-success" : "text-danger"}
        />
      </div>

      <Card className="p-2 sm:p-3">
        {groups.length ? (
          <div className="space-y-3">
            {groups.map((g) => (
              <div key={g.day}>
                <p className="sticky top-16 z-10 bg-surface/95 px-2 py-1.5 text-xs font-semibold text-muted backdrop-blur">
                  {dayLabel(g.items[0].date)}
                </p>
                {g.items.map((t) => (
                  <TransactionRow key={t.id} tx={t} currency={account.currency} onClick={() => setSelected(t)} />
                ))}
              </div>
            ))}
            {filtered.length > limit && (
              <div className="p-2">
                <Button variant="secondary" className="w-full" onClick={() => setLimit((l) => l + PAGE)}>
                  Daha fazla göster ({filtered.length - limit})
                </Button>
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            icon={<SearchX className="size-5" />}
            title="İşlem bulunamadı"
            text="Seçili filtrelere uygun hareket yok. Tarih aralığını genişletmeyi deneyin."
          />
        )}
      </Card>

      <TransactionDetail tx={selected} account={account} onClose={() => setSelected(null)} />
    </div>
  );
}

function Segmented({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="inline-flex rounded-xl bg-surface-2 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={cn(
            "h-7 rounded-lg px-2.5 text-xs font-semibold transition",
            value === o.value ? "bg-surface text-fg shadow-sm" : "text-muted hover:text-fg",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Total({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-3 sm:p-4">
      <p className="text-[11px] text-muted sm:text-xs">{label}</p>
      <p className={cn("mt-1 truncate text-sm font-bold tabular sm:text-lg", className)}>{value}</p>
    </div>
  );
}
