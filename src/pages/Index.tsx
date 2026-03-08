import { useNavigate } from 'react-router-dom';
import { Type, Image, QrCode, LayoutTemplate, Bluetooth, AlertTriangle, ChevronsUp, ChevronsDown, Download, X } from 'lucide-react';
import defaultLogo from '@/assets/logo.svg';
import { getAppSettings } from '@/lib/app-settings';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePrinter } from '@/hooks/use-printer';
import { isWebBluetoothSupported, feedPaper } from '@/lib/printer';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

const quickActions = [
  { path: '/text', icon: Type, label: 'Metin Bas', desc: 'Metin yaz ve bas' },
  { path: '/image', icon: Image, label: 'Fotoğraf Bas', desc: 'Kamera veya galeriden bas' },
  { path: '/qr', icon: QrCode, label: 'QR Kod', desc: 'QR kod oluştur ve bas' },
  { path: '/templates', icon: LayoutTemplate, label: 'Şablonlar', desc: '20+ hazır şablon' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { connected, deviceName } = usePrinter();
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
      toast.success(direction === 'forward' ? 'İleri sarıldı' : 'Geri sarıldı');
    } catch (e: any) {
      toast.error(e.message || 'Besleme hatası');
    } finally {
      setFeeding(false);
    }
  };

  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto space-y-6">
      {!supported && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-destructive">Tarayıcınız Bluetooth desteklemiyor</p>
              <p className="text-muted-foreground mt-1">
                Web Bluetooth API sadece Chrome, Edge ve Opera'da çalışır. Lütfen desteklenen bir tarayıcı kullanın.
              </p>
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
              <p className="font-semibold text-sm">Yazıcı Bağlı</p>
              <p className="text-xs text-muted-foreground">{deviceName}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-6">
          <img src={displayLogo} alt={appName} className="h-16 w-auto mx-auto mb-3" />
          <h1 className="text-2xl font-bold mb-1">{appName}</h1>
          <p className="text-muted-foreground text-sm">
            Mini termal yazıcınız için web uygulaması
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Başlamak için sağ üstten yazıcınıza bağlanın
          </p>
        </div>
      )}

      {connected && (
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="gap-2 h-12"
            disabled={feeding}
            onClick={() => handleFeed('forward')}
          >
            <ChevronsDown className="h-5 w-5" />
            İleri Sar
          </Button>
          <Button
            variant="outline"
            className="gap-2 h-12"
            disabled={feeding}
            onClick={() => handleFeed('backward')}
          >
            <ChevronsUp className="h-5 w-5" />
            Geri Sar
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

      {/* Install banner */}
      {showInstall && !dismissed && (
        <Card className="border-primary/30 bg-primary/5 overflow-hidden">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl overflow-hidden shrink-0">
              <img src="/pwa-192x192.png" alt="SılaPrint" className="w-full h-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">Uygulamayı Yükle</p>
              <p className="text-xs text-muted-foreground">Ana ekranınıza ekleyin, çevrimdışı kullanın</p>
            </div>
            <Button size="sm" className="gap-1 shrink-0" onClick={() => navigate('/install')}>
              <Download className="h-3.5 w-3.5" /> Yükle
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
