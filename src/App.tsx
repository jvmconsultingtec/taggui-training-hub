
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import TrainingDetail from "./pages/TrainingDetail";
import TrainingsList from "./pages/TrainingsList";
import TrainingForm from "./pages/TrainingForm";
import Progress from "./pages/Progress";
import Collaborators from "./pages/Collaborators";
import Reports from "./pages/Reports";
import Company from "./pages/Company";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              {/* Employee routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/trainings/:id" element={<TrainingDetail />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/collaborators" element={<Collaborators />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/company" element={<Company />} />
              <Route path="/settings" element={<Settings />} />
              
              {/* Admin routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/trainings" element={<TrainingsList />} />
              <Route path="/trainings/new" element={<TrainingForm />} />
              <Route path="/trainings/edit/:id" element={<TrainingForm />} />
            </Route>
            
            {/* Catch-all for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
