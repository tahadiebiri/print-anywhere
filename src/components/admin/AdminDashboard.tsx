import { ArrowLeft, Plus, Code, Download, Upload, Settings, Layers, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  categories,
  builtInTemplates,
  type TemplateDefinition,
} from '@/lib/template-data';
import { Save } from 'lucide-react';

interface AdminDashboardProps {
  customTemplates: TemplateDefinition[];
  onSaveAll: (templates: TemplateDefinition[]) => void;
  onAddNew: () => void;
  onEditTemplate: (idx: number) => void;
  onLogout?: () => void;
}

export function AdminDashboard({ customTemplates, onSaveAll, onAddNew, onEditTemplate, onLogout }: AdminDashboardProps) {
  const navigate = useNavigate();
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonText, setJsonText] = useState('');

  const totalTemplates = builtInTemplates.length + customTemplates.length;

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
          onSaveAll([...customTemplates, ...parsed]);
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
        onSaveAll(parsed);
        setJsonMode(false);
        toast.success('JSON kaydedildi');
      } else {
        toast.error('JSON bir dizi olmalı');
      }
    } catch { toast.error('Geçersiz JSON'); }
  };

  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Şablon Yönetimi
          </h1>
          <p className="text-xs text-muted-foreground">Şablonları oluşturun, düzenleyin ve yönetin</p>
        </div>
        {onLogout && (
          <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive" onClick={onLogout}>
            <LogOut className="h-3.5 w-3.5" /> Çıkış
          </Button>
        )}
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{totalTemplates}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Toplam</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{builtInTemplates.length}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Yerleşik</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{customTemplates.length}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Özel</p>
          </CardContent>
        </Card>
      </div>

      {/* Primary action */}
      <Button className="w-full gap-2 h-12 text-base" onClick={onAddNew}>
        <Plus className="h-5 w-5" /> Yeni Şablon Oluştur
      </Button>

      {/* Secondary actions */}
      <div className="grid grid-cols-3 gap-2">
        <Button variant="outline" size="sm" className="gap-1.5 h-10" onClick={() => { setJsonMode(!jsonMode); setJsonText(JSON.stringify(customTemplates, null, 2)); }}>
          <Code className="h-3.5 w-3.5" /> JSON
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 h-10" onClick={exportAll}>
          <Download className="h-3.5 w-3.5" /> Dışa Aktar
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 h-10" onClick={importTemplates}>
          <Upload className="h-3.5 w-3.5" /> İçe Aktar
        </Button>
      </div>

      {/* JSON editor */}
      {jsonMode && (
        <Card className="border-primary/30 overflow-hidden">
          <div className="bg-primary/5 px-4 py-2.5 border-b border-primary/10">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Code className="h-4 w-4" /> JSON Düzenleyici
            </Label>
          </div>
          <CardContent className="p-4 space-y-3">
            <Textarea
              value={jsonText}
              onChange={e => setJsonText(e.target.value)}
              rows={14}
              className="font-mono text-xs leading-relaxed"
            />
            <div className="flex gap-2">
              <Button className="flex-1 gap-1.5" onClick={handleJsonSave}>
                <Save className="h-4 w-4" /> Kaydet
              </Button>
              <Button variant="outline" onClick={() => setJsonMode(false)}>İptal</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custom templates list */}
      {customTemplates.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-semibold">Özel Şablonlar</Label>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full ml-auto">
              {customTemplates.length} adet
            </span>
          </div>
          {customTemplates.map((tmpl, i) => (
            <Card
              key={tmpl.id}
              className="cursor-pointer hover:border-primary/40 hover:bg-accent/30 transition-all active:scale-[0.99] group"
              onClick={() => onEditTemplate(i)}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl shrink-0 group-hover:bg-primary/20 transition-colors">
                  {tmpl.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{tmpl.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{tmpl.description}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {categories.find(c => c.key === tmpl.category)?.label || tmpl.category}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {tmpl.fields.length} alan
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {customTemplates.length === 0 && !jsonMode && (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-2xl mb-3">
              📦
            </div>
            <p className="font-medium text-sm">Henüz özel şablon yok</p>
            <p className="text-xs text-muted-foreground mt-1">Yukarıdaki butonu kullanarak yeni bir şablon oluşturun</p>
          </CardContent>
        </Card>
      )}

      {/* Built-in templates reference */}
      <Card className="bg-muted/20">
        <div className="px-4 py-2.5 border-b border-border/50">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            Yerleşik Şablonlar
            <span className="text-xs text-muted-foreground font-normal">(salt okunur)</span>
          </Label>
        </div>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {builtInTemplates.map(t => (
              <div key={t.id} className="text-xs text-muted-foreground py-0.5 flex items-center gap-1.5">
                <span>{t.icon}</span>
                <span className="truncate">{t.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
