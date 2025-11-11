import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/LoginNew";
import Dashboard from "./pages/dashboard/page";
import EmployeesPage from "./pages/employees/page";
import DepartmentsPage from "./pages/departments/page";
import ObservationsPage from "./pages/observations/page";
import InterviewsPage from "./pages/interviews/page";
import JobAnalysisPage from "./pages/JobAnalysis";
import DevelopmentPlansPage from "./pages/DevelopmentPlans";
import VacationsPage from "./pages/vacations/page";
import AttendancePage from "./pages/attendance/page";
import PayrollPage from "./pages/payroll/page";
import RecruitmentPage from "./pages/recruitment/page";
import TrainingPage from "./pages/Training";
import DianIntegrationPage from "./pages/DianIntegration";
import EvaluationsPage from "./pages/Evaluations";
import PsychometricTestsPage from "./pages/psychometric-tests/page";
import AdminPanel from "./pages/admin/AdminPanel";
import OrganizationsPage from "./pages/admin/OrganizationsPage";
import NotFound from "./pages/NotFound";
import DisciplinaryPage from "./pages/disciplinary/page";
import CompetenciesPage from "./pages/competencies/page";
import BenefitsPage from "./pages/benefits/page";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }
  
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/employees" element={<ProtectedRoute><EmployeesPage /></ProtectedRoute>} />
      <Route path="/departments" element={<ProtectedRoute><DepartmentsPage /></ProtectedRoute>} />
      <Route path="/observations" element={<ProtectedRoute><ObservationsPage /></ProtectedRoute>} />
      <Route path="/interviews" element={<ProtectedRoute><InterviewsPage /></ProtectedRoute>} />
      <Route path="/job-analysis" element={<ProtectedRoute><JobAnalysisPage /></ProtectedRoute>} />
      <Route path="/development-plans" element={<ProtectedRoute><DevelopmentPlansPage /></ProtectedRoute>} />
      <Route path="/vacations" element={<ProtectedRoute><VacationsPage /></ProtectedRoute>} />
      <Route path="/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
      <Route path="/payroll" element={<ProtectedRoute><PayrollPage /></ProtectedRoute>} />
      <Route path="/recruitment" element={<ProtectedRoute><RecruitmentPage /></ProtectedRoute>} />
      <Route path="/training" element={<ProtectedRoute><TrainingPage /></ProtectedRoute>} />
      <Route path="/dian-integration" element={<ProtectedRoute><DianIntegrationPage /></ProtectedRoute>} />
      <Route path="/evaluations" element={<ProtectedRoute><EvaluationsPage /></ProtectedRoute>} />
      <Route path="/competencies" element={<ProtectedRoute><CompetenciesPage /></ProtectedRoute>} />
      <Route path="/benefits" element={<ProtectedRoute><BenefitsPage /></ProtectedRoute>} />
      <Route path="/psychometric-tests" element={<ProtectedRoute><PsychometricTestsPage /></ProtectedRoute>} />
      <Route path="/disciplinary" element={<ProtectedRoute><DisciplinaryPage /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
      <Route path="/admin/organizations" element={<ProtectedRoute><OrganizationsPage /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}