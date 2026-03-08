import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Save, GripVertical, Eye, EyeOff, ChevronDown, ChevronUp, Upload, Paintbrush, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  categories,
  type TemplateDefinition,
  type TemplateCategory,
  type TemplateField,
} from '@/lib/template-data';
import { renderTemplate } from '@/lib/template-renderer';
import { borderStyles, dividerStyles, svgIcons } from '@/lib/svg-assets';
const RENDERER_KEYS = [
  'todo', 'shopping', 'checklist', 'note', 'receipt',
  'frame_heart', 'frame_star', 'frame_cute',
  'sticker_name', 'banner_birthday', 'banner_custom', 'banner_congrats',
  'vocab_card', 'formula_card', 'info_card',
  'weekly_plan', 'daily_plan', 'habit_tracker',
  'product_label', 'price_tag', 'address_label',
];

const FIELD_TYPES = ['text', 'textarea', 'list', 'pricelist', 'number', 'select'] as const;

interface TemplateEditorProps {
  template: TemplateDefinition;
  onUpdate: (partial: Partial<TemplateDefinition>) => void;
  onSave: () => void;
  onDelete: () => void;
  onBack: () => void;
}

export function TemplateEditor({ template, onUpdate, onSave, onDelete, onBack }: TemplateEditorProps) {
  const [previewData, setPreviewData] = useState<Record<string, any>>({});
  const [showPreview, setShowPreview] = useState(true);
  const [fieldsExpanded, setFieldsExpanded] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Render preview
  useEffect(() => {
    if (!canvasRef.current || !showPreview) return;
    const timer = setTimeout(() => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      renderTemplate(ctx, canvas, template.render, previewData, {
        border: template.border,
        divider: template.divider,
        customSvg: template.customSvg,
      });
    }, 150);
    return () => clearTimeout(timer);
  }, [template, previewData, showPreview]);

  const addField = () => {
    const newField: TemplateField = {
      key: `field_${Date.now()}`,
      label: 'Yeni Alan',
      type: 'text',
      placeholder: '',
      defaultValue: '',
    };
    onUpdate({ fields: [...template.fields, newField] });
  };

  const updateField = (fieldIdx: number, partial: Partial<TemplateField>) => {
    const fields = [...template.fields];
    fields[fieldIdx] = { ...fields[fieldIdx], ...partial };
    onUpdate({ fields });
  };

  const removeField = (fieldIdx: number) => {
    onUpdate({ fields: template.fields.filter((_, i) => i !== fieldIdx) });
  };

  const handleSaveAndBack = () => {
    onSave();
    onBack();
  };

  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={handleSaveAndBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold truncate flex items-center gap-2">
            <span className="text-xl">{template.icon}</span>
            {template.name || 'Yeni Şablon'}
          </h1>
          <p className="text-xs text-muted-foreground">Şablonu düzenleyin</p>
        </div>
        {!confirmDelete ? (
          <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <div className="flex gap-1.5">
            <Button variant="destructive" size="sm" onClick={onDelete}>Sil</Button>
            <Button variant="outline" size="sm" onClick={() => setConfirmDelete(false)}>İptal</Button>
          </div>
        )}
      </div>

      {/* Basic info section */}
      <Card>
        <div className="px-4 py-2.5 border-b border-border/50 bg-muted/30">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Temel Bilgiler</Label>
        </div>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-[80px_1fr] gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">İkon</Label>
              <Input
                value={template.icon}
                onChange={e => onUpdate({ icon: e.target.value })}
                className="text-center text-xl h-12"
                maxLength={4}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Şablon Adı</Label>
              <Input
                value={template.name}
                onChange={e => onUpdate({ name: e.target.value })}
                placeholder="Şablon adını girin..."
                className="h-12 text-base font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Açıklama</Label>
            <Input
              value={template.description}
              onChange={e => onUpdate({ description: e.target.value })}
              placeholder="Bu şablon ne işe yarar?"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Kategori</Label>
              <Select value={template.category} onValueChange={v => onUpdate({ category: v as TemplateCategory })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.key} value={c.key}>{c.icon} {c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Renderer</Label>
              <Select value={template.render} onValueChange={v => onUpdate({ render: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {RENDERER_KEYS.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Decorations section */}
      <Card>
        <div className="px-4 py-2.5 border-b border-border/50 bg-muted/30">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Paintbrush className="h-3.5 w-3.5" /> Dekorasyon & SVG
          </Label>
        </div>
        <CardContent className="p-4 space-y-4">
          {/* Icon type */}
          <div className="space-y-1.5">
            <Label className="text-xs">İkon Tipi</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={!template.icon.startsWith('svg:') ? 'default' : 'outline'}
                size="sm"
                className="text-xs"
                onClick={() => onUpdate({ icon: '📄' })}
              >
                😀 Emoji
              </Button>
              <Button
                variant={template.icon.startsWith('svg:') ? 'default' : 'outline'}
                size="sm"
                className="text-xs"
                onClick={() => onUpdate({ icon: 'svg:note' })}
              >
                <ImageIcon className="h-3.5 w-3.5 mr-1" /> Vektörel
              </Button>
            </div>
            {template.icon.startsWith('svg:') && (
              <div className="grid grid-cols-4 gap-1.5 mt-2">
                {Object.entries(svgIcons).map(([key, icon]) => (
                  <button
                    key={key}
                    className={`p-2 rounded-md border text-center text-[10px] transition-all ${
                      template.icon === `svg:${key}`
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/40'
                    }`}
                    onClick={() => onUpdate({ icon: `svg:${key}` })}
                  >
                    <svg viewBox={icon.viewBox} className="w-5 h-5 mx-auto mb-0.5 fill-current">
                      <path d={icon.path} />
                    </svg>
                    {icon.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Border style */}
          <div className="space-y-1.5">
            <Label className="text-xs">Çerçeve Stili</Label>
            <div className="grid grid-cols-3 gap-1.5">
              {borderStyles.map(b => (
                <button
                  key={b.id}
                  className={`p-2 rounded-md border text-[10px] text-center transition-all ${
                    (template.border || 'none') === b.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/40'
                  }`}
                  onClick={() => onUpdate({ border: b.id })}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Divider style */}
          <div className="space-y-1.5">
            <Label className="text-xs">Ayırıcı Stili</Label>
            <Select value={template.divider || 'line'} onValueChange={v => onUpdate({ divider: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {dividerStyles.map(d => <SelectItem key={d.id} value={d.id}>{d.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Custom SVG upload */}
          <div className="space-y-1.5">
            <Label className="text-xs">Özel SVG Yükle</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 flex-1"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.svg,image/svg+xml';
                  input.onchange = async (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (!file) return;
                    if (file.size > 100 * 1024) {
                      toast.error('SVG 100KB\'dan küçük olmalı');
                      return;
                    }
                    const text = await file.text();
                    if (!text.includes('<svg')) {
                      toast.error('Geçerli bir SVG dosyası değil');
                      return;
                    }
                    const dataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(text)))}`;
                    onUpdate({ customSvg: dataUrl });
                    toast.success('SVG yüklendi');
                  };
                  input.click();
                }}
              >
                <Upload className="h-3.5 w-3.5" /> SVG Dosyası Seç
              </Button>
              {template.customSvg && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive"
                  onClick={() => onUpdate({ customSvg: undefined })}
                >
                  Kaldır
                </Button>
              )}
            </div>
            {template.customSvg && (
              <div className="flex justify-center p-3 bg-muted/30 rounded-lg border border-dashed border-border">
                <img src={template.customSvg} alt="Custom SVG" className="h-16 w-auto" style={{ filter: 'grayscale(1)' }} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <Card>
        <div
          className="px-4 py-2.5 border-b border-border/50 bg-muted/30 flex items-center justify-between cursor-pointer"
          onClick={() => setFieldsExpanded(!fieldsExpanded)}
        >
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer">
            Form Alanları ({template.fields.length})
          </Label>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={e => { e.stopPropagation(); addField(); }}
            >
              <Plus className="h-3 w-3" /> Ekle
            </Button>
            {fieldsExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </div>
        </div>

        {fieldsExpanded && (
          <CardContent className="p-3 space-y-2">
            {template.fields.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <p className="text-sm">Henüz alan yok</p>
                <p className="text-xs mt-1">Yukarıdaki "Ekle" butonuyla alan ekleyin</p>
              </div>
            )}
            {template.fields.map((field, fi) => (
              <Card key={fi} className="bg-muted/20 border-border/50">
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground/50 mt-2.5 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          value={field.label}
                          onChange={e => updateField(fi, { label: e.target.value })}
                          placeholder="Alan adı"
                          className="flex-1 h-8 text-xs font-medium"
                        />
                        <Select value={field.type} onValueChange={v => updateField(fi, { type: v as any })}>
                          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {FIELD_TYPES.map(t => (
                              <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeField(fi)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={field.key}
                          onChange={e => updateField(fi, { key: e.target.value })}
                          placeholder="key"
                          className="h-7 text-[11px] font-mono text-muted-foreground"
                        />
                        <Input
                          value={field.placeholder || ''}
                          onChange={e => updateField(fi, { placeholder: e.target.value })}
                          placeholder="Placeholder"
                          className="h-7 text-[11px]"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        )}
      </Card>

      {/* Preview section */}
      <Card>
        <div className="px-4 py-2.5 border-b border-border/50 bg-muted/30 flex items-center justify-between">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Canlı Önizleme
          </Label>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Göster</Label>
            <Switch checked={showPreview} onCheckedChange={setShowPreview} />
          </div>
        </div>

        {showPreview && (
          <CardContent className="p-4 space-y-3">
            {template.fields.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {template.fields.map(f => (
                  <Input
                    key={f.key}
                    value={previewData[f.key] || ''}
                    onChange={e => setPreviewData(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.label}
                    className="text-xs h-8"
                  />
                ))}
              </div>
            )}
            <div className="flex justify-center">
              <div className="border-2 border-dashed border-border rounded-lg p-2 bg-muted/30 inline-block">
                <canvas
                  ref={canvasRef}
                  style={{ width: '100%', maxWidth: '384px', imageRendering: 'pixelated' }}
                  className="block"
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Save button */}
      <Button className="w-full gap-2 h-12 text-base" onClick={handleSaveAndBack}>
        <Save className="h-5 w-5" /> Kaydet ve Geri Dön
      </Button>
    </div>
  );
}
