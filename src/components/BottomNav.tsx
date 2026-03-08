import { Home, Type, Image, QrCode, LayoutTemplate } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: Home, label: 'Ana Sayfa' },
  { path: '/text', icon: Type, label: 'Metin' },
  { path: '/image', icon: Image, label: 'Fotoğraf' },
  { path: '/qr', icon: QrCode, label: 'QR Kod' },
  { path: '/templates', icon: LayoutTemplate, label: 'Şablonlar' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/80 backdrop-blur-md safe-area-bottom">
      <div className="flex items-center justify-around max-w-2xl mx-auto">
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                'flex flex-col items-center gap-0.5 py-2 px-3 text-xs transition-colors',
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5', active && 'stroke-[2.5]')} />
              <span className="font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
