<div align="center">

# Nova Bank

**Hızlı, sade ve güvenli dijital bankacılık deneyimi**

Hesaplarınızı tek ekranda görün, saniyeler içinde para gönderin, kartlarınızı anında yönetin.

</div>

---

## Proje Hakkında

Nova Bank, bireysel müşterilerin günlük bankacılık işlemlerini şubeye gitmeden, her cihazdan yapabilmesi için tasarlanmış bir internet şubesi uygulamasıdır. Kullanıcı; varlıklarının genel durumunu izleyebilir, havale ve FAST ile para gönderebilir, kartlarını yönetebilir ve tüm hesap hareketlerini detaylı olarak inceleyebilir.

Arayüz mobil öncelikli ve tamamen responsive olarak tasarlanmıştır. Açık ve koyu tema desteği vardır, erişilebilirlik standartları gözetilmiştir.

## Öne Çıkan Özellikler

### 🔐 Güvenli Giriş
- Müşteri numarası ve şifre ile giriş, ardından **SMS doğrulama** adımı
- 5 dakika hareketsizlikte **otomatik oturum kapatma** ve canlı geri sayım
- Son başarılı giriş zamanı bilgisi

### 📊 Finansal Özet
- Döviz hesapları dahil **toplam varlığın TL karşılığı**
- Son 6 aya ait **gelir-gider grafiği**
- Bu ayki harcamaların **kategori bazlı dağılımı**
- Tek dokunuşla bakiyeleri gizleme

### 💳 Hesap Yönetimi
- Vadesiz, vadeli ve döviz hesapları
- IBAN kopyalama ve paylaşma
- **Vadeli mevduat getiri hesaplayıcı** (brüt getiri, stopaj, net getiri)

### 💸 Para Transferi
- Başka hesaba veya hesaplar arası transfer
- **TR IBAN doğrulaması** (mod-97 algoritması) ve alıcı bankaya göre havale/FAST tespiti
- Kayıtlı alıcılar, günlük limit kontrolü
- Bilgi, onay ve sonuç adımlarından oluşan güvenli akış, işlem sonunda dekont

### 🪪 Kart Yönetimi
- Kartı anında **dondurma / kullanıma açma**
- İnternet alışverişi ve temassız ödeme ayarları
- Limit kullanımı, hesap kesim ve son ödeme tarihleri
- Kredi kartı borç ödeme: toplam borç, asgari tutar veya farklı tutar

### 🧾 Hesap Hareketleri
- Metin araması (işlem, alıcı, referans no)
- Hesap, tarih aralığı, gelen/giden ve kategori filtreleri
- Günlere göre gruplanmış liste ve detaylı işlem dekontu
- **CSV olarak dışa aktarma**

## Teknik Detaylar

| Alan | Kullanılan |
| --- | --- |
| Framework | Next.js 16 (App Router, Cache Components, statik prerender) |
| Dil | TypeScript |
| Arayüz | React 19, Tailwind CSS v4 |
| İkonlar | lucide-react |
| State | `useSyncExternalStore` tabanlı store, `localStorage` ile kalıcılık |

- **Harici grafik kütüphanesi yok:** Gelir-gider ve harcama grafikleri SVG ile sıfırdan yazıldı.
- **Tasarım sistemi:** CSS değişkenleriyle tanımlı renk token'ları, açık/koyu tema ve container query'ler.
- **Erişilebilirlik:** Yerel `dialog` modalları, `role="switch"` bileşenleri, klavye ile kullanım ve `prefers-reduced-motion` desteği.
- **Sunucusuz mimari:** Uygulama bir backend gerektirmez. Veriler kullanıcının tarayıcısında tutulur ve tüm sayfalar statik olarak üretilir.

## Proje Yapısı

```
src/
├─ app/
│  ├─ page.tsx              # Tanıtım sayfası
│  ├─ giris/                # Giriş ve SMS doğrulama
│  └─ panel/                # İnternet şubesi
│     ├─ hesaplar/          # Hesaplar ve getiri hesaplayıcı
│     ├─ transfer/          # Havale / FAST akışı
│     ├─ kartlar/           # Kart yönetimi
│     └─ hareketler/        # Hesap hareketleri
├─ components/              # Panel iskeleti, kart görseli, grafikler, UI bileşenleri
└─ lib/
   ├─ store.ts              # Uygulama state'i ve bankacılık işlemleri
   ├─ seed.ts               # Başlangıç verileri
   ├─ iban.ts               # TR IBAN üretme ve doğrulama
   └─ format.ts             # Para, tarih ve kategori yardımcıları
```
