import { useRef, useEffect } from 'react';
import { Trash2, Download, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDevMode } from '@/hooks/use-devmode';

export function DevTerminal() {
  const { enabled, logs, clearLogs, exportLogs } = useDevMode();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  if (!enabled) return null;

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-border bg-card">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-muted/50">
        <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
          <Terminal className="h-3.5 w-3.5" />
          <span>DevMode — {logs.length} log</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={exportLogs} title="Export">
            <Download className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={clearLogs} title="Temizle">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div ref={scrollRef} className="h-32 overflow-y-auto p-2 font-mono text-[11px] leading-relaxed">
        {logs.length === 0 && (
          <p className="text-muted-foreground">Henüz log yok. Bir baskı işlemi başlatın...</p>
        )}
        {logs.map((log, i) => {
          const time = new Date(log.timestamp).toLocaleTimeString('tr-TR', { hour12: false } as any);
          const color = log.type === 'error' ? 'text-destructive' : log.type === 'send' ? 'text-green-500' : log.type === 'receive' ? 'text-blue-400' : 'text-muted-foreground';
          return (
            <div key={i} className="whitespace-pre-wrap break-all">
              <span className="text-muted-foreground">[{time}]</span>{' '}
              <span className={color}>[{log.type.toUpperCase()}]</span>{' '}
              <span className="text-foreground">{log.message}</span>
              {log.hex && (
                <div className="ml-4 text-yellow-500 dark:text-yellow-400">{log.hex}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
