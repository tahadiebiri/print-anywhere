import { Bluetooth, BluetoothOff, Loader2, Sun, Moon, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePrinter } from '@/hooks/use-printer';
import { useTheme } from '@/hooks/use-theme';
import { useAdminCombo } from '@/hooks/use-admin-combo';
import { useLanguage } from '@/hooks/use-language';
import { isWebBluetoothSupported } from '@/lib/printer';
import { getAppSettings } from '@/lib/app-settings';
import logo from '@/assets/logo.svg';

export function PrinterHeader() {
  const { connected, deviceName, connecting, connect, disconnect, error } = usePrinter();
  const { theme, toggleTheme } = useTheme();
  const { registerThemeClick } = useAdminCombo();
  const { lang, setLang, t } = useLanguage();
  const settings = getAppSettings();

  const handleThemeToggle = () => {
    registerThemeClick();
    toggleTheme();
  };

  const supported = isWebBluetoothSupported();
  const displayLogo = settings.logoUrl || logo;
  const appName = settings.appName || 'SılaPrint';

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto">
        <div className="flex items-center gap-2">
          <img src={displayLogo} alt={appName} className="h-7 w-auto" />
          <span className="text-lg font-bold tracking-tight">{appName}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}
            className="h-8 px-2 text-xs font-medium gap-1"
          >
            <Globe className="h-3.5 w-3.5" />
            {lang === 'tr' ? 'EN' : 'TR'}
          </Button>
          <Button variant="ghost" size="icon" onClick={handleThemeToggle} className="h-8 w-8">
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          {!supported ? (
            <span className="text-xs text-destructive">{t('btNotSupported')}</span>
          ) : connected ? (
            <>
              <span className="flex items-center gap-1.5 text-xs font-medium text-green-500 dark:text-green-400">
                <Bluetooth className="h-3.5 w-3.5" />
                {deviceName}
              </span>
              <Button variant="ghost" size="sm" onClick={disconnect} className="text-xs">
                {t('disconnect')}
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
              {connecting ? t('connecting') : t('connect')}
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
