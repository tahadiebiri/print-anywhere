import { Bluetooth, BluetoothOff, Loader2, Sun, Moon, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePrinter } from '@/hooks/use-printer';
import { useTheme } from '@/hooks/use-theme';
import { useDevMode } from '@/hooks/use-devmode';
import { useAdminCombo } from '@/hooks/use-admin-combo';
import { isWebBluetoothSupported } from '@/lib/printer';
import logo from '@/assets/logo.svg';

export function PrinterHeader() {
  const { connected, deviceName, connecting, connect, disconnect, error } = usePrinter();
  const { theme, toggleTheme } = useTheme();
  const { enabled: devMode, toggle: toggleDev } = useDevMode();
  const { registerThemeClick } = useAdminCombo();

  const handleThemeToggle = () => {
    registerThemeClick();
    toggleTheme();
  };
  const handleDevToggle = () => toggleDev(deviceName);
  const supported = isWebBluetoothSupported();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto">
        <div className="flex items-center gap-2">
          <img src={logo} alt="SılaPrint" className="h-7 w-auto" />
          <span className="text-lg font-bold tracking-tight">SılaPrint</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={devMode ? 'default' : 'ghost'}
            size="icon"
            onClick={handleDevToggle}
            className="h-8 w-8"
            title="Developer Mode"
          >
            <Code className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleThemeToggle} className="h-8 w-8">
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          {!supported ? (
            <span className="text-xs text-destructive">BT yok</span>
          ) : connected ? (
            <>
              <span className="flex items-center gap-1.5 text-xs font-medium text-green-500 dark:text-green-400">
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
