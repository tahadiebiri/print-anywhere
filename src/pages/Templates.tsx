import { useState, useRef, useEffect } from 'react';
import { Printer, Loader2, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { TemplateIcon } from '@/components/TemplateIcon';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePrinter } from '@/hooks/use-printer';
import { printCanvas } from '@/lib/printer';
import { toast } from 'sonner';
import {
  categories,
  getAllTemplates,
  type TemplateCategory,
  type TemplateDefinition,
} from '@/lib/template-data';
import { renderTemplate } from '@/lib/template-renderer';

export default function Templates() {
  const [selectedCat, setSelectedCat] = useState<TemplateCategory | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDefinition | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [printing, setPrinting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { connected } = usePrinter();

  const allTemplates = getAllTemplates();

  const initForm = (tmpl: TemplateDefinition) => {
    const data: Record<string, any> = {};
    tmpl.fields.forEach(f => {
      data[f.key] = f.defaultValue ?? '';
    });
    setFormData(data);
    setSelectedTemplate(tmpl);
  };

  const updateField = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // Render preview
  useEffect(() => {
    if (!selectedTemplate || !canvasRef.current) return;
    const timer = setTimeout(() => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      renderTemplate(ctx, canvas, selectedTemplate.render, formData, {
        border: selectedTemplate.border,
        divider: selectedTemplate.divider,
        customSvg: selectedTemplate.customSvg,
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [selectedTemplate, formData]);

  const handlePrint = async () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    renderTemplate(ctx, canvas, selectedTemplate!.render, formData, {
      border: selectedTemplate!.border,
      divider: selectedTemplate!.divider,
      customSvg: selectedTemplate!.customSvg,
    });
    await new Promise(r => setTimeout(r, 100));
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

  // ── Category selection ──
  if (!selectedCat) {
    return (
      <div className="p-4 pb-24 max-w-2xl mx-auto space-y-4">
        <PageHeader title="Şablonlar" />
        <div className="grid gap-3">
          {categories.map(cat => {
            const count = allTemplates.filter(t => t.category === cat.key).length;
            return (
              <Card
                key={cat.key}
                className="cursor-pointer hover:border-primary/40 hover:bg-accent/40 transition-all active:scale-[0.99]"
                onClick={() => setSelectedCat(cat.key)}
              >
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-2xl">
                    {cat.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{cat.label}</p>
                    <p className="text-xs text-muted-foreground">{cat.desc}</p>
                  </div>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">{count}</span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Template selection within category ──
  if (!selectedTemplate) {
    const catTemplates = allTemplates.filter(t => t.category === selectedCat);
    const catInfo = categories.find(c => c.key === selectedCat)!;
    return (
      <div className="p-4 pb-24 max-w-2xl mx-auto space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setSelectedCat(null)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">{catInfo.icon} {catInfo.label}</h1>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {catTemplates.map(tmpl => (
            <Card
              key={tmpl.id}
              className="cursor-pointer hover:border-primary/40 hover:bg-accent/40 transition-all active:scale-[0.99]"
              onClick={() => initForm(tmpl)}
            >
              <CardContent className="p-4 text-center space-y-2">
                <TemplateIcon icon={tmpl.icon} size="lg" />
                <p className="font-semibold text-sm">{tmpl.name}</p>
                <p className="text-xs text-muted-foreground">{tmpl.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // ── Template editor ──
  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => setSelectedTemplate(null)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <TemplateIcon icon={selectedTemplate.icon} size="md" />
        <h1 className="text-xl font-bold">{selectedTemplate.name}</h1>
      </div>

      {/* Dynamic form */}
      <div className="space-y-3">
        {selectedTemplate.fields.map(field => (
          <div key={field.key} className="space-y-1">
            <Label className="text-sm">{field.label}</Label>
            {field.type === 'text' && (
              <Input
                value={formData[field.key] || ''}
                onChange={e => updateField(field.key, e.target.value)}
                placeholder={field.placeholder}
              />
            )}
            {field.type === 'number' && (
              <Input
                type="number"
                value={formData[field.key] || ''}
                onChange={e => updateField(field.key, parseInt(e.target.value) || 0)}
                placeholder={field.placeholder}
              />
            )}
            {field.type === 'textarea' && (
              <Textarea
                value={formData[field.key] || ''}
                onChange={e => updateField(field.key, e.target.value)}
                placeholder={field.placeholder}
                rows={4}
              />
            )}
            {field.type === 'select' && (
              <Select value={formData[field.key] || ''} onValueChange={v => updateField(field.key, v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {field.options?.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {field.type === 'list' && (
              <div className="space-y-2">
                {(formData[field.key] || ['']).map((item: string, i: number) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={e => {
                        const arr = [...(formData[field.key] || [''])];
                        arr[i] = e.target.value;
                        updateField(field.key, arr);
                      }}
                      placeholder={`${field.placeholder} ${i + 1}`}
                    />
                    {(formData[field.key] || []).length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => {
                        updateField(field.key, (formData[field.key] || []).filter((_: any, j: number) => j !== i));
                      }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" size="sm" className="gap-1" onClick={() => {
                  updateField(field.key, [...(formData[field.key] || ['']), '']);
                }}>
                  <Plus className="h-3.5 w-3.5" /> Ekle
                </Button>
              </div>
            )}
            {field.type === 'pricelist' && (
              <div className="space-y-2">
                {(formData[field.key] || [{ name: '', qty: '', price: '' }]).map((item: any, i: number) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={item.name || ''}
                      onChange={e => {
                        const arr = [...(formData[field.key] || [])];
                        arr[i] = { ...arr[i], name: e.target.value };
                        updateField(field.key, arr);
                      }}
                      placeholder={field.placeholder}
                      className="flex-1"
                    />
                    <Input
                      value={item.qty || item.price || ''}
                      onChange={e => {
                        const arr = [...(formData[field.key] || [])];
                        arr[i] = { ...arr[i], qty: e.target.value, price: e.target.value };
                        updateField(field.key, arr);
                      }}
                      placeholder="Adet/₺"
                      className="w-24"
                    />
                    {(formData[field.key] || []).length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => {
                        updateField(field.key, (formData[field.key] || []).filter((_: any, j: number) => j !== i));
                      }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" size="sm" className="gap-1" onClick={() => {
                  updateField(field.key, [...(formData[field.key] || []), { name: '', qty: '', price: '' }]);
                }}>
                  <Plus className="h-3.5 w-3.5" /> Ekle
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Live Preview */}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Önizleme</Label>
        <div className="flex justify-center">
          <div className="border-2 border-dashed border-border rounded-lg p-2 bg-muted/30 inline-block">
            <canvas
              ref={canvasRef}
              style={{ width: '100%', maxWidth: '384px', imageRendering: 'pixelated' }}
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

      {!connected && (
        <p className="text-xs text-center text-muted-foreground">Yazdırmak için önce yazıcıya bağlanın</p>
      )}
    </div>
  );
}
