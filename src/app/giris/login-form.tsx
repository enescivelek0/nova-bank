"use client";

import { ArrowLeft, Eye, EyeOff, Info, Loader2, Lock, ShieldCheck, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Logo, ThemeToggle } from "@/components/brand";
import { Button, Field, inputClass } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { bank, useBank } from "@/lib/store";
import { cn, dateTime } from "@/lib/format";

export function LoginForm() {
  const router = useRouter();
  const toast = useToast();
  const state = useBank();
  const [customerNo, setCustomerNo] = useState("10293847");
  const [password, setPassword] = useState("246810");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<{ customerNo?: string; password?: string }>({});
  const [step, setStep] = useState<"form" | "otp">("form");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (state?.session.loggedIn) router.replace("/panel");
  }, [state?.session.loggedIn, router]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!/^\d{8,11}$/.test(customerNo)) next.customerNo = "Müşteri numarası veya TCKN 8-11 haneli olmalıdır.";
    if (!/^\d{6}$/.test(password)) next.password = "Şifre 6 haneli rakamlardan oluşmalıdır.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
      setOtp("");
      // SMS gelişini simüle et: kod bildirim olarak gelir ve alana otomatik dolar
      setTimeout(() => {
        const code = String(Math.floor(100000 + Math.random() * 900000));
        toast({ kind: "info", title: "Yeni SMS · Nova Bank", message: `İnternet şubesi giriş doğrulama kodunuz: ${code}` });
        setOtp(code);
      }, 1200);
    }, 700);
  };

  const verify = (e: FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    setLoading(true);
    setTimeout(() => {
      bank.login();
      router.replace("/panel");
    }, 600);
  };

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-700 via-violet-700 to-indigo-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-white/10 blur-3xl" />
        <Link href="/" className="relative inline-flex items-center gap-2 text-sm text-white/80 hover:text-white">
          <ArrowLeft className="size-4" /> Ana sayfa
        </Link>
        <div className="relative max-w-md">
          <h2 className="text-3xl font-bold leading-tight">Finansal hayatınız tek ekranda.</h2>
          <p className="mt-3 text-white/75">
            Hesaplarınız, kartlarınız ve tüm hareketleriniz güvenli, hızlı ve sade bir arayüzde.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-white/85">
            {["İki adımlı doğrulama", "5 dakika hareketsizlikte otomatik çıkış", "IBAN doğrulamalı transferler"].map((t) => (
              <li key={t} className="flex items-center gap-2.5">
                <ShieldCheck className="size-4 text-emerald-300" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-white/50">© 2026 Nova Bank. Tüm hakları saklıdır.</p>
      </aside>

      <main className="flex flex-col px-4 py-5 sm:px-8">
        <div className="flex items-center justify-between">
          <Logo />
          <ThemeToggle />
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          {step === "form" ? (
            <form onSubmit={submit} noValidate className="animate-slide-up space-y-5">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">İnternet Şubesi Girişi</h1>
                <p className="mt-1.5 text-sm text-muted">Hesabınıza erişmek için bilgilerinizi girin.</p>
              </div>

              <Field label="Müşteri No / TCKN" htmlFor="customerNo" error={errors.customerNo}>
                <div className="relative">
                  <User className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
                  <input
                    id="customerNo"
                    inputMode="numeric"
                    autoComplete="username"
                    maxLength={11}
                    value={customerNo}
                    aria-invalid={!!errors.customerNo}
                    onChange={(e) => setCustomerNo(e.target.value.replace(/\D/g, ""))}
                    className={cn(inputClass, "pl-10 tabular")}
                  />
                </div>
              </Field>

              <Field label="Şifre" htmlFor="password" error={errors.password} hint="6 haneli internet şubesi şifreniz">
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
                  <input
                    id="password"
                    type={show ? "text" : "password"}
                    inputMode="numeric"
                    autoComplete="current-password"
                    maxLength={6}
                    value={password}
                    aria-invalid={!!errors.password}
                    onChange={(e) => setPassword(e.target.value.replace(/\D/g, ""))}
                    className={cn(inputClass, "pr-11 pl-10 tracking-widest tabular")}
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted hover:bg-surface-2"
                    aria-label={show ? "Şifreyi gizle" : "Şifreyi göster"}
                  >
                    {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </Field>

              <div className="flex items-center justify-between text-sm">
                <label className="flex cursor-pointer items-center gap-2 text-muted">
                  <input type="checkbox" defaultChecked className="size-4 rounded accent-[var(--primary)]" />
                  Müşteri numaramı hatırla
                </label>
                <button
                  type="button"
                  onClick={() => toast({ kind: "info", title: "Şifre işlemleri", message: "Yeni şifre için mobil uygulamamızı veya en yakın ATM'yi kullanabilirsiniz." })}
                  className="font-semibold text-primary hover:underline"
                >
                  Şifremi unuttum
                </button>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading && <Loader2 className="size-4 animate-spin" />} Devam et
              </Button>

              {state?.session.lastLoginAt && (
                <p className="text-center text-xs text-muted">Son başarılı giriş: {dateTime(state.session.lastLoginAt)}</p>
              )}
            </form>
          ) : (
            <form onSubmit={verify} className="animate-slide-up space-y-5">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Doğrulama kodu</h1>
                <p className="mt-1.5 text-sm text-muted">
                  ••• ••• 42 17 numaralı telefonunuza gönderilen 6 haneli kodu girin.
                </p>
              </div>
              <div className="flex gap-2.5 rounded-xl border border-primary/20 bg-primary-soft p-3 text-xs text-primary">
                <Info className="mt-0.5 size-4 shrink-0" />
                <p>Kodu kimseyle paylaşmayın. Nova Bank çalışanları doğrulama kodunuzu asla sormaz.</p>
              </div>
              <Field label="SMS kodu" htmlFor="otp">
                <input
                  id="otp"
                  autoFocus
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otp}
                  placeholder="••••••"
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className={cn(inputClass, "h-14 text-center text-2xl font-bold tracking-[0.5em] tabular")}
                />
              </Field>
              <Button type="submit" size="lg" className="w-full" disabled={loading || otp.length !== 6}>
                {loading && <Loader2 className="size-4 animate-spin" />} Giriş yap
              </Button>
              <button
                type="button"
                onClick={() => setStep("form")}
                className="mx-auto flex items-center gap-1.5 text-sm font-medium text-muted hover:text-fg"
              >
                <ArrowLeft className="size-4" /> Geri dön
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
