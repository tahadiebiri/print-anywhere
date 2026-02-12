import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

interface ThermalPreviewProps {
  text?: string;
  fontSize?: number;
  fontWeight?: string;
  textAlign?: CanvasTextAlign;
  fontFamily?: string;
  frame?: string;
  imageData?: string | null;
}

export interface ThermalPreviewHandle {
  getCanvas: () => HTMLCanvasElement | null;
}

export const ThermalPreview = forwardRef<ThermalPreviewHandle, ThermalPreviewProps>(
  ({ text, fontSize = 24, fontWeight = 'normal', textAlign = 'left', fontFamily = "'JetBrains Mono', monospace", frame = 'none', imageData }, ref) => {
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
        const fontStr = `${fontWeight} ${fontSize}px ${fontFamily}`;
        ctx.font = fontStr;
        ctx.textAlign = textAlign;
        const padding = 16;
        const framePad = frame !== 'none' ? 12 : 0;
        const innerPad = padding + framePad;
        const maxWidth = 384 - innerPad * 2;
        const lines = wrapText(ctx, text, maxWidth);
        const lineHeight = fontSize * 1.4;
        canvas.height = Math.ceil(lines.length * lineHeight + innerPad * 2 + fontSize * 0.4);

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (frame !== 'none') {
          drawFrame(ctx, frame, canvas.width, canvas.height);
        }

        ctx.fillStyle = 'black';
        ctx.font = fontStr;
        ctx.textAlign = textAlign;

        const x = textAlign === 'center' ? 192 : textAlign === 'right' ? 384 - innerPad : innerPad;
        lines.forEach((line, i) => {
          ctx.fillText(line, x, innerPad + fontSize + i * lineHeight);
        });
      } else {
        canvas.height = 100;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 384, 100);
        ctx.fillStyle = '#ccc';
        ctx.font = '16px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Önizleme burada görünecek', 192, 55);
      }
    }, [text, fontSize, fontWeight, textAlign, fontFamily, frame, imageData]);

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

function drawFrame(ctx: CanvasRenderingContext2D, frame: string, w: number, h: number) {
  const m = 8;
  ctx.strokeStyle = 'black';
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
      ctx.fillStyle = 'black';
      ctx.textAlign = 'left';
      const star = '★';
      const stepX = 16;
      for (let x = m; x < w - m; x += stepX) {
        ctx.fillText(star, x, m + 12);
        ctx.fillText(star, x, h - m);
      }
      for (let y = m + 24; y < h - m - 4; y += stepX) {
        ctx.fillText(star, m, y);
        ctx.fillText(star, w - m - 12, y);
      }
      break;
    }
    case 'hearts': {
      ctx.font = '13px monospace';
      ctx.fillStyle = 'black';
      ctx.textAlign = 'left';
      const heart = '♥';
      const step = 16;
      for (let x = m; x < w - m; x += step) {
        ctx.fillText(heart, x, m + 12);
        ctx.fillText(heart, x, h - m);
      }
      for (let y = m + 24; y < h - m - 4; y += step) {
        ctx.fillText(heart, m, y);
        ctx.fillText(heart, w - m - 12, y);
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
      // Top-left
      ctx.beginPath(); ctx.moveTo(m, m + c); ctx.lineTo(m, m); ctx.lineTo(m + c, m); ctx.stroke();
      // Top-right
      ctx.beginPath(); ctx.moveTo(w - m - c, m); ctx.lineTo(w - m, m); ctx.lineTo(w - m, m + c); ctx.stroke();
      // Bottom-left
      ctx.beginPath(); ctx.moveTo(m, h - m - c); ctx.lineTo(m, h - m); ctx.lineTo(m + c, h - m); ctx.stroke();
      // Bottom-right
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
