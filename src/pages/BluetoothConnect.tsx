import { useState, useEffect } from 'react';
import {
  Bluetooth, BluetoothOff, BluetoothSearching, Loader2,
  Signal, Battery, BatteryFull, BatteryLow, BatteryMedium,
  Printer, Unplug, CheckCircle2, AlertTriangle, RefreshCw, History, RotateCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { usePrinter } from '@/hooks/use-printer';
import { useLanguage } from '@/hooks/use-language';
import { isWebBluetoothSupported, getPairedDevices, type PairedDevice } from '@/lib/printer';
import { toast } from 'sonner';

function BatteryIcon({ level }: { level: number }) {
  if (level > 75) return <BatteryFull className="h-4 w-4" />;
  if (level > 40) return <BatteryMedium className="h-4 w-4" />;
  if (level > 15) return <BatteryLow className="h-4 w-4" />;
  return <Battery className="h-4 w-4 text-destructive" />;
}

function getBatteryColor(level: number): string {
  if (level > 60) return 'text-green-500';
  if (level > 25) return 'text-yellow-500';
  return 'text-destructive';
}

export default function BluetoothConnect() {
  const { connected, deviceName, connecting, connect, disconnect, error, batteryLevel, refreshBattery, autoReconnect, setAutoReconnect, reconnecting } = usePrinter();
  const { t } = useLanguage();
  const supported = isWebBluetoothSupported();
  const [showInfo, setShowInfo] = useState(false);
  const [pairedDevices, setPairedDevices] = useState<PairedDevice[]>([]);
  const [loadingPaired, setLoadingPaired] = useState(false);
  const [refreshingBattery, setRefreshingBattery] = useState(false);

  const supportedPrinters = [
    { name: 'Cat Printer (GB, GT, YT)', protocol: 'cat_printer' },
    { name: 'PeriPage (A6, A6+, A8)', protocol: 'peripage' },
    { name: 'Phomemo (T02, M02, M110)', protocol: 'phomemo' },
    { name: 'GOOJPRT / MiaoMiaoJi', protocol: 'goojprt' },
    { name: t('otherPrinters'), protocol: 'generic' },
  ];

  useEffect(() => {
    if (supported) loadPairedDevices();
  }, [supported, connected]);

  const loadPairedDevices = async () => {
    setLoadingPaired(true);
    const devices = await getPairedDevices();
    setPairedDevices(devices);
    setLoadingPaired(false);
  };

  const handleConnect = async () => {
    try {
      await connect();
      toast.success(t('printerConnectedToast'));
    } catch {}
  };

  const handleDisconnect = async () => {
    await disconnect();
    toast.info(t('printerDisconnectedToast'));
  };

  const handleRefreshBattery = async () => {
    setRefreshingBattery(true);
    await refreshBattery();
    setRefreshingBattery(false);
  };

  if (!supported) {
    return (
      <div className="p-4 pb-24 max-w-2xl mx-auto space-y-6">
        <div className="text-center py-12 space-y-4">
          <div className="mx-auto h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center">
            <BluetoothOff className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-xl font-bold">{t('btNotSupportedPage')}</h1>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">{t('btNotSupportedPageDesc')}</p>
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="flex items-start gap-3 p-4 text-left">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="text-sm space-y-1">
                <p className="font-medium text-destructive">{t('safariNotSupported')}</p>
                <p className="text-muted-foreground text-xs">{t('bluefyHint')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto space-y-6">
      {/* Status hero */}
      <div className="text-center py-8 space-y-4">
        <div className={`mx-auto h-24 w-24 rounded-full flex items-center justify-center transition-colors ${
          reconnecting ? 'bg-yellow-500/10 dark:bg-yellow-500/20 animate-pulse'
            : connected ? 'bg-green-500/10 dark:bg-green-500/20'
              : connecting ? 'bg-primary/10 animate-pulse' : 'bg-muted'
        }`}>
          {reconnecting ? <RotateCw className="h-12 w-12 text-yellow-500 animate-spin" />
            : connecting ? <BluetoothSearching className="h-12 w-12 text-primary animate-pulse" />
              : connected ? <Bluetooth className="h-12 w-12 text-green-500" />
                : <BluetoothOff className="h-12 w-12 text-muted-foreground" />}
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-bold">
            {reconnecting ? t('reconnecting') : connecting ? t('searching') : connected ? t('printerConnectedTitle') : t('printerConnection')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {reconnecting ? t('reconnectingDesc') : connecting ? t('searchingDesc') : connected ? t('readyToPrint') : t('connectBLE')}
          </p>
        </div>
      </div>

      {/* Connected device card */}
      {connected && (
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                <Printer className="h-7 w-7 text-green-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-lg truncate">{deviceName}</h2>
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Signal className="h-3 w-3" /> {t('bleConnected')}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-background/60 border-border/50">
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">{t('batteryLevel')}</span>
                    <button onClick={handleRefreshBattery} className="text-muted-foreground hover:text-foreground transition-colors" disabled={refreshingBattery}>
                      <RefreshCw className={`h-3 w-3 ${refreshingBattery ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                  {batteryLevel !== null ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className={getBatteryColor(batteryLevel)}><BatteryIcon level={batteryLevel} /></span>
                        <span className={`text-lg font-bold ${getBatteryColor(batteryLevel)}`}>%{batteryLevel}</span>
                      </div>
                      <Progress value={batteryLevel} className="h-1.5" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Battery className="h-4 w-4" />
                      <span className="text-xs">{t('noData')}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-background/60 border-border/50">
                <CardContent className="p-3 space-y-2">
                  <span className="text-xs text-muted-foreground font-medium">{t('connection')}</span>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Signal className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-semibold">{t('active')}</span>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <p>BLE GATT</p>
                      <p>384px / 203 DPI</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-background/50">
                <p className="text-xs text-muted-foreground">{t('protocol')}</p>
                <p className="text-sm font-semibold mt-0.5">BLE GATT</p>
              </div>
              <div className="p-2 rounded-lg bg-background/50">
                <p className="text-xs text-muted-foreground">{t('width')}</p>
                <p className="text-sm font-semibold mt-0.5">384px</p>
              </div>
              <div className="p-2 rounded-lg bg-background/50">
                <p className="text-xs text-muted-foreground">DPI</p>
                <p className="text-sm font-semibold mt-0.5">203</p>
              </div>
            </div>

            <div className="flex items-center justify-between py-2 px-1">
              <div className="flex items-center gap-2">
                <RotateCw className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="auto-reconnect" className="text-sm cursor-pointer">{t('autoReconnect')}</Label>
              </div>
              <Switch id="auto-reconnect" checked={autoReconnect} onCheckedChange={setAutoReconnect} />
            </div>

            <Button
              variant="outline"
              className="w-full gap-2 text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5"
              onClick={handleDisconnect}
            >
              <Unplug className="h-4 w-4" /> {t('disconnectBtn')}
            </Button>
          </CardContent>
        </Card>
      )}

      {!connected && (
        <Button size="lg" className="w-full gap-2 h-14 text-base" onClick={handleConnect} disabled={connecting}>
          {connecting ? <Loader2 className="h-5 w-5 animate-spin" /> : <BluetoothSearching className="h-5 w-5" />}
          {connecting ? t('searchingPrinter') : t('searchAndConnect')}
        </Button>
      )}

      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-destructive">{t('connectionError')}</p>
              <p className="text-muted-foreground mt-1">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!connected && pairedDevices.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm">{t('pairedDevices')}</h3>
              </div>
              <button onClick={loadPairedDevices} className="text-muted-foreground hover:text-foreground transition-colors" disabled={loadingPaired}>
                <RefreshCw className={`h-3.5 w-3.5 ${loadingPaired ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="space-y-1">
              {pairedDevices.map((device) => (
                <div key={device.id} className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors border border-border/50">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Printer className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{device.name}</p>
                    <p className="text-xs text-muted-foreground">{t('previouslyPaired')}</p>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{t('reconnectHint')}</p>
          </CardContent>
        </Card>
      )}

      {!connected && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold text-sm">{t('howToConnect')}</h3>
            <div className="space-y-3">
              {[
                { step: '1', text: t('howToStep1') },
                { step: '2', text: t('howToStep2') },
                { step: '3', text: t('howToStep3') },
              ].map(({ step, text }) => (
                <div key={step} className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">{step}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4 space-y-3">
          <button onClick={() => setShowInfo(!showInfo)} className="w-full flex items-center justify-between">
            <h3 className="font-semibold text-sm">{t('supportedPrinters')}</h3>
            <span className="text-xs text-primary">{showInfo ? t('hide') : t('show')}</span>
          </button>
          {showInfo && (
            <div className="space-y-2 pt-1">
              {supportedPrinters.map((p) => (
                <div key={p.protocol} className="flex items-center gap-3 py-1.5 border-b border-border/50 last:border-0">
                  <Printer className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm">{p.name}</span>
                </div>
              ))}
              <p className="text-xs text-muted-foreground pt-1">{t('supportedPrintersHint')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
