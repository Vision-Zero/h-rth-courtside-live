import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/overlay" element={<Overlay />} />
          <Route path="/score" element={<OverlayScore />} />
          <Route path="/actions" element={<OverlayActions />} />
          <Route path="/sponsor" element={<OverlaySponsor />} />
          <Route path="/substitution" element={<OverlaySubstitution />} />
          <Route path="/halftime" element={<OverlayHalftime />} />
          <Route path="/lineup" element={<OverlayLineup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
