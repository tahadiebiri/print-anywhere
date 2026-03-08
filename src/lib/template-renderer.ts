// Canvas renderers for all template types
import JsBarcode from 'jsbarcode';
import { getBorderById, getDividerById, drawSvgIcon, svgIcons } from './svg-assets';

const W = 384;
const P = 16;

function fillBg(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, h: number) {
  canvas.width = W;
  canvas.height = h;
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, W, h);
}

// Draw template icon (emoji or SVG) at position
function drawTemplateIcon(ctx: CanvasRenderingContext2D, icon: string, x: number, y: number, size: number = 24) {
  if (icon.startsWith('svg:')) {
    const key = icon.substring(4);
    drawSvgIcon(ctx, key, x, y - size + 4, size);
  } else {
    ctx.fillText(icon + ' ', x, y);
  }
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, maxW: number, lineH: number, startY: number): number {
  const prevAlign = ctx.textAlign;
  ctx.textAlign = 'left';
  const words = text.split(' ');
  let line = '';
  let y = startY;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxW) {
      ctx.fillText(line, x, y);
      line = word;
      y += lineH;
    } else {
      line = test;
    }
  }
  if (line) { ctx.fillText(line, x, y); y += lineH; }
  ctx.textAlign = prevAlign;
  return y;
}

