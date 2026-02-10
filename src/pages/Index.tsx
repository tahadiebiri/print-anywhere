import { useNavigate } from 'react-router-dom';
import { Type, Image, QrCode, LayoutTemplate, Bluetooth, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { usePrinter } from '@/hooks/use-printer';
import { isWebBluetoothSupported } from '@/lib/printer';

const quickActions = [
  { path: '/text', icon: Type, label: 'Metin Bas', desc: 'Metin yaz ve bas' },
  { path: '/image', icon: Image, label: 'Görsel Bas', desc: 'Fotoğraf veya resim bas' },
  { path: '/qr', icon: QrCode, label: 'QR Kod', desc: 'QR kod oluştur ve bas' },
  { path: '/templates', icon: LayoutTemplate, label: 'Şablonlar', desc: 'Hazır şablon kullan' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { connected, deviceName } = usePrinter();
  const supported = isWebBluetoothSupported();

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
          <div className="text-5xl mb-3">🖨️</div>
          <h1 className="text-2xl font-bold mb-1">SılaPrint</h1>
          <p className="text-muted-foreground text-sm">
            Mini termal yazıcınız için web uygulaması
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Başlamak için sağ üstten yazıcınıza bağlanın
          </p>
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
