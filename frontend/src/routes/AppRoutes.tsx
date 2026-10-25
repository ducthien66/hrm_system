import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { AppLayout } from '../components/layout/AppLayout.js';
import { LoginPage } from '../pages/auth/LoginPage.js';
import { DashboardPage } from '../pages/dashboard/DashboardPage.js';
import { EmployeeListPage } from '../pages/employees/EmployeeListPage.js';
import { DepartmentListPage } from '../pages/departments/DepartmentListPage.js';
import { ContractListPage } from '../pages/contracts/ContractListPage.js';
import { AttendancePage } from '../pages/attendance/AttendancePage.js';
import { LeavePage } from '../pages/leave/LeavePage.js';
import { PayrollPage } from '../pages/payroll/PayrollPage.js';
import { RecruitmentPage } from '../pages/recruitment/RecruitmentPage.js';
import { AssetPage } from '../pages/assets/AssetPage.js';
import { AuditLogPage } from '../pages/system/AuditLogPage.js';
import { SettingsPage } from '../pages/system/SettingsPage.js';
import { Page403, Page404 } from '../pages/errors/Page403.js';
import { LoadingSpinner } from '../components/common/LoadingSpinner.js';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner message="Đang khởi động phiên làm việc..." />
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role.code) && user.role.code !== 'SUPER_ADMIN') {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="employees" element={<EmployeeListPage />} />
        <Route path="departments" element={<DepartmentListPage />} />
        <Route path="positions" element={<DepartmentListPage />} />
        <Route path="contracts" element={<ContractListPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="schedules" element={<AttendancePage />} />
        <Route path="leave" element={<LeavePage />} />
        <Route path="payroll" element={<PayrollPage />} />
        <Route path="allowances" element={<PayrollPage />} />
        <Route path="recruitment" element={<RecruitmentPage />} />
        <Route path="training" element={<RecruitmentPage />} />
        <Route path="performance" element={<LeavePage />} />
        <Route path="assets" element={<AssetPage />} />
        <Route path="reports" element={<DashboardPage />} />
        <Route path="users" element={<EmployeeListPage />} />
        <Route path="roles" element={<AuditLogPage />} />
        <Route path="audit-logs" element={<AuditLogPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="403" element={<Page403 />} />
      </Route>

      <Route path="*" element={<Page404 />} />
    </Routes>
  );
};
