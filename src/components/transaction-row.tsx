import {
  ArrowDownLeft,
  ArrowUpRight,
  Bus,
  CreditCard,
  HeartPulse,
  Landmark,
  Receipt,
  ShoppingBag,
  ShoppingCart,
  Ticket,
  UtensilsCrossed,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { categoryMeta, cn, money, timeOnly } from "@/lib/format";
import type { Category, Currency, Transaction } from "@/lib/types";

export const categoryIcon: Record<Category, LucideIcon> = {
  maas: Wallet,
  market: ShoppingCart,
  fatura: Receipt,
  restoran: UtensilsCrossed,
  ulasim: Bus,
  eglence: Ticket,
  alisveris: ShoppingBag,
  saglik: HeartPulse,
  transfer: ArrowUpRight,
  kart: CreditCard,
  diger: Landmark,
};

export function CategoryIcon({ tx, className }: { tx: Transaction; className?: string }) {
  const Icon = tx.category === "transfer" && tx.amount > 0 ? ArrowDownLeft : categoryIcon[tx.category];
  const color = categoryMeta[tx.category].color;
  return (
    <span
      className={cn("grid size-10 shrink-0 place-items-center rounded-xl", className)}
      style={{ backgroundColor: `${color}1a`, color }}
    >
      <Icon className="size-[18px]" />
    </span>
  );
}

export function TransactionRow({
  tx,
  currency = "TRY",
  onClick,
  subtitle,
}: {
  tx: Transaction;
  currency?: Currency;
  onClick?: () => void;
  subtitle?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-none"
    >
      <CategoryIcon tx={tx} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{tx.title}</p>
        <p className="truncate text-xs text-muted">
          {subtitle ?? `${categoryMeta[tx.category].label} · ${timeOnly(tx.date)}`}
        </p>
      </div>
      <p className={cn("shrink-0 text-sm font-semibold tabular", tx.amount > 0 ? "text-success" : "text-fg")}>
        {money(tx.amount, currency, { sign: true })}
      </p>
    </button>
  );
}
