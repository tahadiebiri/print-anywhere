import { useState } from 'react';
import { ArrowLeft, Lock, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface AdminLoginProps {
  onLogin: () => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [shake, setShake] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    if (password === 'silaprint2026') {
      onLogin();
      toast.success('Admin paneli açıldı');
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      toast.error('Yanlış şifre');
    }
  };

  return (
    <div className="p-4 pb-24 max-w-md mx-auto flex flex-col items-center justify-center min-h-[60vh]">
      <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="self-start mb-4">
        <ArrowLeft className="h-4 w-4" />
      </Button>

      <Card className={`w-full transition-transform ${shake ? 'animate-[shake_0.3s_ease-in-out]' : ''}`}>
        <CardContent className="p-8 space-y-6">
          <div className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Şablon Yönetimi</h1>
              <p className="text-sm text-muted-foreground mt-1">Admin şifresini girerek devam edin</p>
            </div>
          </div>

          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Şifre girin..."
              className="pl-10"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              autoFocus
            />
          </div>

          <Button className="w-full" size="lg" onClick={handleLogin}>
            Giriş Yap
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
