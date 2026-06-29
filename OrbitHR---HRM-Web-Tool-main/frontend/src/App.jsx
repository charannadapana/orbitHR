import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute, PublicRoute } from './components/auth/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import EmployeeDashboardPage from './pages/EmployeeDashboardPage';
import EmployeeListPage from './pages/EmployeeListPage';
import AdminDepartmentsPage from './pages/AdminDepartmentsPage';
import EmployeeFormPage from './pages/EmployeeFormPage';
import EmployeeDetailPage from './pages/EmployeeDetailPage';
import AdminAttendancePage from './pages/AdminAttendancePage';
import EmployeeAttendancePage from './pages/EmployeeAttendancePage';
import AdminLeavePage from './pages/AdminLeavePage';
import EmployeeLeavePage from './pages/EmployeeLeavePage';
import AdminSkillsPage from './pages/AdminSkillsPage';
import EmployeeSkillsPage from './pages/EmployeeSkillsPage';
import EmployeeTeamPage from './pages/EmployeeTeamPage';
import ManagerDashboardPage from './pages/ManagerDashboardPage';
import ManagerAttendancePage from './pages/ManagerAttendancePage';
import ManagerAnalyticsPage from './pages/ManagerAnalyticsPage';
import ManagerLeavePage from './pages/ManagerLeavePage';
import ManagerPayrollPage from './pages/ManagerPayrollPage';
import ManagerSkillsPage from './pages/ManagerSkillsPage';
import ManagerTasksPage from './pages/ManagerTasksPage';
import ManagerTeamPage from './pages/ManagerTeamPage';
import EmployeeTasksPage from './pages/EmployeeTasksPage';
import EmployeePayrollPage from './pages/EmployeePayrollPage';
import ActivityTimelinePage from './pages/ActivityTimelinePage';
import DocumentsPage from './pages/DocumentsPage';

const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

            <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboardPage /></ProtectedRoute>} />
            <Route path="/admin/employees" element={<ProtectedRoute requiredRole="admin"><EmployeeListPage /></ProtectedRoute>} />
            <Route path="/admin/departments" element={<ProtectedRoute requiredRole="admin"><AdminDepartmentsPage /></ProtectedRoute>} />
            <Route path="/admin/employees/new" element={<ProtectedRoute requiredRole="admin"><EmployeeFormPage /></ProtectedRoute>} />
            <Route path="/admin/employees/:id" element={<ProtectedRoute requiredRole="admin"><EmployeeDetailPage /></ProtectedRoute>} />
            <Route path="/admin/employees/:id/edit" element={<ProtectedRoute requiredRole="admin"><EmployeeFormPage /></ProtectedRoute>} />
            <Route path="/admin/attendance" element={<ProtectedRoute requiredRole="admin"><AdminAttendancePage /></ProtectedRoute>} />
            <Route path="/admin/leaves" element={<ProtectedRoute requiredRole="admin"><AdminLeavePage /></ProtectedRoute>} />
            <Route path="/admin/skills" element={<ProtectedRoute requiredRole="admin"><AdminSkillsPage /></ProtectedRoute>} />
            <Route path="/admin/employees/:employeeId/timeline" element={<ProtectedRoute requiredRole="admin"><ActivityTimelinePage /></ProtectedRoute>} />
            <Route path="/admin/employees/:employeeId/documents" element={<ProtectedRoute requiredRole="admin"><DocumentsPage /></ProtectedRoute>} />

            <Route path="/manager/dashboard" element={<ProtectedRoute requiredRole="manager"><ManagerDashboardPage /></ProtectedRoute>} />
            <Route path="/manager/tasks" element={<ProtectedRoute requiredRole="manager"><ManagerTasksPage /></ProtectedRoute>} />
            <Route path="/manager/team" element={<ProtectedRoute requiredRole="manager"><ManagerTeamPage /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute requiredRole="manager"><ManagerAnalyticsPage /></ProtectedRoute>} />
            <Route path="/manager/attendance" element={<ProtectedRoute requiredRole="manager"><ManagerAttendancePage /></ProtectedRoute>} />
            <Route path="/manager/leaves" element={<ProtectedRoute requiredRole="manager"><ManagerLeavePage /></ProtectedRoute>} />
            <Route path="/manager/skills" element={<ProtectedRoute requiredRole="manager"><ManagerSkillsPage /></ProtectedRoute>} />
            <Route path="/manager/payroll" element={<ProtectedRoute requiredRole="manager"><ManagerPayrollPage /></ProtectedRoute>} />
            <Route path="/manager/team/:employeeId/timeline" element={<ProtectedRoute requiredRole="manager"><ActivityTimelinePage /></ProtectedRoute>} />
            <Route path="/manager/team/:employeeId/documents" element={<ProtectedRoute requiredRole="manager"><DocumentsPage /></ProtectedRoute>} />

            <Route path="/employee/dashboard" element={<ProtectedRoute requiredRole="employee"><EmployeeDashboardPage /></ProtectedRoute>} />
            <Route path="/employee/team" element={<ProtectedRoute requiredRole="employee"><EmployeeTeamPage /></ProtectedRoute>} />
            <Route path="/employee/attendance" element={<ProtectedRoute requiredRole="employee"><EmployeeAttendancePage /></ProtectedRoute>} />
            <Route path="/employee/leaves" element={<ProtectedRoute requiredRole="employee"><EmployeeLeavePage /></ProtectedRoute>} />
            <Route path="/employee/skills" element={<ProtectedRoute requiredRole="employee"><EmployeeSkillsPage /></ProtectedRoute>} />
            <Route path="/employee/tasks" element={<ProtectedRoute requiredRole="employee"><EmployeeTasksPage /></ProtectedRoute>} />
            <Route path="/employee/timeline" element={<ProtectedRoute requiredRole="employee"><ActivityTimelinePage /></ProtectedRoute>} />
            <Route path="/employee/documents" element={<ProtectedRoute requiredRole="employee"><DocumentsPage /></ProtectedRoute>} />
            <Route path="/employee/payroll" element={<ProtectedRoute requiredRole="employee"><EmployeePayrollPage /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
