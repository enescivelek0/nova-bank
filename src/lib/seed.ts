import { makeTrIban, NOVA_BANK_CODE } from "./iban";
import type { Account, BankCard, BankState, Category, Recipient, Transaction } from "./types";

export const STATE_VERSION = 1;

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

export function createSeedState(now = new Date()): BankState {
  const rand = mulberry32(20261108);
  const between = (min: number, max: number) => Math.round((min + rand() * (max - min)) * 100) / 100;
  const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
  let refCounter = 482193;
  const ref = () => `NB${(refCounter++).toString(36).toUpperCase()}${pad(Math.floor(rand() * 99))}`;

  const accounts: Account[] = [
    {
      id: "acc-main",
      name: "Vadesiz TL Hesabı",
      type: "vadesiz",
      currency: "TRY",
      balance: 84250.75,
      iban: makeTrIban(NOVA_BANK_CODE, "0000001029384701"),
      branch: "Levent Ticari Şube",
      openedAt: "2021-03-14T09:00:00.000Z",
    },
    {
      id: "acc-savings",
      name: "Birikim Vadeli Hesabı",
      type: "vadeli",
      currency: "TRY",
      balance: 250000,
      rate: 42,
      iban: makeTrIban(NOVA_BANK_CODE, "0000001029384702"),
      branch: "Levent Ticari Şube",
      openedAt: "2023-06-02T09:00:00.000Z",
    },
    {
      id: "acc-usd",
      name: "Dolar Hesabı",
      type: "doviz",
      currency: "USD",
      balance: 3420.5,
      iban: makeTrIban(NOVA_BANK_CODE, "0000001029384703"),
      branch: "Levent Ticari Şube",
      openedAt: "2022-01-20T09:00:00.000Z",
    },
    {
      id: "acc-eur",
      name: "Euro Hesabı",
      type: "doviz",
      currency: "EUR",
      balance: 1150,
      iban: makeTrIban(NOVA_BANK_CODE, "0000001029384704"),
      branch: "Levent Ticari Şube",
      openedAt: "2024-09-11T09:00:00.000Z",
    },
  ];

  const cards: BankCard[] = [
    {
      id: "card-platinum",
      name: "Nova Platinum",
      kind: "kredi",
      number: "4000123456781234",
      expiry: "08/30",
      cvv: "381",
      holder: "DENİZ ARSLAN",
      limit: 120000,
      debt: 18640.3,
      frozen: false,
      online: true,
      contactless: true,
      theme: "midnight",
    },
    {
      id: "card-debit",
      name: "Nova Banka Kartı",
      kind: "banka",
      number: "4000987654325678",
      expiry: "03/29",
      cvv: "742",
      holder: "DENİZ ARSLAN",
      limit: 0,
      debt: 0,
      accountId: "acc-main",
      frozen: false,
      online: true,
      contactless: true,
      theme: "emerald",
    },
    {
      id: "card-virtual",
      name: "Nova Sanal Kart",
      kind: "kredi",
      number: "4000555566669012",
      expiry: "11/28",
      cvv: "205",
      holder: "DENİZ ARSLAN",
      limit: 15000,
      debt: 1249.9,
      frozen: false,
      online: true,
      contactless: false,
      theme: "sunset",
    },
  ];

  const recipients: Recipient[] = [
    { id: "rcp-1", name: "Ayşe Demir", iban: makeTrIban(NOVA_BANK_CODE, "0000004455667701"), bank: "Nova Bank" },
    { id: "rcp-2", name: "Mehmet Yılmaz", iban: makeTrIban("00901", "0000007788990012"), bank: "Diğer Banka" },
    { id: "rcp-3", name: "Kemal Aydın (Kira)", iban: makeTrIban("00902", "0000001122334455"), bank: "Diğer Banka" },
    { id: "rcp-4", name: "Zeynep Kaya", iban: makeTrIban("00903", "0000009988776655"), bank: "Diğer Banka" },
  ];

  const tx: Transaction[] = [];
  const push = (t: Omit<Transaction, "id" | "reference">) =>
    tx.push({ ...t, id: `tx-${tx.length + 1}`, reference: ref() });

  const at = (d: Date, h: number, m: number) => {
    const x = new Date(d);
    x.setHours(h, m, 0, 0);
    return x.toISOString();
  };

  const daily: Array<{ title: string; category: Category; min: number; max: number; p: number }> = [
    { title: "Semt Market", category: "market", min: 180, max: 1450, p: 0.35 },
    { title: "Mahalle Fırını", category: "market", min: 25, max: 120, p: 0.25 },
    { title: "Yeşil Manav", category: "market", min: 90, max: 420, p: 0.12 },
    { title: "Kahve Durağı", category: "restoran", min: 85, max: 260, p: 0.3 },
    { title: "Lezzet Lokantası", category: "restoran", min: 320, max: 1250, p: 0.12 },
    { title: "Toplu Taşıma Dolum", category: "ulasim", min: 200, max: 500, p: 0.1 },
    { title: "Akaryakıt İstasyonu", category: "ulasim", min: 900, max: 2600, p: 0.08 },
    { title: "Online Mağaza", category: "alisveris", min: 250, max: 3200, p: 0.09 },
    { title: "Giyim Mağazası", category: "alisveris", min: 600, max: 3800, p: 0.04 },
    { title: "Sinema Bileti", category: "eglence", min: 180, max: 480, p: 0.05 },
    { title: "Eczane", category: "saglik", min: 120, max: 900, p: 0.05 },
  ];

  const start = new Date(now);
  start.setDate(start.getDate() - 150);
  start.setHours(0, 0, 0, 0);

  for (let d = new Date(start); d <= now; d.setDate(d.getDate() + 1)) {
    const day = d.getDate();
    const isToday = d.toDateString() === now.toDateString();
    const maxHour = isToday ? Math.max(8, now.getHours()) : 22;

    if (day === 1) {
      push({ accountId: "acc-main", date: at(d, 9, 5), title: "Maaş Ödemesi", description: "Atlas Teknoloji A.Ş. — aylık maaş", category: "maas", amount: 62500, channel: "eft", counterparty: "Atlas Teknoloji A.Ş." });
      push({ accountId: "acc-savings", date: at(d, 9, 30), title: "Birikime Aktarım", description: "Düzenli birikim talimatı", category: "transfer", amount: 7500, channel: "otomatik", counterparty: "Vadesiz TL Hesabı" });
      push({ accountId: "acc-main", date: at(d, 9, 30), title: "Birikime Aktarım", description: "Düzenli birikim talimatı", category: "transfer", amount: -7500, channel: "otomatik", counterparty: "Birikim Vadeli Hesabı" });
    }
    if (day === 3) {
      push({ accountId: "acc-main", date: at(d, 10, 12), title: "Kira Ödemesi", description: "Aylık kira", category: "transfer", amount: -22000, channel: "fast", counterparty: recipients[2].name, counterpartyIban: recipients[2].iban });
    }
    if (day === 5) push({ accountId: "acc-main", date: at(d, 8, 0), title: "İnternet Faturası", description: "Ev interneti — otomatik ödeme", category: "fatura", amount: -549.9, channel: "otomatik" });
    if (day === 8) push({ accountId: "acc-main", date: at(d, 8, 0), title: "Mobil Hat Faturası", description: "Otomatik ödeme talimatı", category: "fatura", amount: -399, channel: "otomatik" });
    if (day === 12) push({ accountId: "acc-main", date: at(d, 8, 0), title: "Elektrik Faturası", description: "Otomatik ödeme talimatı", category: "fatura", amount: -between(620, 1150), channel: "otomatik" });
    if (day === 15) {
      push({ accountId: "acc-main", date: at(d, 8, 0), title: "Doğalgaz Faturası", description: "Otomatik ödeme talimatı", category: "fatura", amount: -between(700, 2100), channel: "otomatik" });
      push({ accountId: "acc-main", date: at(d, 13, 40), title: "Kredi Kartı Borç Ödemesi", description: "Nova Platinum dönem borcu", category: "kart", amount: -between(12000, 19000), channel: "otomatik" });
    }
    if (day === 18) push({ accountId: "acc-main", date: at(d, 8, 0), title: "Su Faturası", description: "Otomatik ödeme talimatı", category: "fatura", amount: -between(240, 420), channel: "otomatik" });
    if (day === 20) push({ accountId: "acc-main", date: at(d, 0, 10), title: "Dijital Müzik Aboneliği", category: "eglence", amount: -99.99, channel: "kart" });
    if (day === 28) push({ accountId: "acc-savings", date: at(d, 0, 5), title: "Vadeli Faiz Getirisi", description: "Aylık net faiz getirisi", category: "diger", amount: between(6800, 7900), channel: "otomatik" });
    if (day === 10 && rand() > 0.4) {
      push({ accountId: "acc-usd", date: at(d, 11, 20), title: "Döviz Alış", description: "USD alış işlemi", category: "transfer", amount: between(100, 300), channel: "sube" });
    }

    for (const item of daily) {
      if (rand() < item.p) {
        const h = 8 + Math.floor(rand() * (maxHour - 8 + 1));
        push({ accountId: "acc-main", date: at(d, h, Math.floor(rand() * 60)), title: item.title, category: item.category, amount: -between(item.min, item.max), channel: "kart" });
      }
    }
    if (rand() < 0.05) {
      const r = pick([recipients[0], recipients[1], recipients[3]]);
      const incoming = rand() > 0.5;
      push({
        accountId: "acc-main",
        date: at(d, 12 + Math.floor(rand() * 8), Math.floor(rand() * 60)),
        title: incoming ? `Gelen Transfer — ${r.name}` : `Giden Transfer — ${r.name}`,
        description: incoming ? "Borç iadesi" : "Hediye katkısı",
        category: "transfer",
        amount: incoming ? between(500, 3000) : -between(300, 2500),
        channel: r.bank === "Nova Bank" ? "havale" : "fast",
        counterparty: r.name,
        counterpartyIban: r.iban,
      });
    }
  }

  const transactions = tx
    .filter((t) => new Date(t.date) <= now)
    .sort((a, b) => b.date.localeCompare(a.date));

  // Bakiyeleri geriye doğru hesapla
  for (const acc of accounts) {
    let running = acc.balance;
    for (const t of transactions) {
      if (t.accountId !== acc.id) continue;
      t.balanceAfter = Math.round(running * 100) / 100;
      running -= t.amount;
    }
  }

  const lastLogin = new Date(now);
  lastLogin.setDate(lastLogin.getDate() - 2);
  lastLogin.setHours(21, 14, 0, 0);

  return {
    version: STATE_VERSION,
    session: { loggedIn: false, lastLoginAt: lastLogin.toISOString() },
    customer: { name: "Deniz Arslan", customerNo: "10293847", email: "deniz.arslan@ornek.com", phone: "+90 5•• ••• 42 17" },
    accounts,
    cards,
    transactions,
    recipients,
  };
}
