export type Currency = "TRY" | "USD" | "EUR";

export type AccountType = "vadesiz" | "vadeli" | "doviz";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  iban: string;
  currency: Currency;
  balance: number;
  branch: string;
  openedAt: string;
  /** Vadeli hesaplar için yıllık faiz oranı (%) */
  rate?: number;
}

export type CardKind = "kredi" | "banka";

export interface BankCard {
  id: string;
  name: string;
  kind: CardKind;
  number: string;
  expiry: string;
  cvv: string;
  holder: string;
  limit: number;
  debt: number;
  accountId?: string;
  frozen: boolean;
  online: boolean;
  contactless: boolean;
  theme: "midnight" | "emerald" | "sunset";
}

export type Category =
  | "maas"
  | "market"
  | "fatura"
  | "restoran"
  | "ulasim"
  | "eglence"
  | "alisveris"
  | "saglik"
  | "transfer"
  | "kart"
  | "diger";

export interface Transaction {
  id: string;
  accountId: string;
  date: string;
  title: string;
  description?: string;
  category: Category;
  /** Pozitif: giriş, negatif: çıkış */
  amount: number;
  balanceAfter?: number;
  channel: "kart" | "havale" | "eft" | "fast" | "otomatik" | "sube";
  counterparty?: string;
  counterpartyIban?: string;
  reference: string;
}

export interface Recipient {
  id: string;
  name: string;
  iban: string;
  bank: string;
}

export interface BankState {
  version: number;
  session: { loggedIn: boolean; loginAt?: string; lastLoginAt?: string };
  customer: { name: string; customerNo: string; email: string; phone: string };
  accounts: Account[];
  cards: BankCard[];
  transactions: Transaction[];
  recipients: Recipient[];
}
