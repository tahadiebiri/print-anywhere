import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Download, Upload, Eye, Code, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  categories,
  builtInTemplates,
  getCustomTemplates,
  saveCustomTemplates,
  type TemplateDefinition,
  type TemplateCategory,
  type TemplateField,
} from '@/lib/template-data';
import { renderTemplate } from '@/lib/template-renderer';
import { useNavigate } from 'react-router-dom';

const ADMIN_PASS = 'silaprint2026';

export default function AdminTemplates() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const [customTemplates, setCustomTemplates] = useState<TemplateDefinition[]>([]);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [previewData, setPreviewData] = useState<Record<string, any>>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setCustomTemplates(getCustomTemplates());
  }, []);

  const handleLogin = () => {
    if (password === ADMIN_PASS) {
      setAuthenticated(true);
      toast.success('Admin paneli açıldı');
    } else {
      toast.error('Yanlış şifre');
    }
  };

  const saveAll = (templates: TemplateDefinition[]) => {
    setCustomTemplates(templates);
    saveCustomTemplates(templates);
    toast.success('Kaydedildi');
  };

  const addNew = () => {
    const newTmpl: TemplateDefinition = {
      id: `custom_${Date.now()}`,
      category: 'list',
      name: 'Yeni Şablon',
      description: 'Açıklama ekleyin',
      icon: '📄',
      fields: [{ key: 'title', label: 'Başlık', type: 'text', placeholder: 'Başlık', defaultValue: '' }],
      render: 'todo', // default renderer
    };
    const updated = [...customTemplates, newTmpl];
    saveAll(updated);
    setEditingIdx(updated.length - 1);
  };

  const deleteTemplate = (idx: number) => {
    const updated = customTemplates.filter((_, i) => i !== idx);
    saveAll(updated);
    setEditingIdx(null);
  };

  const updateTemplate = (idx: number, partial: Partial<TemplateDefinition>) => {
    const updated = [...customTemplates];
    updated[idx] = { ...updated[idx], ...partial };
    setCustomTemplates(updated);
  };

  const addField = (idx: number) => {
    const tmpl = customTemplates[idx];
    const newField: TemplateField = {
      key: `field_${Date.now()}`,
      label: 'Yeni Alan',
      type: 'text',
      placeholder: '',
      defaultValue: '',
    };
    updateTemplate(idx, { fields: [...tmpl.fields, newField] });
  };

  const updateField = (tmplIdx: number, fieldIdx: number, partial: Partial<TemplateField>) => {
    const tmpl = customTemplates[tmplIdx];
    const fields = [...tmpl.fields];
    fields[fieldIdx] = { ...fields[fieldIdx], ...partial };
    updateTemplate(tmplIdx, { fields });
  };

  const removeField = (tmplIdx: number, fieldIdx: number) => {
    const tmpl = customTemplates[tmplIdx];
    updateTemplate(tmplIdx, { fields: tmpl.fields.filter((_, i) => i !== fieldIdx) });
  };

  const exportAll = () => {
    const data = JSON.stringify(customTemplates, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'silaprint-templates.json'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Dışa aktarıldı');
  };

  const importTemplates = () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          saveAll([...customTemplates, ...parsed]);
          toast.success(`${parsed.length} şablon içe aktarıldı`);
        } else {
          toast.error('Geçersiz format');
        }
      } catch { toast.error('JSON parse hatası'); }
    };
    input.click();
  };

  const handleJsonSave = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (Array.isArray(parsed)) {
        saveAll(parsed);
        setJsonMode(false);
      } else {
        toast.error('JSON bir dizi olmalı');
      }
    } catch { toast.error('Geçersiz JSON'); }
  };

  // Preview renderer
  useEffect(() => {
    if (editingIdx === null || !canvasRef.current) return;
    const tmpl = customTemplates[editingIdx];
    if (!tmpl) return;
    const timer = setTimeout(() => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      renderTemplate(ctx, canvas, tmpl.render, previewData);
    }, 150);
    return () => clearTimeout(timer);
  }, [editingIdx, customTemplates, previewData]);

  if (!authenticated) {
    return (
      <div className="p-4 pb-24 max-w-md mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">🔧 Admin Paneli</h1>
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="text-center space-y-2">
              <p className="text-4xl">🔐</p>
              <p className="font-semibold">Şablon Yönetimi</p>
              <p className="text-sm text-muted-foreground">Devam etmek için admin şifresini girin</p>
            </div>
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Şifre..."
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
            <Button className="w-full" onClick={handleLogin}>Giriş</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Editing a template
  if (editingIdx !== null && customTemplates[editingIdx]) {
    const tmpl = customTemplates[editingIdx];
    const rendererKeys = ['todo', 'shopping', 'checklist', 'note', 'receipt', 'frame_heart', 'frame_star', 'frame_cute', 'sticker_name', 'banner_birthday', 'banner_custom', 'banner_congrats', 'vocab_card', 'formula_card', 'info_card', 'weekly_plan', 'daily_plan', 'habit_tracker', 'product_label', 'price_tag', 'address_label'];

    return (
      <div className="p-4 pb-24 max-w-2xl mx-auto space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => { saveAll(customTemplates); setEditingIdx(null); }}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-bold">Şablon Düzenle</h1>
          <div className="flex-1" />
          <Button variant="destructive" size="sm" className="gap-1" onClick={() => deleteTemplate(editingIdx)}>
            <Trash2 className="h-3.5 w-3.5" /> Sil
          </Button>
        </div>

        {/* Basic info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">İkon (Emoji)</Label>
            <Input value={tmpl.icon} onChange={e => updateTemplate(editingIdx, { icon: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Kategori</Label>
            <Select value={tmpl.category} onValueChange={v => updateTemplate(editingIdx, { category: v as TemplateCategory })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c.key} value={c.key}>{c.icon} {c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">İsim</Label>
          <Input value={tmpl.name} onChange={e => updateTemplate(editingIdx, { name: e.target.value })} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Açıklama</Label>
          <Input value={tmpl.description} onChange={e => updateTemplate(editingIdx, { description: e.target.value })} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Renderer</Label>
          <Select value={tmpl.render} onValueChange={v => updateTemplate(editingIdx, { render: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {rendererKeys.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Fields editor */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Alanlar</Label>
            <Button variant="outline" size="sm" className="gap-1" onClick={() => addField(editingIdx)}>
              <Plus className="h-3.5 w-3.5" /> Alan Ekle
            </Button>
          </div>
          {tmpl.fields.map((field, fi) => (
            <Card key={fi} className="bg-muted/30">
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Input value={field.key} onChange={e => updateField(editingIdx, fi, { key: e.target.value })} placeholder="key" className="w-28 text-xs" />
                  <Input value={field.label} onChange={e => updateField(editingIdx, fi, { label: e.target.value })} placeholder="Label" className="flex-1 text-xs" />
                  <Select value={field.type} onValueChange={v => updateField(editingIdx, fi, { type: v as any })}>
                    <SelectTrigger className="w-24 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['text', 'textarea', 'list', 'pricelist', 'number', 'select'].map(t => (
                        <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeField(editingIdx, fi)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <Input value={field.placeholder || ''} onChange={e => updateField(editingIdx, fi, { placeholder: e.target.value })} placeholder="Placeholder" className="text-xs" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Önizleme (test verileri girin)</Label>
          <div className="grid grid-cols-2 gap-2">
            {tmpl.fields.map(f => (
              <Input
                key={f.key}
                value={previewData[f.key] || ''}
                onChange={e => setPreviewData(prev => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.label}
                className="text-xs"
              />
            ))}
          </div>
          <div className="flex justify-center">
            <div className="border-2 border-dashed border-border rounded-lg p-2 bg-muted/30 inline-block">
              <canvas ref={canvasRef} style={{ width: '100%', maxWidth: '384px', imageRendering: 'pixelated' }} className="block" />
            </div>
          </div>
        </div>

        <Button className="w-full gap-2" onClick={() => { saveAll(customTemplates); setEditingIdx(null); }}>
          <Save className="h-4 w-4" /> Kaydet ve Geri Dön
        </Button>
      </div>
    );
  }

  // Template list
  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold">🔧 Şablon Yönetimi</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{builtInTemplates.length}</p>
            <p className="text-xs text-muted-foreground">Yerleşik Şablon</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{customTemplates.length}</p>
            <p className="text-xs text-muted-foreground">Özel Şablon</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" className="gap-2" onClick={addNew}>
          <Plus className="h-4 w-4" /> Yeni Şablon
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => { setJsonMode(true); setJsonText(JSON.stringify(customTemplates, null, 2)); }}>
          <Code className="h-4 w-4" /> JSON Düzenle
        </Button>
        <Button variant="outline" className="gap-2" onClick={exportAll}>
          <Download className="h-4 w-4" /> Dışa Aktar
        </Button>
        <Button variant="outline" className="gap-2" onClick={importTemplates}>
          <Upload className="h-4 w-4" /> İçe Aktar
        </Button>
      </div>

      {/* JSON editor modal */}
      {jsonMode && (
        <Card className="border-primary/30">
          <CardContent className="p-4 space-y-3">
            <Label className="text-sm font-semibold">JSON Düzenleyici</Label>
            <Textarea
              value={jsonText}
              onChange={e => setJsonText(e.target.value)}
              rows={12}
              className="font-mono text-xs"
            />
            <div className="flex gap-2">
              <Button className="flex-1 gap-1" onClick={handleJsonSave}>
                <Save className="h-4 w-4" /> Kaydet
              </Button>
              <Button variant="outline" onClick={() => setJsonMode(false)}>İptal</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custom templates list */}
      {customTemplates.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Özel Şablonlar</Label>
          {customTemplates.map((tmpl, i) => (
            <Card key={tmpl.id} className="cursor-pointer hover:border-primary/40 transition-all" onClick={() => setEditingIdx(i)}>
              <CardContent className="flex items-center gap-3 p-3">
                <span className="text-2xl">{tmpl.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{tmpl.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{tmpl.description}</p>
                </div>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  {categories.find(c => c.key === tmpl.category)?.label || tmpl.category}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {customTemplates.length === 0 && !jsonMode && (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-4xl mb-2">📦</p>
          <p className="text-sm">Henüz özel şablon yok</p>
          <p className="text-xs mt-1">Yeni ekleyin veya JSON dosyası içe aktarın</p>
        </div>
      )}

      {/* Built-in templates reference */}
      <Card className="bg-muted/30">
        <CardContent className="p-4 space-y-2">
          <Label className="text-sm font-semibold">Yerleşik Şablonlar (salt okunur)</Label>
          <div className="grid grid-cols-2 gap-1">
            {builtInTemplates.map(t => (
              <div key={t.id} className="text-xs text-muted-foreground py-1">
                {t.icon} {t.name}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
