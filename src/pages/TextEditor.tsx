import { useState, useRef } from 'react';
import { AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, Loader2, Printer, Type, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Toggle } from '@/components/ui/toggle';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThermalPreview, ThermalPreviewHandle } from '@/components/ThermalPreview';
import { PageHeader } from '@/components/PageHeader';
import { usePrinter } from '@/hooks/use-printer';
import { printCanvas } from '@/lib/printer';
import { toast } from 'sonner';

const fontSizes = [
  { label: 'XS', value: 12 },
  { label: 'S', value: 16 },
  { label: 'M', value: 22 },
  { label: 'L', value: 30 },
  { label: 'XL', value: 40 },
  { label: '2XL', value: 56 },
];

const fonts = [
  { label: 'JetBrains Mono', value: "'JetBrains Mono', monospace", preview: 'Aa' },
  { label: 'Inter', value: "'Inter', sans-serif", preview: 'Aa' },
  { label: 'Georgia', value: "Georgia, 'Times New Roman', serif", preview: 'Aa' },
  { label: 'Arial', value: "Arial, Helvetica, sans-serif", preview: 'Aa' },
  { label: 'Courier', value: "'Courier New', Courier, monospace", preview: 'Aa' },
  { label: 'Cursive', value: "'Segoe Script', 'Comic Sans MS', cursive", preview: 'Aa' },
  { label: 'Impact', value: "Impact, 'Arial Black', sans-serif", preview: 'Aa' },
  { label: 'Trebuchet', value: "'Trebuchet MS', sans-serif", preview: 'Aa' },
  { label: 'Verdana', value: "Verdana, Geneva, sans-serif", preview: 'Aa' },
  { label: 'Palatino', value: "'Palatino Linotype', 'Book Antiqua', serif", preview: 'Aa' },
];

const frames = [
  { label: 'Yok', value: 'none', icon: '○' },
  { label: 'Düz', value: 'solid', icon: '□' },
  { label: 'Kesikli', value: 'dashed', icon: '┄' },
  { label: 'Çift', value: 'double', icon: '▣' },
  { label: 'Yıldız', value: 'stars', icon: '★' },
  { label: 'Kalp', value: 'hearts', icon: '♥' },
  { label: 'Nokta', value: 'dotted', icon: '·' },
  { label: 'Dalga', value: 'wave', icon: '〰' },
  { label: 'Köşe', value: 'corners', icon: '⌐' },
  { label: 'Zincir', value: 'chain', icon: '⛓' },
  { label: 'Yuvarlatılmış', value: 'rounded', icon: '◯' },
  { label: 'Zikzak', value: 'zigzag', icon: '⚡' },
  { label: 'Çiçek', value: 'flowers', icon: '✿' },
  { label: 'Elmas', value: 'diamond', icon: '◆' },
  { label: 'Gölge', value: 'shadow_box', icon: '▪' },
  { label: 'Retro', value: 'retro', icon: '▧' },
];

const textEffects = [
  { label: 'Normal', value: 'none' },
  { label: 'Gölge', value: 'shadow' },
  { label: 'Kontur', value: 'outline' },
  { label: 'Ters (Beyaz/Siyah)', value: 'inverted' },
  { label: '3D Kabartma', value: '3d' },
  { label: 'Glitch', value: 'glitch' },
  { label: 'Typewriter', value: 'typewriter' },
  { label: 'Retro Çizgili', value: 'retro_lines' },
];