const renderers: Record<string, (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, data: Record<string, any>) => void> = {

  // ─── LISTS ───
  todo(ctx, canvas, d) {
    const items = (d.items || []).filter((i: string) => i);
    const h = 70 + items.length * 32 + 20;
    fillBg(ctx, canvas, h);
    ctx.fillStyle = 'black';
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.fillText('☑ ' + (d.title || 'Yapılacaklar'), P, 38);
    ctx.strokeStyle = 'black'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(P, 48); ctx.lineTo(W - P, 48); ctx.stroke();
    ctx.font = '18px "JetBrains Mono", monospace'; ctx.lineWidth = 1.5;
    items.forEach((item: string, i: number) => {
      const y = 75 + i * 32;
      ctx.strokeRect(P, y - 13, 15, 15);
      ctx.fillText(item, P + 24, y);
    });
  },

  shopping(ctx, canvas, d) {
    const items = (d.items || []).filter((i: any) => i.name);
    const h = 70 + items.length * 28 + 20;
    fillBg(ctx, canvas, h);
    ctx.fillStyle = 'black';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🛒 ' + (d.title || 'Alışveriş Listesi'), W / 2, 35);
    ctx.textAlign = 'left';
    ctx.setLineDash([3, 3]); ctx.strokeStyle = 'black';
    ctx.beginPath(); ctx.moveTo(P, 48); ctx.lineTo(W - P, 48); ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = '16px "JetBrains Mono", monospace';
    items.forEach((item: any, i: number) => {
      const y = 72 + i * 28;
      ctx.fillText(`○ ${item.name}`, P, y);
      if (item.qty) { ctx.textAlign = 'right'; ctx.fillText(`x${item.qty}`, W - P, y); ctx.textAlign = 'left'; }
    });
  },

  checklist(ctx, canvas, d) {
    const items = (d.items || []).filter((i: string) => i);
    const h = 90 + items.length * 30 + 20;
    fillBg(ctx, canvas, h);
    ctx.fillStyle = 'black';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✅ ' + (d.title || 'Kontrol Listesi'), W / 2, 35);
    if (d.subtitle) { ctx.font = '14px Inter, sans-serif'; ctx.fillText(d.subtitle, W / 2, 55); }
    ctx.textAlign = 'left';
    ctx.strokeStyle = 'black'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(P, 65); ctx.lineTo(W - P, 65); ctx.stroke();
    ctx.font = '16px "JetBrains Mono", monospace';
    items.forEach((item: string, i: number) => {
      const y = 90 + i * 30;
      ctx.strokeStyle = 'black'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(P + 8, y - 5, 7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillText(item, P + 24, y);
    });
  },

  note(ctx, canvas, d) {
    const h = 350;
    fillBg(ctx, canvas, h);
    ctx.fillStyle = 'black';
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.fillText('📝 ' + (d.title || 'Not'), P, 35);
    ctx.strokeStyle = 'black'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(P, 46); ctx.lineTo(W - P, 46); ctx.stroke();
    ctx.strokeStyle = '#999'; ctx.lineWidth = 0.5;
    for (let y = 75; y < h - 15; y += 26) {
      ctx.beginPath(); ctx.moveTo(P, y); ctx.lineTo(W - P, y); ctx.stroke();
    }
    ctx.strokeStyle = '#cc4444'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(50, 55); ctx.lineTo(50, h - 10); ctx.stroke();
    if (d.body) {
      ctx.fillStyle = 'black'; ctx.font = '15px "JetBrains Mono", monospace';
      wrapText(ctx, d.body, 56, W - 60 - P, 26, 92);
    }
  },

  receipt(ctx, canvas, d) {
    const items = (d.items || []).filter((i: any) => i.name && i.price);
    const total = items.reduce((s: number, i: any) => s + (parseFloat(i.price) || 0), 0);
    const h = 160 + items.length * 26 + 40;
    fillBg(ctx, canvas, h);
    ctx.fillStyle = 'black'; ctx.setLineDash([2, 2]); ctx.strokeStyle = 'black';
    ctx.strokeRect(P, P, W - P * 2, h - P * 2); ctx.setLineDash([]);
    ctx.font = 'bold 26px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(d.title || 'FİŞ', W / 2, 50);
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillText(new Date().toLocaleString('tr-TR'), W / 2, 68);
    ctx.fillText('SılaPrint Terminal', W / 2, 82);
    ctx.fillText('═'.repeat(32), W / 2, 98);
    ctx.textAlign = 'left'; ctx.font = '16px "JetBrains Mono", monospace';
    items.forEach((item: any, i: number) => {
      const y = 120 + i * 26;
      ctx.fillText(item.name, P + 8, y);
      ctx.textAlign = 'right'; ctx.fillText(`₺${parseFloat(item.price).toFixed(2)}`, W - P - 8, y); ctx.textAlign = 'left';
    });
    const ty = 120 + items.length * 26 + 10;
    ctx.textAlign = 'center'; ctx.font = '12px monospace'; ctx.fillText('─'.repeat(32), W / 2, ty);
    ctx.font = 'bold 22px "JetBrains Mono", monospace'; ctx.textAlign = 'right';
    ctx.fillText(`TOPLAM: ₺${total.toFixed(2)}`, W - P - 8, ty + 28);
    ctx.textAlign = 'center'; ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillText('Teşekkür ederiz!', W / 2, ty + 52); ctx.textAlign = 'left';
  },

  // ─── STICKERS ───
  frame_heart(ctx, canvas, d) {
    fillBg(ctx, canvas, 200);
    ctx.strokeStyle = 'black'; ctx.lineWidth = 3;
    ctx.strokeRect(8, 8, W - 16, 184);
    // Heart border pattern
    const hearts = '♥ ';
    ctx.font = '14px sans-serif'; ctx.fillStyle = 'black';
    for (let x = 16; x < W - 20; x += 20) {
      ctx.fillText('♥', x, 22);
      ctx.fillText('♥', x, 194);
    }
    for (let y = 30; y < 185; y += 20) {
      ctx.fillText('♥', 12, y);
      ctx.fillText('♥', W - 24, y);
    }
    ctx.font = 'bold 28px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(d.title || '💖', W / 2, 80);
    if (d.message) { ctx.font = '16px Inter, sans-serif'; wrapText(ctx, d.message, W / 2 - 140, 280, 22, 110); }
    ctx.textAlign = 'left';
  },

  frame_star(ctx, canvas, d) {
    fillBg(ctx, canvas, 220);
    ctx.strokeStyle = 'black'; ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, W - 20, 200);
    ctx.lineWidth = 1; ctx.strokeRect(16, 16, W - 32, 188);
    // Stars
    ctx.font = '12px sans-serif';
    for (let x = 20; x < W - 16; x += 28) { ctx.fillText('★', x, 28); ctx.fillText('★', x, 210); }
    ctx.font = 'bold 22px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(d.title || '⭐ Başarı Belgesi', W / 2, 65);
    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.fillText(d.name || '', W / 2, 110);
    ctx.font = '16px Inter, sans-serif';
    ctx.fillText(d.message || '', W / 2, 145);
    ctx.font = '13px Inter, sans-serif';
    ctx.fillText('— ★ ✦ ★ —', W / 2, 180);
    ctx.textAlign = 'left';
  },

  frame_cute(ctx, canvas, d) {
    fillBg(ctx, canvas, 200);
    // Dotted border
    ctx.setLineDash([4, 4]); ctx.strokeStyle = 'black'; ctx.lineWidth = 2;
    const r = 12;
    ctx.beginPath();
    ctx.roundRect(10, 10, W - 20, 180, r);
    ctx.stroke();
    ctx.setLineDash([]);
    // Dots pattern
    ctx.fillStyle = 'black';
    for (let x = 25; x < W - 20; x += 16) {
      ctx.beginPath(); ctx.arc(x, 25, 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x, 183, 1.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.font = 'bold 22px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('🐱 ' + (d.title || 'Not'), W / 2, 60);
    if (d.message) {
      ctx.font = '15px Inter, sans-serif';
      wrapText(ctx, d.message, 40, W - 80, 22, 90);
    }
    ctx.textAlign = 'left';
  },

  sticker_name(ctx, canvas, d) {
    fillBg(ctx, canvas, 160);
    ctx.fillStyle = 'black'; ctx.fillRect(0, 0, W, 45);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 20px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(d.greeting || 'Merhaba, ben', W / 2, 30);
    ctx.fillStyle = 'black';
    ctx.strokeStyle = 'black'; ctx.lineWidth = 3; ctx.strokeRect(0, 0, W, 160);
    ctx.font = 'bold 42px Inter, sans-serif';
    ctx.fillText(d.name || '', W / 2, 115);
    ctx.textAlign = 'left';
  },

  // ─── BANNERS ───
  banner_birthday(ctx, canvas, d) {
    fillBg(ctx, canvas, 300);
    ctx.fillStyle = 'black'; ctx.strokeStyle = 'black'; ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, W - 12, 288);
    // Confetti dots
    ctx.font = '16px sans-serif';
    const confetti = ['🎈', '🎉', '✨', '🎊', '⭐'];
    for (let i = 0; i < 12; i++) {
      ctx.fillText(confetti[i % confetti.length], 15 + (i % 6) * 60, 30 + Math.floor(i / 6) * 250);
    }
    ctx.textAlign = 'center'; ctx.fillStyle = 'black';
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.fillText('🎂 Mutlu Yıllar! 🎂', W / 2, 70);
    ctx.font = 'bold 48px Inter, sans-serif';
    ctx.fillText(d.name || '', W / 2, 140);
    if (d.age) {
      ctx.font = 'bold 60px Inter, sans-serif';
      ctx.fillText(d.age, W / 2, 210);
    }
    ctx.font = '18px Inter, sans-serif';
    ctx.fillText(d.message || 'İyi ki doğdun!', W / 2, 260);
    ctx.textAlign = 'left';
  },

  banner_custom(ctx, canvas, d) {
    fillBg(ctx, canvas, 200);
    ctx.fillStyle = 'black'; ctx.textAlign = 'center';
    const style = d.style || 'bold';
    if (style === 'shadow') {
      ctx.fillStyle = '#999'; ctx.font = 'bold 44px Inter, sans-serif';
      ctx.fillText(d.line1 || '', W / 2 + 3, 83);
      ctx.fillStyle = 'black';
    }
    if (style === 'outline') {
      ctx.font = 'bold 44px Inter, sans-serif';
      ctx.strokeStyle = 'black'; ctx.lineWidth = 2;
      ctx.strokeText(d.line1 || '', W / 2, 80);
    } else {
      ctx.font = 'bold 44px Inter, sans-serif';
      ctx.fillText(d.line1 || '', W / 2, 80);
    }
    if (d.line2) {
      ctx.font = '22px Inter, sans-serif'; ctx.fillStyle = 'black';
      ctx.fillText(d.line2, W / 2, 130);
    }
    // Decorative lines
    ctx.strokeStyle = 'black'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(P, 155); ctx.lineTo(W - P, 155); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(P, 160); ctx.lineTo(W - P, 160); ctx.stroke();
    ctx.textAlign = 'left';
  },

  banner_congrats(ctx, canvas, d) {
    fillBg(ctx, canvas, 280);
    ctx.strokeStyle = 'black'; ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, W - 16, 264);
    ctx.lineWidth = 1; ctx.strokeRect(14, 14, W - 28, 252);
    ctx.textAlign = 'center'; ctx.fillStyle = 'black';
    ctx.font = '14px sans-serif';
    ctx.fillText('🏆 ✦ 🏆 ✦ 🏆', W / 2, 45);
    ctx.font = 'bold 36px Inter, sans-serif';
    ctx.fillText(d.title || 'TEBRİKLER', W / 2, 100);
    ctx.font = 'bold 32px Inter, sans-serif';
    ctx.fillText(d.name || '', W / 2, 155);
    if (d.reason) { ctx.font = '18px Inter, sans-serif'; ctx.fillText(d.reason, W / 2, 200); }
    ctx.font = '14px sans-serif';
    ctx.fillText('★ ✦ ★ ✦ ★', W / 2, 245);
    ctx.textAlign = 'left';
  },

  // ─── STUDY CARDS ───
  vocab_card(ctx, canvas, d) {
    fillBg(ctx, canvas, 220);
    ctx.strokeStyle = 'black'; ctx.lineWidth = 2; ctx.strokeRect(6, 6, W - 12, 208);
    ctx.fillStyle = 'black';
    ctx.font = '12px "JetBrains Mono", monospace'; ctx.fillText('VOCABULARY', P, 28);
    ctx.strokeStyle = 'black'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(P, 35); ctx.lineTo(W - P, 35); ctx.stroke();
    ctx.font = 'bold 32px Inter, sans-serif';
    ctx.fillText(d.word || '', P, 72);
    if (d.pronunciation) { ctx.font = '14px "JetBrains Mono", monospace'; ctx.fillStyle = '#666'; ctx.fillText(d.pronunciation, P, 92); }
    ctx.fillStyle = 'black'; ctx.strokeStyle = 'black'; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(P, 102); ctx.lineTo(W - P, 102); ctx.stroke();
    ctx.font = 'bold 18px Inter, sans-serif'; ctx.fillText(d.meaning || '', P, 128);
    if (d.example) {
      ctx.font = 'italic 14px Inter, sans-serif'; ctx.fillStyle = '#444';
      wrapText(ctx, `"${d.example}"`, P, W - P * 2, 20, 160);
    }
  },

  formula_card(ctx, canvas, d) {
    fillBg(ctx, canvas, 220);
    ctx.strokeStyle = 'black'; ctx.lineWidth = 2; ctx.strokeRect(6, 6, W - 12, 208);
    // Subject badge
    ctx.fillStyle = 'black'; ctx.fillRect(P, P, 80, 22);
    ctx.fillStyle = 'white'; ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillText(d.subject || 'MATH', P + 6, P + 16);
    ctx.fillStyle = 'black';
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.fillText(d.title || '', P, 68);
    // Formula box
    ctx.fillStyle = '#f0f0f0'; ctx.fillRect(P, 80, W - P * 2, 50);
    ctx.strokeStyle = 'black'; ctx.lineWidth = 1; ctx.strokeRect(P, 80, W - P * 2, 50);
    ctx.fillStyle = 'black'; ctx.font = 'bold 26px "JetBrains Mono", monospace';
    ctx.textAlign = 'center'; ctx.fillText(d.formula || '', W / 2, 113); ctx.textAlign = 'left';
    if (d.note) {
      ctx.font = '14px Inter, sans-serif'; ctx.fillStyle = '#333';
      wrapText(ctx, d.note, P, W - P * 2, 20, 155);
    }
  },

  info_card(ctx, canvas, d) {
    fillBg(ctx, canvas, 280);
    ctx.strokeStyle = 'black'; ctx.lineWidth = 2; ctx.strokeRect(6, 6, W - 12, 268);
    // Topic header
    ctx.fillStyle = 'black'; ctx.fillRect(6, 6, W - 12, 35);
    ctx.fillStyle = 'white'; ctx.font = 'bold 16px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('💡 ' + (d.topic || 'Bilgi Kartı'), W / 2, 30); ctx.textAlign = 'left';
    ctx.fillStyle = 'black'; ctx.font = 'bold 22px Inter, sans-serif';
    ctx.fillText(d.title || '', P, 70);
    ctx.strokeStyle = 'black'; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(P, 78); ctx.lineTo(W - P, 78); ctx.stroke();
    if (d.content) {
      ctx.font = '15px Inter, sans-serif'; ctx.fillStyle = '#222';
      wrapText(ctx, d.content, P, W - P * 2, 22, 100);
    }
  },

  // ─── PLANNER ───
  weekly_plan(ctx, canvas, d) {
    const days = d.startDay === 'sun'
      ? ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']
      : ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    const rowH = 45;
    const h = 60 + days.length * rowH + 10;
    fillBg(ctx, canvas, h);
    ctx.fillStyle = 'black';
    ctx.font = 'bold 22px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('📆 ' + (d.title || 'Haftalık Plan'), W / 2, 35);
    ctx.textAlign = 'left';
    ctx.strokeStyle = 'black'; ctx.lineWidth = 1;
    days.forEach((day, i) => {
      const y = 55 + i * rowH;
      ctx.fillStyle = i >= 5 ? '#f5f5f5' : 'white';
      ctx.fillRect(P, y, W - P * 2, rowH);
      ctx.strokeRect(P, y, W - P * 2, rowH);
      ctx.fillStyle = 'black';
      ctx.font = 'bold 16px "JetBrains Mono", monospace';
      ctx.fillText(day, P + 8, y + 28);
      ctx.strokeStyle = '#ccc'; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(P + 55, y + 5); ctx.lineTo(P + 55, y + rowH - 5); ctx.stroke();
      ctx.strokeStyle = 'black'; ctx.lineWidth = 1;
      // Lines for writing
      ctx.strokeStyle = '#ddd'; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(P + 65, y + rowH - 10); ctx.lineTo(W - P - 8, y + rowH - 10); ctx.stroke();
      ctx.strokeStyle = 'black'; ctx.lineWidth = 1;
    });
  },

  daily_plan(ctx, canvas, d) {
    const start = d.startHour || 8;
    const end = d.endHour || 20;
    const hours = end - start;
    const rowH = 30;
    const h = 60 + hours * rowH + 20;
    fillBg(ctx, canvas, h);
    ctx.fillStyle = 'black';
    ctx.font = 'bold 22px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('⏰ ' + (d.date || 'Günlük Plan'), W / 2, 35);
    ctx.textAlign = 'left';
    ctx.strokeStyle = 'black'; ctx.lineWidth = 1;
    for (let i = 0; i <= hours; i++) {
      const y = 55 + i * rowH;
      ctx.strokeStyle = '#bbb'; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(P, y); ctx.lineTo(W - P, y); ctx.stroke();
      ctx.fillStyle = 'black'; ctx.font = 'bold 13px "JetBrains Mono", monospace';
      const hr = (start + i).toString().padStart(2, '0');
      ctx.fillText(`${hr}:00`, P, y + 18);
    }
  },

  habit_tracker(ctx, canvas, d) {
    const days = d.days || 30;
    const cols = 7;
    const rows = Math.ceil(days / cols);
    const cellSize = 38;
    const gap = 4;
    const h = 80 + rows * (cellSize + gap) + 20;
    fillBg(ctx, canvas, h);
    ctx.fillStyle = 'black';
    ctx.font = 'bold 22px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('✨ ' + (d.title || 'Alışkanlık'), W / 2, 30);
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText(d.month || '', W / 2, 52);
    ctx.textAlign = 'left';
    const startX = (W - cols * (cellSize + gap) + gap) / 2;
    for (let i = 0; i < days; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (cellSize + gap);
      const y = 65 + row * (cellSize + gap);
      ctx.strokeStyle = 'black'; ctx.lineWidth = 1;
      ctx.strokeRect(x, y, cellSize, cellSize);
      ctx.fillStyle = 'black'; ctx.font = '12px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${i + 1}`, x + cellSize / 2, y + cellSize / 2 + 4);
      ctx.textAlign = 'left';
    }
  },

  // ─── COMMERCIAL LABELS ───
  product_label(ctx, canvas, d) {
    fillBg(ctx, canvas, 240);
    ctx.strokeStyle = 'black'; ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, W - 8, 232);
    ctx.fillStyle = 'black';
    ctx.font = 'bold 24px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(d.name || 'Ürün', W / 2, 40);
    if (d.desc) { ctx.font = '14px Inter, sans-serif'; ctx.fillText(d.desc, W / 2, 62); }
    ctx.font = 'bold 32px Inter, sans-serif';
    ctx.fillText(d.price || '', W / 2, 100);
    // Barcode
    if (d.barcode) {
      try {
        const barcodeCanvas = document.createElement('canvas');
        JsBarcode(barcodeCanvas, d.barcode, { format: 'CODE128', width: 2, height: 60, displayValue: true, fontSize: 14, margin: 5 });
        const bx = (W - barcodeCanvas.width) / 2;
        ctx.drawImage(barcodeCanvas, bx, 120);
      } catch {
        ctx.font = '14px "JetBrains Mono", monospace';
        ctx.fillText(d.barcode, W / 2, 160);
      }
    }
    ctx.textAlign = 'left';
  },

  price_tag(ctx, canvas, d) {
    fillBg(ctx, canvas, 200);
    ctx.strokeStyle = 'black'; ctx.lineWidth = 3;
    ctx.strokeRect(6, 6, W - 12, 188);
    ctx.fillStyle = 'black'; ctx.textAlign = 'center';
    ctx.font = '18px Inter, sans-serif';
    ctx.fillText(d.name || '', W / 2, 35);
    // Old price with strikethrough
    if (d.oldPrice) {
      ctx.font = '22px Inter, sans-serif'; ctx.fillStyle = '#888';
      const oldW = ctx.measureText(d.oldPrice).width;
      ctx.fillText(d.oldPrice, W / 2, 75);
      ctx.strokeStyle = '#888'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(W / 2 - oldW / 2 - 4, 70); ctx.lineTo(W / 2 + oldW / 2 + 4, 70); ctx.stroke();
    }
    ctx.fillStyle = 'black'; ctx.font = 'bold 48px Inter, sans-serif';
    ctx.fillText(d.newPrice || '', W / 2, 135);
    if (d.discount) {
      ctx.fillStyle = 'black'; ctx.fillRect(W / 2 - 50, 150, 100, 28);
      ctx.fillStyle = 'white'; ctx.font = 'bold 18px Inter, sans-serif';
      ctx.fillText(d.discount, W / 2, 170);
    }
    ctx.textAlign = 'left';
  },

  address_label(ctx, canvas, d) {
    fillBg(ctx, canvas, 280);
    ctx.strokeStyle = 'black'; ctx.lineWidth = 2; ctx.strokeRect(6, 6, W - 12, 268);
    // From
    ctx.fillStyle = 'black'; ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillText('GÖNDEREN:', P, 30);
    ctx.font = 'bold 16px Inter, sans-serif'; ctx.fillText(d.from || '', P, 52);
    if (d.fromAddr) { ctx.font = '13px Inter, sans-serif'; wrapText(ctx, d.fromAddr, P, W - P * 2, 18, 72); }
    // Divider
    ctx.setLineDash([4, 4]); ctx.strokeStyle = 'black';
    ctx.beginPath(); ctx.moveTo(P, 120); ctx.lineTo(W - P, 120); ctx.stroke();
    ctx.setLineDash([]);
    // To
    ctx.font = 'bold 12px "JetBrains Mono", monospace'; ctx.fillText('ALICI:', P, 145);
    ctx.font = 'bold 18px Inter, sans-serif'; ctx.fillText(d.to || '', P, 170);
    if (d.toAddr) { ctx.font = '14px Inter, sans-serif'; wrapText(ctx, d.toAddr, P, W - P * 2, 20, 195); }
  },
};

export function renderTemplate(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  renderKey: string,
  data: Record<string, any>,
  options?: { border?: string; divider?: string; customSvg?: string }
) {
  const fn = renderers[renderKey];
  if (fn) {
    fn(ctx, canvas, data);

    // Apply border overlay if specified
    if (options?.border && options.border !== 'none') {
      const border = getBorderById(options.border);
      if (border) {
        border.draw(ctx, canvas.width, canvas.height);
      }
    }

    // Draw custom SVG watermark if provided
    if (options?.customSvg) {
      const img = new Image();
      img.src = options.customSvg;
      // Draw in bottom-right corner as a small watermark
      if (img.complete) {
        const svgSize = 40;
        ctx.globalAlpha = 0.7;
        ctx.drawImage(img, canvas.width - svgSize - 12, canvas.height - svgSize - 12, svgSize, svgSize);
        ctx.globalAlpha = 1;
      }
    }
  } else {
    canvas.width = W; canvas.height = 100;
    ctx.fillStyle = 'white'; ctx.fillRect(0, 0, W, 100);
    ctx.fillStyle = 'red'; ctx.font = '16px sans-serif';
    ctx.fillText(`Renderer bulunamadı: ${renderKey}`, 16, 50);
  }
}
