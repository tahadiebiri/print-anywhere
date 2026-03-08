# Fotoğraf Baskısı Sayfası Yenileme ve Logo Ekleme

## Ozet

Mevcut "Gorsel Bas" sayfasi yerine, gomulu kamera onizlemesi, galeri secimi, fotograf duzenleme ve baski metodu secimi iceren yeni bir "Fotograf Baskisi" sayfasi olusturulacak. Ayrica uygulama logosu eklenecek.

## Yapilacaklar

### 1. Logo Ekleme

- `user-uploads://logo.svg` dosyasi `src/assets/logo.svg` olarak kopyalanacak
- Header'daki emoji (printer emoji) yerine SVG logo kullanilacak
- Ana sayfadaki emoji de logo ile degistirilecek

### 2. Fotograf Baskisi Sayfasi - Gomulu Kamera

Mevcut `/image` rotasindaki `ImagePrint.tsx` tamamen yenilenecek. Sayfa acildiginda:

- **Kamera gorunumu**: `navigator.mediaDevices.getUserMedia()` ile kamera akisi bir `<video>` elementinde canli gosterilecek
- **Sol alt**: "Galeri" butonu (galeriden fotograf secmek icin)
- **Sag alt**: "Kamera Cevir" butonu (on/arka kamera gecisi icin `facingMode` degistirilecek)
- **Ortada**: Cek butonu (deklansor) - video'dan kare yakalayip canvas'a cizecek

### 3. Duzenleme Arayuzu

Fotograf cekildikten veya galeriden secildikten sonra:

- **Yeniden boyutlandirma**: Slider ile olceklendirme (zoom in/out)
- **Kirpma alani**: 384px genisligine sabit, yukseklik oranla ayarlanabilir
- **Surukleme**: Gorsel kirpma cercevesi icinde suruklenebilir olacak
- **Dondurme**: 90 derece dondurme butonu (mevcut ozellik korunacak)
- **Parlaklik/Kontrast**: Mevcut slider'lar korunacak
- **Metin ekleme:** Gorsel uzarine metin ekleme ve duzenleme olacak.
- **Karalama:** Gorsel uzerinde karalama yapilabilen bir kalem araci olacak ve kalem kalinligi ayarlanabilir olacak. Ayrica silgi araci ile silinebilecek.
- **Undo/Redo:** yapilan degisiklikleri ileri geri alinabilecek.

### 4. Baski Metodu Secimi

Onizleme asamasinda secenekler:

- **Normal (Dithering)**: Floyd-Steinberg dithering (mevcut)
- **Yuksek Kontrast**: Sert siyah-beyaz
- **Negatif**: Ters renkler
- **Halftone**: Nokta deseni
- **Kenar Algilama**: Sobel filtresi
- **Sert Esik**: Threshold tabanli

Mevcut cerceve secenekleri de korunacak (Polaroid, Film Seridi, vb.)

### 5. Sayfa Akisi: (yukarida yaptigim guncellemelere gore yeniden sekillendir)

```text
+---------------------------+
|  [Geri]  Fotograf Baskisi |
+---------------------------+
|                           |
|   +-------------------+   |
|   |  Tam Ekran        |   |
|   |  Canli Kamera     |   |
|   |  Onizlemesi       |   |
|   |                   |   |
|   +-------------------+   |
|                           |
| [Galeri]    [O]   [Cevir] |
+---------------------------+

        | Fotograf cek |
        v

+---------------------------+
|  [Geri]  Fotograf Baskisi |
+---------------------------+
|  Boyut: [====o========]   |
|  Dondur: [90]             |
|  +-------------------+    |
|  | Kirpilmis/         |   |
|  | Boyutlandirilmis   |   |
|  | Onizleme           |   |
|  +-------------------+    |
|  Efekt: [Dropdown    v]   |
|  Cerceve: [Dropdown  v]   |
|  Parlaklik: [=====o==]    |
|  Kontrast:  [=====o==]    |
|  +-------------------+    |
|  | Baski Onizlemesi   |   |
|  +-------------------+    |
| [<-]       [BAS ]     [->]|
+---------------------------+
```

## Teknik Detaylar

### Degistirilecek/Olusturulacak Dosyalar

1. `**src/assets/logo.svg**` - Logo dosyasi kopyalanacak
2. `**src/components/PrinterHeader.tsx**` - Logo import edilip emoji yerine kullanilacak
3. `**src/pages/Index.tsx**` - Ana sayfadaki emoji yerine logo
4. `**src/pages/ImagePrint.tsx**` - Tamamen yenilenecek:
  - `getUserMedia` ile kamera erisimi
  - `facingMode` state'i ile on/arka kamera gecisi
  - Video'dan kare yakalama (`drawImage` ile)
  - Pinch-to-zoom veya slider ile boyutlandirma
  - Mevcut efekt ve cerceve mantigi korunacak
  - Iki asamali UI: kamera gorunumu ve duzenleme gorunumu

### Kamera API Kullanimi

- `navigator.mediaDevices.getUserMedia({ video: { facingMode } })` ile stream alinacak
- Kamera izni reddedildiginde kullaniciya uyari gosterilecek ve sadece galeri modu aktif kalacak
- Sayfa terk edildiginde stream durdurulacak (`useEffect` cleanup)

### Boyutlandirma Mantigi

- Slider 50%-200% arasi olceklendirme
- Canvas uzerinde kirpma: 384px genislik sabit, yukseklik gorsel oranina gore
- Gorsel suruklenebilir (touch ve mouse event'leri)