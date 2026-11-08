"use client";

import { Copy, Printer } from "lucide-react";
import { Button, Modal } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { categoryMeta, channelLabel, cn, dateTime, money } from "@/lib/format";
import { formatIban } from "@/lib/iban";
import type { Account, Transaction } from "@/lib/types";
import { CategoryIcon } from "./transaction-row";

export function TransactionDetail({
  tx,
  account,
  onClose,
}: {
  tx: Transaction | null;
  account?: Account;
  onClose: () => void;
}) {
  const toast = useToast();
  const currency = account?.currency ?? "TRY";

  const rows: Array<[string, string | undefined]> = tx
    ? [
        ["İşlem tarihi", dateTime(tx.date)],
        ["Hesap", account ? `${account.name}` : undefined],
        ["Kategori", categoryMeta[tx.category].label],
        ["İşlem kanalı", channelLabel[tx.channel]],
        ["Karşı taraf", tx.counterparty],
        ["Karşı IBAN", tx.counterpartyIban ? formatIban(tx.counterpartyIban) : undefined],
        ["Açıklama", tx.description],
        ["İşlem sonrası bakiye", tx.balanceAfter !== undefined ? money(tx.balanceAfter, currency) : undefined],
        ["Referans no", tx.reference],
      ]
    : [];

  return (
    <Modal open={!!tx} onClose={onClose} title="İşlem Detayı">
      {tx && (
        <div className="space-y-5">
          <div className="flex flex-col items-center text-center">
            <CategoryIcon tx={tx} className="size-12" />
            <p className="mt-3 text-sm font-medium text-muted">{tx.title}</p>
            <p className={cn("mt-1 text-2xl font-bold tabular", tx.amount > 0 ? "text-success" : "text-fg")}>
              {money(tx.amount, currency, { sign: true })}
            </p>
          </div>
          <dl className="divide-y divide-line rounded-2xl border border-line">
            {rows
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k} className="flex items-start justify-between gap-4 px-4 py-2.5 text-sm">
                  <dt className="shrink-0 text-muted">{k}</dt>
                  <dd className="text-right font-medium break-all">{v}</dd>
                </div>
              ))}
          </dl>
          <div className="no-print grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                navigator.clipboard?.writeText(tx.reference).catch(() => {});
                toast({ kind: "success", title: "Referans numarası kopyalandı" });
              }}
            >
              <Copy className="size-4" /> Referansı kopyala
            </Button>
            <Button variant="secondary" onClick={() => window.print()}>
              <Printer className="size-4" /> Dekont yazdır
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
