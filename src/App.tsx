import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Integrations from "./pages/Integrations";
import Triggers from "./pages/Triggers";
import TriggerCreate from "./pages/TriggerCreate";
import Templates from "./pages/Templates";
import TemplateCreate from "./pages/TemplateCreate";
import History from "./pages/History";
import Timeline from "./pages/Timeline";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
            <Route path="/app/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
            <Route path="/app/integrations" element={<AppLayout><Integrations /></AppLayout>} />
            <Route path="/app/triggers" element={<AppLayout><Triggers /></AppLayout>} />
            <Route path="/app/triggers/new" element={<AppLayout><TriggerCreate /></AppLayout>} />
            <Route path="/app/templates" element={<AppLayout><Templates /></AppLayout>} />
            <Route path="/app/templates/new" element={<AppLayout><TemplateCreate /></AppLayout>} />
            <Route path="/app/history" element={<AppLayout><History /></AppLayout>} />
            <Route path="/app/timeline" element={<AppLayout><Timeline /></AppLayout>} />
            {/* Legacy redirects */}
            <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
            <Route path="/integrations" element={<Navigate to="/app/integrations" replace />} />
            <Route path="/triggers" element={<Navigate to="/app/triggers" replace />} />
            <Route path="/templates" element={<Navigate to="/app/templates" replace />} />
            <Route path="/history" element={<Navigate to="/app/history" replace />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
