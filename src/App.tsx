import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PrinterProvider } from "@/hooks/use-printer";
import { PrinterHeader } from "@/components/PrinterHeader";
import { BottomNav } from "@/components/BottomNav";
import Index from "./pages/Index";
import TextEditor from "./pages/TextEditor";
import ImagePrint from "./pages/ImagePrint";
import QRCodePage from "./pages/QRCodePage";
import Templates from "./pages/Templates";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <PrinterProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-background dark">
            <PrinterHeader />
            <main className="pb-16">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/text" element={<TextEditor />} />
                <Route path="/image" element={<ImagePrint />} />
                <Route path="/qr" element={<QRCodePage />} />
                <Route path="/templates" element={<Templates />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <BottomNav />
          </div>
        </BrowserRouter>
      </PrinterProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
