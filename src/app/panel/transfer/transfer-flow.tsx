"use client";

import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Loader2,
  Printer,
  Repeat,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  Button,
  buttonStyles,
  Card,
  CardHeader,
  Field,
  inputClass,
  parseAmount,
  sanitizeAmount,
} from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { cn, dateTime, money } from "@/lib/format";
import { formatIban, isNovaIban, isValidTrIban, makeTrIban, normalizeIban } from "@/lib/iban";
import { bank, BankError, useBank } from "@/lib/store";
import type { Transaction } from "@/lib/types";

const DAILY_LIMIT = 250_000;
const EXAMPLE_IBAN = formatIban(makeTrIban("00905", "0000003141592653"));

type Mode = "external" | "own";
type Step = "form" | "confirm" | "done";

interface Draft {
  fromId: string;
  toAccountId: string;
  iban: string;
  name: string;
  amount: string;
  description: string;
  save: boolean;
}

export function TransferFlow() {
  const s = useBank();
  const toast = useToast();
  const [mode, setMode] = useState<Mode>("external");
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Transaction | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof Draft, string>>>({});
  const [d, setD] = useState<Draft>({
    fromId: "acc-main",
    toAccountId: "acc-savings",
    iban: "",
    name: "",
    amount: "",
    description: "",
    save: true,
  });

  if (!s) return null;

  const tryAccounts = s.accounts.filter((a) => a.currency === "TRY");
  const from = s.accounts.find((a) => a.id === d.fromId) ?? tryAccounts[0];
  const ownTargets = tryAccounts.filter((a) => a.id !== from.id);
  const toOwn = s.accounts.find((a) => a.id === d.toAccountId && a.id !== from.id) ?? ownTargets[0];
  const amount = parseAmount(d.amount);
  const iban = normalizeIban(d.iban);
  const ibanValid = isValidTrIban(iban);
  const channel = mode === "own" || (ibanValid && isNovaIban(iban)) ? "Havale" : "FAST";
  const fee = 0;

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setD((p) => ({ ...p, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (mode === "external") {
      if (!iban) next.iban = "Alıcı IBAN'ını girin.";
      else if (!ibanValid) next.iban = "Geçersiz IBAN. TR ile başlayan 26 karakterli IBAN girin.";
      else if (s.accounts.some((a) => a.iban === iban)) next.iban = "Kendi hesabınız için 'Hesaplarım arası' sekmesini kullanın.";
      if (d.name.trim().length < 3) next.name = "Alıcı adını ve soyadını girin.";
    }
    if (!(amount > 0)) next.amount = "Geçerli bir tutar girin.";
    else if (amount > from.balance) next.amount = `Yetersiz bakiye. Kullanılabilir: ${money(from.balance)}`;
    else if (amount > DAILY_LIMIT) next.amount = `Günlük transfer limiti ${money(DAILY_LIMIT)}.`;
    setErrors(next);
    if (!Object.keys(next).length) setStep("confirm");
  };

  const confirm = () => {
    setLoading(true);
    setTimeout(() => {
      try {
        const tx = bank.transfer(
          mode === "own"
            ? { fromId: from.id, toAccountId: toOwn.id, amount, description: d.description }
            : { fromId: from.id, toIban: iban, toName: d.name, amount, description: d.description, saveRecipient: d.save },
        );
        setResult(tx);
        setStep("done");
        toast({ kind: "success", title: "Transfer gerçekleşti", message: `${money(amount)} gönderildi.` });
      } catch (err) {
        toast({ kind: "error", title: "İşlem başarısız", message: err instanceof BankError ? err.message : "Beklenmeyen hata." });
        setStep("form");
      } finally {
        setLoading(false);
      }
    }, 900);
  };

  const reset = () => {
    setD((p) => ({ ...p, iban: "", name: "", amount: "", description: "" }));
    setResult(null);
    setStep("form");
  };

  const recipientName = mode === "own" ? toOwn?.name : d.name;
  const recipientIban = mode === "own" ? toOwn?.iban : iban;

  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Para Gönder</h1>
        <p className="mt-1 text-sm text-muted">Havale, EFT ve FAST ile 7/24 anında transfer</p>
      </div>

      <Stepper step={step} />

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <Card className="p-5 sm:p-6">
          {step === "form" && (
            <form onSubmit={validate} noValidate className="animate-fade-in space-y-5">
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-surface-2 p-1">
                {(
                  [
                    ["external", "Başka hesaba", UserRound],
                    ["own", "Hesaplarım arası", Repeat],
                  ] as const
                ).map(([m, label, Icon]) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setMode(m);
                      setErrors({});
                    }}
                    className={cn(
                      "flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition",
                      mode === m ? "bg-surface text-fg shadow-sm" : "text-muted hover:text-fg",
                    )}
                  >
                    <Icon className="size-4" /> {label}
                  </button>
                ))}
              </div>

              <Field label="Gönderen hesap" htmlFor="from">
                <select id="from" value={from.id} onChange={(e) => set("fromId", e.target.value)} className={inputClass}>
                  {tryAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} — {money(a.balance)}
                    </option>
                  ))}
                </select>
              </Field>

              {mode === "own" ? (
                <Field label="Alıcı hesap" htmlFor="to">
                  <select id="to" value={toOwn?.id} onChange={(e) => set("toAccountId", e.target.value)} className={inputClass}>
                    {ownTargets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} — {money(a.balance)}
                      </option>
                    ))}
                  </select>
                </Field>
              ) : (
                <>
                  {s.recipients.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-semibold text-muted">Kayıtlı alıcılar</p>
                      <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                        {s.recipients.map((r) => (
                          <div key={r.id} className="group relative">
                            <button
                              type="button"
                              onClick={() => {
                                setD((p) => ({ ...p, iban: formatIban(r.iban), name: r.name }));
                                setErrors({});
                              }}
                              className={cn(
                                "flex w-36 shrink-0 flex-col items-start rounded-xl border p-2.5 text-left transition",
                                iban === r.iban ? "border-primary bg-primary-soft" : "border-line hover:bg-surface-2",
                              )}
                            >
                              <span className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-[11px] font-bold text-slate-700 dark:from-slate-700 dark:to-slate-800 dark:text-slate-200">
                                {r.name
                                  .split(" ")
                                  .slice(0, 2)
                                  .map((x) => x[0])
                                  .join("")}
                              </span>
                              <span className="mt-2 w-full truncate text-xs font-semibold">{r.name}</span>
                              <span className="text-[10px] text-muted">{r.bank}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => bank.removeRecipient(r.id)}
                              className="absolute top-1.5 right-1.5 hidden rounded-md p-1 text-muted group-hover:block hover:bg-danger-soft hover:text-danger"
                              aria-label={`${r.name} alıcısını sil`}
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Field
                    label="Alıcı IBAN"
                    htmlFor="iban"
                    error={errors.iban}
                    hint={
                      ibanValid ? (
                        <span className="inline-flex items-center gap-1 font-medium text-success">
                          <BadgeCheck className="size-3.5" /> Geçerli IBAN · {isNovaIban(iban) ? "Nova Bank (Havale)" : "Diğer banka (FAST)"}
                        </span>
                      ) : (
                        `Örnek: ${EXAMPLE_IBAN}`
                      )
                    }
                  >
                    <input
                      id="iban"
                      value={d.iban}
                      aria-invalid={!!errors.iban}
                      autoComplete="off"
                      placeholder="TR__ ____ ____ ____ ____ ____ __"
                      onChange={(e) => {
                        let v = normalizeIban(e.target.value).replace(/[^A-Z0-9]/g, "");
                        if (/^\d/.test(v)) v = "TR" + v;
                        set("iban", formatIban(v.slice(0, 26)));
                      }}
                      className={cn(inputClass, "font-mono tracking-wide uppercase")}
                    />
                  </Field>

                  <Field label="Alıcı adı soyadı" htmlFor="name" error={errors.name}>
                    <input
                      id="name"
                      value={d.name}
                      aria-invalid={!!errors.name}
                      onChange={(e) => set("name", e.target.value)}
                      placeholder="Ad Soyad / Unvan"
                      className={inputClass}
                    />
                  </Field>
                </>
              )}

              <Field
                label="Tutar"
                htmlFor="amount"
                error={errors.amount}
                hint={`Kullanılabilir bakiye: ${money(from.balance)}`}
              >
                <div className="relative">
                  <input
                    id="amount"
                    inputMode="decimal"
                    value={d.amount}
                    aria-invalid={!!errors.amount}
                    placeholder="0,00"
                    onChange={(e) => set("amount", sanitizeAmount(e.target.value))}
                    className={cn(inputClass, "h-14 pr-12 text-xl font-bold tabular")}
                  />
                  <span className="absolute top-1/2 right-4 -translate-y-1/2 text-lg font-bold text-muted">₺</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[500, 1000, 2500, 5000].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => set("amount", sanitizeAmount(String(v)))}
                      className="rounded-lg border border-line px-2.5 py-1 text-xs font-semibold text-muted transition hover:border-primary hover:text-primary"
                    >
                      {v.toLocaleString("tr-TR")} ₺
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Açıklama (isteğe bağlı)" htmlFor="desc">
                <input
                  id="desc"
                  maxLength={60}
                  value={d.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Örn. Kira, borç iadesi"
                  className={inputClass}
                />
              </Field>

              {mode === "external" && !s.recipients.some((r) => r.iban === iban) && (
                <label className="flex cursor-pointer items-center gap-2.5 text-sm">
                  <input
                    type="checkbox"
                    checked={d.save}
                    onChange={(e) => set("save", e.target.checked)}
                    className="size-4 rounded accent-[var(--primary)]"
                  />
                  Alıcıyı kayıtlı alıcılarıma ekle
                </label>
              )}

              <Button type="submit" size="lg" className="w-full">
                Devam et <ArrowRight className="size-4" />
              </Button>
            </form>
          )}

          {step === "confirm" && (
            <div className="animate-fade-in space-y-5">
              <div className="text-center">
                <p className="text-sm text-muted">Gönderilecek tutar</p>
                <p className="mt-1 text-4xl font-bold tracking-tight tabular">{money(amount)}</p>
              </div>
              <Summary
                rows={[
                  ["Gönderen", `${from.name}`],
                  ["Alıcı", recipientName],
                  ["Alıcı IBAN", recipientIban ? formatIban(recipientIban) : ""],
                  ["İşlem tipi", channel],
                  ["Açıklama", d.description || "—"],
                  ["İşlem ücreti", fee ? money(fee) : "Ücretsiz"],
                  ["İşlem sonrası bakiye", money(from.balance - amount)],
                ]}
              />
              <div className="flex items-start gap-2.5 rounded-xl bg-surface-2 p-3 text-xs text-muted">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" />
                Lütfen alıcı bilgilerini kontrol edin. Onayladıktan sonra işlem geri alınamaz.
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="secondary" size="lg" onClick={() => setStep("form")} disabled={loading}>
                  <ArrowLeft className="size-4" /> Düzenle
                </Button>
                <Button size="lg" onClick={confirm} disabled={loading}>
                  {loading ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />} Onayla
                </Button>
              </div>
            </div>
          )}

          {step === "done" && result && (
            <div className="animate-slide-up space-y-5 text-center">
              <div className="mx-auto grid size-16 place-items-center rounded-full bg-success-soft text-success">
                <CheckCircle2 className="size-9" />
              </div>
              <div>
                <h2 className="text-lg font-bold">İşleminiz başarıyla gerçekleşti</h2>
                <p className="mt-1 text-sm text-muted">
                  {money(amount)} tutarındaki transferiniz {recipientName} adlı alıcıya iletildi.
                </p>
              </div>
              <Summary
                rows={[
                  ["Referans no", result.reference],
                  ["Tarih", dateTime(result.date)],
                  ["Alıcı IBAN", recipientIban ? formatIban(recipientIban) : ""],
                  ["Kalan bakiye", money(result.balanceAfter ?? 0)],
                ]}
              />
              <div className="no-print grid gap-3 sm:grid-cols-3">
                <Button variant="secondary" onClick={() => window.print()}>
                  <Printer className="size-4" /> Dekont
                </Button>
                <Button variant="secondary" onClick={reset}>
                  <Repeat className="size-4" /> Yeni transfer
                </Button>
                <Link href="/panel" className={buttonStyles("primary")}>
                  Özete dön
                </Link>
              </div>
            </div>
          )}
        </Card>

        <aside className="space-y-4">
          <Card>
            <CardHeader title="Transfer bilgileri" />
            <ul className="space-y-3 text-sm">
              {[
                { icon: Repeat, t: "Havale", d: "Nova Bank hesaplarına 7/24 anında, ücretsiz." },
                { icon: Building2, t: "FAST", d: "Diğer bankalara 7/24 anında gönderim." },
                { icon: ShieldCheck, t: "Günlük limit", d: `${money(DAILY_LIMIT)} (mobil ve internet şubesi)` },
              ].map(({ icon: Icon, t, d }) => (
                <li key={t} className="flex gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                    <Icon className="size-4" />
                  </span>
                  <div>
                    <p className="font-semibold">{t}</p>
                    <p className="text-xs text-muted">{d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Stepper({ step }: { step: Step }) {
  const steps: Array<[Step, string]> = [
    ["form", "Bilgiler"],
    ["confirm", "Onay"],
    ["done", "Sonuç"],
  ];
  const idx = steps.findIndex(([k]) => k === step);
  return (
    <ol className="flex items-center gap-2">
      {steps.map(([k, label], i) => (
        <li key={k} className="flex flex-1 items-center gap-2">
          <span
            className={cn(
              "grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold transition",
              i <= idx ? "bg-primary text-primary-fg" : "bg-surface-2 text-muted",
            )}
          >
            {i + 1}
          </span>
          <span className={cn("text-xs font-semibold sm:text-sm", i <= idx ? "text-fg" : "text-muted")}>{label}</span>
          {i < steps.length - 1 && <span className={cn("h-0.5 flex-1 rounded-full", i < idx ? "bg-primary" : "bg-line")} />}
        </li>
      ))}
    </ol>
  );
}

function Summary({ rows }: { rows: Array<[string, string | undefined]> }) {
  return (
    <dl className="divide-y divide-line rounded-2xl border border-line text-left">
      {rows.map(([k, v]) => (
        <div key={k} className="flex items-start justify-between gap-4 px-4 py-3 text-sm">
          <dt className="shrink-0 text-muted">{k}</dt>
          <dd className="text-right font-semibold break-all">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
