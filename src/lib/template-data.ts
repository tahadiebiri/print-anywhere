// Template data model & built-in templates

export type TemplateCategory = 'list' | 'sticker' | 'banner' | 'study' | 'planner' | 'label';

export interface TemplateDefinition {
  id: string;
  category: TemplateCategory;
  name: string;
  description: string;
  icon: string; // emoji
  fields: TemplateField[];
  render: string; // renderer function key
}

export interface TemplateField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'list' | 'pricelist' | 'date' | 'select' | 'number';
  placeholder?: string;
  defaultValue?: any;
  options?: { value: string; label: string }[];
}

export const categories: { key: TemplateCategory; label: string; icon: string; desc: string }[] = [
  { key: 'list', label: 'Listeler', icon: '📋', desc: 'Yapılacaklar, alışveriş, kontrol listeleri' },
  { key: 'sticker', label: 'Sticker & Çerçeve', icon: '🎨', desc: 'Dekoratif çerçeveler ve etiketler' },
  { key: 'banner', label: 'Banner', icon: '🎉', desc: 'Uzun şerit banner\'lar' },
  { key: 'study', label: 'Çalışma Kartları', icon: '📚', desc: 'Kelime, bilgi ve formül kartları' },
  { key: 'planner', label: 'Planlayıcı', icon: '📅', desc: 'Takvim, günlük plan, alışkanlık takip' },
  { key: 'label', label: 'Ticari Etiket', icon: '🏷️', desc: 'Ürün etiketi, barkod, fiyat etiketi' },
];

