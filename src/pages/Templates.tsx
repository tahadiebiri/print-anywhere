import { useState, useRef } from 'react';
import { ClipboardList, ShoppingCart, StickyNote, Tag, Receipt, Printer, Loader2, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { usePrinter } from '@/hooks/use-printer';
import { printCanvas } from '@/lib/printer';
import { toast } from 'sonner';

type TemplateType = 'todo' | 'shopping' | 'note' | 'label' | 'receipt' | null;

const templates = [
  { type: 'todo' as const, icon: ClipboardList, label: 'Yapılacaklar', desc: 'Onay kutuları ile görev listesi', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  { type: 'shopping' as const, icon: ShoppingCart, label: 'Alışveriş', desc: 'Fiyatlı alışveriş listesi', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  { type: 'note' as const, icon: StickyNote, label: 'Not Kağıdı', desc: 'Çizgili not kağıdı', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  { type: 'label' as const, icon: Tag, label: 'Etiket', desc: 'Dekoratif kenarlıklı etiket', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
  { type: 'receipt' as const, icon: Receipt, label: 'Mini Fiş', desc: 'Fiş formatında çıktı', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
];

export default function Templates() {
  const [selected, setSelected] = useState<TemplateType>(null);
  const [printing, setPrinting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { connected } = usePrinter();

  const [title, setTitle] = useState('');
  const [items, setItems] = useState<string[]>(['']);
  const [noteBody, setNoteBody] = useState('');
  const [labelDesc, setLabelDesc] = useState('');
  const [labelSubtext, setLabelSubtext] = useState('');
  const [receiptItems, setReceiptItems] = useState<{ name: string; price: string }[]>([{ name: '', price: '' }]);
  const [shopItems, setShopItems] = useState<{ name: string; qty: string }[]>([{ name: '', qty: '' }]);

  const reset = () => {
    setSelected(null);
    setTitle('');
    setItems(['']);
    setNoteBody('');
    setLabelDesc('');
    setLabelSubtext('');
    setReceiptItems([{ name: '', price: '' }]);
    setShopItems([{ name: '', qty: '' }]);
  };

  const renderToCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 384;
    const p = 16;

    const fillBg = (h: number) => {
      canvas.height = h;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    switch (selected) {
      case 'todo': {
        const validItems = items.filter(i => i);
        const lineH = 32;
        const h = 70 + validItems.length * lineH + 20;
        fillBg(h);
        ctx.fillStyle = 'black';
        // Header with underline
        ctx.font = 'bold 24px Inter, sans-serif';
        ctx.fillText('☑ ' + (title || 'Yapılacaklar'), p, 38);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(p, 48); ctx.lineTo(384 - p, 48); ctx.stroke();
        // Items with checkboxes
        ctx.font = '18px "JetBrains Mono", monospace';
        ctx.lineWidth = 1.5;
        validItems.forEach((item, i) => {
          const y = 75 + i * lineH;
          ctx.strokeRect(p, y - 13, 15, 15);
          ctx.fillText(item, p + 24, y);
        });
        break;
      }
      case 'shopping': {
        const validItems = shopItems.filter(i => i.name);
        const lineH = 28;
        const h = 70 + validItems.length * lineH + 20;
        fillBg(h);
        ctx.fillStyle = 'black';
        ctx.font = 'bold 22px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🛒 ' + (title || 'Alışveriş Listesi'), 192, 35);
        ctx.textAlign = 'left';
        // Dashed divider
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = 'black';
        ctx.beginPath(); ctx.moveTo(p, 48); ctx.lineTo(384 - p, 48); ctx.stroke();
        ctx.setLineDash([]);
        // Table-like items
        ctx.font = '16px "JetBrains Mono", monospace';
        validItems.forEach((item, i) => {
          const y = 72 + i * lineH;
          ctx.fillText(`○ ${item.name}`, p, y);
          if (item.qty) {
            ctx.textAlign = 'right';
            ctx.fillText(`x${item.qty}`, 384 - p, y);
            ctx.textAlign = 'left';
          }
        });
        break;
      }
      case 'note': {
        const h = 350;
        fillBg(h);
        ctx.fillStyle = 'black';
        // Decorative header
        ctx.font = 'bold 24px Inter, sans-serif';
        ctx.fillText('📝 ' + (title || 'Not'), p, 35);
        // Double line under header
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(p, 46); ctx.lineTo(384 - p, 46); ctx.stroke();
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(p, 50); ctx.lineTo(384 - p, 50); ctx.stroke();
        // Ruled lines with margin line
        ctx.strokeStyle = '#999';
        ctx.lineWidth = 0.5;
        for (let y = 75; y < h - 15; y += 26) {
          ctx.beginPath(); ctx.moveTo(p, y); ctx.lineTo(384 - p, y); ctx.stroke();
        }
        // Red margin line
        ctx.strokeStyle = '#cc4444';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(50, 55); ctx.lineTo(50, h - 10); ctx.stroke();
        // Note text
        if (noteBody) {
          ctx.fillStyle = 'black';
          ctx.font = '15px "JetBrains Mono", monospace';
          const words = noteBody.split(' ');
          let line = '';
          let y = 92;
          for (const word of words) {
            const test = line ? `${line} ${word}` : word;
            if (ctx.measureText(test).width > 384 - 60 - p) {
              ctx.fillText(line, 56, y);
              line = word;
              y += 26;
            } else {
              line = test;
            }
          }
          if (line) ctx.fillText(line, 56, y);
        }
        break;
      }
      case 'label': {
        const h = 160;
        fillBg(h);
        ctx.fillStyle = 'black';
        // Ornamental border
        ctx.lineWidth = 3;
        ctx.strokeRect(6, 6, 372, h - 12);
        ctx.lineWidth = 1;
        ctx.strokeRect(12, 12, 360, h - 24);
        // Decorative corners
        const corner = 20;
        [[12,12],[372-corner+12,12],[12,h-12-corner],[372-corner+12,h-12-corner]].forEach(([cx, cy]) => {
          ctx.fillRect(cx, cy, corner, 2);
          ctx.fillRect(cx, cy, 2, corner);
          ctx.fillRect(cx + corner - 2, cy, 2, corner);
          ctx.fillRect(cx, cy + corner - 2, corner, 2);
        });
        // Content
        ctx.font = 'bold 28px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(title || 'Etiket', 192, 60);
        ctx.font = '16px Inter, sans-serif';
        ctx.fillText(labelDesc || '', 192, 88);
        if (labelSubtext) {
          ctx.font = 'italic 13px Inter, sans-serif';
          ctx.fillText(labelSubtext, 192, 115);
        }
        // Divider decoration
        ctx.fillText('— ✦ —', 192, 140);
        ctx.textAlign = 'left';
        break;
      }
      case 'receipt': {
        const validItems = receiptItems.filter(i => i.name && i.price);
        const total = validItems.reduce((s, i) => s + (parseFloat(i.price) || 0), 0);
        const lineH = 26;
        const h = 160 + validItems.length * lineH + 40;
        fillBg(h);
        ctx.fillStyle = 'black';
        // Receipt header with dashed border
        ctx.setLineDash([2, 2]);
        ctx.strokeStyle = 'black';
        ctx.strokeRect(p, p, 384 - p * 2, h - p * 2);
        ctx.setLineDash([]);
        // Store name
        ctx.font = 'bold 26px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(title || 'FİŞ', 192, 50);
        ctx.font = '12px "JetBrains Mono", monospace';
        ctx.fillText(new Date().toLocaleString('tr-TR'), 192, 68);
        ctx.fillText('SılaPrint Terminal', 192, 82);
        // Divider
        ctx.font = '12px monospace';
        ctx.fillText('═'.repeat(32), 192, 98);
        // Items
        ctx.textAlign = 'left';
        ctx.font = '16px "JetBrains Mono", monospace';
        validItems.forEach((item, i) => {
          const y = 120 + i * lineH;
          ctx.fillText(item.name, p + 8, y);
          ctx.textAlign = 'right';
          ctx.fillText(`₺${parseFloat(item.price).toFixed(2)}`, 384 - p - 8, y);
          ctx.textAlign = 'left';
        });
        // Total
        const totalY = 120 + validItems.length * lineH + 10;
        ctx.textAlign = 'center';
        ctx.font = '12px monospace';
        ctx.fillText('─'.repeat(32), 192, totalY);
        ctx.font = 'bold 22px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`TOPLAM: ₺${total.toFixed(2)}`, 384 - p - 8, totalY + 28);
        ctx.textAlign = 'center';
        ctx.font = '12px "JetBrains Mono", monospace';
        ctx.fillText('Teşekkür ederiz!', 192, totalY + 52);
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
        <PageHeader title="Şablonlar" />
        <div className="grid gap-3">
          {templates.map(({ type, icon: Icon, label, desc, color }) => (
            <Card
              key={type}
              className="cursor-pointer hover:border-primary/40 hover:bg-accent/40 transition-all active:scale-[0.99]"
              onClick={() => setSelected(type)}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${color.split(' ')[0]}`}>
                  <Icon className={`h-5 w-5 ${color.split(' ').slice(1).join(' ')}`} />
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

        {selected === 'todo' && (
          <div className="space-y-2">
            <Label>Görevler</Label>
            {items.map((item, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={item}
                  onChange={e => { const n = [...items]; n[i] = e.target.value; setItems(n); }}
                  placeholder={`Görev ${i + 1}`}
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

        {selected === 'shopping' && (
          <div className="space-y-2">
            <Label>Ürünler</Label>
            {shopItems.map((item, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={item.name}
                  onChange={e => { const n = [...shopItems]; n[i] = { ...n[i], name: e.target.value }; setShopItems(n); }}
                  placeholder="Ürün adı"
                  className="flex-1"
                />
                <Input
                  value={item.qty}
                  onChange={e => { const n = [...shopItems]; n[i] = { ...n[i], qty: e.target.value }; setShopItems(n); }}
                  placeholder="Adet"
                  className="w-20"
                />
                {shopItems.length > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => setShopItems(shopItems.filter((_, j) => j !== i))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" className="gap-1" onClick={() => setShopItems([...shopItems, { name: '', qty: '' }])}>
              <Plus className="h-3.5 w-3.5" /> Ekle
            </Button>
          </div>
        )}

        {selected === 'note' && (
          <div className="space-y-1">
            <Label>Not İçeriği</Label>
            <Textarea
              value={noteBody}
              onChange={e => setNoteBody(e.target.value)}
              placeholder="Notunuzu yazın..."
              rows={5}
            />
          </div>
        )}

        {selected === 'label' && (
          <>
            <div className="space-y-1">
              <Label>Açıklama</Label>
              <Input value={labelDesc} onChange={e => setLabelDesc(e.target.value)} placeholder="Etiket açıklaması..." />
            </div>
            <div className="space-y-1">
              <Label>Alt Metin (isteğe bağlı)</Label>
              <Input value={labelSubtext} onChange={e => setLabelSubtext(e.target.value)} placeholder="Ek bilgi..." />
            </div>
          </>
        )}

        {selected === 'receipt' && (
          <div className="space-y-2">
            <Label>Kalemler</Label>
            {receiptItems.map((item, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={item.name}
                  onChange={e => { const n = [...receiptItems]; n[i] = { ...n[i], name: e.target.value }; setReceiptItems(n); }}
                  placeholder="Ürün adı"
                  className="flex-1"
                />
                <Input
                  value={item.price}
                  onChange={e => { const n = [...receiptItems]; n[i] = { ...n[i], price: e.target.value }; setReceiptItems(n); }}
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
