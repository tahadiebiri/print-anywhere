import { useState, useEffect } from 'react';
import { Download, Share, Check, Smartphone, Monitor, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/hooks/use-language';
import { getAppSettings } from '@/lib/app-settings';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const { t } = useLanguage();
  const appName = getAppSettings().appName || 'SılaPrint';

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (navigator as any).standalone === true;
    setIsStandalone(standalone);
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setInstalled(true));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setDeferredPrompt(null);
  };

  if (isStandalone || installed) {
    return (
      <div className="p-4 pb-24 max-w-2xl mx-auto">
        <div className="text-center py-16 space-y-4">
          <div className="mx-auto h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center">
            <Check className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-xl font-bold">{t('appInstalled')}</h1>
          <p className="text-sm text-muted-foreground">{t('appInstalledDesc')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto space-y-6">
      <div className="text-center py-8 space-y-4">
        <div className="mx-auto h-24 w-24 rounded-2xl overflow-hidden shadow-lg">
          <img src="/pwa-192x192.png" alt={appName} className="w-full h-full" />
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-bold">{t('installSilaPrint')}</h1>
          <p className="text-sm text-muted-foreground">{t('installHeroDesc')}</p>
        </div>
      </div>

      {deferredPrompt && (
        <Button size="lg" className="w-full gap-2 h-14 text-base" onClick={handleInstall}>
          <Download className="h-5 w-5" /> {t('installButton')}
        </Button>
      )}

      {isIOS && !deferredPrompt && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-primary" /> {t('iphoneInstall')}
            </h3>
            <div className="space-y-3">
              {[
                { step: '1', text: t('iosStep1'), icon: Share },
                { step: '2', text: t('iosStep2'), icon: ExternalLink },
                { step: '3', text: t('iosStep3'), icon: Check },
              ].map(({ step, text }) => (
                <div key={step} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">{step}</span>
                  </div>
                  <p className="text-sm">{text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!isIOS && !deferredPrompt && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Monitor className="h-4 w-4 text-muted-foreground" /> {t('installInstructions')}
            </h3>
            <p className="text-sm text-muted-foreground">{t('installDesktopDesc')}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold text-sm">{t('appAdvantages')}</h3>
          <div className="grid grid-cols-1 gap-2">
            {[t('advantage1'), t('advantage2'), t('advantage3'), t('advantage4')].map((text, i) => (
              <div key={i} className="flex items-center gap-2 py-1">
                <Check className="h-4 w-4 text-green-500 shrink-0" />
                <span className="text-sm text-muted-foreground">{text}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
