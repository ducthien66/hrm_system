import React, { useEffect, useState } from 'react';
import {
  Users,
  UserCheck,
  UserMinus,
  FileWarning,
  Clock,
  CalendarCheck,
  Wallet,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { api } from '../../services/api.js';
import { DashboardMetrics } from '../../types/index.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { formatVND } from '../../utils/format.js';

export const DashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res: any = await api.get('/reports/dashboard');
        setMetrics(res.data);
      } catch (err) {
        console.error('Lỗi tải dữ liệu dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (isLoading || !metrics) {
    return <LoadingSpinner message="Đang tải dữ liệu tổng quan Dashboard..." />;
  }

  const { cards, charts } = metrics;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Bảng điều khiển tổng quan</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Theo dõi các chỉ số nhân sự, chấm công và quỹ lương thời gian thực
        </p>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng nhân viên */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Tổng số nhân sự</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{cards.totalEmployees}</p>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> {cards.activeEmployees} đang hoạt động
            </span>
          </div>
          <div className="p-3 bg-brand-50 text-brand-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Tỷ lệ chuyên cần */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Tỷ lệ chuyên cần hôm nay</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{cards.attendanceRate}%</p>
            <span className="text-[11px] text-slate-500 font-medium mt-1 inline-block">
              {cards.todayAttendances} / {cards.activeEmployees} đã check-in
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Hợp đồng sắp hết hạn */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Hợp đồng sắp hết hạn (30 ngày)</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{cards.expiringContracts}</p>
            <span className="text-[11px] text-amber-700 font-medium mt-1 inline-block">
              Cần rà soát gia hạn
            </span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <FileWarning className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Quỹ lương thực tế */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Quỹ lương thực nhận</p>
            <p className="text-lg font-bold text-slate-900 mt-1">{formatVND(cards.latestPayrollNet)}</p>
            <span className="text-[11px] text-slate-500 font-medium mt-1 inline-block">
              {cards.latestPayrollPeriod}
            </span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Wallet className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Secondary Quick Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400">Đang thử việc</p>
            <p className="text-base font-bold text-slate-800">{cards.probationEmployees}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg">
            <UserMinus className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400">Đã thôi việc</p>
            <p className="text-base font-bold text-slate-800">{cards.resignedEmployees}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
            <CalendarCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400">Đơn phép chờ duyệt</p>
            <p className="text-base font-bold text-amber-600">{cards.pendingLeaves}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400">Tăng trưởng năm</p>
            <p className="text-base font-bold text-emerald-600">+100%</p>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recharts Bar Chart: Nhân sự theo phòng ban */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Phân bổ nhân sự theo phòng ban</h3>
            <p className="text-xs text-slate-400">Số lượng nhân viên chính thức trực thuộc từng bộ phận</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.departmentDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="code" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value: any) => [`${value} nhân sự`, 'Số lượng']}
                  contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recharts Area Chart: Biến động nhân sự */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Xu hướng biến động nhân sự</h3>
            <p className="text-xs text-slate-400">Số lượng nhân sự gia nhập và rời đi qua các tháng</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorJoins" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="joins" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorJoins)" name="Tuyển mới" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
