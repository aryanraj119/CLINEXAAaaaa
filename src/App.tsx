import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Component, ReactNode } from "react";
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
import LabTests from "./pages/LabTests";

const queryClient = new QueryClient();

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Error caught by boundary:", error);
    console.error("Error info:", errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message}</p>
          <pre style={{ background: "#f0f0f0", padding: "10px", overflow: "auto" }}>
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

const App = () => (
  <ErrorBoundary>
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
            <Route path="/lab-tests" element={<LabTests />} />
            <Route path="/admin/db" element={<DatabaseViewer />} />
            <Route path="/doctor-auth" element={<DoctorAuth />} />
            <Route path="/health-chat" element={<HealthcareChatbot />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;