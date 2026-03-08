import { useNavigate } from 'react-router-dom';
import { Type, Image, QrCode, LayoutTemplate, Bluetooth, AlertTriangle, ChevronsUp, ChevronsDown, Download, X } from 'lucide-react';
import defaultLogo from '@/assets/logo.svg';
import { getAppSettings } from '@/lib/app-settings';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePrinter } from '@/hooks/use-printer';
import { useLanguage } from '@/hooks/use-language';
import { isWebBluetoothSupported, feedPaper } from '@/lib/printer';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const navigate = useNavigate();
  const { connected, deviceName } = usePrinter();
  const { t } = useLanguage();
  const supported = isWebBluetoothSupported();
  const settings = getAppSettings();
  const displayLogo = settings.logoUrl || defaultLogo;
  const appName = settings.appName || 'SılaPrint';
  const [feeding, setFeeding] = useState(false);
  const [showInstall, setShowInstall] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (navigator as any).standalone === true;
    const wasDismissed = sessionStorage.getItem('install-dismissed');
    if (!isStandalone && !wasDismissed) setShowInstall(true);
  }, []);

  const handleFeed = async (direction: 'forward' | 'backward') => {
    setFeeding(true);
    try {
      await feedPaper(direction === 'forward' ? 80 : -40);
      toast.success(direction === 'forward' ? t('fedForward') : t('fedBackward'));
    } catch (e: any) {
      toast.error(e.message || t('feedError'));
    } finally {
      setFeeding(false);
    }
  };

  const quickActions = [
    { path: '/text', icon: Type, label: t('quickText'), desc: t('quickTextDesc') },
    { path: '/image', icon: Image, label: t('quickPhoto'), desc: t('quickPhotoDesc') },
    { path: '/qr', icon: QrCode, label: t('quickQR'), desc: t('quickQRDesc') },
    { path: '/templates', icon: LayoutTemplate, label: t('quickTemplates'), desc: t('quickTemplatesDesc') },
  ];

  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto space-y-6">
      {!supported && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-destructive">{t('btNotSupportedTitle')}</p>
              <p className="text-muted-foreground mt-1">{t('btNotSupportedDesc')}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {connected ? (
        <Card className="bg-accent/30 border-primary/20">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bluetooth className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">{t('printerConnected')}</p>
              <p className="text-xs text-muted-foreground">{deviceName}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-6">
          <img src={displayLogo} alt={appName} className="h-16 w-auto mx-auto mb-3" />
          <h1 className="text-2xl font-bold mb-1">{appName}</h1>
          <p className="text-muted-foreground text-sm">{t('webAppDesc')}</p>
          <p className="text-xs text-muted-foreground mt-2">{t('startHint')}</p>
        </div>
      )}

      {connected && (
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="gap-2 h-12" disabled={feeding} onClick={() => handleFeed('forward')}>
            <ChevronsDown className="h-5 w-5" /> {t('feedForward')}
          </Button>
          <Button variant="outline" className="gap-2 h-12" disabled={feeding} onClick={() => handleFeed('backward')}>
            <ChevronsUp className="h-5 w-5" /> {t('feedBackward')}
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {quickActions.map(({ path, icon: Icon, label, desc }) => (
          <Card
            key={path}
            className="cursor-pointer hover:border-primary/40 hover:bg-accent/40 transition-all active:scale-[0.98]"
            onClick={() => navigate(path)}
          >
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showInstall && !dismissed && (
        <Card className="border-primary/30 bg-primary/5 overflow-hidden">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl overflow-hidden shrink-0">
              <img src="/pwa-192x192.png" alt={appName} className="w-full h-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{t('installApp')}</p>
              <p className="text-xs text-muted-foreground">{t('installDesc')}</p>
            </div>
            <Button size="sm" className="gap-1 shrink-0" onClick={() => navigate('/install')}>
              <Download className="h-3.5 w-3.5" /> {t('install')}
            </Button>
            <button
              onClick={() => { setDismissed(true); sessionStorage.setItem('install-dismissed', '1'); }}
              className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
