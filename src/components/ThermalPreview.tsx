import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

interface ThermalPreviewProps {
  text?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  textAlign?: CanvasTextAlign;
  fontFamily?: string;
  frame?: string;
  effect?: string;
  letterSpacing?: number;
  lineHeight?: number;
  imageData?: string | null;
}

export interface ThermalPreviewHandle {
  getCanvas: () => HTMLCanvasElement | null;
}

export const ThermalPreview = forwardRef<ThermalPreviewHandle, ThermalPreviewProps>(
  ({
    text,
    fontSize = 24,
    fontWeight = 'normal',
    fontStyle = 'normal',
    textAlign = 'left',
    fontFamily = "'JetBrains Mono', monospace",
    frame = 'none',
    effect = 'none',
    letterSpacing = 0,
    lineHeight: lineHeightMultiplier = 1.4,
    imageData,
  }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useImperativeHandle(ref, () => ({
      getCanvas: () => canvasRef.current,
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 384;

      if (imageData) {
        const img = new window.Image();
        img.onload = () => {
          const ratio = 384 / img.width;
          canvas.height = Math.ceil(img.height * ratio);
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, 384, canvas.height);
        };
        img.src = imageData;
        return;
      }

      if (text) {
        const fontStr = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
        ctx.font = fontStr;
        ctx.textAlign = textAlign;
        const padding = 16;
        const framePad = frame !== 'none' ? 14 : 0;
        const innerPad = padding + framePad;
        const maxWidth = 384 - innerPad * 2;
        const effectMaxWidth = letterSpacing > 0 ? maxWidth * 0.85 : maxWidth;
        const lines = wrapText(ctx, text, effectMaxWidth);
        const lineH = fontSize * lineHeightMultiplier;
        const isInverted = effect === 'inverted';
        canvas.height = Math.ceil(lines.length * lineH + innerPad * 2 + fontSize * 0.4);

        // Background
        ctx.fillStyle = isInverted ? 'black' : 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Frame
        if (frame !== 'none') {
          drawFrame(ctx, frame, canvas.width, canvas.height, isInverted);
        }

        // Text rendering
        ctx.font = fontStr;
        ctx.textAlign = textAlign;

        const x = textAlign === 'center' ? 192 : textAlign === 'right' ? 384 - innerPad : innerPad;

        lines.forEach((line, i) => {
          const y = innerPad + fontSize + i * lineH;

          if (letterSpacing > 0) {
            drawTextWithSpacing(ctx, line, x, y, letterSpacing, textAlign, fontSize, isInverted, effect, fontStr);
          } else {
            drawTextWithEffect(ctx, line, x, y, effect, fontSize, isInverted, fontStr);
          }
        });

        // Typewriter effect: add cursor
        if (effect === 'typewriter' && lines.length > 0) {
          const lastLineY = innerPad + fontSize + (lines.length - 1) * lineH;
          ctx.font = fontStr;
          const lastLineW = ctx.measureText(lines[lines.length - 1]).width;
          let cursorX = x + lastLineW + 4;
          if (textAlign === 'center') cursorX = 192 + lastLineW / 2 + 4;
          if (textAlign === 'right') cursorX = x;
          ctx.fillStyle = isInverted ? 'white' : 'black';
          ctx.fillRect(cursorX, lastLineY - fontSize + 4, 3, fontSize);
        }
      } else {
        canvas.height = 100;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 384, 100);
        ctx.fillStyle = '#ccc';
        ctx.font = '16px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Önizleme burada görünecek', 192, 55);
      }
    }, [text, fontSize, fontWeight, fontStyle, textAlign, fontFamily, frame, effect, letterSpacing, lineHeightMultiplier, imageData]);

    return (
      <div className="flex justify-center">
        <div className="border-2 border-dashed border-border rounded-lg p-2 bg-muted/30 inline-block">
          <canvas
            ref={canvasRef}
            className="block"
            style={{ width: '384px', imageRendering: 'pixelated' }}
          />
        </div>
      </div>
    );
  }
);

