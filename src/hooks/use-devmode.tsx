import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface DevLog {
  timestamp: number;
  type: 'send' | 'receive' | 'info' | 'error';
  message: string;
  hex?: string;
}

interface DevModeContextType {
  enabled: boolean;
  toggle: () => void;
  logs: DevLog[];
  addLog: (log: Omit<DevLog, 'timestamp'>) => void;
  clearLogs: () => void;
  exportLogs: () => void;
}

const DevModeContext = createContext<DevModeContextType | null>(null);

export function DevModeProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const [logs, setLogs] = useState<DevLog[]>([]);

  const toggle = useCallback(() => setEnabled(e => !e), []);

  const addLog = useCallback((log: Omit<DevLog, 'timestamp'>) => {
    setLogs(prev => [...prev, { ...log, timestamp: Date.now() }]);
  }, []);

  const clearLogs = useCallback(() => setLogs([]), []);

  const exportLogs = useCallback(() => {
    const text = logs.map(l => {
      const time = new Date(l.timestamp).toISOString();
      const hexPart = l.hex ? `\n  HEX: ${l.hex}` : '';
      return `[${time}] [${l.type.toUpperCase()}] ${l.message}${hexPart}`;
    }).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `silaprint-devlog-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [logs]);

  return (
    <DevModeContext.Provider value={{ enabled, toggle, logs, addLog, clearLogs, exportLogs }}>
      {children}
    </DevModeContext.Provider>
  );
}

export function useDevMode() {
  const ctx = useContext(DevModeContext);
  if (!ctx) throw new Error('useDevMode must be used within DevModeProvider');
  return ctx;
}
