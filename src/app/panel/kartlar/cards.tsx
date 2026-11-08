"use client";

import { CalendarClock, Eye, EyeOff, Globe, Loader2, Nfc, Snowflake, Wallet } from "lucide-react";
import { useState } from "react";
import { BankCardVisual } from "@/components/bank-card";
import {
  Button,
  Card,
  CardHeader,
  Field,
  inputClass,
  Modal,
  parseAmount,
  sanitizeAmount,
  Toggle,
} from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { cn, money } from "@/lib/format";
import { bank, BankError, useBank } from "@/lib/store";
import type { BankCard } from "@/lib/types";

function statementDates() {
  const now = new Date();
  const cut = new Date(now.getFullYear(), now.getMonth(), 22);
  if (cut < now) cut.setMonth(cut.getMonth() + 1);
  const due = new Date(cut);
  due.setDate(due.getDate() + 10);
  const fmt = (d: Date) => d.toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
  return { cut: fmt(cut), due: fmt(due) };
}

export function Cards() {
  const s = useBank();
  const toast = useToast();
  const [selectedId, setSelectedId] = useState("card-platinum");
  const [reveal, setReveal] = useState(false);
  const [payOpen, setPayOpen] = useState(false);

  if (!s) return null;
  const card = s.cards.find((c) => c.id === selectedId) ?? s.cards[0];
  const linked = card.accountId ? s.accounts.find((a) => a.id === card.accountId) : undefined;
  const available = card.kind === "kredi" ? card.limit - card.debt : linked?.balance ?? 0;
  const used = card.limit ? (card.debt / card.limit) * 100 : 0;
  const dates = statementDates();

  const update = (patch: Partial<Pick<BankCard, "frozen" | "online" | "contactless">>, msg: string) => {
    bank.updateCard(card.id, patch);
    toast({ kind: "success", title: msg });
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Kartlarım</h1>
        <p className="mt-1 text-sm text-muted">Kart ayarlarınızı anında yönetin</p>
      </div>

      <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {s.cards.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              setSelectedId(c.id);
              setReveal(false);
            }}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition",
              c.id === card.id ? "border-primary bg-primary-soft text-primary" : "border-line bg-surface text-muted hover:text-fg",
            )}
          >
            {c.name}
            <span className="font-mono text-xs opacity-70">•{c.number.slice(-4)}</span>
            {c.frozen && <Snowflake className="size-3.5" />}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,420px)_1fr]">
        <div className="space-y-4">
          <BankCardVisual key={card.id} card={card} showNumber={reveal} className="animate-slide-up" />
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => setReveal((r) => !r)}>
              {reveal ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              {reveal ? "Bilgileri gizle" : "Kart bilgileri"}
            </Button>
            <Button
              variant={card.frozen ? "primary" : "secondary"}
              onClick={() => update({ frozen: !card.frozen }, card.frozen ? "Kart kullanıma açıldı" : "Kart geçici olarak donduruldu")}
            >
              <Snowflake className="size-4" /> {card.frozen ? "Dondurmayı kaldır" : "Kartı dondur"}
            </Button>
          </div>
          {reveal && (
            <div className="grid animate-fade-in grid-cols-3 gap-2 rounded-2xl border border-line bg-surface p-3 text-center text-xs">
              <div>
                <p className="text-muted">Kart no (son 8)</p>
                <p className="mt-0.5 font-mono font-semibold">{card.number.slice(-8).replace(/(.{4})/, "$1 ")}</p>
              </div>
              <div>
                <p className="text-muted">SKT</p>
                <p className="mt-0.5 font-mono font-semibold">{card.expiry}</p>
              </div>
              <div>
                <p className="text-muted">CVV</p>
                <p className="mt-0.5 font-mono font-semibold">{card.cvv}</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <Card>
            {card.kind === "kredi" ? (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <Stat label="Güncel borç" value={money(card.debt)} />
                  <Stat label="Kullanılabilir limit" value={money(available)} tone="success" />
                  <Stat label="Toplam limit" value={money(card.limit)} />
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className={cn("h-full rounded-full transition-all", used > 70 ? "bg-danger" : "bg-primary")}
                    style={{ width: `${Math.min(100, used)}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-muted">Limitin %{used.toFixed(0)} kadarı kullanılıyor</p>

                <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-surface-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <CalendarClock className="size-5 text-primary" />
                    <div className="text-sm">
                      <p className="font-semibold">Hesap kesim: {dates.cut}</p>
                      <p className="text-xs text-muted">Son ödeme: {dates.due}</p>
                    </div>
                  </div>
                  <Button onClick={() => setPayOpen(true)} disabled={card.debt <= 0}>
                    <Wallet className="size-4" /> Borç öde
                  </Button>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Stat label="Bağlı hesap" value={linked?.name ?? "—"} />
                <Stat label="Kullanılabilir bakiye" value={money(available)} tone="success" />
              </div>
            )}
          </Card>

          <Card>
            <CardHeader title="Kart ayarları" subtitle="Değişiklikler anında uygulanır" />
            <ul className="divide-y divide-line">
              {[
                {
                  icon: Globe,
                  title: "İnternet alışverişi",
                  text: "Online ve yurt dışı e-ticaret işlemleri",
                  value: card.online,
                  onChange: (v: boolean) => update({ online: v }, v ? "İnternet alışverişi açıldı" : "İnternet alışverişi kapatıldı"),
                },
                {
                  icon: Nfc,
                  title: "Temassız ödeme",
                  text: "POS cihazlarında temassız işlem",
                  value: card.contactless,
                  onChange: (v: boolean) => update({ contactless: v }, v ? "Temassız ödeme açıldı" : "Temassız ödeme kapatıldı"),
                },
                {
                  icon: Snowflake,
                  title: "Geçici dondurma",
                  text: "Kartınızı kaybettiyseniz tüm işlemleri durdurun",
                  value: card.frozen,
                  onChange: (v: boolean) => update({ frozen: v }, v ? "Kart geçici olarak donduruldu" : "Kart kullanıma açıldı"),
                },
              ].map(({ icon: Icon, title, text, value, onChange }) => (
                <li key={title} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-surface-2 text-muted">
                    <Icon className="size-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="text-xs text-muted">{text}</p>
                  </div>
                  <Toggle checked={value} onChange={onChange} label={title} disabled={card.frozen && title !== "Geçici dondurma"} />
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      {card.kind === "kredi" && (
        <PayDebtModal key={card.id + payOpen} open={payOpen} onClose={() => setPayOpen(false)} card={card} />
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "success" }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted">{label}</p>
      <p className={cn("mt-1 truncate text-lg font-bold tabular", tone === "success" && "text-success")}>{value}</p>
    </div>
  );
}

function PayDebtModal({ open, onClose, card }: { open: boolean; onClose: () => void; card: BankCard }) {
  const s = useBank();
  const toast = useToast();
  const min = Math.round(card.debt * 0.2 * 100) / 100;
  const [choice, setChoice] = useState<"full" | "min" | "custom">("full");
  const [custom, setCustom] = useState("");
  const [fromId, setFromId] = useState("acc-main");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  if (!s) return null;

  const accounts = s.accounts.filter((a) => a.currency === "TRY");
  const amount = choice === "full" ? card.debt : choice === "min" ? min : parseAmount(custom);

  const pay = () => {
    setLoading(true);
    setError(undefined);
    setTimeout(() => {
      try {
        bank.payCardDebt(card.id, fromId, amount);
        toast({ kind: "success", title: "Kart borcu ödendi", message: `${money(amount)} · ${card.name}` });
        onClose();
      } catch (e) {
        setError(e instanceof BankError ? e.message : "İşlem başarısız.");
      } finally {
        setLoading(false);
      }
    }, 700);
  };

  return (
    <Modal open={open} onClose={onClose} title={`${card.name} borç ödeme`}>
      <div className="space-y-4">
        <div className="space-y-2">
          {(
            [
              ["full", "Toplam borç", card.debt],
              ["min", "Asgari ödeme (%20)", min],
              ["custom", "Farklı tutar", null],
            ] as const
          ).map(([k, label, v]) => (
            <label
              key={k}
              className={cn(
                "flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition",
                choice === k ? "border-primary bg-primary-soft" : "border-line hover:bg-surface-2",
              )}
            >
              <span className="flex items-center gap-3 text-sm font-semibold">
                <input type="radio" name="pay" checked={choice === k} onChange={() => setChoice(k)} className="accent-[var(--primary)]" />
                {label}
              </span>
              {v !== null && <span className="text-sm font-bold tabular">{money(v)}</span>}
            </label>
          ))}
        </div>
        {choice === "custom" && (
          <Field label="Tutar (TL)" htmlFor="custom">
            <input
              id="custom"
              autoFocus
              inputMode="decimal"
              placeholder="0,00"
              value={custom}
              onChange={(e) => setCustom(sanitizeAmount(e.target.value))}
              className={cn(inputClass, "tabular")}
            />
          </Field>
        )}
        <Field label="Ödeme yapılacak hesap" htmlFor="payFrom">
          <select id="payFrom" value={fromId} onChange={(e) => setFromId(e.target.value)} className={inputClass}>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} — {money(a.balance)}
              </option>
            ))}
          </select>
        </Field>
        {error && <p className="rounded-xl bg-danger-soft p-3 text-sm font-medium text-danger">{error}</p>}
        <Button size="lg" className="w-full" onClick={pay} disabled={loading || !(amount > 0)}>
          {loading && <Loader2 className="size-4 animate-spin" />} {money(amount || 0)} öde
        </Button>
      </div>
    </Modal>
  );
}
