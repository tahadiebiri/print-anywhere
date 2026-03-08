import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/use-language';
import { isWebBluetoothSupported } from '@/lib/printer';

export function BrowserCheckDialog() {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (!isWebBluetoothSupported()) {
      setOpen(true);
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <DialogTitle>{t('btNotSupportedTitle')}</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            {t('btNotSupportedDesc')}
          </DialogDescription>
        </DialogHeader>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>{t('safariNotSupported')}</p>
          <p>{t('bluefyHint')}</p>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            {t('cancel')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