export default function TextEditor() {
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(22);
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [align, setAlign] = useState<CanvasTextAlign>('left');
  const [font, setFont] = useState(fonts[0].value);
  const [frame, setFrame] = useState('none');
  const [effect, setEffect] = useState('none');
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.4);
  const [printing, setPrinting] = useState(false);
  const previewRef = useRef<ThermalPreviewHandle>(null);
  const { connected } = usePrinter();

  const handleReset = () => {
    setText('');
    setFontSize(22);
    setBold(false);
    setItalic(false);
    setAlign('left');
    setFont(fonts[0].value);
    setFrame('none');
    setEffect('none');
    setLetterSpacing(0);
    setLineHeight(1.4);
  };

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
      <PageHeader title="Metin Bas" />

      {/* Text Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-1.5"><Type className="h-3.5 w-3.5" /> Metin</Label>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground" onClick={handleReset}>
            <RotateCcw className="h-3 w-3" /> Sıfırla
          </Button>
        </div>
        <Textarea
          placeholder="Basılacak metni yazın..."
          value={text}
          onChange={e => setText(e.target.value)}
          rows={3}
          className="resize-none"
        />
      </div>

      {/* Font & Effect selectors */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Yazı Tipi</Label>
          <Select value={font} onValueChange={setFont}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              {fonts.map(f => (
                <SelectItem key={f.value} value={f.value}>
                  <span style={{ fontFamily: f.value }}>{f.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground flex items-center gap-1"><Sparkles className="h-3 w-3" /> Efekt</Label>
          <Select value={effect} onValueChange={setEffect}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              {textEffects.map(e => (
                <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Font Size - Chip selector */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Boyut</Label>
        <div className="flex gap-1.5">
          {fontSizes.map(fs => (
            <button
              key={fs.value}
              className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                fontSize === fs.value
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
              onClick={() => setFontSize(fs.value)}
            >
              {fs.label}
            </button>
          ))}
        </div>
      </div>

      {/* Style toggles */}
      <div className="flex items-center gap-2">
        <Toggle pressed={bold} onPressedChange={setBold} size="sm" aria-label="Kalın" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle pressed={italic} onPressedChange={setItalic} size="sm" aria-label="İtalik" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
          <Italic className="h-4 w-4" />
        </Toggle>
        <div className="border-l border-border h-6 mx-1" />
        <Toggle pressed={align === 'left'} onPressedChange={() => setAlign('left')} size="sm" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
          <AlignLeft className="h-4 w-4" />
        </Toggle>
        <Toggle pressed={align === 'center'} onPressedChange={() => setAlign('center')} size="sm" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
          <AlignCenter className="h-4 w-4" />
        </Toggle>
        <Toggle pressed={align === 'right'} onPressedChange={() => setAlign('right')} size="sm" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
          <AlignRight className="h-4 w-4" />
        </Toggle>
      </div>

      {/* Spacing controls */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <Label className="text-xs text-muted-foreground">Harf Aralığı</Label>
            <span className="text-xs text-muted-foreground font-mono">{letterSpacing}px</span>
          </div>
          <Slider value={[letterSpacing]} onValueChange={v => setLetterSpacing(v[0])} min={-2} max={12} step={1} />
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <Label className="text-xs text-muted-foreground">Satır Aralığı</Label>
            <span className="text-xs text-muted-foreground font-mono">{lineHeight.toFixed(1)}x</span>
          </div>
          <Slider value={[lineHeight]} onValueChange={v => setLineHeight(v[0])} min={1.0} max={2.5} step={0.1} />
        </div>
      </div>

      {/* Frame selector - grid of chips */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Çerçeve</Label>
        <div className="grid grid-cols-4 gap-1.5">
          {frames.map(f => (
            <button
              key={f.value}
              className={`py-2 rounded-md text-xs font-medium transition-all flex flex-col items-center gap-0.5 ${
                frame === f.value
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
              onClick={() => setFrame(f.value)}
            >
              <span className="text-base leading-none">{f.icon}</span>
              <span className="text-[10px]">{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Önizleme</Label>
        <div className="overflow-x-auto">
          <ThermalPreview
            ref={previewRef}
            text={text}
            fontSize={fontSize}
            fontWeight={bold ? 'bold' : 'normal'}
            fontStyle={italic ? 'italic' : 'normal'}
            textAlign={align}
            fontFamily={font}
            frame={frame}
            effect={effect}
            letterSpacing={letterSpacing}
            lineHeight={lineHeight}
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
