import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/DashboardLayout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import SesiLive from "./pages/SesiLive";
import Payroll from "./pages/Payroll";
import Kreator from "./pages/Kreator";
import Sales from "./pages/Sales";
import Konten from "./pages/Konten";
import Konfigurasi from "./pages/Konfigurasi";
import Investor from "./pages/Investor";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/sesi-live"
              element={
                <ProtectedRoute allowedRoles={["CREATOR"]}>
                  <DashboardLayout>
                    <SesiLive />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <DashboardLayout>
                    <Payroll />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/kreator"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <DashboardLayout>
                    <Kreator />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/sales"
              element={
                <ProtectedRoute allowedRoles={["ADMIN", "CREATOR"]}>
                  <DashboardLayout>
                    <Sales />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/konten"
              element={
                <ProtectedRoute allowedRoles={["CREATOR"]}>
                  <DashboardLayout>
                    <Konten />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/konfigurasi"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <DashboardLayout>
                    <Konfigurasi />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/investor"
              element={
                <ProtectedRoute allowedRoles={["ADMIN", "INVESTOR"]}>
                  <DashboardLayout>
                    <Investor />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
