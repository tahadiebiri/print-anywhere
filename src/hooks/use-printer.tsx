import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { connectPrinter, disconnectPrinter, readBatteryLevel, setDevLogCallback, type AppPrinterState } from '@/lib/printer';
import { useDevMode } from '@/hooks/use-devmode';

interface PrinterContextType extends AppPrinterState {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  error: string | null;
  refreshBattery: () => Promise<void>;
}

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

  const refreshBattery = useCallback(async () => {
    if (!state.connected) return;
    const level = await readBatteryLevel();
    if (level !== null) {
      setState(s => ({ ...s, batteryLevel: level }));
    }
  }, [state.connected]);

  const connectFn = useCallback(async () => {
    setState(s => ({ ...s, connecting: true }));
    setError(null);
    try {
      const { name, id } = await connectPrinter();
      setState({ connected: true, deviceName: name, connecting: false, batteryLevel: null, deviceId: id });
      // Try reading battery after connection
      setTimeout(async () => {
        const level = await readBatteryLevel();
        if (level !== null) {
          setState(s => ({ ...s, batteryLevel: level }));
        }
      }, 1000);
    } catch (e: any) {
      setState(s => ({ ...s, connecting: false }));
      setError(e.message || 'Bağlantı hatası');
    }
  }, []);

  const disconnectFn = useCallback(async () => {
    try {
      await disconnectPrinter();
    } finally {
      setState({ connected: false, deviceName: null, connecting: false, batteryLevel: null, deviceId: null });
    }
  }, []);

  return (
    <PrinterContext.Provider value={{ ...state, connect: connectFn, disconnect: disconnectFn, error, refreshBattery }}>
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
