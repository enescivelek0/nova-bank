import { Snowflake, Wifi } from "lucide-react";
import { cn, maskCard } from "@/lib/format";
import type { BankCard } from "@/lib/types";

const themes: Record<BankCard["theme"], string> = {
  midnight: "from-slate-900 via-indigo-950 to-indigo-700",
  emerald: "from-emerald-700 via-teal-700 to-cyan-600",
  sunset: "from-fuchsia-600 via-rose-500 to-orange-400",
};

export function BankCardVisual({
  card,
  showNumber = false,
  className,
}: {
  card: BankCard;
  showNumber?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "@container relative aspect-[1.586] w-full overflow-hidden rounded-2xl bg-gradient-to-br p-5 text-white shadow-xl shadow-black/15 select-none",
        themes[card.theme],
        card.frozen && "grayscale-[0.7]",
        className,
      )}
    >
      <div className="pointer-events-none absolute -top-16 -right-10 size-48 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 size-56 rounded-full bg-black/15 blur-2xl" />

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-medium tracking-wide text-white/70 uppercase">
              {card.kind === "kredi" ? "Kredi Kartı" : "Banka Kartı"}
            </p>
            <p className="text-sm font-semibold">{card.name}</p>
          </div>
          {card.contactless && <Wifi className="size-5 rotate-90 text-white/80" aria-hidden />}
        </div>

        <div className="flex items-center gap-3">
          <div className="h-7 w-9 rounded-md bg-gradient-to-br from-amber-200 to-amber-400 opacity-90 shadow-inner" />
          <p className="font-mono text-[5cqw] tracking-[0.1em] whitespace-nowrap tabular">{maskCard(card.number, showNumber)}</p>
        </div>

        <div className="flex items-end justify-between text-xs">
          <div>
            <p className="text-[10px] text-white/60 uppercase">Kart Sahibi</p>
            <p className="font-semibold tracking-wide">{card.holder}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-white/60 uppercase">SKT</p>
            <p className="font-semibold tabular">{card.expiry}</p>
          </div>
          <svg viewBox="0 0 48 30" className="h-7 w-11" aria-hidden>
            <circle cx="17" cy="15" r="13" fill="#fff" fillOpacity=".55" />
            <circle cx="31" cy="15" r="13" fill="#fff" fillOpacity=".3" />
          </svg>
        </div>
      </div>

      {card.frozen && (
        <div className="absolute inset-0 grid place-items-center bg-slate-900/45 backdrop-blur-[2px]">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-900">
            <Snowflake className="size-4" /> Kart donduruldu
          </span>
        </div>
      )}
    </div>
  );
}
