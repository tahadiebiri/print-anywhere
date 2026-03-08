import { Home, Type, LayoutTemplate, QrCode, Bluetooth } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { usePrinter } from '@/hooks/use-printer';
import { useAdminCombo } from '@/hooks/use-admin-combo';
import { useLanguage } from '@/hooks/use-language';

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { connected } = usePrinter();
  const { registerQrClick, registerConnectClick } = useAdminCombo();
  const { t } = useLanguage();

  const navItems = [
    { path: '/', icon: Home, label: t('navHome') },
    { path: '/text', icon: Type, label: t('navText') },
    { path: '/templates', icon: LayoutTemplate, label: t('navTemplates') },
    { path: '/qr', icon: QrCode, label: t('navQR') },
    { path: '/connect', icon: Bluetooth, label: t('navConnect') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/80 backdrop-blur-md safe-area-bottom">
      <div className="flex items-center justify-around max-w-2xl mx-auto">
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          const isBluetooth = path === '/connect';
          return (
            <button
              key={path}
              onClick={() => {
                if (path === '/qr') registerQrClick();
                if (path === '/connect') registerConnectClick();
                navigate(path);
              }}
              className={cn(
                'flex flex-col items-center gap-0.5 py-2 px-3 text-xs transition-colors relative',
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5', active && 'stroke-[2.5]')} />
              <span className="font-medium">{label}</span>
              {isBluetooth && (
                <span className={cn(
                  'absolute top-1.5 right-1.5 h-2 w-2 rounded-full',
                  connected ? 'bg-green-500' : 'bg-muted-foreground/40'
                )} />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
