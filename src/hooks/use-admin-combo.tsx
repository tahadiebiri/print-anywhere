import { createContext, useContext, useRef, useCallback, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface AdminComboContextType {
  registerThemeClick: () => void;
  registerQrClick: () => void;
  showPasswordDialog: boolean;
  setShowPasswordDialog: (v: boolean) => void;
}

const AdminComboContext = createContext<AdminComboContextType | null>(null);

export function AdminComboProvider({ children }: { children: ReactNode }) {
  const themeClicks = useRef(0);
  const qrClicks = useRef(0);
  const lastThemeTime = useRef(0);
  const lastQrTime = useRef(0);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  const reset = () => {
    themeClicks.current = 0;
    qrClicks.current = 0;
  };

  const registerThemeClick = useCallback(() => {
    const now = Date.now();
    // Reset if more than 5 seconds since last theme click
    if (now - lastThemeTime.current > 5000) {
      themeClicks.current = 0;
    }
    lastThemeTime.current = now;
    themeClicks.current++;
    // Reset QR count when theme is clicked
    qrClicks.current = 0;
  }, []);

  const registerQrClick = useCallback(() => {
    if (themeClicks.current < 3) return;

    const now = Date.now();
    if (now - lastQrTime.current > 5000) {
      qrClicks.current = 0;
    }
    lastQrTime.current = now;
    qrClicks.current++;

    if (qrClicks.current >= 4) {
      setShowPasswordDialog(true);
      reset();
    }
  }, []);

  return (
    <AdminComboContext.Provider value={{ registerThemeClick, registerQrClick, showPasswordDialog, setShowPasswordDialog }}>
      {children}
    </AdminComboContext.Provider>
  );
}

export function useAdminCombo() {
  const ctx = useContext(AdminComboContext);
  if (!ctx) throw new Error('useAdminCombo must be used within AdminComboProvider');
  return ctx;
}
