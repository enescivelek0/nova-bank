import {
  ArrowRight,
  BarChart3,
  CreditCard,
  Fingerprint,
  Send,
  ShieldCheck,
  Smartphone,
  TimerReset,
} from "lucide-react";
import Link from "next/link";
import { Logo, ThemeToggle } from "@/components/brand";

const features = [
  { icon: Send, title: "Havale, EFT ve FAST", text: "IBAN doğrulamalı, iki adımlı onay ekranı ve anında dekont." },
  { icon: CreditCard, title: "Kart yönetimi", text: "Kartı dondur, internet alışverişini kapat, borcunu tek tıkla öde." },
  { icon: BarChart3, title: "Harcama analizi", text: "Kategori bazlı harcama dağılımı ve aylık gelir-gider grafikleri." },
  { icon: TimerReset, title: "Oturum güvenliği", text: "Hareketsizlikte otomatik çıkış ve son giriş bilgisi." },
];

const footerLinks = [
  { title: "Bireysel", links: ["Hesaplar", "Kartlar", "Para Transferi", "Vadeli Mevduat"] },
  { title: "Kurumsal", links: ["Hakkımızda", "Kariyer", "Basın Odası", "Yatırımcı İlişkileri"] },
  { title: "Destek", links: ["Yardım Merkezi", "Güvenlik", "Şube ve ATM", "İletişim"] },
];

export default function Home() {
  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 -top-40 -z-10 mx-auto h-[520px] max-w-5xl rounded-full bg-gradient-to-r from-indigo-500/25 via-violet-500/20 to-cyan-400/20 blur-3xl" />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-1 sm:gap-2">
          <a href="#ozellikler" className="hidden rounded-xl px-3 py-2 text-sm font-medium text-muted hover:text-fg sm:block">
            Özellikler
          </a>
          <ThemeToggle />
          <Link
            href="/giris"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-fg shadow-sm shadow-primary/30 transition hover:brightness-110"
          >
            Giriş yap
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        <section className="grid items-center gap-10 pt-8 pb-16 lg:grid-cols-[1.1fr_1fr] lg:pt-16">
          <div className="animate-slide-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-muted">
              <span className="size-1.5 rounded-full bg-success" /> Yeni · FAST ile 7/24 ücretsiz transfer
            </span>
            <h1 className="mt-5 text-4xl leading-[1.1] font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Bankacılığın{" "}
              <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">sade ve hızlı</span>{" "}
              hali.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              Hesaplarınızı tek ekranda görün, saniyeler içinde para gönderin, kartlarınızı anında yönetin. Şubeye gitmeden,
              7/24 ve ek ücret ödemeden.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/giris"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-[15px] font-semibold text-primary-fg shadow-lg shadow-primary/30 transition hover:brightness-110"
              >
                İnternet Şubesi
                <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#ozellikler"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-line bg-surface px-6 text-[15px] font-semibold transition hover:bg-surface-2"
              >
                Neler var?
              </a>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4">
              {[
                ["7/24", "Kesintisiz işlem"],
                ["0 ₺", "Havale & FAST ücreti"],
                ["%42", "Vadeli faiz oranı"],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="text-2xl font-bold tabular">{v}</dt>
                  <dd className="text-xs text-muted">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          <HeroMock />
        </section>

        <section id="ozellikler" className="scroll-mt-20 pb-16">
          <div className="mb-8 max-w-xl">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">İhtiyacınız olan her şey, tek uygulamada</h2>
            <p className="mt-2 text-muted">Günlük bankacılık işlemlerinizi hızlı, güvenli ve sade bir deneyimle yapın.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-line bg-surface p-5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5">
                <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16 grid gap-6 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-800 p-8 text-white sm:p-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Bankacılık artık cebinizde</h2>
            <p className="mt-2 max-w-lg text-white/80">
              Para transferi yapın, kartınızı anında dondurun, hesap hareketlerinizi indirin. Hepsi birkaç dokunuşla.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            <span className="inline-flex items-center gap-2 text-sm text-white/80"><ShieldCheck className="size-4" /> İki adımlı doğrulama</span>
            <span className="inline-flex items-center gap-2 text-sm text-white/80"><Smartphone className="size-4" /> Her cihazda</span>
            <Link href="/giris" className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-indigo-700 transition hover:bg-white/90">
              <Fingerprint className="size-4" /> Giriş yap
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
              Hesaplarınız, kartlarınız ve tüm finansal işlemleriniz için yeni nesil dijital bankacılık.
            </p>
          </div>
          {footerLinks.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold">{col.title}</p>
              <ul className="mt-3 space-y-2 text-sm text-muted">
                {col.links.map((l) => (
                  <li key={l}>
                    <Link href={col.title === "Bireysel" ? "/giris" : "#"} className="transition hover:text-fg">
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-line">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p>© 2026 Nova Bank. Tüm hakları saklıdır.</p>
            <div className="flex flex-wrap gap-4">
              <a href="#" className="hover:text-fg">Gizlilik Politikası</a>
              <a href="#" className="hover:text-fg">KVKK Aydınlatma Metni</a>
              <a href="#" className="hover:text-fg">Çerez Politikası</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function HeroMock() {
  return (
    <div className="relative mx-auto w-full max-w-md animate-fade-in lg:max-w-none">
      <div className="rounded-3xl border border-line bg-surface p-5 shadow-2xl shadow-indigo-900/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted">Toplam varlık</p>
            <p className="mt-1 text-3xl font-bold tabular">₺536.947,20</p>
          </div>
          <span className="rounded-full bg-success-soft px-2.5 py-1 text-xs font-semibold text-success">+%4,2 bu ay</span>
        </div>
        <div className="mt-5 flex h-24 items-end gap-1.5">
          {[38, 52, 45, 66, 58, 74, 61, 82, 70, 90, 76, 96].map((h, i) => (
            <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-indigo-500 to-violet-400" style={{ height: `${h}%`, opacity: 0.35 + i * 0.055 }} />
          ))}
        </div>
        <div className="mt-5 space-y-2.5">
          {[
            ["Maaş Ödemesi", "+₺62.500,00", true],
            ["Semt Market", "−₺684,30", false],
            ["Kira Ödemesi", "−₺22.000,00", false],
          ].map(([t, a, pos]) => (
            <div key={t as string} className="flex items-center justify-between rounded-xl bg-surface-2 px-3 py-2.5 text-sm">
              <span className="font-medium">{t}</span>
              <span className={pos ? "font-semibold text-success tabular" : "font-semibold tabular"}>{a}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute -right-3 -bottom-8 hidden w-56 rotate-6 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-700 p-4 text-white shadow-2xl sm:block">
        <p className="text-[10px] text-white/60 uppercase">Kredi Kartı</p>
        <p className="text-sm font-semibold">Nova Platinum</p>
        <p className="mt-6 font-mono text-sm tracking-widest">•••• 1234</p>
      </div>
    </div>
  );
}
