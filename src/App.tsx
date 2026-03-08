import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PrinterProvider } from "@/hooks/use-printer";
import { ThemeProvider } from "@/hooks/use-theme";
import { DevModeProvider } from "@/hooks/use-devmode";
import { PrinterHeader } from "@/components/PrinterHeader";
import { PrinterDevBridge } from "@/hooks/use-printer";
import { BottomNav } from "@/components/BottomNav";
import { DevTerminal } from "@/components/DevTerminal";
import Index from "./pages/Index";
import TextEditor from "./pages/TextEditor";
import ImagePrint from "./pages/ImagePrint";
import QRCodePage from "./pages/QRCodePage";
import Templates from "./pages/Templates";
import BluetoothConnect from "./pages/BluetoothConnect";
import InstallPage from "./pages/InstallPage";
import AdminTemplates from "./pages/AdminTemplates";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ThemeProvider>
        <PrinterProvider>
          <DevModeProvider>
            <BrowserRouter>
              <div className="min-h-screen bg-background text-foreground">
              <PrinterDevBridge />
              <PrinterHeader />
                <main className="pb-16">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/text" element={<TextEditor />} />
                    <Route path="/image" element={<ImagePrint />} />
                    <Route path="/qr" element={<QRCodePage />} />
                    <Route path="/templates" element={<Templates />} />
                    <Route path="/connect" element={<BluetoothConnect />} />
                    <Route path="/install" element={<InstallPage />} />
                    <Route path="/admin" element={<AdminTemplates />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <DevTerminal />
                <BottomNav />
              </div>
            </BrowserRouter>
          </DevModeProvider>
        </PrinterProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
