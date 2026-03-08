

# Arayuz Iyilestirme ve Hata Giderme Plani

## Tespit Edilen Sorunlar

1. **BottomNav**: "Görsel" yazisi eski, "Fotoğraf" olmali
2. **ImagePrint sayfasi**: Kamera gorunumunde `PageHeader` gereksiz yer kapliyor, kamera tam ekran olmali
3. **ImageEditor**: Iki ayri onizleme (duzenleme + baski) kafa karistirici; tek onizleme yeterli
4. **CameraView**: On kamera ile cekim sirasinda aynalama dogru ama `setPointerCapture` touch cihazlarda sorun cikarabilir
5. **Genel UI**: Sayfalarda tutarsiz bosluklar, buton boyutlari ve renk kullanimi

## Yapilacaklar

### 1. BottomNav Guncelleme
- "Görsel" → "Fotoğraf" olarak degistirilecek

### 2. ImagePrint Tam Ekran Kamera
- Kamera modunda `PageHeader` gizlenecek, kamera tam ekran olacak
- Sadece editor modunda PageHeader gosterilecek

### 3. ImageEditor Sadeleştirme
- Iki canvas yerine tek baski onizlemesi gosterilecek
- Duzenleme kontrolleri (boyut, dondur) ve baski metodu secimi ayni akista olacak
- Undo/redo butonlari ve slider'lar icin tutarli spacing

### 4. Tum Sayfalarda UI Tutarliligi
- Buton ve kart stillerinde tutarli `gap`, `padding` kullanimi
- Print butonlari tum sayfalarda ayni stilde olacak
- `disabled` durumlarinda tutarli mesaj gosterimi
- Templates sayfasinda onizleme canvas'i kullaniciya gosterilecek (su an `hidden`)

### 5. Kucuk Hata Duzeltmeleri
- `CameraView` icinde `cameraReady` false iken shutter butonu disable, ama galeri seciminden sonra editor'e geciste sorun yok — dogrulanacak
- `ImageEditor`'da `touch-none` class'i mobilde suruklenebilirlik icin gerekli ama scroll'u engelleyebilir — sadece canvas alanina uygulanacak

## Teknik Detaylar

### Degisecek Dosyalar
1. **`src/components/BottomNav.tsx`** — label guncelleme
2. **`src/pages/ImagePrint.tsx`** — kamera modunda header gizleme
3. **`src/components/ImageEditor.tsx`** — tek onizleme canvas, daha temiz layout
4. **`src/components/CameraView.tsx`** — tam ekran duzeltmeleri, touch iyilestirme
5. **`src/pages/Templates.tsx`** — basmadan once onizleme gosterimi
6. **`src/pages/TextEditor.tsx`** — kucuk UI tutarliligi duzeltmeleri

