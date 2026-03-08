import { useState, useRef, useCallback, useEffect } from 'react';
import { RotateCw, Printer, Loader2, Undo2, Redo2 } from 'lucide-react';
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

interface EditorState {
  scale: number;
  brightness: number;
  contrast: number;
  filter: FilterType;
  frameType: string;
  rotation: number;
  offsetX: number;
  offsetY: number;
}

const defaultState: EditorState = {
  scale: 100, brightness: 0, contrast: 0,
  filter: 'none', frameType: 'none', rotation: 0,
  offsetX: 0, offsetY: 0,
};

export function ImageEditor({ imageSrc, onBack }: ImageEditorProps) {
  const [state, setState] = useState<EditorState>(defaultState);
  const [history, setHistory] = useState<EditorState[]>([defaultState]);
  const [historyIdx, setHistoryIdx] = useState(0);
  const [printing, setPrinting] = useState(false);

  const dragRef = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { connected } = usePrinter();

  const pushState = useCallback((next: EditorState) => {
    setState(next);
    setHistory(h => [...h.slice(0, historyIdx + 1), next]);
    setHistoryIdx(i => i + 1);
  }, [historyIdx]);

  const update = useCallback((partial: Partial<EditorState>) => {
    pushState({ ...state, ...partial });
  }, [state, pushState]);

  const undo = () => {
    if (historyIdx > 0) {
      setHistoryIdx(i => i - 1);
      setState(history[historyIdx - 1]);
    }
  };
  const redo = () => {
    if (historyIdx < history.length - 1) {
      setHistoryIdx(i => i + 1);
      setState(history[historyIdx + 1]);
    }
  };

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    img.onload = () => {
      const { scale, brightness, contrast, filter, frameType, rotation, offsetX, offsetY } = state;
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

      applyFilter(ctx, canvas.width, canvas.height, filter, framePad, cropW, cropH);
    };
    img.src = imageSrc;
  }, [imageSrc, state]);

  useEffect(() => {
    const timer = setTimeout(renderCanvas, 50);
    return () => clearTimeout(timer);
  }, [renderCanvas]);

  // Drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    dragRef.current = { startX: e.clientX, startY: e.clientY, ox: state.offsetX, oy: state.offsetY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    setState(s => ({
      ...s,
      offsetX: dragRef.current!.ox + (e.clientX - dragRef.current!.startX),
      offsetY: dragRef.current!.oy + (e.clientY - dragRef.current!.startY),
    }));
  };
  const handlePointerUp = () => {
    if (dragRef.current) {
      // Commit drag to history
      pushState(state);
      dragRef.current = null;
    }
  };

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
      {/* Undo / Redo */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={undo} disabled={historyIdx <= 0}>
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={redo} disabled={historyIdx >= history.length - 1}>
          <Redo2 className="h-4 w-4" />
        </Button>
        <div className="flex-1" />
        <Button variant="outline" size="sm" className="gap-1" onClick={() => update({ rotation: (state.rotation + 90) % 360 })}>
          <RotateCw className="h-4 w-4" /> {state.rotation}°
        </Button>
      </div>

      {/* Scale */}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Boyut: %{state.scale}</Label>
        <Slider value={[state.scale]} onValueChange={([v]) => update({ scale: v })} min={50} max={200} step={5} />
      </div>

      {/* Canvas preview */}
      <div className="flex justify-center">
        <div className="border-2 border-dashed border-border rounded-lg p-2 bg-muted/30 inline-block overflow-hidden cursor-grab active:cursor-grabbing">
          <canvas
            ref={canvasRef}
            style={{ width: '100%', maxWidth: '384px', imageRendering: 'pixelated' }}
            className="block touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          />
        </div>
      </div>

      {/* Effect & Frame */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Efekt</Label>
          <Select value={state.filter} onValueChange={(v) => update({ filter: v as FilterType })}>
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
          <Select value={state.frameType} onValueChange={(v) => update({ frameType: v })}>
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
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Parlaklık: {state.brightness}</Label>
          <Slider value={[state.brightness]} onValueChange={([v]) => update({ brightness: v })} min={-50} max={50} step={5} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Kontrast: {state.contrast}</Label>
          <Slider value={[state.contrast]} onValueChange={([v]) => update({ contrast: v })} min={-50} max={50} step={5} />
        </div>
      </div>

      {/* Print */}
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
