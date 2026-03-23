import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import Overlay from "./pages/Overlay.tsx";
import OverlayScore from "./pages/OverlayScore.tsx";
import OverlayActions from "./pages/OverlayActions.tsx";
import OverlaySponsor from "./pages/OverlaySponsor.tsx";
import OverlaySubstitution from "./pages/OverlaySubstitution.tsx";
import OverlayHalftime from "./pages/OverlayHalftime.tsx";
import OverlayLineup from "./pages/OverlayLineup.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<any>(undefined);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) return null;
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/overlay" element={<Overlay />} />
          <Route path="/score" element={<OverlayScore />} />
          <Route path="/actions" element={<OverlayActions />} />
          <Route path="/sponsor" element={<OverlaySponsor />} />
          <Route path="/substitution" element={<OverlaySubstitution />} />
          <Route path="/halftime" element={<OverlayHalftime />} />
          <Route path="/lineup" element={<OverlayLineup />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
