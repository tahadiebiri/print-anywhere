import { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { Printer, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThermalPreview, ThermalPreviewHandle } from '@/components/ThermalPreview';
import { usePrinter } from '@/hooks/use-printer';
import { printCanvas } from '@/lib/printer';
import { toast } from 'sonner';

export default function QRCodePage() {
  const [content, setContent] = useState('');
  const [caption, setCaption] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [printing, setPrinting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { connected } = usePrinter();

  useEffect(() => {
    if (!content.trim()) {
      setQrDataUrl(null);
      return;
    }
    QRCode.toDataURL(content, {
      width: 300,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    }).then(setQrDataUrl).catch(() => setQrDataUrl(null));
  }, [content]);

  // Draw combined QR + caption on a hidden canvas for printing
  useEffect(() => {
    if (!qrDataUrl || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    img.onload = () => {
      const qrSize = 300;
      const captionHeight = caption ? 40 : 0;
      canvas.width = 384;
      canvas.height = qrSize + 42 + captionHeight; // 42 = padding

      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, (384 - qrSize) / 2, 20, qrSize, qrSize);

      if (caption) {
        ctx.fillStyle = 'black';
        ctx.font = '20px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(caption, 192, qrSize + 40);
      }
    };
    img.src = qrDataUrl;
  }, [qrDataUrl, caption]);

  const handlePrint = async () => {
    if (!canvasRef.current) return;
    setPrinting(true);
    try {
      await printCanvas(canvasRef.current);
      toast.success('Yazdırıldı!');
    } catch (e: any) {
      toast.error(e.message || 'Yazdırma hatası');
    } finally {
      setPrinting(false);
    }
  };

  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">QR Kod</h1>

      <div className="space-y-2">
        <Label>URL veya Metin</Label>
        <Input
          placeholder="https://example.com"
          value={content}
          onChange={e => setContent(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Açıklama (isteğe bağlı)</Label>
        <Input
          placeholder="QR kod altına yazılacak metin"
          value={caption}
          onChange={e => setCaption(e.target.value)}
        />
      </div>

      {qrDataUrl && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Önizleme</Label>
          <div className="flex justify-center">
            <div className="border-2 border-dashed border-border rounded-lg p-4 bg-white inline-block">
              <img src={qrDataUrl} alt="QR Code" className="block mx-auto" style={{ width: 200 }} />
              {caption && <p className="text-center mt-2 text-sm text-black">{caption}</p>}
            </div>
          </div>
          {/* Hidden canvas for printing */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      <Button
        className="w-full gap-2"
        size="lg"
        disabled={!connected || !content.trim() || printing}
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
