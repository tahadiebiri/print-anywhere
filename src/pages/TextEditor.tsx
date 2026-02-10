import { useState, useRef, useEffect } from 'react';
import { AlignLeft, AlignCenter, AlignRight, Bold, Loader2, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Toggle } from '@/components/ui/toggle';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThermalPreview, ThermalPreviewHandle } from '@/components/ThermalPreview';
import { usePrinter } from '@/hooks/use-printer';
import { printCanvas } from '@/lib/printer';
import { toast } from 'sonner';

const fontSizes = [
  { label: 'Küçük', value: 18 },
  { label: 'Orta', value: 24 },
  { label: 'Büyük', value: 32 },
];

const fonts = [
  { label: 'JetBrains Mono', value: "'JetBrains Mono', monospace" },
  { label: 'Inter', value: "'Inter', sans-serif" },
  { label: 'Serif', value: "Georgia, 'Times New Roman', serif" },
  { label: 'Cursive', value: "'Segoe Script', 'Comic Sans MS', cursive" },
];

const frames = [
  { label: 'Çerçevesiz', value: 'none' },
  { label: 'Düz Çerçeve', value: 'solid' },
  { label: 'Kesikli Çerçeve', value: 'dashed' },
  { label: 'Çift Çerçeve', value: 'double' },
  { label: 'Yıldızlı', value: 'stars' },
];

export default function TextEditor() {
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(24);
  const [bold, setBold] = useState(false);
  const [align, setAlign] = useState<CanvasTextAlign>('left');
  const [font, setFont] = useState(fonts[0].value);
  const [frame, setFrame] = useState('none');
  const [printing, setPrinting] = useState(false);
  const previewRef = useRef<ThermalPreviewHandle>(null);
  const { connected } = usePrinter();

  const handlePrint = async () => {
    const canvas = previewRef.current?.getCanvas();
    if (!canvas) return;
    setPrinting(true);
    try {
      await printCanvas(canvas);
      toast.success('Yazdırıldı!');
    } catch (e: any) {
      toast.error(e.message || 'Yazdırma hatası');
    } finally {
      setPrinting(false);
    }
  };

  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">Metin Bas</h1>

      <div className="space-y-2">
        <Label>Metin</Label>
        <Textarea
          placeholder="Basılacak metni yazın..."
          value={text}
          onChange={e => setText(e.target.value)}
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Font</Label>
          <Select value={font} onValueChange={setFont}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {fonts.map(f => (
                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Çerçeve</Label>
          <Select value={frame} onValueChange={setFrame}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {frames.map(f => (
                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Label className="w-full text-xs text-muted-foreground">Font Boyutu</Label>
        {fontSizes.map(fs => (
          <Button
            key={fs.value}
            variant={fontSize === fs.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFontSize(fs.value)}
          >
            {fs.label}
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Toggle pressed={bold} onPressedChange={setBold} size="sm" aria-label="Kalın">
          <Bold className="h-4 w-4" />
        </Toggle>
        <div className="border-l border-border h-6 mx-1" />
        <Toggle pressed={align === 'left'} onPressedChange={() => setAlign('left')} size="sm">
          <AlignLeft className="h-4 w-4" />
        </Toggle>
        <Toggle pressed={align === 'center'} onPressedChange={() => setAlign('center')} size="sm">
          <AlignCenter className="h-4 w-4" />
        </Toggle>
        <Toggle pressed={align === 'right'} onPressedChange={() => setAlign('right')} size="sm">
          <AlignRight className="h-4 w-4" />
        </Toggle>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Önizleme</Label>
        <div className="overflow-x-auto">
          <ThermalPreview
            ref={previewRef}
            text={text}
            fontSize={fontSize}
            fontWeight={bold ? 'bold' : 'normal'}
            textAlign={align}
            fontFamily={font}
            frame={frame}
          />
        </div>
      </div>

      <Button
        className="w-full gap-2"
        size="lg"
        disabled={!connected || !text.trim() || printing}
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
