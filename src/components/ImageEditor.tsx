import { useState, useRef, useCallback, useEffect } from 'react';
import {
  RotateCw, Printer, Loader2, Undo2, Redo2,
  Pencil, Eraser, Type, Move, Minus, Plus, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';
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

interface Stroke {
  points: { x: number; y: number }[];
  color: string;
  width: number;
  eraser: boolean;
}

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
}

type ToolMode = 'move' | 'pen' | 'eraser' | 'text';

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

  // Tool state
  const [tool, setTool] = useState<ToolMode>('move');
  const [penSize, setPenSize] = useState(3);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [strokeHistory, setStrokeHistory] = useState<Stroke[][]>([[]]);
  const [strokeHistoryIdx, setStrokeHistoryIdx] = useState(0);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);

  // Text state
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [textInput, setTextInput] = useState('');
  const [textFontSize, setTextFontSize] = useState(20);
  const [textFont, setTextFont] = useState('JetBrains Mono');
  const [textColor, setTextColor] = useState('#000000');
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [draggingText, setDraggingText] = useState<{ id: string; startX: number; startY: number; ox: number; oy: number } | null>(null);

  const dragRef = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { connected } = usePrinter();

  // Canvas dimensions tracking
  const [canvasDims, setCanvasDims] = useState({ w: 384, h: 300 });

  const pushState = useCallback((next: EditorState) => {
    setState(next);
    setHistory(h => [...h.slice(0, historyIdx + 1), next]);
    setHistoryIdx(i => i + 1);
  }, [historyIdx]);

  const update = useCallback((partial: Partial<EditorState>) => {
    pushState({ ...state, ...partial });
  }, [state, pushState]);

  const pushStrokes = useCallback((next: Stroke[]) => {
    setStrokes(next);
    setStrokeHistory(h => [...h.slice(0, strokeHistoryIdx + 1), next]);
    setStrokeHistoryIdx(i => i + 1);
  }, [strokeHistoryIdx]);

  const undo = () => {
    // Undo strokes first, then editor state
    if (strokeHistoryIdx > 0) {
      setStrokeHistoryIdx(i => i - 1);
      setStrokes(strokeHistory[strokeHistoryIdx - 1]);
    } else if (historyIdx > 0) {
      setHistoryIdx(i => i - 1);
      setState(history[historyIdx - 1]);
    }
  };

  const redo = () => {
    if (strokeHistoryIdx < strokeHistory.length - 1) {
      setStrokeHistoryIdx(i => i + 1);
      setStrokes(strokeHistory[strokeHistoryIdx + 1]);
    } else if (historyIdx < history.length - 1) {
      setHistoryIdx(i => i + 1);
      setState(history[historyIdx + 1]);
    }
  };

  const canUndo = strokeHistoryIdx > 0 || historyIdx > 0;
  const canRedo = strokeHistoryIdx < strokeHistory.length - 1 || historyIdx < history.length - 1;

  // Get scale factor between displayed canvas and actual canvas
  const getDisplayScale = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return 1;
    const rect = canvas.getBoundingClientRect();
    return canvas.width / rect.width;
  }, []);

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
      setCanvasDims({ w: canvas.width, h: canvas.height });

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

  // Render overlay (strokes + text)
  const renderOverlay = useCallback(() => {
    const overlay = overlayRef.current;
    const base = canvasRef.current;
    if (!overlay || !base) return;

    overlay.width = base.width;
    overlay.height = base.height;
    const ctx = overlay.getContext('2d')!;
    ctx.clearRect(0, 0, overlay.width, overlay.height);

    // Draw strokes
    const allStrokes = currentStroke ? [...strokes, currentStroke] : strokes;
    for (const stroke of allStrokes) {
      if (stroke.points.length < 2) continue;
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = stroke.width;

      if (stroke.eraser) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
      } else {
        ctx.strokeStyle = stroke.color;
      }

      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
      ctx.restore();
    }

    // Draw text overlays
    for (const t of textOverlays) {
      ctx.save();
      ctx.font = `${t.fontSize}px "JetBrains Mono", monospace`;
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, t.x, t.y);

      // Selection indicator
      if (selectedTextId === t.id) {
        const metrics = ctx.measureText(t.text);
        ctx.strokeStyle = 'hsl(262, 83%, 58%)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(t.x - 2, t.y - t.fontSize, metrics.width + 4, t.fontSize + 4);
        ctx.setLineDash([]);
      }
      ctx.restore();
    }
  }, [strokes, currentStroke, textOverlays, selectedTextId]);

  useEffect(() => {
    const timer = setTimeout(renderCanvas, 50);
    return () => clearTimeout(timer);
  }, [renderCanvas]);

  useEffect(() => {
    renderOverlay();
  }, [renderOverlay]);

  // Pointer coordinate helper
  const getCanvasPoint = (e: React.PointerEvent) => {
    const overlay = overlayRef.current;
    if (!overlay) return { x: 0, y: 0 };
    const rect = overlay.getBoundingClientRect();
    const scale = overlay.width / rect.width;
    return {
      x: (e.clientX - rect.left) * scale,
      y: (e.clientY - rect.top) * scale,
    };
  };

  // Unified pointer handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const pt = getCanvasPoint(e);

    if (tool === 'move') {
      dragRef.current = { startX: e.clientX, startY: e.clientY, ox: state.offsetX, oy: state.offsetY };
    } else if (tool === 'pen' || tool === 'eraser') {
      setCurrentStroke({
        points: [pt],
        color: 'black',
        width: tool === 'eraser' ? penSize * 3 : penSize,
        eraser: tool === 'eraser',
      });
    } else if (tool === 'text') {
      // Check if clicking on existing text
      const overlay = overlayRef.current;
      if (overlay) {
        const ctx = overlay.getContext('2d')!;
        const clicked = textOverlays.find(t => {
          ctx.font = `${t.fontSize}px "JetBrains Mono", monospace`;
          const m = ctx.measureText(t.text);
          return pt.x >= t.x - 2 && pt.x <= t.x + m.width + 2 &&
                 pt.y >= t.y - t.fontSize && pt.y <= t.y + 4;
        });
        if (clicked) {
          setSelectedTextId(clicked.id);
          setDraggingText({ id: clicked.id, startX: e.clientX, startY: e.clientY, ox: clicked.x, oy: clicked.y });
        } else {
          setSelectedTextId(null);
        }
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (tool === 'move' && dragRef.current) {
      setState(s => ({
        ...s,
        offsetX: dragRef.current!.ox + (e.clientX - dragRef.current!.startX),
        offsetY: dragRef.current!.oy + (e.clientY - dragRef.current!.startY),
      }));
    } else if ((tool === 'pen' || tool === 'eraser') && currentStroke) {
      const pt = getCanvasPoint(e);
      setCurrentStroke(s => s ? { ...s, points: [...s.points, pt] } : null);
    } else if (tool === 'text' && draggingText) {
      const scale = getDisplayScale();
      const dx = (e.clientX - draggingText.startX) * scale;
      const dy = (e.clientY - draggingText.startY) * scale;
      setTextOverlays(prev => prev.map(t =>
        t.id === draggingText.id
          ? { ...t, x: draggingText.ox + dx, y: draggingText.oy + dy }
          : t
      ));
    }
  };

  const handlePointerUp = () => {
    if (tool === 'move' && dragRef.current) {
      pushState(state);
      dragRef.current = null;
    } else if ((tool === 'pen' || tool === 'eraser') && currentStroke) {
      const newStrokes = [...strokes, currentStroke];
      pushStrokes(newStrokes);
      setCurrentStroke(null);
    } else if (draggingText) {
      setDraggingText(null);
    }
  };

  const addText = () => {
    if (!textInput.trim()) return;
    const newText: TextOverlay = {
      id: crypto.randomUUID(),
      text: textInput,
      x: 20,
      y: canvasDims.h / 2,
      fontSize: textFontSize,
      color: 'black',
    };
    setTextOverlays(prev => [...prev, newText]);
    setSelectedTextId(newText.id);
    setTextInput('');
  };

  const deleteSelectedText = () => {
    if (selectedTextId) {
      setTextOverlays(prev => prev.filter(t => t.id !== selectedTextId));
      setSelectedTextId(null);
    }
  };

  const clearDrawing = () => {
    pushStrokes([]);
  };

  // Composite canvas for printing
  const getCompositeCanvas = (): HTMLCanvasElement | null => {
    const base = canvasRef.current;
    const overlay = overlayRef.current;
    if (!base || !overlay) return null;

    const composite = document.createElement('canvas');
    composite.width = base.width;
    composite.height = base.height;
    const ctx = composite.getContext('2d')!;
    ctx.drawImage(base, 0, 0);
    ctx.drawImage(overlay, 0, 0);
    return composite;
  };

  const handlePrint = async () => {
    const composite = getCompositeCanvas();
    if (!composite) return;
    setPrinting(true);
    try {
      await printCanvas(composite);
      toast.success('Yazdırıldı!');
    } catch (e: any) {
      toast.error(e.message || 'Yazdırma hatası');
    } finally {
      setPrinting(false);
    }
  };

  const toolButtons: { mode: ToolMode; icon: typeof Move; label: string }[] = [
    { mode: 'move', icon: Move, label: 'Taşı' },
    { mode: 'pen', icon: Pencil, label: 'Kalem' },
    { mode: 'eraser', icon: Eraser, label: 'Silgi' },
    { mode: 'text', icon: Type, label: 'Metin' },
  ];

  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto space-y-4">
      {/* Toolbar: Undo/Redo + Rotate */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={undo} disabled={!canUndo}>
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={redo} disabled={!canRedo}>
          <Redo2 className="h-4 w-4" />
        </Button>
        <div className="flex-1" />
        <Button variant="outline" size="sm" className="gap-1" onClick={() => update({ rotation: (state.rotation + 90) % 360 })}>
          <RotateCw className="h-4 w-4" /> {state.rotation}°
        </Button>
      </div>

      {/* Tool selector */}
      <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
        {toolButtons.map(({ mode, icon: Icon, label }) => (
          <Toggle
            key={mode}
            pressed={tool === mode}
            onPressedChange={() => setTool(mode)}
            size="sm"
            className="flex-1 gap-1 data-[state=on]:bg-background data-[state=on]:shadow-sm"
          >
            <Icon className="h-4 w-4" />
            <span className="text-xs hidden sm:inline">{label}</span>
          </Toggle>
        ))}
      </div>

      {/* Pen/Eraser options */}
      {(tool === 'pen' || tool === 'eraser') && (
        <div className="flex items-center gap-3">
          <Label className="text-xs text-muted-foreground shrink-0">
            {tool === 'pen' ? 'Kalem' : 'Silgi'}: {penSize}px
          </Label>
          <Slider
            value={[penSize]}
            onValueChange={([v]) => setPenSize(v)}
            min={1}
            max={20}
            step={1}
            className="flex-1"
          />
          <Button variant="ghost" size="sm" className="gap-1 text-destructive" onClick={clearDrawing}>
            <Trash2 className="h-3.5 w-3.5" /> Temizle
          </Button>
        </div>
      )}

      {/* Text tool options */}
      {tool === 'text' && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              placeholder="Metin yazın..."
              className="flex-1"
              onKeyDown={e => e.key === 'Enter' && addText()}
            />
            <Button size="sm" onClick={addText} disabled={!textInput.trim()}>Ekle</Button>
          </div>
          <div className="flex items-center gap-3">
            <Label className="text-xs text-muted-foreground shrink-0">Boyut: {textFontSize}px</Label>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setTextFontSize(s => Math.max(8, s - 2))}>
              <Minus className="h-3 w-3" />
            </Button>
            <Slider
              value={[textFontSize]}
              onValueChange={([v]) => setTextFontSize(v)}
              min={8}
              max={48}
              step={1}
              className="flex-1"
            />
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setTextFontSize(s => Math.min(48, s + 2))}>
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          {selectedTextId && (
            <Button variant="outline" size="sm" className="gap-1 text-destructive" onClick={deleteSelectedText}>
              <Trash2 className="h-3.5 w-3.5" /> Seçili metni sil
            </Button>
          )}
          {textOverlays.length > 0 && (
            <p className="text-xs text-muted-foreground">💡 Metinleri sürükleyerek taşıyabilirsiniz</p>
          )}
        </div>
      )}

      {/* Scale */}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Boyut: %{state.scale}</Label>
        <Slider value={[state.scale]} onValueChange={([v]) => update({ scale: v })} min={50} max={200} step={5} />
      </div>

      {/* Canvas preview with overlay */}
      <div className="flex justify-center">
        <div
          ref={containerRef}
          className="border-2 border-dashed border-border rounded-lg p-2 bg-muted/30 inline-block overflow-hidden relative"
          style={{ cursor: tool === 'move' ? 'grab' : tool === 'pen' ? 'crosshair' : tool === 'eraser' ? 'cell' : 'text' }}
        >
          <canvas
            ref={canvasRef}
            style={{ width: '100%', maxWidth: '384px', imageRendering: 'pixelated' }}
            className="block"
          />
          <canvas
            ref={overlayRef}
            style={{ width: '100%', maxWidth: '384px', position: 'absolute', top: 8, left: 8, right: 8, bottom: 8 }}
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
