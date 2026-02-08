import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { connectPrinter, disconnectPrinter, type AppPrinterState } from '@/lib/printer';

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

  const connect = useCallback(async () => {
    setState(s => ({ ...s, connecting: true }));
    setError(null);
    try {
      const name = await connectPrinter();
      setState({ connected: true, deviceName: name, connecting: false });
    } catch (e: any) {
      setState(s => ({ ...s, connecting: false }));
      setError(e.message || 'Bağlantı hatası');
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await disconnectPrinter();
    } finally {
      setState({ connected: false, deviceName: null, connecting: false });
    }
  }, []);

  return (
    <PrinterContext.Provider value={{ ...state, connect, disconnect, error }}>
      {children}
    </PrinterContext.Provider>
  );
}

export function usePrinter() {
  const ctx = useContext(PrinterContext);
  if (!ctx) throw new Error('usePrinter must be used within PrinterProvider');
  return ctx;
}
