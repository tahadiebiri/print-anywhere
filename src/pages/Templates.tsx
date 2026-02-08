import { useState, useRef } from 'react';
import { ClipboardList, ShoppingCart, StickyNote, Tag, Receipt, Printer, Loader2, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { usePrinter } from '@/hooks/use-printer';
import { printCanvas } from '@/lib/printer';
import { toast } from 'sonner';

type TemplateType = 'todo' | 'shopping' | 'note' | 'label' | 'receipt' | null;

const templates = [
  { type: 'todo' as const, icon: ClipboardList, label: 'Yapılacaklar', desc: 'Başlık + onay kutuları' },
  { type: 'shopping' as const, icon: ShoppingCart, label: 'Alışveriş', desc: 'Madde listesi' },
  { type: 'note' as const, icon: StickyNote, label: 'Not Kağıdı', desc: 'Başlık + çizgili alan' },
  { type: 'label' as const, icon: Tag, label: 'Etiket', desc: 'İsim + açıklama' },
  { type: 'receipt' as const, icon: Receipt, label: 'Mini Fiş', desc: 'Tarih, kalemler, toplam' },
];

export default function Templates() {
  const [selected, setSelected] = useState<TemplateType>(null);
  const [printing, setPrinting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { connected } = usePrinter();

  // Template-specific state
  const [title, setTitle] = useState('');
  const [items, setItems] = useState<string[]>(['']);
  const [noteBody, setNoteBody] = useState('');
  const [labelDesc, setLabelDesc] = useState('');
  const [receiptItems, setReceiptItems] = useState<{ name: string; price: string }[]>([{ name: '', price: '' }]);

  const reset = () => {
    setSelected(null);
    setTitle('');
    setItems(['']);
    setNoteBody('');
    setLabelDesc('');
    setReceiptItems([{ name: '', price: '' }]);
  };

  const renderToCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 384;
    const padding = 16;
    ctx.fillStyle = 'white';

    switch (selected) {
      case 'todo': {
        const lineH = 30;
        canvas.height = 60 + items.filter(i => i).length * lineH + 20;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black';
        ctx.font = 'bold 22px Inter, sans-serif';
        ctx.fillText(title || 'Yapılacaklar', padding, 35);
        ctx.font = '18px JetBrains Mono, monospace';
        items.filter(i => i).forEach((item, i) => {
          const y = 65 + i * lineH;
          ctx.strokeStyle = 'black';
          ctx.strokeRect(padding, y - 12, 14, 14);
          ctx.fillText(item, padding + 22, y);
        });
        break;
      }
      case 'shopping': {
        const lineH = 28;
        canvas.height = 60 + items.filter(i => i).length * lineH + 20;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black';
        ctx.font = 'bold 22px Inter, sans-serif';
        ctx.fillText(title || 'Alışveriş Listesi', padding, 35);
        ctx.font = '18px JetBrains Mono, monospace';
        items.filter(i => i).forEach((item, i) => {
          ctx.fillText(`• ${item}`, padding, 65 + i * lineH);
        });
        break;
      }
      case 'note': {
        canvas.height = 300;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black';
        ctx.font = 'bold 22px Inter, sans-serif';
        ctx.fillText(title || 'Not', padding, 35);
        // Draw lines
        ctx.strokeStyle = '#ccc';
        for (let y = 55; y < 290; y += 25) {
          ctx.beginPath();
          ctx.moveTo(padding, y);
          ctx.lineTo(384 - padding, y);
          ctx.stroke();
        }
        if (noteBody) {
          ctx.fillStyle = 'black';
          ctx.font = '16px JetBrains Mono, monospace';
          const words = noteBody.split(' ');
          let line = '';
          let y = 72;
          for (const word of words) {
            const test = line ? `${line} ${word}` : word;
            if (ctx.measureText(test).width > 384 - padding * 2) {
              ctx.fillText(line, padding, y);
              line = word;
              y += 25;
            } else {
              line = test;
            }
          }
          if (line) ctx.fillText(line, padding, y);
        }
        break;
      }
      case 'label': {
        canvas.height = 120;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black';
        ctx.font = 'bold 26px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(title || 'Etiket', 192, 45);
        ctx.font = '16px Inter, sans-serif';
        ctx.fillText(labelDesc || '', 192, 75);
        ctx.textAlign = 'left';
        // Dashed border
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(8, 8, 368, 104);
        ctx.setLineDash([]);
        break;
      }
      case 'receipt': {
        const validItems = receiptItems.filter(i => i.name && i.price);
        const total = validItems.reduce((s, i) => s + (parseFloat(i.price) || 0), 0);
        const lineH = 26;
        canvas.height = 120 + validItems.length * lineH + 40;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black';
        ctx.font = 'bold 22px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(title || 'FİŞ', 192, 35);
        ctx.font = '14px JetBrains Mono, monospace';
        ctx.fillText(new Date().toLocaleString('tr-TR'), 192, 55);
        // Divider
        ctx.fillText('─'.repeat(30), 192, 75);
        ctx.textAlign = 'left';
        ctx.font = '16px JetBrains Mono, monospace';
        validItems.forEach((item, i) => {
          const y = 100 + i * lineH;
          ctx.fillText(item.name, padding, y);
          ctx.textAlign = 'right';
          ctx.fillText(`₺${parseFloat(item.price).toFixed(2)}`, 384 - padding, y);
          ctx.textAlign = 'left';
        });
        const totalY = 100 + validItems.length * lineH + 10;
        ctx.textAlign = 'center';
        ctx.fillText('─'.repeat(30), 192, totalY);
        ctx.font = 'bold 20px JetBrains Mono, monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`TOPLAM: ₺${total.toFixed(2)}`, 384 - padding, totalY + 25);
        ctx.textAlign = 'left';
        break;
      }
    }
  };

  const handlePrint = async () => {
    renderToCanvas();
    await new Promise(r => setTimeout(r, 100));
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

  if (!selected) {
    return (
      <div className="p-4 pb-24 max-w-2xl mx-auto space-y-4">
        <h1 className="text-xl font-bold">Şablonlar</h1>
        <div className="grid gap-3">
          {templates.map(({ type, icon: Icon, label, desc }) => (
            <Card
              key={type}
              className="cursor-pointer hover:border-primary/40 hover:bg-accent/40 transition-all active:scale-[0.99]"
              onClick={() => setSelected(type)}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={reset}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold">{templates.find(t => t.type === selected)?.label}</h1>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <Label>Başlık</Label>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Başlık..." />
        </div>

        {(selected === 'todo' || selected === 'shopping') && (
          <div className="space-y-2">
            <Label>Maddeler</Label>
            {items.map((item, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={item}
                  onChange={e => {
                    const n = [...items];
                    n[i] = e.target.value;
                    setItems(n);
                  }}
                  placeholder={`Madde ${i + 1}`}
                />
                {items.length > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => setItems(items.filter((_, j) => j !== i))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" className="gap-1" onClick={() => setItems([...items, ''])}>
              <Plus className="h-3.5 w-3.5" /> Ekle
            </Button>
          </div>
        )}

        {selected === 'note' && (
          <div className="space-y-1">
            <Label>Not İçeriği</Label>
            <textarea
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={noteBody}
              onChange={e => setNoteBody(e.target.value)}
              placeholder="Notunuzu yazın..."
            />
          </div>
        )}

        {selected === 'label' && (
          <div className="space-y-1">
            <Label>Açıklama</Label>
            <Input value={labelDesc} onChange={e => setLabelDesc(e.target.value)} placeholder="Etiket açıklaması..." />
          </div>
        )}

        {selected === 'receipt' && (
          <div className="space-y-2">
            <Label>Kalemler</Label>
            {receiptItems.map((item, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={item.name}
                  onChange={e => {
                    const n = [...receiptItems];
                    n[i] = { ...n[i], name: e.target.value };
                    setReceiptItems(n);
                  }}
                  placeholder="Ürün adı"
                  className="flex-1"
                />
                <Input
                  value={item.price}
                  onChange={e => {
                    const n = [...receiptItems];
                    n[i] = { ...n[i], price: e.target.value };
                    setReceiptItems(n);
                  }}
                  placeholder="₺"
                  className="w-24"
                  type="number"
                />
                {receiptItems.length > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => setReceiptItems(receiptItems.filter((_, j) => j !== i))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" className="gap-1" onClick={() => setReceiptItems([...receiptItems, { name: '', price: '' }])}>
              <Plus className="h-3.5 w-3.5" /> Ekle
            </Button>
          </div>
        )}
      </div>

      {/* Hidden canvas for rendering */}
      <canvas ref={canvasRef} className="hidden" />

      <Button
        className="w-full gap-2"
        size="lg"
        disabled={!connected || printing}
        onClick={handlePrint}
      >
        {printing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
        {printing ? 'Yazdırılıyor...' : 'Önizle ve Bas'}
      </Button>

      {!connected && (
        <p className="text-xs text-center text-muted-foreground">Yazdırmak için önce yazıcıya bağlanın</p>
      )}
    </div>
  );
}
