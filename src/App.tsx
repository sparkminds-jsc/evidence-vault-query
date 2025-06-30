
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import ManageStaff from "./pages/ManageStaff";
import ManageCustomer from "./pages/ManageCustomer";
import KnowledgeData from "./pages/KnowledgeData";
import AdminKnowledgeData from "./pages/AdminKnowledgeData";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/manage-staff" 
              element={
                <ProtectedRoute>
                  <ManageStaff />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/manage-customer" 
              element={
                <ProtectedRoute>
                  <ManageCustomer />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/knowledge-data" 
              element={
                <ProtectedRoute>
                  <KnowledgeData />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin-knowledge-data" 
              element={
                <ProtectedRoute>
                  <AdminKnowledgeData />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
