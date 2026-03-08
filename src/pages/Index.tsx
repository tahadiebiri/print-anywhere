import { useNavigate } from 'react-router-dom';
import { Type, Image, QrCode, LayoutTemplate, Bluetooth, AlertTriangle, ChevronsUp, ChevronsDown, Download, X } from 'lucide-react';
import logo from '@/assets/logo.svg';
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
  { path: '/templates', icon: LayoutTemplate, label: 'Şablonlar', desc: 'Hazır şablon kullan' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { connected, deviceName } = usePrinter();
  const supported = isWebBluetoothSupported();
  const [feeding, setFeeding] = useState(false);

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
          <img src={logo} alt="SılaPrint" className="h-16 w-auto mx-auto mb-3" />
          <h1 className="text-2xl font-bold mb-1">SılaPrint</h1>
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
    </div>
  );
}
