import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { getAppSettings, applyThemeColors } from "./lib/app-settings";

// Apply saved theme colors on startup
applyThemeColors(getAppSettings());

// Mobile keyboard fix: ensure focused inputs are visible
if ('virtualKeyboard' in navigator) {
  (navigator as any).virtualKeyboard.overlaysContent = false;
}
document.addEventListener('focusin', (e) => {
  const target = e.target as HTMLElement;
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
    setTimeout(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  }
});

createRoot(document.getElementById("root")!).render(<App />);
