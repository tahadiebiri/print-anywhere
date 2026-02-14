import { useState, useRef, useCallback, useEffect } from 'react';
import { RotateCw, Printer, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePrinter } from '@/hooks/use-printer';
import { printCanvas } from '@/lib/printer';
import { toast } from 'sonner';
import { FilterType, filters, photoFrames, applyFilter, drawPhotoFrame } from '@/lib/image-filters';

interface ImageEditorProps {
  imageSrc: string;
  onBack: () => void;
}

export function ImageEditor({ imageSrc, onBack }: ImageEditorProps) {
  const [scale, setScale] = useState(100);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [filter, setFilter] = useState<FilterType>('none');
  const [frameType, setFrameType] = useState('none');
  const [rotation, setRotation] = useState(0);
  const [printing, setPrinting] = useState(false);

  // Drag state
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const dragRef = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null);

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const printCanvasRef = useRef<HTMLCanvasElement>(null);
  const { connected } = usePrinter();

  const renderPreview = useCallback(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    img.onload = () => {
      const PRINT_W = 384;
      const scaleFactor = scale / 100;
      const framePad = frameType === 'polaroid' ? 30 : frameType !== 'none' ? 16 : 0;
      const polaroidBottom = frameType === 'polaroid' ? 60 : 0;

      const baseRatio = (PRINT_W - framePad * 2) / img.width;
      const imgW = Math.round(img.width * baseRatio * scaleFactor);
      const imgH = Math.round(img.height * baseRatio * scaleFactor);

      const cropW = PRINT_W - framePad * 2;
      const cropH = Math.round(img.height * baseRatio);

      canvas.width = PRINT_W;
      canvas.height = cropH + framePad * 2 + polaroidBottom;

      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawPhotoFrame(ctx, frameType, canvas.width, canvas.height, framePad);

      ctx.save();
      ctx.beginPath();
      ctx.rect(framePad, framePad, cropW, cropH);
      ctx.clip();

      ctx.filter = `brightness(${100 + brightness}%) contrast(${100 + contrast}%)`;

      const drawX = framePad + (cropW - imgW) / 2 + offsetX;
      const drawY = framePad + (cropH - imgH) / 2 + offsetY;

      if (rotation !== 0) {
        const cx = drawX + imgW / 2;
        const cy = drawY + imgH / 2;
        ctx.translate(cx, cy);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(img, -imgW / 2, -imgH / 2, imgW, imgH);
      } else {
        ctx.drawImage(img, drawX, drawY, imgW, imgH);
      }
      ctx.filter = 'none';
      ctx.restore();

      // Render print preview with filter
      const pc = printCanvasRef.current;
      if (pc) {
        pc.width = canvas.width;
        pc.height = canvas.height;
        const pctx = pc.getContext('2d')!;
        pctx.drawImage(canvas, 0, 0);
        applyFilter(pctx, pc.width, pc.height, filter, framePad, cropW, cropH);
      }
    };
    img.src = imageSrc;
  }, [imageSrc, scale, brightness, contrast, filter, frameType, rotation, offsetX, offsetY]);

  useEffect(() => {
    const timer = setTimeout(renderPreview, 50);
    return () => clearTimeout(timer);
  }, [renderPreview]);

  // Drag handlers for the preview canvas
  const handlePointerDown = (e: React.PointerEvent) => {
    dragRef.current = { startX: e.clientX, startY: e.clientY, ox: offsetX, oy: offsetY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    setOffsetX(dragRef.current.ox + (e.clientX - dragRef.current.startX));
    setOffsetY(dragRef.current.oy + (e.clientY - dragRef.current.startY));
  };
  const handlePointerUp = () => { dragRef.current = null; };

  const handlePrint = async () => {
    if (!printCanvasRef.current) return;
    setPrinting(true);
    try {
      await printCanvas(printCanvasRef.current);
      toast.success('Yazdırıldı!');
    } catch (e: any) {
      toast.error(e.message || 'Yazdırma hatası');
    } finally {
      setPrinting(false);
    }
  };

  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-1 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Geri
      </Button>

      {/* Scale slider */}
      <div className="space-y-1">
        <Label className="text-xs">Boyut: %{scale}</Label>
        <Slider value={[scale]} onValueChange={([v]) => setScale(v)} min={50} max={200} step={5} />
      </div>

      {/* Rotation */}
      <Button variant="outline" size="sm" className="gap-1" onClick={() => setRotation(r => (r + 90) % 360)}>
        <RotateCw className="h-4 w-4" /> Döndür ({rotation}°)
      </Button>

      {/* Editable preview - draggable */}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Düzenleme Önizlemesi (sürükle)</Label>
        <div className="flex justify-center">
          <div className="border-2 border-dashed border-border rounded-lg p-2 bg-muted/30 inline-block overflow-hidden cursor-grab active:cursor-grabbing touch-none">
            <canvas
              ref={previewCanvasRef}
              style={{ width: '384px', imageRendering: 'auto' }}
              className="block"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            />
          </div>
        </div>
      </div>

      {/* Effect & Frame selectors */}
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

      {/* Brightness & Contrast */}
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

      {/* Print preview */}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Baskı Önizlemesi</Label>
        <div className="flex justify-center">
          <div className="border-2 border-dashed border-border rounded-lg p-2 bg-muted/30 inline-block overflow-x-auto">
            <canvas
              ref={printCanvasRef}
              style={{ width: '384px', imageRendering: 'pixelated' }}
              className="block"
            />
          </div>
        </div>
      </div>

      {/* Print button */}
      <Button
        className="w-full gap-2"
        size="lg"
        disabled={!connected || printing}
        onClick={handlePrint}
      >
        {printing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
        {printing ? 'Yazdırılıyor...' : 'Bas'}
      </Button>

      {!connected && (
        <p className="text-xs text-center text-muted-foreground">Yazdırmak için önce yazıcıya bağlanın</p>
      )}
    </div>
  );
}
