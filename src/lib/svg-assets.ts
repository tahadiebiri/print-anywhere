// SVG assets library for thermal printer templates
// All SVG paths are designed for 384px wide canvas, black/white output

// ─── ICON PATHS (24x24 viewBox) ───
// These replace emoji icons with clean vector alternatives
export const svgIcons: Record<string, { path: string; viewBox: string; label: string }> = {
  // Lists
  checkbox: { viewBox: '0 0 24 24', path: 'M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM9 17l-4-4 1.41-1.41L9 14.17l7.59-7.59L18 8l-9 9z', label: 'Onay Kutusu' },
  cart: { viewBox: '0 0 24 24', path: 'M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z', label: 'Sepet' },
  list_check: { viewBox: '0 0 24 24', path: 'M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z', label: 'Liste' },
  note: { viewBox: '0 0 24 24', path: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM6 20V4h7v5h5v11H6z', label: 'Not' },
  receipt: { viewBox: '0 0 24 24', path: 'M18 17H6v-2h12v2zm0-4H6v-2h12v2zm0-4H6V7h12v2zM3 22l1.5-1.5L6 22l1.5-1.5L9 22l1.5-1.5L12 22l1.5-1.5L15 22l1.5-1.5L18 22l1.5-1.5L21 22V2l-1.5 1.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2 4.5 3.5 3 2v20z', label: 'Fiş' },
  
  // Sticker & Frame
  heart: { viewBox: '0 0 24 24', path: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z', label: 'Kalp' },
  star: { viewBox: '0 0 24 24', path: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z', label: 'Yıldız' },
  cat: { viewBox: '0 0 24 24', path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-1-1c-.55-.55-.55-1.44 0-1.99L11 12l-2-2.01c-.55-.55-.55-1.44 0-1.99l1-1 4 4-4 4.01zM15 9c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z', label: 'Kedi' },
  tag: { viewBox: '0 0 24 24', path: 'M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z', label: 'Etiket' },
  
  // Banner
  cake: { viewBox: '0 0 24 24', path: 'M12 6c1.11 0 2-.9 2-2 0-.38-.1-.73-.29-1.03L12 0l-1.71 2.97c-.19.3-.29.65-.29 1.03 0 1.1.9 2 2 2zm4.6 9.99l-1.07-1.07-1.08 1.07c-1.3 1.3-3.58 1.31-4.89 0l-1.07-1.07-1.09 1.07C6.75 16.64 5.88 17 4.96 17c-.73 0-1.4-.23-1.96-.61V21c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-4.61c-.56.38-1.23.61-1.96.61-.92 0-1.79-.36-2.44-1.01zM18 9h-5V7h-2v2H6c-1.66 0-3 1.34-3 3v1.54c0 1.08.88 1.96 1.96 1.96.52 0 1.02-.2 1.38-.57l2.14-2.13 2.13 2.13c.74.74 2.03.74 2.77 0l2.14-2.13 2.13 2.13c.37.37.86.57 1.38.57 1.08 0 1.96-.88 1.96-1.96V12c.01-1.66-1.33-3-2.99-3z', label: 'Pasta' },
  megaphone: { viewBox: '0 0 24 24', path: 'M18 11v2h4v-2h-4zm-2 6.61c.96.71 2.21 1.65 3.2 2.39.4-.53.8-1.07 1.2-1.6-.99-.74-2.24-1.68-3.2-2.4-.4.54-.8 1.08-1.2 1.61zM20.4 5.6c-.4-.53-.8-1.07-1.2-1.6-.99.74-2.24 1.68-3.2 2.4.4.53.8 1.07 1.2 1.6.96-.72 2.21-1.65 3.2-2.4zM4 9c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h1l5 3V6L5 9H4zm11.5 3c0-1.33-.58-2.53-1.5-3.35v6.69c.92-.81 1.5-2.01 1.5-3.34z', label: 'Megafon' },
  trophy: { viewBox: '0 0 24 24', path: 'M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z', label: 'Kupa' },
  
  // Study
  book: { viewBox: '0 0 24 24', path: 'M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z', label: 'Kitap' },
  formula: { viewBox: '0 0 24 24', path: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z', label: 'Formül' },
  lightbulb: { viewBox: '0 0 24 24', path: 'M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z', label: 'Ampul' },
  
  // Planner
  calendar: { viewBox: '0 0 24 24', path: 'M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z', label: 'Takvim' },
  clock: { viewBox: '0 0 24 24', path: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z', label: 'Saat' },
  sparkles: { viewBox: '0 0 24 24', path: 'M14.5 2l1.19 3.81L19.5 7l-3.81 1.19L14.5 12l-1.19-3.81L9.5 7l3.81-1.19L14.5 2zM7 6l.75 2.25L10 9l-2.25.75L7 12l-.75-2.25L4 9l2.25-.75L7 6zm7 10l.94 3.06L18 20l-3.06.94L14 24l-.94-3.06L10 20l3.06-.94L14 16z', label: 'Parıltı' },
  
  // Labels
  label_tag: { viewBox: '0 0 24 24', path: 'M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16z', label: 'Etiket' },
  money: { viewBox: '0 0 24 24', path: 'M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z', label: 'Para' },
  mail: { viewBox: '0 0 24 24', path: 'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z', label: 'Posta' },
};

// ─── DECORATIVE BORDERS (designed for 384px canvas width) ───
export interface BorderStyle {
  id: string;
  label: string;
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
}

export const borderStyles: BorderStyle[] = [
  {
    id: 'none',
    label: 'Kenarlıksız',
    draw: () => {},
  },
  {
    id: 'simple',
    label: 'Basit Çizgi',
    draw: (ctx, w, h) => {
      ctx.strokeStyle = 'black'; ctx.lineWidth = 2;
      ctx.strokeRect(6, 6, w - 12, h - 12);
    },
  },
  {
    id: 'double',
    label: 'Çift Çizgi',
    draw: (ctx, w, h) => {
      ctx.strokeStyle = 'black'; ctx.lineWidth = 2;
      ctx.strokeRect(4, 4, w - 8, h - 8);
      ctx.lineWidth = 1;
      ctx.strokeRect(10, 10, w - 20, h - 20);
    },
  },
  {
    id: 'dotted',
    label: 'Noktalı',
    draw: (ctx, w, h) => {
      ctx.setLineDash([3, 5]);
      ctx.strokeStyle = 'black'; ctx.lineWidth = 2;
      ctx.strokeRect(8, 8, w - 16, h - 16);
      ctx.setLineDash([]);
    },
  },
  {
    id: 'dashed',
    label: 'Kesikli',
    draw: (ctx, w, h) => {
      ctx.setLineDash([8, 4]);
      ctx.strokeStyle = 'black'; ctx.lineWidth = 2;
      ctx.strokeRect(6, 6, w - 12, h - 12);
      ctx.setLineDash([]);
    },
  },
  {
    id: 'rounded',
    label: 'Yuvarlatılmış',
    draw: (ctx, w, h) => {
      ctx.strokeStyle = 'black'; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(8, 8, w - 16, h - 16, 16);
      ctx.stroke();
    },
  },
  {
    id: 'hearts',
    label: 'Kalpler',
    draw: (ctx, w, h) => {
      ctx.strokeStyle = 'black'; ctx.lineWidth = 1.5;
      ctx.strokeRect(8, 8, w - 16, h - 16);
      ctx.fillStyle = 'black'; ctx.font = '12px sans-serif';
      for (let x = 16; x < w - 16; x += 18) {
        ctx.fillText('♥', x, 20);
        ctx.fillText('♥', x, h - 10);
      }
      for (let y = 26; y < h - 16; y += 18) {
        ctx.fillText('♥', 10, y);
        ctx.fillText('♥', w - 22, y);
      }
    },
  },
  {
    id: 'stars',
    label: 'Yıldızlar',
    draw: (ctx, w, h) => {
      ctx.strokeStyle = 'black'; ctx.lineWidth = 1.5;
      ctx.strokeRect(8, 8, w - 16, h - 16);
      ctx.fillStyle = 'black'; ctx.font = '11px sans-serif';
      for (let x = 16; x < w - 16; x += 22) {
        ctx.fillText('★', x, 20);
        ctx.fillText('★', x, h - 10);
      }
      for (let y = 28; y < h - 16; y += 22) {
        ctx.fillText('★', 10, y);
        ctx.fillText('★', w - 22, y);
      }
    },
  },
  {
    id: 'wavy',
    label: 'Dalgalı',
    draw: (ctx, w, h) => {
      ctx.strokeStyle = 'black'; ctx.lineWidth = 2;
      // Top wave
      ctx.beginPath();
      for (let x = 8; x < w - 8; x += 20) {
        ctx.quadraticCurveTo(x + 5, 2, x + 10, 10);
        ctx.quadraticCurveTo(x + 15, 18, x + 20, 10);
      }
      ctx.stroke();
      // Bottom wave
      ctx.beginPath();
      for (let x = 8; x < w - 8; x += 20) {
        ctx.quadraticCurveTo(x + 5, h - 18, x + 10, h - 10);
        ctx.quadraticCurveTo(x + 15, h - 2, x + 20, h - 10);
      }
      ctx.stroke();
      // Sides
      ctx.beginPath(); ctx.moveTo(8, 10); ctx.lineTo(8, h - 10); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w - 8, 10); ctx.lineTo(w - 8, h - 10); ctx.stroke();
    },
  },
  {
    id: 'zigzag',
    label: 'Zikzak',
    draw: (ctx, w, h) => {
      ctx.strokeStyle = 'black'; ctx.lineWidth = 1.5;
      // Top zigzag
      ctx.beginPath(); ctx.moveTo(6, 12);
      for (let x = 6; x < w - 6; x += 12) {
        ctx.lineTo(x + 6, 4);
        ctx.lineTo(x + 12, 12);
      }
      ctx.stroke();
      // Bottom zigzag
      ctx.beginPath(); ctx.moveTo(6, h - 12);
      for (let x = 6; x < w - 6; x += 12) {
        ctx.lineTo(x + 6, h - 4);
        ctx.lineTo(x + 12, h - 12);
      }
      ctx.stroke();
      // Sides
      ctx.beginPath(); ctx.moveTo(6, 12); ctx.lineTo(6, h - 12); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w - 6, 12); ctx.lineTo(w - 6, h - 12); ctx.stroke();
    },
  },
  {
    id: 'flowers',
    label: 'Çiçekler',
    draw: (ctx, w, h) => {
      ctx.strokeStyle = 'black'; ctx.lineWidth = 1;
      ctx.strokeRect(10, 10, w - 20, h - 20);
      ctx.fillStyle = 'black'; ctx.font = '10px sans-serif';
      const flowers = ['✿', '❀', '✿', '❀'];
      let fi = 0;
      for (let x = 14; x < w - 14; x += 20) {
        ctx.fillText(flowers[fi % 4], x, 22);
        ctx.fillText(flowers[(fi + 2) % 4], x, h - 12);
        fi++;
      }
      for (let y = 28; y < h - 18; y += 20) {
        ctx.fillText(flowers[fi % 4], 12, y);
        ctx.fillText(flowers[(fi + 1) % 4], w - 22, y);
        fi++;
      }
    },
  },
  {
    id: 'diamond',
    label: 'Elmas',
    draw: (ctx, w, h) => {
      ctx.strokeStyle = 'black'; ctx.lineWidth = 2;
      ctx.strokeRect(6, 6, w - 12, h - 12);
      // Corner diamonds
      const drawDiamond = (cx: number, cy: number, size: number) => {
        ctx.beginPath();
        ctx.moveTo(cx, cy - size);
        ctx.lineTo(cx + size, cy);
        ctx.lineTo(cx, cy + size);
        ctx.lineTo(cx - size, cy);
        ctx.closePath();
        ctx.fill();
      };
      ctx.fillStyle = 'black';
      drawDiamond(6, 6, 5);
      drawDiamond(w - 6, 6, 5);
      drawDiamond(6, h - 6, 5);
      drawDiamond(w - 6, h - 6, 5);
      // Mid-edge diamonds
      drawDiamond(w / 2, 6, 4);
      drawDiamond(w / 2, h - 6, 4);
      drawDiamond(6, h / 2, 4);
      drawDiamond(w - 6, h / 2, 4);
    },
  },
];

// ─── DECORATIVE DIVIDERS ───
export interface DividerStyle {
  id: string;
  label: string;
  draw: (ctx: CanvasRenderingContext2D, y: number, w: number) => void;
}

export const dividerStyles: DividerStyle[] = [
  {
    id: 'line',
    label: 'Çizgi',
    draw: (ctx, y, w) => {
      ctx.strokeStyle = 'black'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(16, y); ctx.lineTo(w - 16, y); ctx.stroke();
    },
  },
  {
    id: 'double_line',
    label: 'Çift Çizgi',
    draw: (ctx, y, w) => {
      ctx.strokeStyle = 'black'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(16, y - 2); ctx.lineTo(w - 16, y - 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(16, y + 2); ctx.lineTo(w - 16, y + 2); ctx.stroke();
    },
  },
  {
    id: 'dotted_div',
    label: 'Noktalı',
    draw: (ctx, y, w) => {
      ctx.setLineDash([2, 4]); ctx.strokeStyle = 'black'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(16, y); ctx.lineTo(w - 16, y); ctx.stroke();
      ctx.setLineDash([]);
    },
  },
  {
    id: 'ornament',
    label: 'Süslemeli',
    draw: (ctx, y, w) => {
      ctx.strokeStyle = 'black'; ctx.lineWidth = 1;
      const mid = w / 2;
      ctx.beginPath(); ctx.moveTo(40, y); ctx.lineTo(mid - 20, y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(mid + 20, y); ctx.lineTo(w - 40, y); ctx.stroke();
      ctx.fillStyle = 'black'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('◆ ✦ ◆', mid, y + 4);
      ctx.textAlign = 'left';
    },
  },
  {
    id: 'stars_div',
    label: 'Yıldızlı',
    draw: (ctx, y, w) => {
      ctx.fillStyle = 'black'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('— ★ ✦ ★ —', w / 2, y + 4);
      ctx.textAlign = 'left';
    },
  },
  {
    id: 'wave_div',
    label: 'Dalga',
    draw: (ctx, y, w) => {
      ctx.strokeStyle = 'black'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(16, y);
      for (let x = 16; x < w - 16; x += 16) {
        ctx.quadraticCurveTo(x + 4, y - 5, x + 8, y);
        ctx.quadraticCurveTo(x + 12, y + 5, x + 16, y);
      }
      ctx.stroke();
    },
  },
];

// ─── UTILITY: Draw SVG icon on canvas ───
export function drawSvgIcon(
  ctx: CanvasRenderingContext2D,
  iconKey: string,
  x: number,
  y: number,
  size: number = 24
) {
  const icon = svgIcons[iconKey];
  if (!icon) return;

  const [, , vw, vh] = icon.viewBox.split(' ').map(Number);
  const scale = size / Math.max(vw, vh);

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  const path = new Path2D(icon.path);
  ctx.fillStyle = 'black';
  ctx.fill(path);

  ctx.restore();
}

// ─── UTILITY: Draw SVG from raw string onto canvas ───
export function drawSvgString(
  ctx: CanvasRenderingContext2D,
  svgString: string,
  x: number,
  y: number,
  width: number,
  height: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      ctx.drawImage(img, x, y, width, height);
      URL.revokeObjectURL(url);
      resolve();
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('SVG render hatası'));
    };
    img.src = url;
  });
}

// ─── UTILITY: Load and draw user-uploaded SVG/image ───
export function drawImageUrl(
  ctx: CanvasRenderingContext2D,
  url: string,
  x: number,
  y: number,
  width: number,
  height: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.drawImage(img, x, y, width, height);
      resolve();
    };
    img.onerror = () => reject(new Error('Görsel yüklenemedi'));
    img.src = url;
  });
}

// ─── Get border by ID ───
export function getBorderById(id: string): BorderStyle | undefined {
  return borderStyles.find(b => b.id === id);
}

// ─── Get divider by ID ───
export function getDividerById(id: string): DividerStyle | undefined {
  return dividerStyles.find(d => d.id === id);
}
