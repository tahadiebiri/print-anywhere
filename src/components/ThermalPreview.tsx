import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

interface ThermalPreviewProps {
  text?: string;
  fontSize?: number;
  fontWeight?: string;
  textAlign?: CanvasTextAlign;
  imageData?: string | null;
}

export interface ThermalPreviewHandle {
  getCanvas: () => HTMLCanvasElement | null;
}

export const ThermalPreview = forwardRef<ThermalPreviewHandle, ThermalPreviewProps>(
  ({ text, fontSize = 24, fontWeight = 'normal', textAlign = 'left', imageData }, ref) => {
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
        ctx.font = `${fontWeight} ${fontSize}px 'JetBrains Mono', monospace`;
        ctx.textAlign = textAlign;
        const padding = 16;
        const maxWidth = 384 - padding * 2;
        const lines = wrapText(ctx, text, maxWidth);
        const lineHeight = fontSize * 1.4;
        canvas.height = Math.ceil(lines.length * lineHeight + padding * 2);
        
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black';
        ctx.font = `${fontWeight} ${fontSize}px 'JetBrains Mono', monospace`;
        ctx.textAlign = textAlign;

        const x = textAlign === 'center' ? 192 : textAlign === 'right' ? 384 - padding : padding;
        lines.forEach((line, i) => {
          ctx.fillText(line, x, padding + fontSize + i * lineHeight);
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
    }, [text, fontSize, fontWeight, textAlign, imageData]);

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
