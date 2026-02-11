import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { connectPrinter, disconnectPrinter, setDevLogCallback, type AppPrinterState } from '@/lib/printer';
import { useDevMode } from '@/hooks/use-devmode';

interface PrinterContextType extends AppPrinterState {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  error: string | null;
}

const PrinterContext = createContext<PrinterContextType | null>(null);

export function PrinterProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppPrinterState>({
    connected: false,
    deviceName: null,
    connecting: false,
  });
  const [error, setError] = useState<string | null>(null);

  return (
    <PrinterContext.Provider value={{ ...state, connect: useConnectFn(setState, setError), disconnect: useDisconnectFn(setState), error }}>
      {children}
    </PrinterContext.Provider>
  );
}

function useConnectFn(setState: any, setError: any) {
  return useCallback(async () => {
    setState((s: AppPrinterState) => ({ ...s, connecting: true }));
    setError(null);
    try {
      const name = await connectPrinter();
      setState({ connected: true, deviceName: name, connecting: false });
    } catch (e: any) {
      setState((s: AppPrinterState) => ({ ...s, connecting: false }));
      setError(e.message || 'Bağlantı hatası');
    }
  }, [setState, setError]);
}

function useDisconnectFn(setState: any) {
  return useCallback(async () => {
    try {
      await disconnectPrinter();
    } finally {
      setState({ connected: false, deviceName: null, connecting: false });
    }
  }, [setState]);
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
