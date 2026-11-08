"use client";

import { useState } from "react";
import { compactMoney, money } from "@/lib/format";

export interface Slice {
  key: string;
  label: string;
  value: number;
  color: string;
}

export function Donut({ data, total }: { data: Slice[]; total: number }) {
  const [active, setActive] = useState<string | null>(null);
  const r = 42;
  const c = 2 * Math.PI * r;
  const gap = data.length > 1 ? 1.6 : 0;
  const shown = data.find((d) => d.key === active);

  const arcs = data.reduce<Array<Slice & { len: number; offset: number }>>((acc, d) => {
    const prev = acc[acc.length - 1];
    const offset = prev ? prev.offset + prev.len + gap : 0;
    const len = Math.max(0, (d.value / total) * c - gap);
    acc.push({ ...d, len, offset });
    return acc;
  }, []);

  return (
    <div className="@container">
    <div className="flex flex-col items-center gap-5 @md:flex-row">
      <div className="relative size-40 shrink-0">
        <svg viewBox="0 0 100 100" className="size-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="11" />
          {arcs.map((d) => (
            <circle
              key={d.key}
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke={d.color}
              strokeWidth={active === d.key ? 13 : 11}
              strokeDasharray={`${d.len} ${c - d.len}`}
              strokeDashoffset={-d.offset}
              className="cursor-pointer transition-all duration-200"
              opacity={active && active !== d.key ? 0.35 : 1}
              onMouseEnter={() => setActive(d.key)}
              onMouseLeave={() => setActive(null)}
            />
          ))}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="text-[11px] text-muted">{shown ? shown.label : "Toplam"}</p>
            <p className="text-sm font-bold tabular">{money(shown ? shown.value : total)}</p>
          </div>
        </div>
      </div>
      <ul className="grid w-full grid-cols-2 gap-x-4 gap-y-2 @md:grid-cols-1">
        {data.map((d) => (
          <li
            key={d.key}
            className="flex items-center justify-between gap-2 text-xs"
            onMouseEnter={() => setActive(d.key)}
            onMouseLeave={() => setActive(null)}
          >
            <span className="flex min-w-0 items-center gap-2">
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: d.color }} />
              <span className="truncate text-muted">{d.label}</span>
            </span>
            <span className="font-semibold tabular">%{Math.round((d.value / total) * 100)}</span>
          </li>
        ))}
      </ul>
    </div>
    </div>
  );
}

export interface BarPoint {
  label: string;
  income: number;
  expense: number;
}

export function IncomeExpenseBars({ data }: { data: BarPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.flatMap((d) => [d.income, d.expense]));
  const steps = [1, 0.5, 0];

  return (
    <div>
      <div className="relative flex h-44 gap-2 pl-12">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex w-full flex-col justify-between">
          {steps.map((s) => (
            <div key={s} className="flex items-center gap-2">
              <span className="w-10 text-right text-[10px] text-muted tabular">{compactMoney(max * s)}</span>
              <span className="h-px flex-1 border-t border-dashed border-line" />
            </div>
          ))}
        </div>
        {data.map((d, i) => (
          <div
            key={d.label}
            className="relative flex flex-1 items-end justify-center gap-1"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <div
              className="w-full max-w-4 rounded-t-md bg-success transition-all"
              style={{ height: `${(d.income / max) * 100}%`, opacity: hover === null || hover === i ? 1 : 0.4 }}
            />
            <div
              className="w-full max-w-4 rounded-t-md bg-primary transition-all"
              style={{ height: `${(d.expense / max) * 100}%`, opacity: hover === null || hover === i ? 1 : 0.4 }}
            />
            {hover === i && (
              <div className="absolute bottom-full z-10 mb-2 w-max rounded-xl border border-line bg-surface px-3 py-2 text-[11px] shadow-lg">
                <p className="mb-1 font-semibold">{d.label}</p>
                <p className="text-success tabular">Gelir: {money(d.income)}</p>
                <p className="text-primary tabular">Gider: {money(d.expense)}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2 pl-12">
        {data.map((d) => (
          <span key={d.label} className="flex-1 text-center text-[11px] text-muted">
            {d.label}
          </span>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-success" /> Gelir</span>
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-primary" /> Gider</span>
      </div>
    </div>
  );
}
