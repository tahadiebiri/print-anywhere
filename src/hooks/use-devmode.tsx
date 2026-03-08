import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

export interface DevLog {
  timestamp: number;
  type: 'send' | 'receive' | 'info' | 'error';
  message: string;
  hex?: string;
}

interface DevModeContextType {
  enabled: boolean;
  toggle: (deviceName?: string | null) => void;
  logs: DevLog[];
  addLog: (log: Omit<DevLog, 'timestamp'>) => void;
  clearLogs: () => void;
  exportLogs: () => void;
}

const DevModeContext = createContext<DevModeContextType | null>(null);

export function DevModeProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const [logs, setLogs] = useState<DevLog[]>([]);

  // Listen for combo toggle event
  useEffect(() => {
    const handler = () => setEnabled(prev => !prev);
    window.addEventListener('toggle-devmode-combo', handler);
    return () => window.removeEventListener('toggle-devmode-combo', handler);
  }, []);

  const toggle = useCallback((deviceName?: string | null) => {
    if (enabled) {
      setEnabled(false);
      return;
    }
    // Require password = connected device BT name
    if (!deviceName) {
      const input = prompt('DevMode şifresi (bağlı cihazın Bluetooth adı):');
      if (!input) return;
      // Can't verify without device name, deny
      alert('Yazıcı bağlı değil. Önce yazıcıya bağlanın.');
      return;
    }
    const input = prompt('DevMode şifresi (bağlı cihazın Bluetooth adı):');
    if (input === deviceName) {
      setEnabled(true);
    } else {
      alert('Yanlış şifre!');
    }
  }, [enabled]);

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
