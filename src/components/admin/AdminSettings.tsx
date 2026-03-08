import { useState, useRef } from 'react';
import { ArrowLeft, Save, RotateCcw, Palette, Type, Shield, Smartphone, ImageIcon, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useLanguage } from '@/hooks/use-language';
import {
  getAppSettings,
  saveAppSettings,
  getDefaultSettings,
  applyThemeColors,
  type AppSettings,
} from '@/lib/app-settings';

interface AdminSettingsProps {
  onBack: () => void;
}

export function AdminSettings({ onBack }: AdminSettingsProps) {
  const [settings, setSettings] = useState<AppSettings>(getAppSettings);
  const [logoPreview, setLogoPreview] = useState(settings.logoUrl);
  const fileRef = useRef<HTMLInputElement>(null);
  const { lang, setLang, t } = useLanguage();

  const presetColors = [
    { label: t('colorPurple'), value: '262 83% 58%' },
    { label: t('colorBlue'), value: '221 83% 53%' },
    { label: t('colorGreen'), value: '142 71% 45%' },
    { label: t('colorRed'), value: '0 84% 60%' },
    { label: t('colorOrange'), value: '25 95% 53%' },
    { label: t('colorPink'), value: '330 81% 60%' },
    { label: t('colorCyan'), value: '187 85% 43%' },
    { label: t('colorGold'), value: '45 93% 47%' },
  ];

  const update = (partial: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 512 * 1024) {
      toast.error(t('logoTooLarge'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setLogoPreview(dataUrl);
      update({ logoUrl: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoPreview('');
    update({ logoUrl: '' });
  };

  const handleSave = () => {
    const saved = saveAppSettings(settings);
    applyThemeColors(saved);
    toast.success(t('settingsSaved'));
  };

  const handleReset = () => {
    const defaults = getDefaultSettings();
    setSettings(defaults);
    setLogoPreview(defaults.logoUrl);
    saveAppSettings(defaults);
    applyThemeColors(defaults);
    toast.success(t('resetToDefaults'));
  };

  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{t('systemSettingsTitle')}</h1>
          <p className="text-xs text-muted-foreground">{t('systemSettingsDesc')}</p>
        </div>
      </div>

      {/* Language */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Globe className="h-4 w-4 text-primary" />
            {t('language')}
          </div>
          <Separator />
          <div className="space-y-2">
            <Label className="text-xs">{t('languageDesc')}</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setLang('tr')}
                className={`h-10 rounded-lg border-2 transition-all flex items-center justify-center text-sm font-medium gap-2 ${
                  lang === 'tr' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'
                }`}
              >
                🇹🇷 {t('turkish')}
              </button>
              <button
                onClick={() => setLang('en')}
                className={`h-10 rounded-lg border-2 transition-all flex items-center justify-center text-sm font-medium gap-2 ${
                  lang === 'en' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'
                }`}
              >
                🇬🇧 {t('english')}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* App Identity */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Type className="h-4 w-4 text-primary" />
            {t('appIdentity')}
          </div>
          <Separator />
          <div className="space-y-2">
            <Label className="text-xs">{t('appName')}</Label>
            <Input value={settings.appName} onChange={e => update({ appName: e.target.value })} placeholder="SılaPrint" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5" /> {t('logo')}
            </Label>
            <div className="flex items-center gap-3">
              {logoPreview ? (
                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center overflow-hidden border">
                  <img src={logoPreview} alt="Logo" className="h-10 w-10 object-contain" />
                </div>
              ) : (
                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground text-xs">
                  {t('logoNone')}
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                  {t('upload')}
                </Button>
                {logoPreview && (
                  <Button variant="outline" size="sm" onClick={removeLogo} className="text-destructive">
                    {t('remove')}
                  </Button>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </div>
            <p className="text-[10px] text-muted-foreground">{t('logoMaxSize')}</p>
          </div>
        </CardContent>
      </Card>

      {/* Theme Colors */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Palette className="h-4 w-4 text-primary" />
            {t('colorTheme')}
          </div>
          <Separator />
          <div className="space-y-2">
            <Label className="text-xs">{t('primaryColor')}</Label>
            <div className="grid grid-cols-4 gap-2">
              {presetColors.map(c => (
                <button
                  key={c.value}
                  onClick={() => update({ primaryColor: c.value })}
                  className={`h-10 rounded-lg border-2 transition-all flex items-center justify-center text-[10px] font-medium text-white ${
                    settings.primaryColor === c.value ? 'border-foreground scale-105 shadow-md' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: `hsl(${c.value})` }}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Label className="text-[10px] text-muted-foreground whitespace-nowrap">{t('customHSL')}</Label>
              <Input
                value={settings.primaryColor}
                onChange={e => update({ primaryColor: e.target.value })}
                placeholder="262 83% 58%"
                className="text-xs h-8 font-mono"
              />
              <div className="h-8 w-8 rounded-md shrink-0 border" style={{ backgroundColor: `hsl(${settings.primaryColor})` }} />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">{t('accentColor')}</Label>
            <div className="flex items-center gap-2">
              <Input
                value={settings.accentColor}
                onChange={e => update({ accentColor: e.target.value })}
                placeholder="262 60% 94%"
                className="text-xs h-8 font-mono"
              />
              <div className="h-8 w-8 rounded-md shrink-0 border" style={{ backgroundColor: `hsl(${settings.accentColor})` }} />
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              applyThemeColors(settings);
              toast.info(t('colorPreviewApplied'));
            }}
          >
            <Palette className="h-3.5 w-3.5 mr-1.5" /> {t('previewColors')}
          </Button>
        </CardContent>
      </Card>

      {/* Admin Password */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Shield className="h-4 w-4 text-primary" />
            {t('security')}
          </div>
          <Separator />
          <div className="space-y-2">
            <Label className="text-xs">{t('adminPassword')}</Label>
            <Input
              type="password"
              value={settings.adminPassword}
              onChange={e => update({ adminPassword: e.target.value })}
            />
            <p className="text-[10px] text-muted-foreground">{t('adminPasswordHint')}</p>
          </div>
        </CardContent>
      </Card>

      {/* PWA Settings */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Smartphone className="h-4 w-4 text-primary" />
            {t('pwaSettings')}
          </div>
          <Separator />
          <div className="space-y-2">
            <Label className="text-xs">{t('pwaAppName')}</Label>
            <Input value={settings.pwaName} onChange={e => update({ pwaName: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">{t('pwaShortName')}</Label>
            <Input value={settings.pwaShortName} onChange={e => update({ pwaShortName: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">{t('pwaDescription')}</Label>
            <Input value={settings.pwaDescription} onChange={e => update({ pwaDescription: e.target.value })} />
          </div>
          <p className="text-[10px] text-muted-foreground">{t('pwaHint')}</p>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button className="flex-1 gap-1.5 h-12" onClick={handleSave}>
          <Save className="h-4 w-4" /> {t('save')}
        </Button>
        <Button variant="outline" className="gap-1.5 h-12" onClick={handleReset}>
          <RotateCcw className="h-4 w-4" /> {t('reset')}
        </Button>
      </div>
    </div>
  );
}
