import React, { useState, useEffect } from 'react';
import { LogIn, LogOut, Clock, Calendar, AlertCircle } from 'lucide-react';
import { api } from '../../services/api.js';
import { AttendanceRecord } from '../../types/index.js';
import { Button } from '../../components/common/Button.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { formatDateVN, formatDateTimeVN, getStatusBadge } from '../../utils/format.js';
import { useAuth } from '../../context/AuthContext.js';

export const AttendancePage: React.FC = () => {
  const { user, isManager } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'my' | 'all'>('my');

  // Cập nhật đồng hồ thời gian thực mỗi giây
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchAttendance = async () => {
    setIsLoading(true);
    try {
      const endpoint = viewMode === 'all' && isManager ? '/attendance' : '/attendance/my';
      const res: any = await api.get(endpoint);
      setRecords(res.data);
    } catch (err) {
      console.error('Lỗi lấy bảng công:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [viewMode]);

  const handleCheckIn = async () => {
    setActionMsg(null);
    setIsSubmitting(true);
    try {
      await api.post('/attendance/check-in');
      setActionMsg({ type: 'success', text: 'Ghi nhận Check-in thành công!' });
      fetchAttendance();
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message || 'Lỗi Check-in' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    setActionMsg(null);
    setIsSubmitting(true);
    try {
      await api.post('/attendance/check-out');
      setActionMsg({ type: 'success', text: 'Ghi nhận Check-out thành công!' });
      fetchAttendance();
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message || 'Lỗi Check-out' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const todayRecord = records.find(
    (r) =>
      r.employeeId === (user?.employee?.id || user?.employeeId) &&
      new Date(r.workDate).toDateString() === new Date().toDateString()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quản lý chấm công & Ca làm việc</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ghi nhận giờ vào ra, tính toán số giờ làm việc thực tế và phát hiện bất thường
          </p>
        </div>

        {isManager && (
          <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setViewMode('my')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'my' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Công của tôi
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Toàn công ty
            </button>
          </div>
        )}
      </div>

      {/* Live Check-in / Check-out Clock Box */}
      <div className="bg-gradient-to-tr from-brand-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs mb-3">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDateVN(currentTime.toISOString())}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-mono font-bold tracking-tight">
              {currentTime.toLocaleTimeString('vi-VN')}
            </h1>
            <p className="text-xs text-slate-300 mt-2">
              Ca hành chính tiêu chuẩn: <span className="font-semibold text-white">08:30 - 17:30</span> (Nghỉ trưa 60 phút)
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Button
              onClick={handleCheckIn}
              variant="primary"
              size="lg"
              className="w-full sm:w-44 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/30 border-0"
              icon={<LogIn className="w-5 h-5" />}
              isLoading={isSubmitting}
              disabled={!!todayRecord?.checkInTime}
            >
              {todayRecord?.checkInTime ? 'Đã Check-in' : 'Check-in (Vào ca)'}
            </Button>

            <Button
              onClick={handleCheckOut}
              variant="danger"
              size="lg"
              className="w-full sm:w-44 shadow-lg shadow-rose-600/30 border-0"
              icon={<LogOut className="w-5 h-5" />}
              isLoading={isSubmitting}
              disabled={!todayRecord?.checkInTime || !!todayRecord?.checkOutTime}
            >
              {todayRecord?.checkOutTime ? 'Đã Check-out' : 'Check-out (Tan ca)'}
            </Button>
          </div>
        </div>

        {/* Feedback Alert */}
        {actionMsg && (
          <div
            className={`mt-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
              actionMsg.type === 'success'
                ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-200 border border-rose-500/30'
            }`}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{actionMsg.text}</span>
          </div>
        )}
      </div>

      {/* Attendance History Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-600" />
            <span>{viewMode === 'all' ? 'Nhật ký chấm công toàn công ty' : 'Bảng chấm công cá nhân'}</span>
          </h3>
          <span className="text-xs text-slate-400">Tổng cộng: {records.length} bản ghi</span>
        </div>

        {isLoading ? (
          <LoadingSpinner message="Đang tải dữ liệu chấm công..." />
        ) : records.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Chưa có bản ghi chấm công nào được lưu trong kỳ.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Ngày làm việc</th>
                  {viewMode === 'all' && <th className="py-3 px-4">Nhân sự</th>}
                  <th className="py-3 px-4">Giờ vào (Check-in)</th>
                  <th className="py-3 px-4">Giờ ra (Check-out)</th>
                  <th className="py-3 px-4">Thời gian làm</th>
                  <th className="py-3 px-4">Đi muộn / Về sớm</th>
                  <th className="py-3 px-4">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {records.map((rec) => {
                  const badge = getStatusBadge(rec.status);
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {formatDateVN(rec.workDate)}
                      </td>
                      {viewMode === 'all' && (
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-900">{rec.employee?.fullName}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{rec.employee?.employeeCode}</p>
                        </td>
                      )}
                      <td className="py-3.5 px-4 font-mono text-emerald-600">
                        {rec.checkInTime ? formatDateTimeVN(rec.checkInTime) : '—'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {rec.checkOutTime ? formatDateTimeVN(rec.checkOutTime) : '—'}
                      </td>
                      <td className="py-3.5 px-4 font-medium">
                        {rec.workHours > 0 ? `${rec.workHours} giờ` : '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        {rec.lateMinutes > 0 && (
                          <span className="text-amber-600 font-medium">Muộn {rec.lateMinutes}p</span>
                        )}
                        {rec.earlyMinutes > 0 && (
                          <span className="text-orange-600 font-medium">Sớm {rec.earlyMinutes}p</span>
                        )}
                        {rec.lateMinutes === 0 && rec.earlyMinutes === 0 && (
                          <span className="text-slate-400">Đúng giờ</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-medium border ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