ThermalPreview.displayName = 'ThermalPreview';

// ─── Text Effects ───
function drawTextWithEffect(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  effect: string,
  fontSize: number,
  inverted: boolean,
  fontStr: string
) {
  const fg = inverted ? 'white' : 'black';

  switch (effect) {
    case 'shadow':
      ctx.fillStyle = inverted ? '#666' : '#aaa';
      ctx.fillText(text, x + 2, y + 2);
      ctx.fillStyle = fg;
      ctx.fillText(text, x, y);
      break;

    case 'outline':
      ctx.strokeStyle = fg;
      ctx.lineWidth = 2;
      ctx.strokeText(text, x, y);
      ctx.fillStyle = inverted ? 'black' : 'white';
      ctx.fillText(text, x, y);
      break;

    case '3d': {
      const depth = Math.max(2, Math.floor(fontSize / 12));
      for (let d = depth; d > 0; d--) {
        ctx.fillStyle = inverted ? `rgba(255,255,255,${0.15})` : `rgba(0,0,0,${0.15})`;
        ctx.fillText(text, x + d, y + d);
      }
      ctx.fillStyle = fg;
      ctx.fillText(text, x, y);
      break;
    }

    case 'glitch':
      // Red & blue offset layers
      ctx.fillStyle = inverted ? '#ff6666' : '#cc0000';
      ctx.fillText(text, x - 2, y - 1);
      ctx.fillStyle = inverted ? '#6666ff' : '#0000cc';
      ctx.fillText(text, x + 2, y + 1);
      ctx.fillStyle = fg;
      ctx.fillText(text, x, y);
      break;

    case 'typewriter':
      // Monospace-style with slight "ink" variation
      ctx.fillStyle = fg;
      ctx.fillText(text, x, y);
      // Underline
      const tw = ctx.measureText(text).width;
      let ux = x;
      if (ctx.textAlign === 'center') ux = x - tw / 2;
      if (ctx.textAlign === 'right') ux = x - tw;
      ctx.strokeStyle = inverted ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(ux, y + 3);
      ctx.lineTo(ux + tw, y + 3);
      ctx.stroke();
      break;

    case 'retro_lines':
      ctx.fillStyle = fg;
      ctx.fillText(text, x, y);
      // Horizontal scan lines over text
      const rlw = ctx.measureText(text).width;
      let rlx = x;
      if (ctx.textAlign === 'center') rlx = x - rlw / 2;
      if (ctx.textAlign === 'right') rlx = x - rlw;
      ctx.strokeStyle = inverted ? 'black' : 'white';
      ctx.lineWidth = 1;
      for (let sy = y - fontSize + 2; sy < y + 4; sy += 3) {
        ctx.beginPath();
        ctx.moveTo(rlx - 2, sy);
        ctx.lineTo(rlx + rlw + 2, sy);
        ctx.stroke();
      }
      break;

    case 'inverted':
      ctx.fillStyle = fg;
      ctx.fillText(text, x, y);
      break;

    default:
      ctx.fillStyle = fg;
      ctx.fillText(text, x, y);
  }
}

// ─── Letter Spacing ───
function drawTextWithSpacing(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  spacing: number,
  align: CanvasTextAlign,
  fontSize: number,
  inverted: boolean,
  effect: string,
  fontStr: string
) {
  // Calculate total width with spacing
  const chars = text.split('');
  let totalW = 0;
  chars.forEach(ch => { totalW += ctx.measureText(ch).width + spacing; });
  totalW -= spacing; // remove last spacing

  const savedAlign = ctx.textAlign;
  ctx.textAlign = 'left';

  let startX = x;
  if (align === 'center') startX = x - totalW / 2;
  if (align === 'right') startX = x - totalW;

  let cx = startX;
  chars.forEach(ch => {
    drawTextWithEffect(ctx, ch, cx, y, effect, fontSize, inverted, fontStr);
    cx += ctx.measureText(ch).width + spacing;
  });

  ctx.textAlign = savedAlign;
}

