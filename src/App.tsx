import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Doctors from "./pages/Doctors";
import DoctorDetail from "./pages/DoctorDetail";
import Auth from "./pages/Auth";
import Appointments from "./pages/Appointments";
import DoctorDashboard from "./pages/DoctorDashboard";
import BloodBank from "./pages/BloodBank";
import HealthcareChatbot from "./pages/HealthcareChatbot";
import NotFound from "./pages/NotFound";
import DatabaseViewer from "./pages/DatabaseViewer";
import DoctorAuth from "./pages/DoctorAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/doctor/:id" element={<DoctorDetail />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="/blood-bank" element={<BloodBank />} />
          <Route path="/admin/db" element={<DatabaseViewer />} />
          <Route path="/doctor-auth" element={<DoctorAuth />} />
          <Route path="/health-chat" element={<HealthcareChatbot />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
