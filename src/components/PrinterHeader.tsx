import { Bluetooth, BluetoothOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePrinter } from '@/hooks/use-printer';
import { isWebBluetoothSupported } from '@/lib/printer';

export function PrinterHeader() {
  const { connected, deviceName, connecting, connect, disconnect, error } = usePrinter();
  const supported = isWebBluetoothSupported();

  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight">🖨️ TinyPrint</span>
        </div>
        <div className="flex items-center gap-2">
          {!supported ? (
            <span className="text-xs text-destructive">Bluetooth desteklenmiyor</span>
          ) : connected ? (
            <>
              <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'hsl(var(--printer-success))' }}>
                <Bluetooth className="h-3.5 w-3.5" />
                {deviceName}
              </span>
              <Button variant="ghost" size="sm" onClick={disconnect} className="text-xs">
                Kes
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={connect}
              disabled={connecting}
              className="gap-1.5"
            >
              {connecting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <BluetoothOff className="h-3.5 w-3.5" />
              )}
              {connecting ? 'Bağlanıyor...' : 'Bağlan'}
            </Button>
          )}
        </div>
      </div>
      {error && (
        <div className="px-4 pb-2 max-w-2xl mx-auto">
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}
    </header>
  );
}
