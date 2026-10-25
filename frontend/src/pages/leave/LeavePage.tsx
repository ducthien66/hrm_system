import React, { useState, useEffect } from 'react';
import { Plus, Check, X, Palmtree } from 'lucide-react';
import { api } from '../../services/api.js';
import { LeaveRequest, LeaveBalance, LeaveType } from '../../types/index.js';
import { Button } from '../../components/common/Button.js';
import { Modal } from '../../components/common/Modal.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { formatDateVN, getStatusBadge } from '../../utils/format.js';
import { useAuth } from '../../context/AuthContext.js';

export const LeavePage: React.FC = () => {
  const { user, isManager } = useAuth();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal Create Leave
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [leaveTypeId, setLeaveTypeId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalDays, setTotalDays] = useState(1);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal Reject
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchLeaveData = async () => {
    setIsLoading(true);
    try {
      const [reqRes, balRes, typeRes]: any = await Promise.all([
        api.get('/leave/requests'),
        api.get('/leave/balances'),
        api.get('/leave/types'),
      ]);
      setRequests(reqRes.data);
      setBalances(balRes.data);
      setTypes(typeRes.data);
      if (typeRes.data.length > 0 && !leaveTypeId) {
        setLeaveTypeId(typeRes.data[0].id);
      }
    } catch (err) {
      console.error('Lỗi lấy dữ liệu nghỉ phép:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await api.post('/leave/requests', {
        leaveTypeId,
        startDate,
        endDate,
        totalDays: Number(totalDays),
        reason,
      });
      setShowCreateModal(false);
      setStartDate('');
      setEndDate('');
      setReason('');
      fetchLeaveData();
    } catch (err: any) {
      setError(err.message || 'Lỗi gửi đơn nghỉ phép');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReview = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    if (status === 'REJECTED') {
      setRejectingId(id);
      setRejectionReason('');
      setShowRejectModal(true);
      return;
    }

    try {
      await api.post(`/leave/requests/${id}/review`, { status: 'APPROVED' });
      fetchLeaveData();
    } catch (err: any) {
      alert(err.message || 'Lỗi phê duyệt đơn');
    }
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingId) return;
    setIsSubmitting(true);
    try {
      await api.post(`/leave/requests/${rejectingId}/review`, {
        status: 'REJECTED',
        rejectionReason,
      });
      setShowRejectModal(false);
      fetchLeaveData();
    } catch (err: any) {
      alert(err.message || 'Lỗi từ chối đơn');
    } finally {
      setIsSubmitting(false);
    }
  };

  const annualBalance = balances.find((b) => b.leaveType.code === 'ANNUAL');

  return (
    <div className="space-y-6">
      {/* Header & New Request Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quản lý nghỉ phép & Ngày nghỉ</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quy trình tạo đơn, thẩm định phê duyệt và theo dõi hạn mức phép năm theo Luật Lao động
          </p>
        </div>
        <Button
          onClick={() => {
            setError(null);
            setShowCreateModal(true);
          }}
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
        >
          Tạo đơn xin nghỉ phép
        </Button>
      </div>

      {/* Leave Balance Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Phép năm được cấp ({new Date().getFullYear()})</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {annualBalance?.entitledDays || 12} <span className="text-xs font-normal text-slate-400">ngày</span>
            </p>
          </div>
          <div className="p-3 bg-brand-50 text-brand-600 rounded-xl">
            <Palmtree className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Đã sử dụng</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              {annualBalance?.usedDays || 0} <span className="text-xs font-normal text-slate-400">ngày</span>
            </p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Palmtree className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Số dư phép khả dụng</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {annualBalance?.remainingDays || 12} <span className="text-xs font-normal text-slate-400">ngày</span>
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Palmtree className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
            Danh sách đơn xin nghỉ phép
          </h3>
          <span className="text-xs text-slate-400">{requests.length} đơn</span>
        </div>

        {isLoading ? (
          <LoadingSpinner message="Đang tải danh sách đơn nghỉ phép..." />
        ) : requests.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Chưa có đơn xin nghỉ phép nào được ghi nhận.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Nhân sự</th>
                  <th className="py-3 px-4">Loại phép</th>
                  <th className="py-3 px-4">Thời gian nghỉ</th>
                  <th className="py-3 px-4">Số ngày</th>
                  <th className="py-3 px-4">Lý do</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Phê duyệt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {requests.map((req) => {
                  const badge = getStatusBadge(req.status);
                  const canReview = isManager && req.status === 'PENDING' && req.employeeId !== (user?.employee?.id || user?.employeeId);

                  return (
                    <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <p>{req.employee?.fullName}</p>
                        <p className="text-[11px] font-normal text-slate-400">{req.employee?.employeeCode}</p>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">{req.leaveType.name}</td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {formatDateVN(req.startDate)} - {formatDateVN(req.endDate)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{req.totalDays} ngày</td>
                      <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                        {req.reason}
                        {req.rejectionReason && (
                          <p className="text-[11px] text-rose-600 italic mt-0.5">Lý do từ chối: {req.rejectionReason}</p>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-medium border ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {canReview ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleReview(req.id, 'APPROVED')}
                              title="Phê duyệt đơn"
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-200"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReview(req.id, 'REJECTED')}
                              title="Từ chối đơn"
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            {req.status === 'PENDING' ? 'Chờ thẩm định' : 'Đã hoàn tất'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tạo Đơn Nghỉ Phép */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Tạo đơn xin nghỉ phép">
        <form onSubmit={handleCreate} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Loại nghỉ phép *</label>
            <select
              required
              value={leaveTypeId}
              onChange={(e) => setLeaveTypeId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
            >
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.daysPerYear} ngày/năm)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Từ ngày *</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Đến ngày *</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tổng số ngày nghỉ *</label>
            <input
              type="number"
              min={0.5}
              step={0.5}
              required
              value={totalDays}
              onChange={(e) => setTotalDays(parseFloat(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Lý do xin nghỉ *</label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ghi rõ lý do xin nghỉ và bàn giao công việc..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setShowCreateModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
              Gửi đơn xin phép
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Từ Chối Đơn */}
      <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)} title="Từ chối đơn xin nghỉ phép">
        <form onSubmit={handleConfirmReject} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Lý do từ chối *</label>
            <textarea
              required
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Nhập lý do không chấp thuận phê duyệt..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setShowRejectModal(false)}>
              Hủy
            </Button>
            <Button variant="danger" size="sm" type="submit" isLoading={isSubmitting}>
              Xác nhận từ chối
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
