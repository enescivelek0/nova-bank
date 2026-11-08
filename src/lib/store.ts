"use client";

import { useSyncExternalStore } from "react";
import { isNovaIban, normalizeIban } from "./iban";
import { makeRef } from "./format";
import { createSeedState, STATE_VERSION } from "./seed";
import type { BankCard, BankState, Currency, Recipient, Transaction } from "./types";

const STORAGE_KEY = "nova-bank-state";

/** Döviz alış kurları */
export const FX_RATES: Record<Currency, number> = { TRY: 1, USD: 41.82, EUR: 48.57 };

let state: BankState | null = null;
const listeners = new Set<() => void>();

function read(): BankState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as BankState;
      if (parsed.version === STATE_VERSION) return parsed;
    }
  } catch {
    /* depolama erişilemez: seed ile devam et */
  }
  return createSeedState();
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* yoksay */
  }
}

function getSnapshot() {
  if (!state) state = read();
  return state;
}

function setState(updater: (s: BankState) => BankState) {
  state = updater(getSnapshot());
  persist();
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      state = read();
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Sunucuda null döner; istemcide localStorage'dan yüklenen durum. */
export function useBank(): BankState | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}

export class BankError extends Error {}

export const bank = {
  login() {
    setState((s) => ({
      ...s,
      session: { loggedIn: true, loginAt: new Date().toISOString(), lastLoginAt: s.session.loginAt ?? s.session.lastLoginAt },
    }));
  },

  logout() {
    setState((s) => ({ ...s, session: { loggedIn: false, lastLoginAt: s.session.loginAt ?? s.session.lastLoginAt } }));
  },

  resetData() {
    const fresh = createSeedState();
    fresh.session = { ...fresh.session, loggedIn: true, loginAt: new Date().toISOString() };
    setState(() => fresh);
  },

  transfer(input: {
    fromId: string;
    toAccountId?: string;
    toIban?: string;
    toName?: string;
    amount: number;
    description?: string;
    saveRecipient?: boolean;
  }): Transaction {
    const s = getSnapshot();
    const from = s.accounts.find((a) => a.id === input.fromId);
    if (!from) throw new BankError("Gönderen hesap bulunamadı.");
    if (!(input.amount > 0)) throw new BankError("Geçerli bir tutar girin.");
    if (input.amount > from.balance) throw new BankError("Hesap bakiyesi yetersiz.");

    const now = new Date().toISOString();
    const reference = makeRef();
    const own = input.toAccountId ? s.accounts.find((a) => a.id === input.toAccountId) : undefined;
    if (input.toAccountId && !own) throw new BankError("Alıcı hesap bulunamadı.");
    if (own && own.currency !== from.currency) throw new BankError("Hesaplar arası transfer aynı para birimiyle yapılabilir.");

    const iban = own ? own.iban : normalizeIban(input.toIban ?? "");
    const counterparty = own ? own.name : input.toName?.trim() || "Alıcı";
    const channel: Transaction["channel"] = own || isNovaIban(iban) ? "havale" : "fast";

    const outTx: Transaction = {
      id: `tx-${crypto.randomUUID()}`,
      accountId: from.id,
      date: now,
      title: own ? `Hesaplar Arası — ${own.name}` : `Giden Transfer — ${counterparty}`,
      description: input.description?.trim() || undefined,
      category: "transfer",
      amount: -input.amount,
      balanceAfter: Math.round((from.balance - input.amount) * 100) / 100,
      channel,
      counterparty,
      counterpartyIban: iban,
      reference,
    };

    setState((prev) => {
      const transactions = [outTx, ...prev.transactions];
      const accounts = prev.accounts.map((a) => {
        if (a.id === from.id) return { ...a, balance: outTx.balanceAfter! };
        if (own && a.id === own.id) return { ...a, balance: Math.round((a.balance + input.amount) * 100) / 100 };
        return a;
      });
      if (own) {
        const target = accounts.find((a) => a.id === own.id)!;
        transactions.unshift({
          ...outTx,
          id: `tx-${crypto.randomUUID()}`,
          accountId: own.id,
          title: `Hesaplar Arası — ${from.name}`,
          amount: input.amount,
          balanceAfter: target.balance,
          counterparty: from.name,
          counterpartyIban: from.iban,
        });
      }
      let recipients = prev.recipients;
      if (!own && input.saveRecipient && !recipients.some((r) => r.iban === iban)) {
        const r: Recipient = {
          id: `rcp-${crypto.randomUUID()}`,
          name: counterparty,
          iban,
          bank: isNovaIban(iban) ? "Nova Bank" : "Diğer Banka",
        };
        recipients = [...recipients, r];
      }
      return { ...prev, accounts, transactions, recipients };
    });
    return outTx;
  },

  payCardDebt(cardId: string, fromId: string, amount: number): Transaction {
    const s = getSnapshot();
    const card = s.cards.find((c) => c.id === cardId);
    const from = s.accounts.find((a) => a.id === fromId);
    if (!card || card.kind !== "kredi") throw new BankError("Kart bulunamadı.");
    if (!from || from.currency !== "TRY") throw new BankError("TL hesabı seçin.");
    if (!(amount > 0)) throw new BankError("Geçerli bir tutar girin.");
    if (amount > card.debt + 0.001) throw new BankError("Tutar kart borcundan fazla olamaz.");
    if (amount > from.balance) throw new BankError("Hesap bakiyesi yetersiz.");

    const t: Transaction = {
      id: `tx-${crypto.randomUUID()}`,
      accountId: from.id,
      date: new Date().toISOString(),
      title: "Kredi Kartı Borç Ödemesi",
      description: `${card.name} •••• ${card.number.slice(-4)}`,
      category: "kart",
      amount: -amount,
      balanceAfter: Math.round((from.balance - amount) * 100) / 100,
      channel: "havale",
      reference: makeRef(),
    };
    setState((prev) => ({
      ...prev,
      transactions: [t, ...prev.transactions],
      accounts: prev.accounts.map((a) => (a.id === from.id ? { ...a, balance: t.balanceAfter! } : a)),
      cards: prev.cards.map((c) => (c.id === card.id ? { ...c, debt: Math.round((c.debt - amount) * 100) / 100 } : c)),
    }));
    return t;
  },

  updateCard(cardId: string, patch: Partial<Pick<BankCard, "frozen" | "online" | "contactless">>) {
    setState((prev) => ({
      ...prev,
      cards: prev.cards.map((c) => (c.id === cardId ? { ...c, ...patch } : c)),
    }));
  },

  removeRecipient(id: string) {
    setState((prev) => ({ ...prev, recipients: prev.recipients.filter((r) => r.id !== id) }));
  },
};

export function totalAssetsTry(s: BankState) {
  return s.accounts.reduce((sum, a) => sum + a.balance * FX_RATES[a.currency], 0);
}
