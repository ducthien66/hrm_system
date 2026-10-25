import React, { useState, useEffect } from 'react';
import { Plus, FileText, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api.js';
import { EmploymentContract, Employee } from '../../types/index.js';
import { Button } from '../../components/common/Button.js';
import { Modal } from '../../components/common/Modal.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { formatDateVN, formatVND, getStatusBadge } from '../../utils/format.js';
import { useAuth } from '../../context/AuthContext.js';

export const ContractListPage: React.FC = () => {
  const { isHR } = useAuth();
  const [contracts, setContracts] = useState<EmploymentContract[]>([]);
  const [expiring, setExpiring] = useState<EmploymentContract[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [contractNumber, setContractNumber] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [contractType, setContractType] = useState('DEFINITE_1Y');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [baseSalary, setBaseSalary] = useState(15000000);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchContracts = async () => {
    setIsLoading(true);
    try {
      const [allRes, expRes, empRes]: any = await Promise.all([
        api.get('/contracts'),
        api.get('/contracts/expiring'),
        api.get('/employees?limit=100'),
      ]);
      setContracts(allRes.data);
      setExpiring(expRes.data);
      setEmployees(empRes.data);
      if (empRes.data.length > 0 && !employeeId) {
        setEmployeeId(empRes.data[0].id);
      }
    } catch (err) {
      console.error('Lỗi lấy danh sách hợp đồng:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/contracts', {
        contractNumber,
        employeeId,
        contractType,
        startDate,
        endDate: endDate || null,
        baseSalary: Number(baseSalary),
        notes,
      });
      setShowCreateModal(false);
      setContractNumber('');
      fetchContracts();
    } catch (err: any) {
      alert(err.message || 'Lỗi tạo hợp đồng');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quản lý hợp đồng lao động</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi thời hạn, chế độ lương theo hợp đồng và cảnh báo gia hạn tự động
          </p>
        </div>
        {isHR && (
          <Button
            onClick={() => setShowCreateModal(true)}
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
          >
            Tạo hợp đồng mới
          </Button>
        )}
      </div>

      {/* Expiring contracts alert banner */}
      {expiring.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800">
            <p className="font-semibold">Cảnh báo: Có {expiring.length} hợp đồng sắp hết hạn trong 30 ngày tới</p>
            <p className="mt-0.5 text-amber-700">
              Các nhân sự: {expiring.map((c) => `${c.employee?.fullName} (${formatDateVN(c.endDate)})`).join(', ')}.
            </p>
          </div>
        </div>
      )}

      {/* Contracts Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        {isLoading ? (
          <LoadingSpinner message="Đang tải danh sách hợp đồng..." />
        ) : contracts.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">Chưa có hợp đồng nào trong hệ thống.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Số hợp đồng</th>
                  <th className="py-3 px-4">Nhân sự</th>
                  <th className="py-3 px-4">Loại hợp đồng</th>
                  <th className="py-3 px-4">Thời hạn</th>
                  <th className="py-3 px-4">Mức lương thỏa thuận</th>
                  <th className="py-3 px-4">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {contracts.map((c) => {
                  const badge = getStatusBadge(c.status);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">{c.contractNumber}</td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900">{c.employee?.fullName}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{c.employee?.employeeCode}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        {c.contractType === 'PROBATION' && 'Thử việc'}
                        {c.contractType === 'DEFINITE_1Y' && 'Xác định thời hạn 1 năm'}
                        {c.contractType === 'DEFINITE_3Y' && 'Xác định thời hạn 3 năm'}
                        {c.contractType === 'INDEFINITE' && 'Không xác định thời hạn'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {formatDateVN(c.startDate)} - {c.endDate ? formatDateVN(c.endDate) : 'Vô thời hạn'}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{formatVND(c.baseSalary)}</td>
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

      {/* Modal Tạo Hợp Đồng */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Lập hợp đồng lao động mới">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nhân viên *</label>
            <select
              required
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName} ({emp.employeeCode})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Số hợp đồng *</label>
              <input
                type="text"
                required
                value={contractNumber}
                onChange={(e) => setContractNumber(e.target.value)}
                placeholder="VD: HDLD-2026-001"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Loại hợp đồng</label>
              <select
                value={contractType}
                onChange={(e) => setContractType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
              >
                <option value="PROBATION">Thử việc</option>
                <option value="DEFINITE_1Y">Xác định thời hạn 1 năm</option>
                <option value="DEFINITE_3Y">Xác định thời hạn 3 năm</option>
                <option value="INDEFINITE">Không xác định thời hạn</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày bắt đầu *</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày kết thúc</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mức lương thỏa thuận (VND) *</label>
            <input
              type="number"
              min={1000000}
              step={500000}
              required
              value={baseSalary}
              onChange={(e) => setBaseSalary(parseFloat(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setShowCreateModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
              Ký kết hợp đồng
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
