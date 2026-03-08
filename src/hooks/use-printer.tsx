import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { connectPrinter, disconnectPrinter, readBatteryLevel, setDevLogCallback, setDisconnectCallback, type AppPrinterState } from '@/lib/printer';
import { useDevMode } from '@/hooks/use-devmode';
import { toast } from 'sonner';

interface PrinterContextType extends AppPrinterState {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  error: string | null;
  refreshBattery: () => Promise<void>;
  autoReconnect: boolean;
  setAutoReconnect: (v: boolean) => void;
  reconnecting: boolean;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

const PrinterContext = createContext<PrinterContextType | null>(null);

export function PrinterProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppPrinterState>({
    connected: false,
    deviceName: null,
    connecting: false,
    batteryLevel: null,
    deviceId: null,
  });
  const [error, setError] = useState<string | null>(null);
  const [autoReconnect, setAutoReconnect] = useState(true);
  const [reconnecting, setReconnecting] = useState(false);
  const manualDisconnect = useRef(false);
  const retryCount = useRef(0);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshBattery = useCallback(async () => {
    if (!state.connected) return;
    const level = await readBatteryLevel();
    if (level !== null) {
      setState(s => ({ ...s, batteryLevel: level }));
    }
  }, [state.connected]);

  const attemptReconnect = useCallback(async () => {
    if (retryCount.current >= MAX_RETRIES) {
      setReconnecting(false);
      retryCount.current = 0;
      toast.error('Yeniden bağlanılamadı. Lütfen manuel olarak bağlanın.');
      return;
    }

    retryCount.current += 1;
    setReconnecting(true);
    toast.info(`Yeniden bağlanılıyor... (${retryCount.current}/${MAX_RETRIES})`);

    try {
      const { name, id } = await connectPrinter();
      setState({ connected: true, deviceName: name, connecting: false, batteryLevel: null, deviceId: id });
      setReconnecting(false);
      retryCount.current = 0;
      toast.success('Yazıcıya yeniden bağlanıldı!');
      setTimeout(async () => {
        const level = await readBatteryLevel();
        if (level !== null) setState(s => ({ ...s, batteryLevel: level }));
      }, 1000);
    } catch {
      retryTimer.current = setTimeout(attemptReconnect, RETRY_DELAY * retryCount.current);
    }
  }, []);

  // Register disconnect callback
  useEffect(() => {
    setDisconnectCallback(() => {
      setState(s => ({ ...s, connected: false, batteryLevel: null }));

      if (!manualDisconnect.current && autoReconnect) {
        retryCount.current = 0;
        retryTimer.current = setTimeout(attemptReconnect, RETRY_DELAY);
      }
    });
    return () => {
      setDisconnectCallback(null);
      if (retryTimer.current) clearTimeout(retryTimer.current);
    };
  }, [autoReconnect, attemptReconnect]);

  const connectFn = useCallback(async () => {
    manualDisconnect.current = false;
    setState(s => ({ ...s, connecting: true }));
    setError(null);
    try {
      const { name, id } = await connectPrinter();
      setState({ connected: true, deviceName: name, connecting: false, batteryLevel: null, deviceId: id });
      setTimeout(async () => {
        const level = await readBatteryLevel();
        if (level !== null) setState(s => ({ ...s, batteryLevel: level }));
      }, 1000);
    } catch (e: any) {
      setState(s => ({ ...s, connecting: false }));
      setError(e.message || 'Bağlantı hatası');
    }
  }, []);

  const disconnectFn = useCallback(async () => {
    manualDisconnect.current = true;
    if (retryTimer.current) clearTimeout(retryTimer.current);
    setReconnecting(false);
    retryCount.current = 0;
    try {
      await disconnectPrinter();
    } finally {
      setState({ connected: false, deviceName: null, connecting: false, batteryLevel: null, deviceId: null });
    }
  }, []);

  return (
    <PrinterContext.Provider value={{
      ...state,
      connect: connectFn,
      disconnect: disconnectFn,
      error,
      refreshBattery,
      autoReconnect,
      setAutoReconnect,
      reconnecting,
    }}>
      {children}
    </PrinterContext.Provider>
  );
}

// Bridge component to connect devmode logs to printer
export function PrinterDevBridge() {
  const { addLog, enabled } = useDevMode();

  useEffect(() => {
    if (enabled) {
      setDevLogCallback((log) => addLog(log as any));
    } else {
      setDevLogCallback(null);
    }
    return () => setDevLogCallback(null);
  }, [enabled, addLog]);

  return null;
}

export function usePrinter() {
  const ctx = useContext(PrinterContext);
  if (!ctx) throw new Error('usePrinter must be used within PrinterProvider');
  return ctx;
}