export const builtInTemplates: TemplateDefinition[] = [
  // ─── LISTS ───
  {
    id: 'todo',
    category: 'list',
    name: 'Yapılacaklar',
    description: 'Onay kutuları ile görev listesi',
    icon: '☑',
    fields: [
      { key: 'title', label: 'Başlık', type: 'text', placeholder: 'Yapılacaklar', defaultValue: '' },
      { key: 'items', label: 'Görevler', type: 'list', placeholder: 'Görev', defaultValue: [''] },
    ],
    render: 'todo',
  },
  {
    id: 'shopping',
    category: 'list',
    name: 'Alışveriş Listesi',
    description: 'Adetli alışveriş listesi',
    icon: '🛒',
    fields: [
      { key: 'title', label: 'Başlık', type: 'text', placeholder: 'Alışveriş Listesi', defaultValue: '' },
      { key: 'items', label: 'Ürünler', type: 'pricelist', placeholder: 'Ürün', defaultValue: [{ name: '', qty: '' }] },
    ],
    render: 'shopping',
  },
  {
    id: 'checklist',
    category: 'list',
    name: 'Kontrol Listesi',
    description: 'Seyahat, toplantı veya etkinlik kontrol listesi',
    icon: '✅',
    fields: [
      { key: 'title', label: 'Başlık', type: 'text', placeholder: 'Kontrol Listesi', defaultValue: '' },
      { key: 'subtitle', label: 'Alt Başlık', type: 'text', placeholder: 'Tarih veya açıklama', defaultValue: '' },
      { key: 'items', label: 'Maddeler', type: 'list', placeholder: 'Madde', defaultValue: [''] },
    ],
    render: 'checklist',
  },
  // ─── STICKERS ───
  {
    id: 'frame-heart',
    category: 'sticker',
    name: 'Kalp Çerçeve',
    description: 'Kalp kenarlıklı dekoratif çerçeve',
    icon: '💖',
    fields: [
      { key: 'title', label: 'Başlık', type: 'text', placeholder: 'Sevgilim', defaultValue: '' },
      { key: 'message', label: 'Mesaj', type: 'textarea', placeholder: 'Seni seviyorum...', defaultValue: '' },
    ],
    render: 'frame_heart',
  },
  {
    id: 'frame-star',
    category: 'sticker',
    name: 'Yıldız Çerçeve',
    description: 'Yıldız desenli sertifika çerçevesi',
    icon: '⭐',
    fields: [
      { key: 'title', label: 'Başlık', type: 'text', placeholder: 'Başarı Belgesi', defaultValue: '' },
      { key: 'name', label: 'İsim', type: 'text', placeholder: 'Ad Soyad', defaultValue: '' },
      { key: 'message', label: 'Açıklama', type: 'text', placeholder: 'Harika iş çıkardın!', defaultValue: '' },
    ],
    render: 'frame_star',
  },
  {
    id: 'frame-cute',
    category: 'sticker',
    name: 'Sevimli Not',
    description: 'Köşeleri yuvarlak, noktaklarla süslü not',
    icon: '🐱',
    fields: [
      { key: 'title', label: 'Başlık', type: 'text', placeholder: 'Not', defaultValue: '' },
      { key: 'message', label: 'Mesaj', type: 'textarea', placeholder: 'Mesajınız...', defaultValue: '' },
    ],
    render: 'frame_cute',
  },
  {
    id: 'sticker-name',
    category: 'sticker',
    name: 'İsim Etiketi',
    description: 'Yapıştırılabilir isim etiketi',
    icon: '👋',
    fields: [
      { key: 'greeting', label: 'Üst Yazı', type: 'text', placeholder: 'Merhaba, ben', defaultValue: 'Merhaba, ben' },
      { key: 'name', label: 'İsim', type: 'text', placeholder: 'Adınız', defaultValue: '' },
    ],
    render: 'sticker_name',
  },
  // ─── BANNERS ───
  {
    id: 'banner-birthday',
    category: 'banner',
    name: 'Doğum Günü',
    description: 'Doğum günü kutlama afişi',
    icon: '🎂',
    fields: [
      { key: 'name', label: 'İsim', type: 'text', placeholder: 'Ad', defaultValue: '' },
      { key: 'age', label: 'Yaş', type: 'text', placeholder: '10', defaultValue: '' },
      { key: 'message', label: 'Mesaj', type: 'text', placeholder: 'İyi ki doğdun!', defaultValue: 'İyi ki doğdun!' },
    ],
    render: 'banner_birthday',
  },
  {
    id: 'banner-custom',
    category: 'banner',
    name: 'Özel Banner',
    description: 'Büyük yazılı özel afiş',
    icon: '📢',
    fields: [
      { key: 'line1', label: 'Satır 1', type: 'text', placeholder: 'Hoş Geldiniz', defaultValue: '' },
      { key: 'line2', label: 'Satır 2', type: 'text', placeholder: 'Alt başlık', defaultValue: '' },
      { key: 'style', label: 'Stil', type: 'select', defaultValue: 'bold', options: [
        { value: 'bold', label: 'Kalın' },
        { value: 'outline', label: 'Çerçeveli' },
        { value: 'shadow', label: 'Gölgeli' },
      ]},
    ],
    render: 'banner_custom',
  },
  {
    id: 'banner-congrats',
    category: 'banner',
    name: 'Tebrikler',
    description: 'Başarı ve kutlama afişi',
    icon: '🏆',
    fields: [
      { key: 'title', label: 'Başlık', type: 'text', placeholder: 'TEBRİKLER', defaultValue: 'TEBRİKLER' },
      { key: 'name', label: 'İsim', type: 'text', placeholder: 'Ad Soyad', defaultValue: '' },
      { key: 'reason', label: 'Sebep', type: 'text', placeholder: 'Mezuniyet, terfi vb.', defaultValue: '' },
    ],
    render: 'banner_congrats',
  },
  // ─── STUDY CARDS ───
  {
    id: 'vocab-card',
    category: 'study',
    name: 'Kelime Kartı',
    description: 'İngilizce-Türkçe kelime kartı',
    icon: '🔤',
    fields: [
      { key: 'word', label: 'Kelime', type: 'text', placeholder: 'Ephemeral', defaultValue: '' },
      { key: 'pronunciation', label: 'Okunuş', type: 'text', placeholder: '/ɪˈfem.ər.əl/', defaultValue: '' },
      { key: 'meaning', label: 'Anlam', type: 'text', placeholder: 'Geçici, kısa ömürlü', defaultValue: '' },
      { key: 'example', label: 'Örnek Cümle', type: 'textarea', placeholder: 'The ephemeral beauty of cherry blossoms...', defaultValue: '' },
    ],
    render: 'vocab_card',
  },
  {
    id: 'formula-card',
    category: 'study',
    name: 'Formül Kartı',
    description: 'Matematik/Fizik formül kartı',
    icon: '🧮',
    fields: [
      { key: 'subject', label: 'Konu', type: 'text', placeholder: 'Fizik', defaultValue: '' },
      { key: 'title', label: 'Formül Adı', type: 'text', placeholder: 'Newton 2. Yasa', defaultValue: '' },
      { key: 'formula', label: 'Formül', type: 'text', placeholder: 'F = m × a', defaultValue: '' },
      { key: 'note', label: 'Açıklama', type: 'textarea', placeholder: 'Kuvvet = Kütle × İvme', defaultValue: '' },
    ],
    render: 'formula_card',
  },
  {
    id: 'info-card',
    category: 'study',
    name: 'Bilgi Kartı',
    description: 'Özet bilgi ve not kartı',
    icon: '💡',
    fields: [
      { key: 'topic', label: 'Konu', type: 'text', placeholder: 'Osmanlı Tarihi', defaultValue: '' },
      { key: 'title', label: 'Başlık', type: 'text', placeholder: 'Kuruluş Dönemi', defaultValue: '' },
      { key: 'content', label: 'İçerik', type: 'textarea', placeholder: 'Bilgi içeriği...', defaultValue: '' },
    ],
    render: 'info_card',
  },
  // ─── PLANNER ───
  {
    id: 'weekly-plan',
    category: 'planner',
    name: 'Haftalık Plan',
    description: '7 günlük planlama tablosu',
    icon: '📆',
    fields: [
      { key: 'title', label: 'Başlık', type: 'text', placeholder: 'Bu Hafta', defaultValue: '' },
      { key: 'startDay', label: 'Başlangıç', type: 'select', defaultValue: 'mon', options: [
        { value: 'mon', label: 'Pazartesi' },
        { value: 'sun', label: 'Pazar' },
      ]},
    ],
    render: 'weekly_plan',
  },
  {
    id: 'daily-plan',
    category: 'planner',
    name: 'Günlük Plan',
    description: 'Saatli günlük plan',
    icon: '⏰',
    fields: [
      { key: 'date', label: 'Tarih', type: 'text', placeholder: 'Bugün', defaultValue: '' },
      { key: 'startHour', label: 'Başlangıç Saati', type: 'number', defaultValue: 8 },
      { key: 'endHour', label: 'Bitiş Saati', type: 'number', defaultValue: 20 },
    ],
    render: 'daily_plan',
  },
  {
    id: 'habit-tracker',
    category: 'planner',
    name: 'Alışkanlık Takip',
    description: '30 günlük alışkanlık izleme',
    icon: '✨',
    fields: [
      { key: 'title', label: 'Alışkanlık', type: 'text', placeholder: 'Su iç', defaultValue: '' },
      { key: 'month', label: 'Ay', type: 'text', placeholder: 'Mart 2026', defaultValue: '' },
      { key: 'days', label: 'Gün Sayısı', type: 'number', defaultValue: 30 },
    ],
    render: 'habit_tracker',
  },
  // ─── COMMERCIAL LABELS ───
  {
    id: 'product-label',
    category: 'label',
    name: 'Ürün Etiketi',
    description: 'Ürün adı, fiyat ve barkod',
    icon: '🏷️',
    fields: [
      { key: 'name', label: 'Ürün Adı', type: 'text', placeholder: 'Organik Bal', defaultValue: '' },
      { key: 'price', label: 'Fiyat', type: 'text', placeholder: '₺149.90', defaultValue: '' },
      { key: 'barcode', label: 'Barkod', type: 'text', placeholder: '8690123456789', defaultValue: '' },
      { key: 'desc', label: 'Açıklama', type: 'text', placeholder: 'Net 500g', defaultValue: '' },
    ],
    render: 'product_label',
  },
  {
    id: 'price-tag',
    category: 'label',
    name: 'Fiyat Etiketi',
    description: 'Büyük fiyatlı satış etiketi',
    icon: '💰',
    fields: [
      { key: 'name', label: 'Ürün', type: 'text', placeholder: 'Ürün adı', defaultValue: '' },
      { key: 'oldPrice', label: 'Eski Fiyat', type: 'text', placeholder: '₺199.90', defaultValue: '' },
      { key: 'newPrice', label: 'Yeni Fiyat', type: 'text', placeholder: '₺149.90', defaultValue: '' },
      { key: 'discount', label: 'İndirim', type: 'text', placeholder: '%25', defaultValue: '' },
    ],
    render: 'price_tag',
  },
  {
    id: 'address-label',
    category: 'label',
    name: 'Adres Etiketi',
    description: 'Kargo ve posta etiketi',
    icon: '📮',
    fields: [
      { key: 'from', label: 'Gönderen', type: 'text', placeholder: 'Ad Soyad', defaultValue: '' },
      { key: 'fromAddr', label: 'Gönderen Adres', type: 'textarea', placeholder: 'Adres...', defaultValue: '' },
      { key: 'to', label: 'Alıcı', type: 'text', placeholder: 'Ad Soyad', defaultValue: '' },
      { key: 'toAddr', label: 'Alıcı Adres', type: 'textarea', placeholder: 'Adres...', defaultValue: '' },
    ],
    render: 'address_label',
  },
  {
    id: 'receipt',
    category: 'list',
    name: 'Mini Fiş',
    description: 'Fiş formatında çıktı',
    icon: '🧾',
    fields: [
      { key: 'title', label: 'Başlık', type: 'text', placeholder: 'FİŞ', defaultValue: '' },
      { key: 'items', label: 'Kalemler', type: 'pricelist', placeholder: 'Ürün', defaultValue: [{ name: '', price: '' }] },
    ],
    render: 'receipt',
  },
  {
    id: 'note',
    category: 'list',
    name: 'Not Kağıdı',
    description: 'Çizgili not kağıdı',
    icon: '📝',
    fields: [
      { key: 'title', label: 'Başlık', type: 'text', placeholder: 'Not', defaultValue: '' },
      { key: 'body', label: 'İçerik', type: 'textarea', placeholder: 'Notunuz...', defaultValue: '' },
    ],
    render: 'note',
  },
];

// Custom templates stored in localStorage
const CUSTOM_KEY = 'silaprint_custom_templates';

export function getCustomTemplates(): TemplateDefinition[] {
  try {
    const raw = localStorage.getItem(CUSTOM_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveCustomTemplates(templates: TemplateDefinition[]) {
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(templates));
}

export function getAllTemplates(): TemplateDefinition[] {
  return [...builtInTemplates, ...getCustomTemplates()];
}