// ─── Frame Drawing ───
function drawFrame(ctx: CanvasRenderingContext2D, frame: string, w: number, h: number, inverted: boolean = false) {
  const m = 8;
  const fg = inverted ? 'white' : 'black';
  ctx.strokeStyle = fg;
  ctx.fillStyle = fg;
  ctx.lineWidth = 2;

  switch (frame) {
    case 'solid':
      ctx.strokeRect(m, m, w - m * 2, h - m * 2);
      break;
    case 'dashed':
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(m, m, w - m * 2, h - m * 2);
      ctx.setLineDash([]);
      break;
    case 'double':
      ctx.strokeRect(m, m, w - m * 2, h - m * 2);
      ctx.strokeRect(m + 4, m + 4, w - m * 2 - 8, h - m * 2 - 8);
      break;
    case 'stars': {
      ctx.font = '14px monospace';
      ctx.textAlign = 'left';
      const stepX = 16;
      for (let x = m; x < w - m; x += stepX) {
        ctx.fillText('★', x, m + 12);
        ctx.fillText('★', x, h - m);
      }
      for (let y = m + 24; y < h - m - 4; y += stepX) {
        ctx.fillText('★', m, y);
        ctx.fillText('★', w - m - 12, y);
      }
      break;
    }
    case 'hearts': {
      ctx.font = '13px monospace';
      ctx.textAlign = 'left';
      const step = 16;
      for (let x = m; x < w - m; x += step) {
        ctx.fillText('♥', x, m + 12);
        ctx.fillText('♥', x, h - m);
      }
      for (let y = m + 24; y < h - m - 4; y += step) {
        ctx.fillText('♥', m, y);
        ctx.fillText('♥', w - m - 12, y);
      }
      break;
    }
    case 'dotted':
      ctx.setLineDash([2, 4]);
      ctx.strokeRect(m, m, w - m * 2, h - m * 2);
      ctx.setLineDash([]);
      break;
    case 'wave': {
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = m; x < w - m; x += 10) {
        const y1 = m + Math.sin((x - m) / 10 * Math.PI) * 4;
        ctx.lineTo(x, y1 + 4);
      }
      ctx.stroke();
      ctx.beginPath();
      for (let x = m; x < w - m; x += 10) {
        const y1 = h - m + Math.sin((x - m) / 10 * Math.PI) * 4;
        ctx.lineTo(x, y1 - 4);
      }
      ctx.stroke();
      ctx.beginPath();
      for (let y = m; y < h - m; y += 10) {
        const x1 = m + Math.sin((y - m) / 10 * Math.PI) * 4;
        ctx.lineTo(x1 + 4, y);
      }
      ctx.stroke();
      ctx.beginPath();
      for (let y = m; y < h - m; y += 10) {
        const x1 = w - m + Math.sin((y - m) / 10 * Math.PI) * 4;
        ctx.lineTo(x1 - 4, y);
      }
      ctx.stroke();
      break;
    }
    case 'corners': {
      const c = 30;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(m, m + c); ctx.lineTo(m, m); ctx.lineTo(m + c, m); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w - m - c, m); ctx.lineTo(w - m, m); ctx.lineTo(w - m, m + c); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(m, h - m - c); ctx.lineTo(m, h - m); ctx.lineTo(m + c, h - m); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w - m - c, h - m); ctx.lineTo(w - m, h - m); ctx.lineTo(w - m, h - m - c); ctx.stroke();
      break;
    }
    case 'chain': {
      ctx.lineWidth = 1.5;
      const size = 10;
      for (let x = m; x < w - m - size; x += size * 1.5) {
        ctx.strokeRect(x, m, size, size);
        ctx.strokeRect(x, h - m - size, size, size);
      }
      for (let y = m + size * 1.5; y < h - m - size; y += size * 1.5) {
        ctx.strokeRect(m, y, size, size);
        ctx.strokeRect(w - m - size, y, size, size);
      }
      break;
    }
    case 'rounded':
      ctx.beginPath();
      ctx.roundRect(m, m, w - m * 2, h - m * 2, 16);
      ctx.stroke();
      break;
    case 'zigzag': {
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(m, m + 6);
      for (let x = m; x < w - m; x += 12) {
        ctx.lineTo(x + 6, m);
        ctx.lineTo(x + 12, m + 6);
      }
      ctx.stroke();
      ctx.beginPath(); ctx.moveTo(m, h - m - 6);
      for (let x = m; x < w - m; x += 12) {
        ctx.lineTo(x + 6, h - m);
        ctx.lineTo(x + 12, h - m - 6);
      }
      ctx.stroke();
      ctx.beginPath(); ctx.moveTo(m, m + 6); ctx.lineTo(m, h - m - 6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w - m, m + 6); ctx.lineTo(w - m, h - m - 6); ctx.stroke();
      break;
    }
    case 'flowers': {
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.lineWidth = 1;
      ctx.strokeRect(m + 2, m + 2, w - m * 2 - 4, h - m * 2 - 4);
      const fl = ['✿', '❀', '✿', '❀'];
      let fi = 0;
      for (let x = m; x < w - m; x += 18) {
        ctx.fillText(fl[fi % 4], x, m + 12);
        ctx.fillText(fl[(fi + 2) % 4], x, h - m);
        fi++;
      }
      for (let y = m + 20; y < h - m - 6; y += 18) {
        ctx.fillText(fl[fi % 4], m, y);
        ctx.fillText(fl[(fi + 1) % 4], w - m - 12, y);
        fi++;
      }
      break;
    }
    case 'diamond': {
      ctx.lineWidth = 2;
      ctx.strokeRect(m, m, w - m * 2, h - m * 2);
      const dd = (cx: number, cy: number, s: number) => {
        ctx.beginPath();
        ctx.moveTo(cx, cy - s); ctx.lineTo(cx + s, cy);
        ctx.lineTo(cx, cy + s); ctx.lineTo(cx - s, cy);
        ctx.closePath(); ctx.fill();
      };
      dd(m, m, 5); dd(w - m, m, 5);
      dd(m, h - m, 5); dd(w - m, h - m, 5);
      dd(w / 2, m, 4); dd(w / 2, h - m, 4);
      dd(m, h / 2, 4); dd(w - m, h / 2, 4);
      break;
    }
    case 'shadow_box': {
      // Shadow effect box
      ctx.fillStyle = inverted ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)';
      ctx.fillRect(m + 4, m + 4, w - m * 2, h - m * 2);
      ctx.fillStyle = inverted ? 'black' : 'white';
      ctx.fillRect(m, m, w - m * 2, h - m * 2);
      ctx.strokeStyle = fg;
      ctx.lineWidth = 2;
      ctx.strokeRect(m, m, w - m * 2, h - m * 2);
      break;
    }
    case 'retro': {
      // Double line with corner ornaments
      ctx.lineWidth = 3;
      ctx.strokeRect(m, m, w - m * 2, h - m * 2);
      ctx.lineWidth = 1;
      ctx.strokeRect(m + 5, m + 5, w - m * 2 - 10, h - m * 2 - 10);
      // Corner dots
      const cr = 3;
      [m + 3, w - m - 3].forEach(cx => {
        [m + 3, h - m - 3].forEach(cy => {
          ctx.beginPath(); ctx.arc(cx, cy, cr, 0, Math.PI * 2); ctx.fill();
        });
      });
      break;
    }
  }
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const paragraphs = text.split('\n');
  const lines: string[] = [];
  for (const para of paragraphs) {
    if (!para) { lines.push(''); continue; }
    const words = para.split(' ');
    let line = '';
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}
