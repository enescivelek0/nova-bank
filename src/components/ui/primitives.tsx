"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/format";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <section className={cn("rounded-2xl border border-line bg-surface p-4 sm:p-5", className)}>
      {children}
    </section>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-[15px] font-semibold">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

export function buttonStyles(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
    size === "sm" && "h-8 px-3 text-xs",
    size === "md" && "h-10 px-4 text-sm",
    size === "lg" && "h-12 px-5 text-[15px]",
    variant === "primary" && "bg-primary text-primary-fg shadow-sm shadow-primary/20 hover:brightness-110",
    variant === "secondary" && "border border-line bg-surface text-fg hover:bg-surface-2",
    variant === "ghost" && "text-muted hover:bg-surface-2 hover:text-fg",
    variant === "danger" && "bg-danger text-white hover:brightness-110",
    className,
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button type={type} {...props} className={buttonStyles(variant, size, className)} />;
}

/** "1.250,50" gibi TR formatlı tutarı sayıya çevirir */
export function parseAmount(value: string) {
  const n = Number(value.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
}

/** Girişi rakam + tek virgül + en fazla 2 ondalık ile sınırlar ve binlik ayırıcı ekler */
export function sanitizeAmount(value: string) {
  const cleaned = value.replace(/[^\d,]/g, "");
  const [int = "", ...rest] = cleaned.split(",");
  const intPart = int.replace(/^0+(?=\d)/, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return rest.length ? `${intPart || "0"},${rest.join("").slice(0, 2)}` : intPart;
}

export function Field({
  label,
  hint,
  error,
  children,
  htmlFor,
}: {
  label: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-xs font-semibold text-muted">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-danger">{error}</p>
      ) : (
        hint && <p className="text-xs text-muted">{hint}</p>
      )}
    </div>
  );
}

export const inputClass =
  "h-11 w-full rounded-xl border border-line bg-surface px-3.5 text-sm text-fg outline-none transition placeholder:text-muted/70 focus:border-primary focus:ring-4 focus:ring-[var(--ring)] aria-[invalid=true]:border-danger";

export function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)] disabled:opacity-50",
        checked ? "bg-primary" : "bg-line",
      )}
    >
      <span
        className={cn(
          "inline-block size-5 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-[22px]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "success" | "danger" | "primary";
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
        tone === "neutral" && "bg-surface-2 text-muted",
        tone === "success" && "bg-success-soft text-success",
        tone === "danger" && "bg-danger-soft text-danger",
        tone === "primary" && "bg-primary-soft text-primary",
      )}
    >
      {children}
    </span>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={id}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="m-auto mb-0 w-full max-w-none rounded-t-3xl border border-line bg-surface p-0 text-fg shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm open:animate-slide-up sm:mb-auto sm:max-w-md sm:rounded-3xl"
    >
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <h2 id={id} className="text-base font-semibold">
          {title}
        </h2>
        <button onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-surface-2" aria-label="Kapat">
          <X className="size-4" />
        </button>
      </div>
      <div className="max-h-[75vh] overflow-y-auto p-5">{children}</div>
    </dialog>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-surface-2", className)} />;
}

export function EmptyState({ icon, title, text }: { icon: ReactNode; title: string; text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="mb-3 grid size-12 place-items-center rounded-2xl bg-surface-2 text-muted">{icon}</div>
      <p className="text-sm font-semibold">{title}</p>
      {text && <p className="mt-1 max-w-xs text-xs text-muted">{text}</p>}
    </div>
  );
}
