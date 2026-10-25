import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  FileText,
  Clock,
  CalendarDays,
  Palmtree,
  Wallet,
  Receipt,
  UserPlus,
  GraduationCap,
  Award,
  Laptop,
  BarChart3,
  ShieldCheck,
  UserCog,
  History,
  Settings,
  Activity,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface MenuItem {
  name: string;
  path: string;
  icon: React.ElementType;
  roles?: string[]; // If undefined, visible to all authenticated users
}

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role.code;

  const menus: MenuItem[] = [
    { name: '1. Tổng quan', path: '/dashboard', icon: LayoutDashboard },
    {
      name: '2. Nhân viên',
      path: '/employees',
      icon: Users,
      roles: ['SUPER_ADMIN', 'HR_MANAGER', 'DEPT_MANAGER', 'ACCOUNTANT'],
    },
    {
      name: '3. Phòng ban',
      path: '/departments',
      icon: Building2,
      roles: ['SUPER_ADMIN', 'HR_MANAGER', 'DEPT_MANAGER'],
    },
    {
      name: '4. Chức vụ',
      path: '/positions',
      icon: Briefcase,
      roles: ['SUPER_ADMIN', 'HR_MANAGER'],
    },
    {
      name: '5. Hợp đồng lao động',
      path: '/contracts',
      icon: FileText,
      roles: ['SUPER_ADMIN', 'HR_MANAGER', 'ACCOUNTANT'],
    },
    { name: '6. Chấm công', path: '/attendance', icon: Clock },
    { name: '7. Lịch làm việc', path: '/schedules', icon: CalendarDays },
    { name: '8. Nghỉ phép', path: '/leave', icon: Palmtree },
    {
      name: '9. Tiền lương',
      path: '/payroll',
      icon: Wallet,
      roles: ['SUPER_ADMIN', 'ACCOUNTANT', 'HR_MANAGER', 'EMPLOYEE'],
    },
    {
      name: '10. Phụ cấp & Khấu trừ',
      path: '/allowances',
      icon: Receipt,
      roles: ['SUPER_ADMIN', 'ACCOUNTANT', 'HR_MANAGER'],
    },
    {
      name: '11. Tuyển dụng',
      path: '/recruitment',
      icon: UserPlus,
      roles: ['SUPER_ADMIN', 'HR_MANAGER'],
    },
    {
      name: '12. Đào tạo',
      path: '/training',
      icon: GraduationCap,
      roles: ['SUPER_ADMIN', 'HR_MANAGER'],
    },
    {
      name: '13. Đánh giá hiệu suất',
      path: '/performance',
      icon: Award,
      roles: ['SUPER_ADMIN', 'HR_MANAGER', 'DEPT_MANAGER'],
    },
    {
      name: '14. Tài sản cấp phát',
      path: '/assets',
      icon: Laptop,
      roles: ['SUPER_ADMIN', 'HR_MANAGER', 'DEPT_MANAGER'],
    },
    {
      name: '15. Báo cáo thống kê',
      path: '/reports',
      icon: BarChart3,
      roles: ['SUPER_ADMIN', 'HR_MANAGER', 'ACCOUNTANT', 'DEPT_MANAGER'],
    },
    {
      name: '16. Quản lý người dùng',
      path: '/users',
      icon: UserCog,
      roles: ['SUPER_ADMIN'],
    },
    {
      name: '17. Phân quyền',
      path: '/roles',
      icon: ShieldCheck,
      roles: ['SUPER_ADMIN'],
    },
    {
      name: '18. Nhật ký hoạt động',
      path: '/audit-logs',
      icon: History,
      roles: ['SUPER_ADMIN'],
    },
    {
      name: '19. Cài đặt hệ thống',
      path: '/settings',
      icon: Settings,
      roles: ['SUPER_ADMIN'],
    },
  ];

  // Lọc menu theo quyền
  const visibleMenus = menus.filter((item) => {
    if (!item.roles) return true;
    if (role === 'SUPER_ADMIN') return true;
    return role ? item.roles.includes(role) : false;
  });

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 h-screen sticky top-0 border-r border-slate-800">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-lg shadow-brand-500/20">
          HR
        </div>
        <div>
          <h1 className="text-sm font-bold text-white tracking-wide uppercase">HRM ENTERPRISE</h1>
          <p className="text-[11px] text-slate-400">Hệ thống Quản trị Nhân sự</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
        {visibleMenus.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Grafana Monitoring Shortcut for Super Admin */}
      {role === 'SUPER_ADMIN' && (
        <div className="px-3 py-2 border-t border-slate-800">
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all"
            title="Mở Dashboard giám sát Grafana (Cổng 3000)"
          >
            <span className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <span>Grafana Monitor</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>
        </div>
      )}

      {/* Role Indicator Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-semibold text-xs text-brand-400">
            {user?.employee?.fullName ? user.employee.fullName.charAt(0) : 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-medium text-white truncate">
              {user?.employee?.fullName || user?.email}
            </p>
            <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-brand-950 text-brand-400 border border-brand-800/50">
              {user?.role.name}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
