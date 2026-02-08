
# 🖨️ Mini Termal Yazıcı Web Uygulaması

## Genel Bakış
Bluetooth BLE üzerinden X18 serisi termal yazıcıya bağlanıp metin, görsel, QR kod ve etiket basabilen bir web uygulaması. Hem mobil hem masaüstü tarayıcılardan kullanılabilir.

---

## Sayfa 1: Ana Sayfa / Bağlantı
- **Yazıcı bağlantı butonu** — BLE ile yazıcıyı tarayıp bağlanma
- Bağlantı durumu göstergesi (bağlı/bağlı değil)
- Yazıcı bilgileri (isim, MAC adresi)
- Hızlı erişim butonları: Metin Bas, Görsel Bas, QR Kod, Şablonlar

## Sayfa 2: Metin Editörü
- Metin yazma alanı
- **Font boyutu** seçimi (küçük, orta, büyük)
- **Kalın / Normal** yazı stili
- **Hizalama** (sol, orta, sağ)
- Önizleme — basılacak çıktının 384px genişliğinde gerçek boyut önizlemesi
- **Bas** butonu

## Sayfa 3: Görsel Basma
- Cihazdan görsel yükleme (dosya veya kamera)
- Otomatik siyah-beyaz dönüşüm (dithering)
- **Kontrast ve parlaklık** ayarı
- 384px genişliğe otomatik ölçeklendirme
- Önizleme ve basma

## Sayfa 4: QR Kod / Barkod
- Metin veya URL girişi
- QR kod oluşturma ve önizleme
- Altına isteğe bağlı açıklama metni
- Basma

## Sayfa 5: Şablonlar
Hazır şablonlar:
- 📝 **Yapılacaklar Listesi** — başlık + onay kutuları
- 🛒 **Alışveriş Listesi** — maddeler halinde liste
- 📋 **Not Kağıdı** — başlık + çizgili alan
- 🏷️ **Etiket** — isim + açıklama + QR kod
- 🧾 **Mini Fiş** — tarih, kalemler, toplam

Şablonu seç → içeriği doldur → önizle → bas

---

## Teknik Yaklaşım
- **Web Bluetooth API** ile BLE üzerinden yazıcıya bağlantı
- Cat_printer protokolü: bitmap verileri 384px genişliğinde, 1-bit siyah-beyaz olarak gönderilecek
- Canvas API ile metin ve görseller bitmap'e dönüştürülecek
- Tüm işlemler tarayıcıda — backend gerekmez
- Mobil uyumlu (responsive) tasarım
- Türkçe arayüz

## Tasarım
- Sade, modern ve koyu tema destekli arayüz
- Alt navigasyon barı (mobilde kolay erişim)
- Yazıcı bağlantı durumu her zaman üstte görünür
