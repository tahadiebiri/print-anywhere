import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, ImageIcon, Printer, Loader2, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/PageHeader';
import { usePrinter } from '@/hooks/use-printer';
import { printCanvas } from '@/lib/printer';
import { toast } from 'sonner';

type FilterType = 'none' | 'highContrast' | 'invert' | 'threshold' | 'halftone' | 'edge';

const filters: { label: string; value: FilterType }[] = [
  { label: 'Normal (Dithering)', value: 'none' },
  { label: 'Yüksek Kontrast', value: 'highContrast' },
  { label: 'Negatif', value: 'invert' },
  { label: 'Sert Eşik', value: 'threshold' },
  { label: 'Halftone (Nokta)', value: 'halftone' },
  { label: 'Kenar Algılama', value: 'edge' },
];

const photoFrames = [
  { label: 'Çerçevesiz', value: 'none' },
  { label: 'Düz Çerçeve', value: 'solid' },
  { label: 'Polaroid', value: 'polaroid' },
  { label: 'Yuvarlak Köşe', value: 'rounded' },
  { label: 'Pul', value: 'stamp' },
  { label: 'Film Şeridi', value: 'filmstrip' },
];

export default function ImagePrint() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [filter, setFilter] = useState<FilterType>('none');
  const [frameType, setFrameType] = useState('none');
  const [rotation, setRotation] = useState(0);
  const [printing, setPrinting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const { connected } = usePrinter();

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setOriginalImage(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const renderPreview = useCallback(() => {
    if (!originalImage || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    img.onload = () => {
      const framePad = frameType === 'polaroid' ? 30 : frameType !== 'none' ? 16 : 0;
      const polaroidBottom = frameType === 'polaroid' ? 60 : 0;
      const ratio = (384 - framePad * 2) / img.width;
      const imgW = 384 - framePad * 2;
      const imgH = Math.ceil(img.height * ratio);

      canvas.width = 384;
      canvas.height = imgH + framePad * 2 + polaroidBottom;

      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw frame background
      drawPhotoFrame(ctx, frameType, canvas.width, canvas.height, framePad);

      // Apply rotation
      ctx.save();
      ctx.filter = `brightness(${100 + brightness}%) contrast(${100 + contrast}%)`;
      if (rotation !== 0) {
        ctx.translate(framePad + imgW / 2, framePad + imgH / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(img, -imgW / 2, -imgH / 2, imgW, imgH);
      } else {
        ctx.drawImage(img, framePad, framePad, imgW, imgH);
      }
      ctx.filter = 'none';
      ctx.restore();

      // Apply filter effect
      applyFilter(ctx, canvas.width, canvas.height, filter, framePad, imgW, imgH);
    };
    img.src = originalImage;
  }, [originalImage, brightness, contrast, filter, frameType, rotation]);

  useEffect(() => {
    if (originalImage) {
      const timer = setTimeout(renderPreview, 50);
      return () => clearTimeout(timer);
    }
  }, [originalImage, brightness, contrast, filter, frameType, rotation, renderPreview]);

  const handlePrint = async () => {
    if (!canvasRef.current) return;
    setPrinting(true);
    try {
      await printCanvas(canvasRef.current);
      toast.success('Yazdırıldı!');
    } catch (e: any) {
      toast.error(e.message || 'Yazdırma hatası');
    } finally {
      setPrinting(false);
    }
  };

  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto space-y-4">
      <PageHeader title="Görsel Bas" />

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => cameraRef.current?.click()}
          className="flex flex-col items-center gap-2 border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:border-primary/40 hover:bg-accent/40 transition-colors"
        >
          <Camera className="h-8 w-8 text-muted-foreground" />
          <span className="text-sm text-muted-foreground font-medium">Kamera</span>
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
        </button>
        <button
          onClick={() => galleryRef.current?.click()}
          className="flex flex-col items-center gap-2 border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:border-primary/40 hover:bg-accent/40 transition-colors"
        >
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
          <span className="text-sm text-muted-foreground font-medium">Galeri / Dosya</span>
          <input
            ref={galleryRef}
            type="file"
            accept="image/*,.svg,.png,.jpg,.jpeg,.webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </button>
      </div>

      {originalImage && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Efekt</Label>
              <Select value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {filters.map(f => (
                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Çerçeve</Label>
              <Select value={frameType} onValueChange={setFrameType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {photoFrames.map(f => (
                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Parlaklık: {brightness}</Label>
              <Slider value={[brightness]} onValueChange={([v]) => setBrightness(v)} min={-50} max={50} step={5} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Kontrast: {contrast}</Label>
              <Slider value={[contrast]} onValueChange={([v]) => setContrast(v)} min={-50} max={50} step={5} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1" onClick={() => setRotation(r => (r + 90) % 360)}>
              <RotateCw className="h-4 w-4" /> Döndür ({rotation}°)
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Önizleme</Label>
            <div className="flex justify-center">
              <div className="border-2 border-dashed border-border rounded-lg p-2 bg-muted/30 inline-block overflow-x-auto">
                <canvas
                  ref={canvasRef}
                  style={{ width: '384px', imageRendering: 'pixelated' }}
                  className="block"
                />
              </div>
            </div>
          </div>

          <Button
            className="w-full gap-2"
            size="lg"
            disabled={!connected || printing}
            onClick={handlePrint}
          >
            {printing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
            {printing ? 'Yazdırılıyor...' : 'Bas'}
          </Button>
        </>
      )}

      {!connected && (
        <p className="text-xs text-center text-muted-foreground">Yazdırmak için önce yazıcıya bağlanın</p>
      )}
    </div>
  );
}

function drawPhotoFrame(ctx: CanvasRenderingContext2D, frame: string, w: number, h: number, pad: number) {
  ctx.strokeStyle = 'black';
  ctx.fillStyle = 'black';

  switch (frame) {
    case 'solid':
      ctx.lineWidth = 3;
      ctx.strokeRect(pad / 2, pad / 2, w - pad, h - pad);
      break;
    case 'polaroid':
      ctx.lineWidth = 2;
      ctx.strokeRect(4, 4, w - 8, h - 8);
      break;
    case 'rounded':
      ctx.lineWidth = 3;
      const r = 20;
      ctx.beginPath();
      ctx.moveTo(pad / 2 + r, pad / 2);
      ctx.lineTo(w - pad / 2 - r, pad / 2);
      ctx.quadraticCurveTo(w - pad / 2, pad / 2, w - pad / 2, pad / 2 + r);
      ctx.lineTo(w - pad / 2, h - pad / 2 - r);
      ctx.quadraticCurveTo(w - pad / 2, h - pad / 2, w - pad / 2 - r, h - pad / 2);
      ctx.lineTo(pad / 2 + r, h - pad / 2);
      ctx.quadraticCurveTo(pad / 2, h - pad / 2, pad / 2, h - pad / 2 - r);
      ctx.lineTo(pad / 2, pad / 2 + r);
      ctx.quadraticCurveTo(pad / 2, pad / 2, pad / 2 + r, pad / 2);
      ctx.closePath();
      ctx.stroke();
      break;
    case 'stamp': {
      ctx.lineWidth = 2;
      const step = 12;
      const radius = 4;
      // Draw scalloped edge
      ctx.beginPath();
      for (let x = pad / 2; x < w - pad / 2; x += step) {
        ctx.arc(x + step / 2, pad / 2, radius, 0, Math.PI, true);
      }
      for (let y = pad / 2; y < h - pad / 2; y += step) {
        ctx.arc(w - pad / 2, y + step / 2, radius, -Math.PI / 2, Math.PI / 2, true);
      }
      for (let x = w - pad / 2; x > pad / 2; x -= step) {
        ctx.arc(x - step / 2, h - pad / 2, radius, 0, Math.PI, false);
      }
      for (let y = h - pad / 2; y > pad / 2; y -= step) {
        ctx.arc(pad / 2, y - step / 2, radius, Math.PI / 2, -Math.PI / 2, false);
      }
      ctx.stroke();
      break;
    }
    case 'filmstrip': {
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, w, h);
      // Film holes on left and right
      const holeSize = 8;
      const holeGap = 18;
      ctx.fillStyle = 'white';
      for (let y = 10; y < h - 10; y += holeGap) {
        ctx.fillRect(3, y, holeSize, holeSize);
        ctx.strokeRect(3, y, holeSize, holeSize);
        ctx.fillRect(w - 3 - holeSize, y, holeSize, holeSize);
        ctx.strokeRect(w - 3 - holeSize, y, holeSize, holeSize);
      }
      ctx.fillStyle = 'black';
      break;
    }
  }
}

function applyFilter(ctx: CanvasRenderingContext2D, w: number, h: number, filter: FilterType, pad: number, imgW: number, imgH: number) {
  if (filter === 'none') {
    // Standard Floyd-Steinberg dithering
    const imageData = ctx.getImageData(pad, pad, imgW, imgH);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      data[i] = data[i + 1] = data[i + 2] = gray;
    }
    for (let y = 0; y < imgH; y++) {
      for (let x = 0; x < imgW; x++) {
        const idx = (y * imgW + x) * 4;
        const old = data[idx];
        const nw = old > 127 ? 255 : 0;
        const err = old - nw;
        data[idx] = data[idx + 1] = data[idx + 2] = nw;
        if (x + 1 < imgW) { const r = idx + 4; data[r] = data[r + 1] = data[r + 2] = data[r] + err * 7 / 16; }
        if (y + 1 < imgH) {
          if (x > 0) { const bl = ((y + 1) * imgW + (x - 1)) * 4; data[bl] = data[bl + 1] = data[bl + 2] = data[bl] + err * 3 / 16; }
          const b = ((y + 1) * imgW + x) * 4; data[b] = data[b + 1] = data[b + 2] = data[b] + err * 5 / 16;
          if (x + 1 < imgW) { const br = ((y + 1) * imgW + (x + 1)) * 4; data[br] = data[br + 1] = data[br + 2] = data[br] + err * 1 / 16; }
        }
      }
    }
    ctx.putImageData(imageData, pad, pad);
    return;
  }

  const imageData = ctx.getImageData(pad, pad, imgW, imgH);
  const data = imageData.data;

  switch (filter) {
    case 'highContrast':
      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const v = gray > 100 ? 255 : 0;
        data[i] = data[i + 1] = data[i + 2] = v;
      }
      break;
    case 'invert':
      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const inv = 255 - gray;
        const v = inv > 127 ? 255 : 0;
        data[i] = data[i + 1] = data[i + 2] = v;
      }
      break;
    case 'threshold':
      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const v = gray > 140 ? 255 : 0;
        data[i] = data[i + 1] = data[i + 2] = v;
      }
      break;
    case 'halftone':
      for (let y = 0; y < imgH; y += 4) {
        for (let x = 0; x < imgW; x += 4) {
          let sum = 0, count = 0;
          for (let dy = 0; dy < 4 && y + dy < imgH; dy++) {
            for (let dx = 0; dx < 4 && x + dx < imgW; dx++) {
              const idx = ((y + dy) * imgW + (x + dx)) * 4;
              sum += 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
              count++;
            }
          }
          const avg = sum / count;
          const dotSize = Math.round((1 - avg / 255) * 4);
          for (let dy = 0; dy < 4 && y + dy < imgH; dy++) {
            for (let dx = 0; dx < 4 && x + dx < imgW; dx++) {
              const idx = ((y + dy) * imgW + (x + dx)) * 4;
              const dist = Math.max(Math.abs(dy - 1.5), Math.abs(dx - 1.5));
              data[idx] = data[idx + 1] = data[idx + 2] = dist < dotSize ? 0 : 255;
            }
          }
        }
      }
      break;
    case 'edge': {
      const gray = new Float32Array(imgW * imgH);
      for (let i = 0; i < gray.length; i++) {
        const idx = i * 4;
        gray[i] = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      }
      for (let y = 1; y < imgH - 1; y++) {
        for (let x = 1; x < imgW - 1; x++) {
          const gx = -gray[(y - 1) * imgW + (x - 1)] + gray[(y - 1) * imgW + (x + 1)]
            - 2 * gray[y * imgW + (x - 1)] + 2 * gray[y * imgW + (x + 1)]
            - gray[(y + 1) * imgW + (x - 1)] + gray[(y + 1) * imgW + (x + 1)];
          const gy = -gray[(y - 1) * imgW + (x - 1)] - 2 * gray[(y - 1) * imgW + x] - gray[(y - 1) * imgW + (x + 1)]
            + gray[(y + 1) * imgW + (x - 1)] + 2 * gray[(y + 1) * imgW + x] + gray[(y + 1) * imgW + (x + 1)];
          const mag = Math.sqrt(gx * gx + gy * gy);
          const idx = (y * imgW + x) * 4;
          const v = mag > 50 ? 0 : 255;
          data[idx] = data[idx + 1] = data[idx + 2] = v;
        }
      }
      break;
    }
  }
  ctx.putImageData(imageData, pad, pad);
}
