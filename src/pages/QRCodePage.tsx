import { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { Printer, Loader2, Wifi, User, Mail, Phone, Link, RotateCcw, Download, Settings2, Zap, ImagePlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { PageHeader } from '@/components/PageHeader';
import { usePrinter } from '@/hooks/use-printer';
import { useLanguage } from '@/hooks/use-language';
import { printCanvas } from '@/lib/printer';
import { toast } from 'sonner';

type ContentType = 'url' | 'wifi' | 'vcard' | 'email' | 'phone';
type ErrorLevel = 'L' | 'M' | 'Q' | 'H';
type QRFrame = 'none' | 'solid' | 'rounded' | 'dashed' | 'double' | 'shadow' | 'badge';

interface WifiData { ssid: string; password: string; encryption: 'WPA' | 'WEP' | 'nopass'; }
interface VCardData { name: string; phone: string; email: string; org: string; }
interface EmailData { to: string; subject: string; body: string; }

export default function QRCodePage() {
  const [advancedMode, setAdvancedMode] = useState(false);
  const [contentType, setContentType] = useState<ContentType>('url');
  const [urlText, setUrlText] = useState('');
  const [wifi, setWifi] = useState<WifiData>({ ssid: '', password: '', encryption: 'WPA' });
  const [vcard, setVcard] = useState<VCardData>({ name: '', phone: '', email: '', org: '' });
  const [emailData, setEmailData] = useState<EmailData>({ to: '', subject: '', body: '' });
  const [phoneNumber, setPhoneNumber] = useState('');

  const [caption, setCaption] = useState('');
  const [qrSize, setQrSize] = useState(280);
  const [errorLevel, setErrorLevel] = useState<ErrorLevel>('M');
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [frame, setFrame] = useState<QRFrame>('none');
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState(60);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [printing, setPrinting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { connected } = usePrinter();
  const { t } = useLanguage();

  const contentTypeLabels: Record<ContentType, { label: string; icon: any }> = {
    url: { label: t('urlText'), icon: Link },
    wifi: { label: t('wifi'), icon: Wifi },
    vcard: { label: t('contact'), icon: User },
    email: { label: t('email'), icon: Mail },
    phone: { label: t('phone'), icon: Phone },
  };

  const errorLevels: { value: ErrorLevel; label: string; desc: string }[] = [
    { value: 'L', label: t('low'), desc: '~7%' },
    { value: 'M', label: t('mid'), desc: '~15%' },
    { value: 'Q', label: t('high'), desc: '~25%' },
    { value: 'H', label: t('max'), desc: '~30%' },
  ];

  const qrFrames: { value: QRFrame; label: string }[] = [
    { value: 'none', label: t('qrFrameNone') },
    { value: 'solid', label: t('qrFrameSolid') },
    { value: 'rounded', label: t('qrFrameRounded') },
    { value: 'dashed', label: t('qrFrameDashed') },
    { value: 'double', label: t('qrFrameDouble') },
    { value: 'shadow', label: t('qrFrameShadow') },
    { value: 'badge', label: t('qrFrameBadge') },
  ];

  const getQRContent = (): string => {
    switch (contentType) {
      case 'url': return urlText.trim();
      case 'wifi':
        if (!wifi.ssid) return '';
        return `WIFI:T:${wifi.encryption};S:${wifi.ssid};P:${wifi.password};;`;
      case 'vcard':
        if (!vcard.name) return '';
        return [
          'BEGIN:VCARD', 'VERSION:3.0',
          `FN:${vcard.name}`,
          vcard.phone ? `TEL:${vcard.phone}` : '',
          vcard.email ? `EMAIL:${vcard.email}` : '',
          vcard.org ? `ORG:${vcard.org}` : '',
          'END:VCARD'
        ].filter(Boolean).join('\n');
      case 'email':
        if (!emailData.to) return '';
        return `mailto:${emailData.to}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
      case 'phone':
        return phoneNumber.trim() ? `tel:${phoneNumber.trim()}` : '';
      default: return '';
    }
  };

  const qrContent = getQRContent();

  // Auto-set error correction to H when logo is present
  const effectiveErrorLevel = logoDataUrl ? 'H' : errorLevel;

  useEffect(() => {
    if (!qrContent) { setQrDataUrl(null); return; }
    QRCode.toDataURL(qrContent, {
      width: qrSize,
      margin: 2,
      errorCorrectionLevel: effectiveErrorLevel,
      color: { dark: fgColor, light: bgColor },
    }).then(setQrDataUrl).catch(() => setQrDataUrl(null));
  }, [qrContent, qrSize, effectiveErrorLevel, fgColor, bgColor]);

  // Draw combined QR + frame + caption on hidden canvas, then update preview
  useEffect(() => {
    if (!qrDataUrl || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    img.onload = () => {
      const W = 384;
      const pad = frame !== 'none' ? 28 : 16;
      const displaySize = Math.min(qrSize, W - pad * 2);
      const captionH = caption ? 36 : 0;
      const totalH = pad + displaySize + (caption ? 12 : 0) + captionH + pad;

      canvas.width = W;
      canvas.height = totalH;

      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, W, totalH);

      if (frame !== 'none') {
        drawQRFrame(ctx, frame, W, totalH);
      }

      const qrX = (W - displaySize) / 2;
      const qrY = pad;
      ctx.drawImage(img, qrX, qrY, displaySize, displaySize);

      // Draw logo in center
      const drawLogoAndFinish = () => {
        if (caption) {
          ctx.fillStyle = 'black';
          ctx.font = 'bold 18px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(caption, W / 2, qrY + displaySize + 28, W - pad * 2);
        }
        setPreviewUrl(canvas.toDataURL('image/png'));
      };

      if (logoDataUrl) {
        const logoImg = new window.Image();
        logoImg.onload = () => {
          const lSize = logoSize;
          const lx = qrX + (displaySize - lSize) / 2;
          const ly = qrY + (displaySize - lSize) / 2;
          // White background behind logo
          const padding = 4;
          ctx.fillStyle = 'white';
          ctx.beginPath();
          ctx.roundRect(lx - padding, ly - padding, lSize + padding * 2, lSize + padding * 2, 8);
          ctx.fill();
          ctx.drawImage(logoImg, lx, ly, lSize, lSize);
          drawLogoAndFinish();
        };
        logoImg.src = logoDataUrl;
      } else {
        drawLogoAndFinish();
      }
    };
    img.src = qrDataUrl;
  }, [qrDataUrl, caption, qrSize, frame, logoDataUrl, logoSize]);

  const handlePrint = async () => {
    if (!canvasRef.current) return;
    setPrinting(true);
    try {
      await printCanvas(canvasRef.current);
      toast.success(t('printed'));
    } catch (e: any) {
      toast.error(e.message || t('printError'));
    } finally {
      setPrinting(false);
    }
  };

  const handleDownload = () => {
    if (!previewUrl) return;
    const a = document.createElement('a');
    a.href = previewUrl;
    a.download = `qr-code-${Date.now()}.png`;
    a.click();
    toast.success(t('qrDownloaded'));
  };

  const handleReset = () => {
    setUrlText(''); setCaption('');
    setWifi({ ssid: '', password: '', encryption: 'WPA' });
    setVcard({ name: '', phone: '', email: '', org: '' });
    setEmailData({ to: '', subject: '', body: '' });
    setPhoneNumber('');
    setQrSize(280); setErrorLevel('M');
    setFgColor('#000000'); setBgColor('#ffffff');
    setFrame('none'); setLogoDataUrl(null); setLogoSize(60);
  };

  // Simple mode content types
  const simpleTypes: ContentType[] = ['url', 'wifi', 'phone'];

  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <PageHeader title={t('qrCode')} />
        {/* Mode Toggle */}
        <div className="flex items-center bg-muted rounded-full p-0.5 border border-border">
          <button
            onClick={() => setAdvancedMode(false)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              !advancedMode
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Zap className="h-3 w-3" /> {t('simple')}
          </button>
          <button
            onClick={() => setAdvancedMode(true)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              advancedMode
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Settings2 className="h-3 w-3" /> {t('advanced')}
          </button>
        </div>
      </div>

      {/* Content Type Selector */}
      <div className="flex flex-wrap gap-2">
        {((advancedMode ? Object.keys(contentTypeLabels) : simpleTypes) as ContentType[]).map(type => {
          const { label, icon: Icon } = contentTypeLabels[type];
          return (
            <button
              key={type}
              onClick={() => setContentType(type)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                contentType === type
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          );
        })}
      </div>

      {/* Content Input Forms */}
      <div className="space-y-3 rounded-xl border border-border bg-card p-3">
        {contentType === 'url' && (
          <div className="space-y-1.5">
            <Label className="text-xs">{t('urlOrText')}</Label>
            <Input placeholder="https://example.com" value={urlText} onChange={e => setUrlText(e.target.value)} />
          </div>
        )}

        {contentType === 'wifi' && (
          <>
            <div className="space-y-1.5">
              <Label className="text-xs">{t('networkName')}</Label>
              <Input placeholder={t('wifiName')} value={wifi.ssid} onChange={e => setWifi(w => ({ ...w, ssid: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t('password')}</Label>
              <Input type="password" placeholder={t('wifiPassword')} value={wifi.password} onChange={e => setWifi(w => ({ ...w, password: e.target.value }))} />
            </div>
            {advancedMode && (
              <div className="space-y-1.5">
                <Label className="text-xs">{t('encryption')}</Label>
                <div className="flex gap-2">
                  {(['WPA', 'WEP', 'nopass'] as const).map(enc => (
                    <button
                      key={enc}
                      onClick={() => setWifi(w => ({ ...w, encryption: enc }))}
                      className={`px-3 py-1 rounded-md text-xs font-medium border transition-all ${
                        wifi.encryption === enc
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-muted/50 text-muted-foreground border-border'
                      }`}
                    >
                      {enc === 'nopass' ? t('open') : enc}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {contentType === 'vcard' && (
          <>
            <div className="space-y-1.5">
              <Label className="text-xs">{t('fullName')}</Label>
              <Input placeholder="Ahmet Yılmaz" value={vcard.name} onChange={e => setVcard(v => ({ ...v, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs">{t('phone')}</Label>
                <Input placeholder="+90 555..." value={vcard.phone} onChange={e => setVcard(v => ({ ...v, phone: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t('email')}</Label>
                <Input placeholder="mail@example.com" value={vcard.email} onChange={e => setVcard(v => ({ ...v, email: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t('company')}</Label>
              <Input placeholder={t('companyName')} value={vcard.org} onChange={e => setVcard(v => ({ ...v, org: e.target.value }))} />
            </div>
          </>
        )}

        {contentType === 'email' && (
          <>
            <div className="space-y-1.5">
              <Label className="text-xs">{t('recipientEmail')}</Label>
              <Input placeholder="info@example.com" value={emailData.to} onChange={e => setEmailData(d => ({ ...d, to: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t('subject')}</Label>
              <Input placeholder={t('subjectPlaceholder')} value={emailData.subject} onChange={e => setEmailData(d => ({ ...d, subject: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t('message')}</Label>
              <Input placeholder={t('messagePlaceholder')} value={emailData.body} onChange={e => setEmailData(d => ({ ...d, body: e.target.value }))} />
            </div>
          </>
        )}

        {contentType === 'phone' && (
          <div className="space-y-1.5">
            <Label className="text-xs">{t('phoneNumber')}</Label>
            <Input placeholder="+90 555 123 4567" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />
          </div>
        )}

        {/* Caption */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">{t('caption')}</Label>
          <Input placeholder={t('captionPlaceholder')} value={caption} onChange={e => setCaption(e.target.value)} />
        </div>
      </div>

      {/* Advanced: Style & Settings */}
      {advancedMode && (
        <div className="rounded-xl border border-border bg-card p-3 space-y-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('styleSettings')}</p>

          {/* QR Size */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs">{t('qrSize')}</Label>
              <span className="text-xs text-muted-foreground">{qrSize}px</span>
            </div>
            <Slider value={[qrSize]} onValueChange={v => setQrSize(v[0])} min={150} max={350} step={10} />
          </div>

          {/* Error Correction */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Hata Düzeltme</Label>
              {logoDataUrl && (
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">🔒 Logo için H zorunlu</span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {errorLevels.map(lvl => (
                <button
                  key={lvl.value}
                  disabled={!!logoDataUrl}
                  onClick={() => setErrorLevel(lvl.value)}
                  className={`text-center px-2 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    (logoDataUrl ? lvl.value === 'H' : errorLevel === lvl.value)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
                  } ${logoDataUrl ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div>{lvl.label}</div>
                  <div className="text-[10px] opacity-70">{lvl.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">QR Rengi</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={fgColor}
                  onChange={e => setFgColor(e.target.value)}
                  className="w-8 h-8 rounded-md border border-border cursor-pointer"
                />
                <Input value={fgColor} onChange={e => setFgColor(e.target.value)} className="font-mono text-xs h-8" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Arka Plan</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={e => setBgColor(e.target.value)}
                  className="w-8 h-8 rounded-md border border-border cursor-pointer"
                />
                <Input value={bgColor} onChange={e => setBgColor(e.target.value)} className="font-mono text-xs h-8" />
              </div>
            </div>
          </div>

          {/* Frame */}
          <div className="space-y-2">
            <Label className="text-xs">Çerçeve</Label>
            <div className="flex flex-wrap gap-1.5">
              {qrFrames.map(f => (
                <button
                  key={f.value}
                  onClick={() => setFrame(f.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    frame === f.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Logo */}
          <div className="space-y-2">
            <Label className="text-xs">Ortaya Logo / İkon</Label>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = ev => setLogoDataUrl(ev.target?.result as string);
                reader.readAsDataURL(file);
                e.target.value = '';
              }}
            />
            {logoDataUrl ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg border border-border overflow-hidden bg-white flex items-center justify-center">
                  <img src={logoDataUrl} alt="Logo" className="w-10 h-10 object-contain" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs">Boyut</Label>
                    <span className="text-xs text-muted-foreground">{logoSize}px</span>
                  </div>
                  <Slider value={[logoSize]} onValueChange={v => setLogoSize(v[0])} min={30} max={100} step={5} />
                </div>
                <button
                  onClick={() => setLogoDataUrl(null)}
                  className="p-1.5 rounded-md border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 w-full"
                onClick={() => logoInputRef.current?.click()}
              >
                <ImagePlus className="h-3.5 w-3.5" /> Logo Yükle
              </Button>
            )}
            {logoDataUrl && (
              <p className="text-[10px] text-muted-foreground">
                Logo eklendiğinde hata düzeltme otomatik olarak Maksimum (H) seviyeye ayarlanır.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Hidden canvas for rendering */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Preview */}
      {previewUrl && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Önizleme</Label>
          <div className="flex justify-center">
            <div className="border-2 border-dashed border-border rounded-lg p-2 bg-muted/30 inline-block">
              <img src={previewUrl} alt="QR Code Preview" className="block" style={{ width: 384, imageRendering: 'pixelated' as any }} />
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" size="lg" onClick={handleReset} className="gap-1.5">
          <RotateCcw className="h-4 w-4" />
        </Button>
        {previewUrl && (
          <Button variant="outline" size="lg" onClick={handleDownload} className="gap-1.5">
            <Download className="h-4 w-4" /> İndir
          </Button>
        )}
        <Button
          className="flex-1 gap-2"
          size="lg"
          disabled={!connected || !qrContent || printing}
          onClick={handlePrint}
        >
          {printing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
          {printing ? 'Yazdırılıyor...' : 'Yazdır'}
        </Button>
      </div>

      {!connected && (
        <p className="text-xs text-center text-muted-foreground">Yazdırmak için önce yazıcıya bağlanın</p>
      )}
    </div>
  );
}

// ─── QR Frame Drawing ───
function drawQRFrame(ctx: CanvasRenderingContext2D, frame: QRFrame, w: number, h: number) {
  const m = 10;
  ctx.strokeStyle = 'black';
  ctx.fillStyle = 'black';
  ctx.lineWidth = 2;

  switch (frame) {
    case 'solid':
      ctx.strokeRect(m, m, w - m * 2, h - m * 2);
      break;
    case 'rounded':
      ctx.beginPath();
      ctx.roundRect(m, m, w - m * 2, h - m * 2, 14);
      ctx.stroke();
      break;
    case 'dashed':
      ctx.setLineDash([8, 4]);
      ctx.strokeRect(m, m, w - m * 2, h - m * 2);
      ctx.setLineDash([]);
      break;
    case 'double':
      ctx.strokeRect(m, m, w - m * 2, h - m * 2);
      ctx.strokeRect(m + 4, m + 4, w - m * 2 - 8, h - m * 2 - 8);
      break;
    case 'shadow':
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.fillRect(m + 4, m + 4, w - m * 2, h - m * 2);
      ctx.fillStyle = 'white';
      ctx.fillRect(m, m, w - m * 2, h - m * 2);
      ctx.strokeStyle = 'black';
      ctx.strokeRect(m, m, w - m * 2, h - m * 2);
      break;
    case 'badge': {
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(m, m, w - m * 2, h - m * 2, 18);
      ctx.stroke();
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.roundRect(w / 2 - 50, m - 2, 100, 20, [0, 0, 8, 8]);
      ctx.fill();
      ctx.fillStyle = 'white';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('QR CODE', w / 2, m + 13);
      break;
    }
  }
}
