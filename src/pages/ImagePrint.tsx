import { useState, useRef, useCallback } from 'react';
import { Upload, Printer, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { usePrinter } from '@/hooks/use-printer';
import { printCanvas } from '@/lib/printer';
import { toast } from 'sonner';

export default function ImagePrint() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [printing, setPrinting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
      const ratio = 384 / img.width;
      canvas.width = 384;
      canvas.height = Math.ceil(img.height * ratio);
      
      ctx.filter = `brightness(${100 + brightness}%) contrast(${100 + contrast}%)`;
      ctx.drawImage(img, 0, 0, 384, canvas.height);
      ctx.filter = 'none';

      // Floyd-Steinberg dithering
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const w = canvas.width;
      const h = canvas.height;

      // Convert to grayscale first
      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        data[i] = data[i + 1] = data[i + 2] = gray;
      }

      // Dithering
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          const oldPixel = data[idx];
          const newPixel = oldPixel > 127 ? 255 : 0;
          const error = oldPixel - newPixel;
          data[idx] = data[idx + 1] = data[idx + 2] = newPixel;

          if (x + 1 < w) {
            const r = idx + 4;
            data[r] = data[r + 1] = data[r + 2] = data[r] + error * 7 / 16;
          }
          if (y + 1 < h) {
            if (x > 0) {
              const bl = idx + (w - 1) * 4;
              const actualBl = ((y + 1) * w + (x - 1)) * 4;
              data[actualBl] = data[actualBl + 1] = data[actualBl + 2] = data[actualBl] + error * 3 / 16;
            }
            const b = ((y + 1) * w + x) * 4;
            data[b] = data[b + 1] = data[b + 2] = data[b] + error * 5 / 16;
            if (x + 1 < w) {
              const br = ((y + 1) * w + (x + 1)) * 4;
              data[br] = data[br + 1] = data[br + 2] = data[br] + error * 1 / 16;
            }
          }
        }
      }
      ctx.putImageData(imageData, 0, 0);
    };
    img.src = originalImage;
  }, [originalImage, brightness, contrast]);

  // Re-render when settings change
  useState(() => { renderPreview(); });
  // Using effect via key trick
  const settingsKey = `${brightness}-${contrast}-${originalImage}`;

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
      <h1 className="text-xl font-bold">Görsel Bas</h1>

      <label className="flex flex-col items-center gap-2 border-2 border-dashed border-border rounded-xl p-8 cursor-pointer hover:border-primary/40 transition-colors">
        <Upload className="h-8 w-8 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Görsel seçmek için dokunun</span>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>

      {originalImage && (
        <>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Parlaklık: {brightness}</Label>
              <Slider
                value={[brightness]}
                onValueChange={([v]) => { setBrightness(v); setTimeout(renderPreview, 0); }}
                min={-50}
                max={50}
                step={5}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Kontrast: {contrast}</Label>
              <Slider
                value={[contrast]}
                onValueChange={([v]) => { setContrast(v); setTimeout(renderPreview, 0); }}
                min={-50}
                max={50}
                step={5}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Önizleme (Siyah-Beyaz Dithered)</Label>
            <div className="flex justify-center">
              <div className="border-2 border-dashed border-border rounded-lg p-2 bg-muted/30 inline-block overflow-x-auto">
                <canvas
                  ref={canvasRef}
                  key={settingsKey}
                  style={{ width: '384px', imageRendering: 'pixelated' }}
                  className="block"
                />
                <img
                  src={originalImage}
                  className="hidden"
                  onLoad={renderPreview}
                  alt=""
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
