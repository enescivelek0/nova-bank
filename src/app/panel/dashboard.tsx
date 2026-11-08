"use client";

import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowRight,
  ArrowUpRight,
  CreditCard,
  Eye,
  EyeOff,
  History,
  PiggyBank,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BankCardVisual } from "@/components/bank-card";
import { Donut, IncomeExpenseBars, type BarPoint, type Slice } from "@/components/charts";
import { TransactionDetail } from "@/components/transaction-detail";
import { TransactionRow } from "@/components/transaction-row";
import { Card, CardHeader } from "@/components/ui/primitives";
import { categoryMeta, cn, dayLabel, money } from "@/lib/format";
import { formatIban } from "@/lib/iban";
import { FX_RATES, totalAssetsTry, useBank } from "@/lib/store";
import type { Category, Transaction } from "@/lib/types";

const isInternal = (t: Transaction) => t.title.startsWith("Birikime") || t.title.startsWith("Hesaplar Arası");

export function Dashboard() {
  const s = useBank();
  const [hidden, setHidden] = useState(false);
  const [selected, setSelected] = useState<Transaction | null>(null);

  const stats = useMemo(() => {
    if (!s) return null;
    const now = new Date();
    const main = s.transactions.filter((t) => t.accountId === "acc-main" && !isInternal(t));
    const thisMonth = main.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const income = thisMonth.filter((t) => t.amount > 0).reduce((a, t) => a + t.amount, 0);
    const expense = thisMonth.filter((t) => t.amount < 0).reduce((a, t) => a - t.amount, 0);

    const byCat = new Map<Category, number>();
    for (const t of thisMonth) if (t.amount < 0) byCat.set(t.category, (byCat.get(t.category) ?? 0) - t.amount);
    const sorted = [...byCat.entries()].sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, 5);
    const rest = sorted.slice(5).reduce((a, [, v]) => a + v, 0);
    const slices: Slice[] = top.map(([k, v]) => ({ key: k, label: categoryMeta[k].label, value: v, color: categoryMeta[k].color }));
    if (rest > 0) slices.push({ key: "rest", label: "Diğer", value: rest, color: "#94a3b8" });

    const months: BarPoint[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const list = main.filter((t) => {
        const x = new Date(t.date);
        return x.getMonth() === d.getMonth() && x.getFullYear() === d.getFullYear();
      });
      months.push({
        label: d.toLocaleDateString("tr-TR", { month: "short" }),
        income: list.filter((t) => t.amount > 0).reduce((a, t) => a + t.amount, 0),
        expense: list.filter((t) => t.amount < 0).reduce((a, t) => a - t.amount, 0),
      });
    }
    return { income, expense, slices, months };
  }, [s]);

  if (!s || !stats) return null;

  const total = totalAssetsTry(s);
  const mask = (v: string) => (hidden ? "••••••" : v);
  const creditCards = s.cards.filter((c) => c.kind === "kredi");
  const totalDebt = creditCards.reduce((a, c) => a + c.debt, 0);
  const recent = s.transactions.slice(0, 6);
  const accountOf = (id: string) => s.accounts.find((a) => a.id === id);

  return (
    <div className="animate-fade-in space-y-5">
      {/* Varlık özeti */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-800 p-5 text-white shadow-xl shadow-indigo-900/20 sm:p-7">
        <div className="pointer-events-none absolute -top-20 -right-16 size-72 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-white/75">
              Toplam varlık (TL karşılığı)
              <button
                onClick={() => setHidden((h) => !h)}
                className="rounded-lg p-1 hover:bg-white/10"
                aria-label={hidden ? "Bakiyeleri göster" : "Bakiyeleri gizle"}
              >
                {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <p className="mt-1 text-3xl font-bold tracking-tight tabular sm:text-4xl">{mask(money(total))}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5">
                <ArrowDownLeft className="size-3.5 text-emerald-300" /> Bu ay gelen {mask(money(stats.income))}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5">
                <ArrowUpRight className="size-3.5 text-rose-300" /> Bu ay giden {mask(money(stats.expense))}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {[
              { href: "/panel/transfer", label: "Gönder", icon: ArrowLeftRight },
              { href: "/panel/kartlar", label: "Borç öde", icon: CreditCard },
              { href: "/panel/hesaplar", label: "Hesaplar", icon: PiggyBank },
              { href: "/panel/hareketler", label: "Hareketler", icon: History },
            ].map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-1.5 rounded-2xl bg-white/10 px-2 py-3 text-[11px] font-semibold transition hover:bg-white/20 sm:w-20"
              >
                <Icon className="size-5" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Hesaplar */}
      <div className="scrollbar-none -mx-4 flex snap-x gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 xl:grid-cols-4">
        {s.accounts.map((a) => (
          <Link
            key={a.id}
            href="/panel/hesaplar"
            className="group min-w-[78%] snap-start rounded-2xl border border-line bg-surface p-4 transition hover:border-primary/40 hover:shadow-lg hover:shadow-black/5 sm:min-w-0"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted">{a.name}</p>
              <span className="rounded-md bg-surface-2 px-1.5 py-0.5 text-[10px] font-bold text-muted">{a.currency}</span>
            </div>
            <p className="mt-2 text-xl font-bold tabular">{mask(money(a.balance, a.currency))}</p>
            <p className="mt-1 truncate font-mono text-[11px] text-muted">{formatIban(a.iban)}</p>
            {a.currency !== "TRY" && (
              <p className="mt-1 text-[11px] text-muted">≈ {mask(money(a.balance * FX_RATES[a.currency]))}</p>
            )}
            {a.rate && <p className="mt-1 text-[11px] font-semibold text-success">Yıllık %{a.rate} faiz</p>}
          </Link>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <Card>
          <CardHeader title="Gelir & Gider" subtitle="Vadesiz TL hesabı · son 6 ay" />
          <IncomeExpenseBars data={stats.months} />
        </Card>
        <Card>
          <CardHeader title="Bu ayki harcamalar" subtitle="Kategori dağılımı" />
          {stats.slices.length ? (
            <Donut data={stats.slices} total={stats.expense} />
          ) : (
            <p className="py-10 text-center text-sm text-muted">Bu ay henüz harcama yok.</p>
          )}
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <Card>
          <CardHeader
            title="Son işlemler"
            action={
              <Link href="/panel/hareketler" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                Tümü <ArrowRight className="size-3.5" />
              </Link>
            }
          />
          <div className="-mx-2">
            {recent.map((t) => (
              <TransactionRow
                key={t.id}
                tx={t}
                currency={accountOf(t.accountId)?.currency}
                subtitle={`${dayLabel(t.date)} · ${accountOf(t.accountId)?.name ?? ""}`}
                onClick={() => setSelected(t)}
              />
            ))}
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader
              title="Kredi kartlarım"
              subtitle={`Toplam borç ${hidden ? "••••" : money(totalDebt)}`}
              action={
                <Link href="/panel/kartlar" className="text-xs font-semibold text-primary hover:underline">
                  Yönet
                </Link>
              }
            />
            <BankCardVisual card={creditCards[0]} className="mx-auto max-w-sm" />
            <div className="mt-4 space-y-3">
              {creditCards.map((c) => {
                const used = c.limit ? (c.debt / c.limit) * 100 : 0;
                return (
                  <div key={c.id}>
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold">{c.name}</span>
                      <span className="text-muted tabular">
                        {mask(money(c.debt))} / {money(c.limit)}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
                      <div
                        className={cn("h-full rounded-full", used > 70 ? "bg-danger" : "bg-primary")}
                        style={{ width: `${Math.min(100, used)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <CardHeader title="Döviz kurları" subtitle="Nova Bank döviz alış kurları" />
            <div className="grid grid-cols-2 gap-3">
              {(["USD", "EUR"] as const).map((c) => (
                <div key={c} className="rounded-xl bg-surface-2 p-3">
                  <p className="text-xs font-semibold text-muted">{c}/TRY</p>
                  <p className="mt-1 text-lg font-bold tabular">{FX_RATES[c].toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <TransactionDetail tx={selected} account={selected ? accountOf(selected.accountId) : undefined} onClose={() => setSelected(null)} />
    </div>
  );
}
