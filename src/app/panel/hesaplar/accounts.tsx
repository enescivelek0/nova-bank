"use client";

import { ArrowLeftRight, Building2, CalendarDays, Copy, Landmark, Percent, Share2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { TransactionDetail } from "@/components/transaction-detail";
import { TransactionRow } from "@/components/transaction-row";
import { Badge, Button, buttonStyles, Card, CardHeader, Field, inputClass, parseAmount, sanitizeAmount } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { cn, dateLong, dayLabel, money } from "@/lib/format";
import { formatIban } from "@/lib/iban";
import { FX_RATES, useBank } from "@/lib/store";
import type { Account, Transaction } from "@/lib/types";

const typeLabel: Record<Account["type"], string> = {
  vadesiz: "Vadesiz",
  vadeli: "Vadeli",
  doviz: "Döviz",
};

export function Accounts() {
  const s = useBank();
  const toast = useToast();
  const [selectedId, setSelectedId] = useState("acc-main");
  const [detail, setDetail] = useState<Transaction | null>(null);

  if (!s) return null;
  const acc = s.accounts.find((a) => a.id === selectedId) ?? s.accounts[0];
  const txs = s.transactions.filter((t) => t.accountId === acc.id).slice(0, 8);

  const copyIban = () => {
    navigator.clipboard?.writeText(acc.iban).catch(() => {});
    toast({ kind: "success", title: "IBAN kopyalandı", message: formatIban(acc.iban) });
  };

  const share = async () => {
    const text = `${s.customer.name}\n${acc.name}\nIBAN: ${formatIban(acc.iban)}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "IBAN bilgilerim", text });
      } catch {}
    } else {
      navigator.clipboard?.writeText(text).catch(() => {});
      toast({ kind: "success", title: "Hesap bilgileri kopyalandı" });
    }
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Hesaplarım</h1>
        <p className="mt-1 text-sm text-muted">{s.accounts.length} aktif hesap</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0">
          {s.accounts.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelectedId(a.id)}
              className={cn(
                "min-w-[220px] rounded-2xl border p-4 text-left transition lg:min-w-0",
                a.id === acc.id
                  ? "border-primary bg-primary-soft ring-4 ring-[var(--ring)]/30"
                  : "border-line bg-surface hover:bg-surface-2",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">{a.name}</span>
                <Badge tone={a.type === "vadeli" ? "success" : a.type === "doviz" ? "primary" : "neutral"}>{typeLabel[a.type]}</Badge>
              </div>
              <p className="mt-2 text-lg font-bold tabular">{money(a.balance, a.currency)}</p>
            </button>
          ))}
        </div>

        <div className="space-y-5">
          <Card>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm text-muted">{acc.name}</p>
                <p className="mt-1 text-3xl font-bold tracking-tight tabular">{money(acc.balance, acc.currency)}</p>
                {acc.currency !== "TRY" && (
                  <p className="mt-1 text-sm text-muted">
                    ≈ {money(acc.balance * FX_RATES[acc.currency])} · 1 {acc.currency} = {FX_RATES[acc.currency]} TL
                  </p>
                )}
                <p className="mt-1 text-xs text-muted">Kullanılabilir bakiye</p>
              </div>
              {acc.currency === "TRY" && (
                <Link href="/panel/transfer" className={buttonStyles()}>
                  <ArrowLeftRight className="size-4" /> Para gönder
                </Link>
              )}
            </div>

            <div className="mt-5 rounded-2xl border border-line bg-surface-2 p-4">
              <p className="text-xs font-semibold text-muted">IBAN</p>
              <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
                <p className="font-mono text-sm font-semibold tracking-wide break-all sm:text-base">{formatIban(acc.iban)}</p>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={copyIban}>
                    <Copy className="size-3.5" /> Kopyala
                  </Button>
                  <Button variant="secondary" size="sm" onClick={share}>
                    <Share2 className="size-3.5" /> Paylaş
                  </Button>
                </div>
              </div>
            </div>

            <dl className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Building2, k: "Şube", v: acc.branch },
                { icon: CalendarDays, k: "Açılış tarihi", v: dateLong(acc.openedAt) },
                { icon: Landmark, k: "Hesap türü", v: `${typeLabel[acc.type]} ${acc.currency}` },
              ].map(({ icon: Icon, k, v }) => (
                <div key={k} className="flex items-center gap-3 rounded-xl border border-line p-3">
                  <Icon className="size-4 shrink-0 text-muted" />
                  <div className="min-w-0">
                    <dt className="text-[11px] text-muted">{k}</dt>
                    <dd className="truncate text-sm font-semibold">{v}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </Card>

          {acc.type === "vadeli" && acc.rate && <InterestCalculator rate={acc.rate} balance={acc.balance} />}

          <Card>
            <CardHeader
              title="Son hareketler"
              action={
                <Link href="/panel/hareketler" className="text-xs font-semibold text-primary hover:underline">
                  Tümünü gör
                </Link>
              }
            />
            {txs.length ? (
              <div className="-mx-2">
                {txs.map((t) => (
                  <TransactionRow
                    key={t.id}
                    tx={t}
                    currency={acc.currency}
                    subtitle={dayLabel(t.date)}
                    onClick={() => setDetail(t)}
                  />
                ))}
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-muted">Bu hesapta henüz hareket yok.</p>
            )}
          </Card>
        </div>
      </div>

      <TransactionDetail tx={detail} account={acc} onClose={() => setDetail(null)} />
    </div>
  );
}

function InterestCalculator({ rate, balance }: { rate: number; balance: number }) {
  const [amount, setAmount] = useState(sanitizeAmount(String(Math.round(balance))));
  const [days, setDays] = useState(32);
  const principal = parseAmount(amount);
  const gross = (principal * rate * days) / 36500;
  const withholding = gross * 0.175;
  const net = gross - withholding;

  return (
    <Card>
      <CardHeader title="Vadeli getiri hesaplayıcı" subtitle={`Yıllık brüt %${rate} · Stopaj %17,5`} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Anapara (TL)" htmlFor="principal">
          <input
            id="principal"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(sanitizeAmount(e.target.value))}
            className={cn(inputClass, "tabular")}
          />
        </Field>
        <Field label="Vade" htmlFor="days">
          <div className="grid grid-cols-4 gap-1.5" id="days">
            {[32, 46, 92, 181].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={cn(
                  "h-11 rounded-xl border text-sm font-semibold transition",
                  d === days ? "border-primary bg-primary-soft text-primary" : "border-line hover:bg-surface-2",
                )}
              >
                {d}g
              </button>
            ))}
          </div>
        </Field>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 rounded-2xl bg-surface-2 p-4 text-center">
        <div>
          <p className="text-[11px] text-muted">Brüt getiri</p>
          <p className="mt-1 text-sm font-bold tabular">{money(gross)}</p>
        </div>
        <div>
          <p className="text-[11px] text-muted">Stopaj</p>
          <p className="mt-1 text-sm font-bold text-danger tabular">−{money(withholding)}</p>
        </div>
        <div>
          <p className="flex items-center justify-center gap-1 text-[11px] text-muted">
            <Percent className="size-3" /> Net getiri
          </p>
          <p className="mt-1 text-sm font-bold text-success tabular">{money(net)}</p>
        </div>
      </div>
    </Card>
  );
}
