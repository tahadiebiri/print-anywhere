import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAdminCombo } from '@/hooks/use-admin-combo';

export function AdminPasswordDialog() {
  const { showPasswordDialog, setShowPasswordDialog } = useAdminCombo();
  const [password, setPassword] = useState('');
  const [shake, setShake] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    if (password === 'silaprint2026') {
      setShowPasswordDialog(false);
      setPassword('');
      toast.success('Admin paneli açıldı');
      navigate('/admin');
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      toast.error('Yanlış şifre');
    }
  };

  return (
    <Dialog open={showPasswordDialog} onOpenChange={(v) => { setShowPasswordDialog(v); if (!v) setPassword(''); }}>
      <DialogContent className={`sm:max-w-sm ${shake ? 'animate-[shake_0.3s_ease-in-out]' : ''}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 justify-center">
            <Lock className="h-5 w-5 text-primary" />
            Admin Girişi
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Admin şifresi..."
              className="pl-10"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              autoFocus
            />
          </div>
          <Button className="w-full" onClick={handleLogin}>
            Giriş Yap
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
