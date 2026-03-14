import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CompanyProvider } from "@/contexts/CompanyContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Index from "./pages/Index";
import UploadWizard from "./pages/UploadWizard";
import QuizEditor from "./pages/QuizEditor";
import QuizPlayer from "./pages/QuizPlayer";
import NotFound from "./pages/NotFound";
import CompanyHome from "./pages/CompanyHome";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminEmployees from "./pages/admin/AdminEmployees";
import AdminMaterials from "./pages/admin/AdminMaterials";
import AdminQuizzes from "./pages/admin/AdminQuizzes";

const queryClient = new QueryClient();

/** Wraps company-scoped routes with the CompanyProvider */
const CompanyWrapper = ({ children }: { children: React.ReactNode }) => {
  // Extract slug from the URL at render time
  const slug = window.location.pathname.split('/')[1];
  return <CompanyProvider slug={slug}>{children}</CompanyProvider>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/home" element={<Landing />} />
            <Route path="/login" element={<Login />} />

            {/* Legacy / global admin routes (protected) */}
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/upload" element={<ProtectedRoute><UploadWizard /></ProtectedRoute>} />
            <Route path="/editor/:manualId" element={<ProtectedRoute><QuizEditor /></ProtectedRoute>} />
            <Route path="/quiz/:quizId" element={<ProtectedRoute><QuizPlayer /></ProtectedRoute>} />

            {/* Company-scoped routes */}
            <Route
              path="/:companySlug"
              element={
                <ProtectedRoute>
                  <CompanyWrapper>
                    <CompanyHome />
                  </CompanyWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="/:companySlug/quiz/:quizId"
              element={
                <ProtectedRoute>
                  <CompanyWrapper>
                    <QuizPlayer />
                  </CompanyWrapper>
                </ProtectedRoute>
              }
            />

            {/* Company admin routes */}
            <Route
              path="/:companySlug/admin"
              element={
                <ProtectedRoute>
                  <CompanyWrapper>
                    <AdminLayout />
                  </CompanyWrapper>
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="employees" element={<AdminEmployees />} />
              <Route path="materials" element={<AdminMaterials />} />
              <Route path="quizzes" element={<AdminQuizzes />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
