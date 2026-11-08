# Nova Bank — Dijital Bankacılık Arayüzü

Modern, responsive ve açık/koyu temalı bir internet bankacılığı uygulaması. Hesap yönetimi, havale/FAST transferleri, kart yönetimi ve hesap hareketleri gibi temel bankacılık akışlarını uçtan uca içerir.

> Nova Bank kurgusal bir markadır. Uygulama bir backend veya veritabanı kullanmaz; tüm veriler tarayıcıda (`localStorage`) tutulur ve ilk girişte örnek verilerle başlar.

## Özellikler

- **İki adımlı giriş:** Müşteri no + şifre doğrulaması, ardından SMS kodu adımı
- **Oturum güvenliği:** 5 dakika hareketsizlikte otomatik çıkış ve geri sayım, son giriş bilgisi
- **Özet paneli:** Toplam varlık (döviz hesapları TL karşılığıyla), 6 aylık gelir-gider grafiği, kategori bazlı harcama dağılımı, bakiyeleri gizleme
- **Hesaplar:** IBAN kopyalama/paylaşma, hesap detayları, vadeli mevduat getiri hesaplayıcı (brüt, stopaj, net)
- **Para transferi:** Başka hesaba veya hesaplar arası transfer, mod-97 ile **TR IBAN doğrulaması**, havale/FAST otomatik tespiti, kayıtlı alıcılar, onay ekranı ve dekont
- **Kartlar:** Kartı dondurma, internet alışverişi ve temassız ödeme ayarları, limit kullanımı, kredi kartı borç ödeme (toplam / asgari / farklı tutar)
- **Hesap hareketleri:** Arama, hesap/tarih/yön/kategori filtreleri, günlere göre gruplama, işlem detayı ve **CSV dışa aktarma**
- Grafik kütüphanesi olmadan yazılmış SVG grafikler, erişilebilir bileşenler (`dialog`, `switch`, `aria-*`), `prefers-reduced-motion` desteği

## Teknolojiler

- [Next.js 16](https://nextjs.org) (App Router, Cache Components, statik prerender)
- React 19, TypeScript
- Tailwind CSS v4 (tasarım token'ları, container queries, dark mode)
- lucide-react ikonları

## Kurulum

```bash
npm install
npm run dev
```

Uygulama `http://localhost:3000` adresinde açılır. Giriş ekranında örnek bilgiler hazır gelir.

## Yayına alma (Vercel)

1. Projeyi GitHub'a gönderin.
2. [vercel.com/new](https://vercel.com/new) üzerinden depoyu içe aktarın.
3. Framework olarak Next.js otomatik algılanır, ek ayar veya ortam değişkeni gerekmez. **Deploy**'a basın.

## Proje yapısı

```
src/
├─ app/
│  ├─ page.tsx              # Tanıtım sayfası
│  ├─ giris/                # Giriş ve SMS doğrulama
│  └─ panel/                # İnternet şubesi (özet, hesaplar, transfer, kartlar, hareketler)
├─ components/              # Panel iskeleti, kart görseli, grafikler, UI bileşenleri
└─ lib/
   ├─ store.ts              # useSyncExternalStore tabanlı state + localStorage
   ├─ seed.ts               # Deterministik örnek veri üretimi
   ├─ iban.ts               # TR IBAN üretme / doğrulama (mod-97)
   └─ format.ts             # Para, tarih ve kategori yardımcıları
```
