import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import { PublicHeader } from "@/components/PublicHeader";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import CashFlow from "./pages/CashFlow";
import Products from "./pages/Products";
import Inventory from "./pages/Inventory";
import Costs from "./pages/Costs";
import Settings from "./pages/Settings";
import Plans from "./pages/Plans";
import Team from "./pages/Team";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import PaymentSuccess from "./pages/PaymentSuccess";
import NotFound from "./pages/NotFound";

// Public pages
import Landing from "./pages/Landing";
import Pricing from "./pages/Pricing";
import AboutUs from "./pages/AboutUs";
import Blog from "./pages/Blog";
import Careers from "./pages/Careers";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import LGPD from "./pages/LGPD";

const queryClient = new QueryClient();

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<PublicLayout><Landing /></PublicLayout>} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/precos" element={<PublicLayout><Pricing /></PublicLayout>} />

            {/* Public institutional pages */}
            <Route path="/sobre-nos" element={<PublicLayout><AboutUs /></PublicLayout>} />
            <Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
            <Route path="/carreiras" element={<PublicLayout><Careers /></PublicLayout>} />
            <Route path="/politica-privacidade" element={<PublicLayout><PrivacyPolicy /></PublicLayout>} />
            <Route path="/termos-uso" element={<PublicLayout><TermsOfUse /></PublicLayout>} />
            <Route path="/lgpd" element={<PublicLayout><LGPD /></PublicLayout>} />

            {/* Onboarding route */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute requireOnboarding={false}>
                  <Onboarding />
                </ProtectedRoute>
              }
            />

            {/* App routes */}
            <Route path="/app" element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/app/fluxo-caixa" element={
              <ProtectedRoute>
                <AppLayout>
                  <CashFlow />
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/app/produtos" element={
              <ProtectedRoute>
                <AppLayout>
                  <Products />
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/app/estoque" element={
              <ProtectedRoute>
                <AppLayout>
                  <Inventory />
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/app/custos" element={
              <ProtectedRoute>
                <AppLayout>
                  <Costs />
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/app/configuracoes" element={
              <ProtectedRoute>
                <AppLayout>
                  <Settings />
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/app/planos" element={
              <ProtectedRoute>
                <AppLayout>
                  <Plans />
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/app/equipe" element={
              <ProtectedRoute>
                <AppLayout>
                  <Team />
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/app/sucesso" element={
              <ProtectedRoute>
                <PaymentSuccess />
              </ProtectedRoute>
            } />

            {/* Redirects (pra não quebrar rotas antigas) */}
            <Route path="/dashboard" element={<Navigate to="/app" replace />} />
            <Route path="/fluxo-caixa" element={<Navigate to="/app/fluxo-caixa" replace />} />
            <Route path="/produtos" element={<Navigate to="/app/produtos" replace />} />
            <Route path="/estoque" element={<Navigate to="/app/estoque" replace />} />
            <Route path="/custos" element={<Navigate to="/app/custos" replace />} />
            <Route path="/configuracoes" element={<Navigate to="/app/configuracoes" replace />} />
            <Route path="/planos" element={<Navigate to="/app/planos" replace />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
